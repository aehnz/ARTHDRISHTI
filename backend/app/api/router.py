from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response

from app.core.container import AppContainer
from app.models.domain import SessionRecord
from app.models.schemas import (
    AskRequest, AskResponse, AuditEventResponse, AuthContextResponse, AuthStartRequest,
    AuthStartResponse, AuthVerifyRequest, AuthVerifyResponse, CashFlowResponse,
    ConsentItemResponse, ConsentUpdateRequest, CreditHealthResponse, CustomerResponse, CustomerSummaryResponse,
    DemoCatalogResponse, DemoStateResponse,
    ExplainabilityResponse, FinancialDnaResponse, FinancialStateResponse, GoalResponse,
    GoalSimulationRequest, GovernanceDecision, HealthResponse, InsightResponse,
    LanguagePreferenceRequest, LoanSimulationRequest, LoanSimulationResponse, MeAskRequest,
    NextBestActionResponse, OnboardingConnectionRequest, OnboardingConsentRequest,
    OnboardingGoalsRequest, OnboardingProfileRequest, OnboardingStateResponse,
    PlanSimulationRequest, ProtectionResolutionRequest, ProtectionResponse,
    RecommendationResponse, RecoveryPlanResponse, ScenarioId, ScenarioResponse,
    TransactionResponse, UserResponse,
    WhatIfRequest, WhatIfResponse,
)
from app.services.platform import PlatformService
from app.db.base import database_ready

router = APIRouter(prefix="/api/v1")
ScenarioQuery = Annotated[ScenarioId | None, Query(description="Legacy parameter; authenticated session is authoritative")]


def container(request: Request) -> AppContainer:
    return request.app.state.container


def platform(app: AppContainer = Depends(container)) -> PlatformService:
    return app.platform


def current_session(request: Request, app: AppContainer = Depends(container)) -> SessionRecord:
    return app.auth.resolve(request.cookies.get(app.settings.session_cookie_name))


def demo_session(session: SessionRecord = Depends(current_session)) -> SessionRecord:
    if session.mode != "DEMO":
        raise HTTPException(status_code=403, detail={"code": "DEMO_ACCESS_REQUIRED", "message": "This route is available only in a demo workspace."})
    return session


def normal_session(session: SessionRecord = Depends(current_session)) -> SessionRecord:
    if session.mode != "NORMAL":
        raise HTTPException(status_code=403, detail={"code": "NORMAL_SESSION_REQUIRED", "message": "This route is available only to a signed-in user."})
    return session


def set_session_cookie(response: Response, app: AppContainer, session: SessionRecord) -> None:
    response.set_cookie(key=app.settings.session_cookie_name, value=session.id, max_age=app.settings.session_ttl_minutes * 60, httponly=True, secure=app.settings.session_cookie_secure, samesite="lax", path="/")


def authorize_customer(customer_id: str, session: SessionRecord) -> None:
    canonical = customer_id if customer_id.startswith("cust-") else f"cust-{customer_id}"
    if canonical != session.customer_id:
        raise HTTPException(status_code=403, detail={"code": "CUSTOMER_ACCESS_DENIED", "message": "The requested customer is not assigned to this session."})


def context_args(app: PlatformService, session: SessionRecord) -> dict:
    return {"consent_scope": app.consent_scope(session), "resolved_ids": app.resolved_ids(session), "session": session}


def data_context(app: PlatformService, session: SessionRecord) -> dict:
    values = context_args(app, session)
    values.pop("session")
    return values


@router.get("/health", response_model=HealthResponse, tags=["System"])
def health(app: PlatformService = Depends(platform)) -> HealthResponse:
    return app.health()


@router.get("/health/live", tags=["System"])
def liveness() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/health/ready", tags=["System"])
def readiness(app: AppContainer = Depends(container)) -> dict[str, str]:
    if app.engine is not None and not database_ready(app.engine):
        raise HTTPException(status_code=503, detail={"code": "DATABASE_UNAVAILABLE", "message": "The persistence layer is not ready."})
    return {"status": "ready", "database": "postgresql" if app.engine is not None else "in-memory"}


@router.post("/auth/start", response_model=AuthStartResponse, tags=["Authentication"])
def auth_start(body: AuthStartRequest, app: AppContainer = Depends(container)) -> AuthStartResponse:
    return app.auth.start(body.phone)


@router.post("/auth/verify", response_model=AuthVerifyResponse, tags=["Authentication"])
def auth_verify(body: AuthVerifyRequest, response: Response, app: AppContainer = Depends(container)) -> AuthVerifyResponse:
    result, session = app.auth.verify(body.challenge_id, body.otp)
    set_session_cookie(response, app, session)
    return result


@router.get("/auth/me", response_model=AuthContextResponse, tags=["Authentication"])
@router.get("/me", response_model=AuthContextResponse, tags=["Authentication"])
def auth_me(session: SessionRecord = Depends(current_session), app: AppContainer = Depends(container)) -> AuthContextResponse:
    return app.auth.context(session)


@router.post("/auth/logout", status_code=204, tags=["Authentication"])
def auth_logout(request: Request, response: Response, app: AppContainer = Depends(container)) -> Response:
    app.auth.logout(request.cookies.get(app.settings.session_cookie_name))
    response.delete_cookie(app.settings.session_cookie_name, path="/")
    response.status_code = 204
    return response


@router.get("/demo/catalog", response_model=DemoCatalogResponse, tags=["Demo"])
def demo_catalog(app: AppContainer = Depends(container)) -> DemoCatalogResponse:
    return DemoCatalogResponse(accounts=app.auth.demo_accounts())


@router.get("/demo/customers", response_model=list[CustomerSummaryResponse], tags=["Demo"])
def demo_customers(_session: SessionRecord = Depends(demo_session), app: PlatformService = Depends(platform)) -> list[CustomerSummaryResponse]:
    return app.customer_matrix()


@router.get("/onboarding", response_model=OnboardingStateResponse, tags=["Onboarding"])
def onboarding_state(session: SessionRecord = Depends(normal_session), app: AppContainer = Depends(container)) -> OnboardingStateResponse:
    return app.auth.context(session).onboarding


@router.patch("/onboarding/profile", response_model=OnboardingStateResponse, tags=["Onboarding"])
def onboarding_profile(body: OnboardingProfileRequest, session: SessionRecord = Depends(normal_session), app: AppContainer = Depends(container)) -> OnboardingStateResponse:
    return app.auth.update_profile(session, body)


@router.post("/onboarding/connection", response_model=OnboardingStateResponse, tags=["Onboarding"])
def onboarding_connection(body: OnboardingConnectionRequest, session: SessionRecord = Depends(normal_session), app: AppContainer = Depends(container)) -> OnboardingStateResponse:
    return app.auth.connect_data(session, body)


@router.patch("/onboarding/goals", response_model=OnboardingStateResponse, tags=["Onboarding"])
def onboarding_goals(body: OnboardingGoalsRequest, session: SessionRecord = Depends(normal_session), app: AppContainer = Depends(container)) -> OnboardingStateResponse:
    return app.auth.update_goals(session, body)


@router.patch("/onboarding/consent", response_model=OnboardingStateResponse, tags=["Onboarding"])
def onboarding_consent(body: OnboardingConsentRequest, session: SessionRecord = Depends(normal_session), app: AppContainer = Depends(container)) -> OnboardingStateResponse:
    scope = app.platform.consent_scope(session)
    selected = set(body.consent_ids)
    for item in app.platform.consent_list(session.customer_id, scope):
        app.platform.update_consent(session.customer_id, item.id, "consented" if item.required or item.id in selected else "not_consented", consent_scope=scope, session=session)
    return app.auth.mark_consent(session)


@router.post("/onboarding/complete", response_model=OnboardingStateResponse, tags=["Onboarding"])
def onboarding_complete(session: SessionRecord = Depends(normal_session), app: AppContainer = Depends(container)) -> OnboardingStateResponse:
    return app.auth.complete_onboarding(session)


@router.patch("/me/language", response_model=UserResponse, tags=["Profile"])
def update_language(body: LanguagePreferenceRequest, session: SessionRecord = Depends(current_session), app: AppContainer = Depends(container)) -> UserResponse:
    return app.auth.update_language(session, body)


@router.get("/me/overview", response_model=DemoStateResponse, tags=["Current user"])
def me_overview(session: SessionRecord = Depends(current_session), app: PlatformService = Depends(platform)) -> DemoStateResponse:
    return app.demo_state(session.customer_id, session.scenario_id, **context_args(app, session))


@router.get("/me/financial-state", response_model=FinancialStateResponse, tags=["Current user"])
def me_state(session: SessionRecord = Depends(current_session), app: PlatformService = Depends(platform)) -> FinancialStateResponse:
    scope = app.consent_scope(session)
    anomaly = app._consent_status(session.customer_id, scope).get("anomaly_detection") == "consented"
    return app.state(session.customer_id, session.scenario_id, detect_anomalies=anomaly, resolved_ids=app.resolved_ids(session), session=session)


@router.get("/me/transactions", response_model=list[TransactionResponse], tags=["Current user"])
def me_transactions(offset: int = Query(0, ge=0), limit: int = Query(250, ge=1, le=500), session: SessionRecord = Depends(current_session), app: PlatformService = Depends(platform)) -> list[TransactionResponse]:
    consent = app._consent_status(session.customer_id, app.consent_scope(session))
    items = app.transaction_list(session.customer_id, session.scenario_id, detect_anomalies=consent.get("anomaly_detection") == "consented", resolved_ids=app.resolved_ids(session))
    return items[offset:offset + limit]


@router.get("/me/insights", response_model=list[InsightResponse], tags=["Current user"])
def me_insights(session: SessionRecord = Depends(current_session), app: PlatformService = Depends(platform)) -> list[InsightResponse]:
    return app.insight_list(session.customer_id, session.scenario_id, **data_context(app, session))


@router.get("/me/recommendations", response_model=list[RecommendationResponse], tags=["Current user"])
def me_recommendations(session: SessionRecord = Depends(current_session), app: PlatformService = Depends(platform)) -> list[RecommendationResponse]:
    return app.recommendation_list(session.customer_id, session.scenario_id, **context_args(app, session))


@router.get("/me/next-best-action", response_model=NextBestActionResponse, tags=["Current user"])
def me_next_action(session: SessionRecord = Depends(current_session), app: PlatformService = Depends(platform)) -> NextBestActionResponse:
    return app.next_action(session.customer_id, session.scenario_id, **context_args(app, session))


@router.get("/me/financial-dna", response_model=FinancialDnaResponse, tags=["Current user"])
def me_dna(session: SessionRecord = Depends(current_session), app: PlatformService = Depends(platform)) -> FinancialDnaResponse:
    return app.financial_dna(session.customer_id, session.scenario_id, **data_context(app, session))


@router.get("/me/cash-flow", response_model=CashFlowResponse, tags=["Current user"])
def me_cash_flow(session: SessionRecord = Depends(current_session), app: PlatformService = Depends(platform)) -> CashFlowResponse:
    return app.cash_flow(session.customer_id, session.scenario_id, **data_context(app, session))


@router.get("/me/credit-health", response_model=CreditHealthResponse, tags=["Current user"])
def me_credit_health(session: SessionRecord = Depends(current_session), app: PlatformService = Depends(platform)) -> CreditHealthResponse:
    state = me_state(session, app)
    return CreditHealthResponse(label="Indicative Credit Health", **state.creditHealth.model_dump(), riskBand=state.risk.level, recommendations=["Keep utilization controlled", "Maintain on-time repayments"], disclaimer="This is not a CIBIL or bureau score.")


@router.get("/me/goals", response_model=list[GoalResponse], tags=["Current user"])
def me_goals(session: SessionRecord = Depends(current_session), app: PlatformService = Depends(platform)) -> list[GoalResponse]:
    return app.goals_for(session.customer_id, session.scenario_id, **data_context(app, session))


@router.post("/me/goals/simulate", response_model=list[GoalResponse], tags=["Current user"])
def me_goals_simulate(body: GoalSimulationRequest, session: SessionRecord = Depends(current_session), app: PlatformService = Depends(platform)) -> list[GoalResponse]:
    return app.simulate_goals(session.customer_id, session.scenario_id, body.extra_monthly_contribution, **context_args(app, session))


@router.get("/me/protection", response_model=ProtectionResponse, tags=["Current user"])
def me_protection(session: SessionRecord = Depends(current_session), app: PlatformService = Depends(platform)) -> ProtectionResponse:
    return app.protection(session.customer_id, session.scenario_id, **context_args(app, session))


@router.patch("/me/protection/{event_id}", response_model=ProtectionResponse, tags=["Current user"])
def me_protection_resolve(event_id: str, body: ProtectionResolutionRequest, session: SessionRecord = Depends(current_session), app: PlatformService = Depends(platform)) -> ProtectionResponse:
    return app.resolve_protection(session, event_id, body.status)


@router.get("/me/consent", response_model=list[ConsentItemResponse], tags=["Current user"])
def me_consent(session: SessionRecord = Depends(current_session), app: PlatformService = Depends(platform)) -> list[ConsentItemResponse]:
    return app.consent_list(session.customer_id, app.consent_scope(session))


@router.patch("/me/consent/{consent_id}", response_model=ConsentItemResponse, tags=["Current user"])
def me_consent_update(consent_id: str, body: ConsentUpdateRequest, session: SessionRecord = Depends(current_session), app: PlatformService = Depends(platform)) -> ConsentItemResponse:
    return app.update_consent(session.customer_id, consent_id, body.status, consent_scope=app.consent_scope(session), session=session)


@router.post("/me/loan-simulation", response_model=LoanSimulationResponse, tags=["Current user"])
def me_loan(body: LoanSimulationRequest, session: SessionRecord = Depends(current_session), app: PlatformService = Depends(platform)) -> LoanSimulationResponse:
    return app.loan(session.customer_id, body.model_copy(update={"scenario": session.scenario_id}), **context_args(app, session))


@router.post("/me/what-if", response_model=WhatIfResponse, tags=["Current user"])
def me_what_if(body: WhatIfRequest, session: SessionRecord = Depends(current_session), app: PlatformService = Depends(platform)) -> WhatIfResponse:
    return app.what_if(session.customer_id, body.model_copy(update={"scenario": session.scenario_id}), **context_args(app, session))


@router.post("/me/plan-simulation", response_model=RecoveryPlanResponse, tags=["Current user"])
def me_plan(body: PlanSimulationRequest, session: SessionRecord = Depends(current_session), app: PlatformService = Depends(platform)) -> RecoveryPlanResponse:
    return app.plan(session.customer_id, session.scenario_id, body.adherence, **data_context(app, session))


@router.get("/me/trajectory", response_model=RecoveryPlanResponse, tags=["Current user"])
@router.get("/me/recovery-plan", response_model=RecoveryPlanResponse, tags=["Current user"])
@router.get("/me/growth-plan", response_model=RecoveryPlanResponse, tags=["Current user"])
def me_current_plan(session: SessionRecord = Depends(current_session), app: PlatformService = Depends(platform)) -> RecoveryPlanResponse:
    return app.plan(session.customer_id, session.scenario_id, **data_context(app, session))


@router.get("/me/governance", response_model=GovernanceDecision, tags=["Current user"])
def me_governance(session: SessionRecord = Depends(current_session), app: PlatformService = Depends(platform)) -> GovernanceDecision:
    return app.governance(session.customer_id, session.scenario_id, **context_args(app, session))


@router.get("/me/explainability", response_model=ExplainabilityResponse, tags=["Current user"])
def me_explainability(session: SessionRecord = Depends(current_session), app: PlatformService = Depends(platform)) -> ExplainabilityResponse:
    return app.explainability(session.customer_id, session.scenario_id, **context_args(app, session))


@router.get("/me/audit", response_model=list[AuditEventResponse], tags=["Current user"])
def me_audit(offset: int = Query(0, ge=0), limit: int = Query(250, ge=1, le=500), session: SessionRecord = Depends(current_session), app: PlatformService = Depends(platform)) -> list[AuditEventResponse]:
    return app.audits_for(session.customer_id, session)[offset:offset + limit]


@router.post("/me/ask", response_model=AskResponse, tags=["Current user"])
def me_ask(body: MeAskRequest, session: SessionRecord = Depends(current_session), app: AppContainer = Depends(container)) -> AskResponse:
    user = app.auth.context(session).user
    request = AskRequest(customer_id=session.customer_id, question=body.question, language=body.language or user.languagePreference, scenario=session.scenario_id)
    return app.platform.ask(request, **context_args(app.platform, session))


# Authenticated Iteration 1 compatibility routes. Session identity and scenario
# are authoritative, irrespective of legacy path/query values.
@router.get("/customers", response_model=list[CustomerSummaryResponse], tags=["Compatibility"])
def customers(_session: SessionRecord = Depends(demo_session), app: PlatformService = Depends(platform)) -> list[CustomerSummaryResponse]:
    return app.customer_matrix()


@router.get("/customers/{customer_id}", response_model=CustomerResponse, tags=["Compatibility"])
def customer(customer_id: str, scenario: ScenarioQuery = None, session: SessionRecord = Depends(current_session), app: PlatformService = Depends(platform)) -> CustomerResponse:
    authorize_customer(customer_id, session)
    return app.customer(session.customer_id, session.scenario_id)


@router.get("/customers/{customer_id}/overview", response_model=DemoStateResponse, tags=["Compatibility"])
def overview(customer_id: str, scenario: ScenarioQuery = None, session: SessionRecord = Depends(current_session), app: PlatformService = Depends(platform)) -> DemoStateResponse:
    authorize_customer(customer_id, session)
    return app.demo_state(session.customer_id, session.scenario_id, **context_args(app, session))


@router.get("/customers/{customer_id}/financial-state", response_model=FinancialStateResponse, tags=["Compatibility"])
def financial_state(customer_id: str, scenario: ScenarioQuery = None, session: SessionRecord = Depends(current_session), app: PlatformService = Depends(platform)) -> FinancialStateResponse:
    authorize_customer(customer_id, session)
    return me_state(session, app)


@router.post("/customers/{customer_id}/loan-simulation", response_model=LoanSimulationResponse, tags=["Compatibility"])
def loan_simulation(customer_id: str, body: LoanSimulationRequest, session: SessionRecord = Depends(current_session), app: PlatformService = Depends(platform)) -> LoanSimulationResponse:
    authorize_customer(customer_id, session)
    return me_loan(body, session, app)


@router.post("/customers/{customer_id}/what-if", response_model=WhatIfResponse, tags=["Compatibility"])
def what_if(customer_id: str, body: WhatIfRequest, session: SessionRecord = Depends(current_session), app: PlatformService = Depends(platform)) -> WhatIfResponse:
    authorize_customer(customer_id, session)
    return me_what_if(body, session, app)


@router.get("/scenarios", response_model=list[ScenarioResponse], tags=["Demo"])
def scenarios(app: PlatformService = Depends(platform)) -> list[ScenarioResponse]:
    return app.scenarios_list()


@router.post("/ask", response_model=AskResponse, tags=["Compatibility"])
def ask(body: AskRequest, session: SessionRecord = Depends(current_session), app: PlatformService = Depends(platform)) -> AskResponse:
    authorize_customer(body.customer_id, session)
    request = body.model_copy(update={"customer_id": session.customer_id, "scenario": session.scenario_id})
    return app.ask(request, **context_args(app, session))
