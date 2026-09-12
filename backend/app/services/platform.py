from __future__ import annotations

from datetime import date, datetime, timezone

from fastapi import HTTPException

from app.ai.provider import AIProvider
from app.intelligence.engine import DecisionEngine, IntelligenceEngine, PlanningEngine, cash_flow, financial_dna, goals_with_state, protection, timeline
from app.models.schemas import (
    AskRequest, AskResponse, AuditEventResponse, CashFlowResponse, ConsentItemResponse,
    CustomerResponse, CustomerSummaryResponse, DebtAccountResponse, DemoStateResponse, ExplainabilityResponse,
    FinancialDnaResponse, FinancialStateResponse, GoalResponse, GovernanceDecision, HealthResponse,
    InsightResponse, LoanSimulationRequest, LoanSimulationResponse, NextBestActionResponse,
    ProtectionResponse, RecommendationResponse, RecoveryPlanResponse, ScenarioId,
    ScenarioResponse, TransactionIntelligenceResponse,
    TransactionResponse, WhatIfRequest, WhatIfResponse,
)
from app.models.domain import ProtectionEventRecord, SessionRecord
from app.repositories.interfaces import ConsentRepository, CustomerRepository, DebtRepository, GoalRepository, ProtectionEventRepository, ScenarioRepository, TransactionRepository
from app.services.audit import AuditService
from app.services.artifacts import ArtifactStore
from app.providers.transactions import RepositoryTransactionProvider, TransactionProvider


class PlatformService:
    def __init__(self, *, customers: CustomerRepository, transactions: TransactionRepository, debts: DebtRepository, goals: GoalRepository, consents: ConsentRepository, scenarios: ScenarioRepository, protection_events: ProtectionEventRepository, audit: AuditService, intelligence: IntelligenceEngine, decisions: DecisionEngine, planning: PlanningEngine, ai: AIProvider, environment: str, database_status: str = "in-memory", artifacts: ArtifactStore | None = None, transaction_provider: TransactionProvider | None = None) -> None:
        self.customers, self.transactions, self.debts, self.goals, self.consents = customers, transactions, debts, goals, consents
        self.scenarios, self.protection_events, self.audit_service = scenarios, protection_events, audit
        self.intelligence, self.decisions, self.planning, self.ai = intelligence, decisions, planning, ai
        self.environment = environment
        self.database_status = database_status
        self.artifacts = artifacts or ArtifactStore()
        self.transaction_provider = transaction_provider or RepositoryTransactionProvider(transactions)

    def _scenario(self, customer_id: str, scenario: ScenarioId | None) -> ScenarioId:
        self._ensure_persona(customer_id)
        if scenario is None:
            raise HTTPException(status_code=422, detail={"code": "ACCOUNT_CONTEXT_REQUIRED", "message": "An authenticated account assignment is required."})
        return scenario

    def _source(self, customer_id: str, scenario: ScenarioId):
        source = self.scenarios.source_for(customer_id, scenario)
        if not source:
            raise HTTPException(status_code=422, detail={"code": "SCENARIO_NOT_AVAILABLE", "message": "The selected scenario is not available for this customer."})
        return source

    def _ensure_persona(self, customer_id: str) -> str:
        definitions = self.scenarios.list_definitions()
        available = next((scenario for scenario in definitions if self.scenarios.is_valid(customer_id, scenario)), None)
        if not available:
            raise HTTPException(status_code=404, detail={"code": "CUSTOMER_NOT_FOUND", "message": "Customer was not found."})
        return customer_id.removeprefix("cust-")

    def _audit(self, customer_id: str, event_type: str, session: SessionRecord | None = None, **metadata: str | int | float | bool | None) -> None:
        self.audit_service.record(customer_id=customer_id, action=event_type.upper(), session=session, **metadata)

    def health(self) -> HealthResponse:
        return HealthResponse(status="ok", service="ARTHDRISHTI Intelligence API", version="3.0.0", environment=self.environment, intelligenceEngineStatus="statistical-intelligence-ready", aiProviderStatus=self.ai.name, databaseStatus=self.database_status)

    def customer(self, customer_id: str, scenario: ScenarioId | None = None) -> CustomerResponse:
        active = self._scenario(customer_id, scenario)
        customer = self.customers.get(customer_id, active)
        if not customer:
            raise HTTPException(status_code=404, detail={"code": "CUSTOMER_NOT_FOUND", "message": "Customer was not found."})
        return customer

    def transaction_list(self, customer_id: str, scenario: ScenarioId | None = None, *, detect_anomalies: bool = True, resolved_ids: set[str] | None = None) -> list[TransactionResponse]:
        items = self.transaction_provider.fetch(customer_id, self._scenario(customer_id, scenario))
        annotated = self.intelligence.anomalies(items) if detect_anomalies else items
        resolved = resolved_ids or set()
        return [item.model_copy(update={"anomaly": False, "status": "posted", "anomalyMetadata": None, "intelligence": "Verification response recorded"}) if item.id in resolved else item for item in annotated]

    def debt_list(self, customer_id: str, scenario: ScenarioId | None = None) -> list[DebtAccountResponse]:
        return self.debts.list_for(customer_id, self._scenario(customer_id, scenario))

    def state(self, customer_id: str, scenario: ScenarioId | None = None, audit: bool = True, *, detect_anomalies: bool = True, resolved_ids: set[str] | None = None, session: SessionRecord | None = None) -> FinancialStateResponse:
        persona = self._ensure_persona(customer_id)
        active = self._scenario(customer_id, scenario)
        result = self.intelligence.state(self._source(customer_id, active), self.transaction_list(customer_id, active, detect_anomalies=detect_anomalies, resolved_ids=resolved_ids))
        self.artifacts.financial_state(session, result)
        if audit: self._audit(customer_id, "financial_state_generated", session=session, scenario=active, health=result.healthScore, risk=result.risk.level)
        return result

    def insight_list(self, customer_id: str, scenario: ScenarioId | None = None, *, consent_scope: str | None = None, resolved_ids: set[str] | None = None) -> list[InsightResponse]:
        persona, active = self._ensure_persona(customer_id), self._scenario(customer_id, scenario)
        consent = self._consent_status(customer_id, consent_scope)
        anomaly_allowed = consent.get("anomaly_detection") == "consented"
        spending_allowed = consent.get("spending_categories") == "consented" and consent.get("transaction_history") == "consented"
        items = self.transaction_list(customer_id, active, detect_anomalies=anomaly_allowed, resolved_ids=resolved_ids)
        state = self.intelligence.state(self._source(customer_id, active), items)
        if active == "anomaly" and anomaly_allowed and any(item.anomaly for item in items):
            return self.intelligence.insights(persona, active, state, items)
        return self.intelligence.insights(persona, active, state, items) if spending_allowed else []

    def recommendation_list(self, customer_id: str, scenario: ScenarioId | None = None, *, consent_scope: str | None = None, resolved_ids: set[str] | None = None, session: SessionRecord | None = None) -> list[RecommendationResponse]:
        persona, active = self._ensure_persona(customer_id), self._scenario(customer_id, scenario)
        consent = self._consent_status(customer_id, consent_scope)
        items = self.transaction_list(customer_id, active, detect_anomalies=consent.get("anomaly_detection") == "consented", resolved_ids=resolved_ids)
        state = self.intelligence.state(self._source(customer_id, active), items)
        insights = self.insight_list(customer_id, active, consent_scope=consent_scope, resolved_ids=resolved_ids)
        result = self.intelligence.recommendations(persona, active, state, insights)
        self.artifacts.recommendations(session, result)
        self.audit_service.record(customer_id=customer_id, action="RECOMMENDATION_CREATED", session=session, entity_type="recommendation", entity_id=result[0].id, scenario=active)
        return result

    def next_action(self, customer_id: str, scenario: ScenarioId | None = None, **context) -> NextBestActionResponse:
        return self.intelligence.next_best_action(self.recommendation_list(customer_id, scenario, **context))

    def consent_list(self, customer_id: str, consent_scope: str | None = None) -> list[ConsentItemResponse]:
        self._ensure_persona(customer_id)
        return self.consents.list_for(customer_id, consent_scope)

    def _consent_status(self, customer_id: str, consent_scope: str | None = None) -> dict[str, str]:
        return {item.id: item.status for item in self.consent_list(customer_id, consent_scope)}

    def update_consent(self, customer_id: str, consent_id: str, status: str, *, consent_scope: str | None = None, session: SessionRecord | None = None) -> ConsentItemResponse:
        self._ensure_persona(customer_id)
        item = self.consents.update(customer_id, consent_id, status, consent_scope)
        if not item:
            raise HTTPException(status_code=409, detail={"code": "CONSENT_CHANGE_NOT_ALLOWED", "message": "Required consent cannot be revoked or the consent item was not found."})
        self.audit_service.record(customer_id=customer_id, action="CONSENT_UPDATED", session=session, entity_type="consent", entity_id=consent_id, reason=f"Status changed to {status}", status=status)
        return item

    def loan(self, customer_id: str, request: LoanSimulationRequest, *, consent_scope: str | None = None, resolved_ids: set[str] | None = None, session: SessionRecord | None = None) -> LoanSimulationResponse:
        active = self._scenario(customer_id, request.scenario)
        consent = self._consent_status(customer_id, consent_scope)
        state = self.state(customer_id, active, audit=False, detect_anomalies=consent.get("anomaly_detection") == "consented", resolved_ids=resolved_ids)
        result = self.decisions.loan(customer_id, state, request.amount, request.tenure_months, request.illustrative_apr, request.purpose, consent)
        self.artifacts.loan(session, request, result, state)
        self.audit_service.record(customer_id=customer_id, action="LOAN_SIMULATED", session=session, decision=result.recommendation, entity_type="simulation", entity_id=result.simulationId, trace_id=result.traceId, amount=request.amount, scenario=active)
        self.audit_service.record(customer_id=customer_id, action="SIMULATION_CREATED", session=session, decision=result.recommendation, entity_type="simulation", entity_id=result.simulationId, trace_id=result.traceId, amount=request.amount, scenario=active)
        self.audit_service.record(customer_id=customer_id, action="DECISION_CREATED", session=session, decision=result.recommendation, entity_type="decision", entity_id=result.simulationId, trace_id=result.traceId, purpose=request.purpose)
        if result.recommendation in ("BLOCKED", "ESCALATE"):
            self.audit_service.record(customer_id=customer_id, action="DECISION_BLOCKED", session=session, decision=result.recommendation, entity_type="decision", entity_id=result.simulationId, trace_id=result.traceId, reason=result.governance.alternativeAction)
        if result.recommendation in ("BLOCKED", "NOT_RECOMMENDED_RIGHT_NOW"):
            self.audit_service.record(customer_id=customer_id, action="RECOMMENDATION_SUPPRESSED", session=session, decision=result.recommendation, entity_type="simulation", entity_id=result.simulationId, trace_id=result.traceId, reason=result.governance.alternativeAction)
        return result

    def governance(self, customer_id: str, scenario: ScenarioId | None = None, **context) -> GovernanceDecision:
        return self.loan(customer_id, LoanSimulationRequest(amount=500_000, tenure_months=60, illustrative_apr=13.2, purpose="personal", scenario=scenario), **context).governance

    def explainability(self, customer_id: str, scenario: ScenarioId | None = None, **context) -> ExplainabilityResponse:
        return self.decisions.explain(self.loan(customer_id, LoanSimulationRequest(amount=500_000, tenure_months=60, illustrative_apr=13.2, purpose="personal", scenario=scenario), **context))

    def plan(self, customer_id: str, scenario: ScenarioId | None = None, adherence: int = 80, *, consent_scope: str | None = None, resolved_ids: set[str] | None = None) -> RecoveryPlanResponse:
        consent = self._consent_status(customer_id, consent_scope)
        return self.planning.plan(self.state(customer_id, scenario, audit=False, detect_anomalies=consent.get("anomaly_detection") == "consented", resolved_ids=resolved_ids), adherence)

    def what_if(self, customer_id: str, request: WhatIfRequest, *, consent_scope: str | None = None, resolved_ids: set[str] | None = None, session: SessionRecord | None = None) -> WhatIfResponse:
        consent = self._consent_status(customer_id, consent_scope)
        result = self.planning.what_if(self.state(customer_id, request.scenario, audit=False, detect_anomalies=consent.get("anomaly_detection") == "consented", resolved_ids=resolved_ids), request.monthly_saving_delta, request.income_delta_pct, request.emi_delta)
        self.artifacts.what_if(session, request, result)
        self._audit(customer_id, "what_if_simulation_performed", session=session, direction=result.direction)
        return result

    def financial_dna(self, customer_id: str, scenario: ScenarioId | None = None, *, consent_scope: str | None = None, resolved_ids: set[str] | None = None) -> FinancialDnaResponse:
        active = self._scenario(customer_id, scenario)
        consent = self._consent_status(customer_id, consent_scope)
        if consent.get("transaction_history") != "consented":
            raise HTTPException(status_code=403, detail={"code": "CONSENT_REQUIRED", "message": "Transaction-history consent is required for Financial DNA."})
        items = self.transaction_list(customer_id, active, detect_anomalies=consent.get("anomaly_detection") == "consented", resolved_ids=resolved_ids)
        result = financial_dna(self.customer(customer_id, active).id, self.state(customer_id, active, audit=False, detect_anomalies=consent.get("anomaly_detection") == "consented", resolved_ids=resolved_ids), items)
        if consent.get("spending_categories") != "consented":
            result.categories = [item for item in result.categories if item.category not in {"SPENDING", "BEHAVIOUR"}]
        if consent.get("savings") != "consented":
            result.categories = [item for item in result.categories if item.category not in {"SAVINGS", "OPPORTUNITY"}]
        if consent.get("debt") != "consented":
            result.categories = [item for item in result.categories if item.category != "DEBT"]
        return result

    def cash_flow(self, customer_id: str, scenario: ScenarioId | None = None, *, consent_scope: str | None = None, resolved_ids: set[str] | None = None) -> CashFlowResponse:
        consent = self._consent_status(customer_id, consent_scope)
        active = self._scenario(customer_id, scenario)
        return cash_flow(self.state(customer_id, active, audit=False, detect_anomalies=consent.get("anomaly_detection") == "consented", resolved_ids=resolved_ids), self._source(customer_id, active).reference_date)

    def protection(self, customer_id: str, scenario: ScenarioId | None = None, *, consent_scope: str | None = None, resolved_ids: set[str] | None = None, session: SessionRecord | None = None) -> ProtectionResponse:
        active = self._scenario(customer_id, scenario)
        consent = self._consent_status(customer_id, consent_scope)
        if consent.get("anomaly_detection") != "consented":
            state = self.state(customer_id, active, audit=False, detect_anomalies=False, resolved_ids=resolved_ids)
            return ProtectionResponse(unresolvedCount=0, anomalies=[], stressRisk=state.risk, recommendedAction="ENABLE ANOMALY DETECTION", disclaimer="Statistical unusual-activity screening is unavailable without consent; this is not a claim of production fraud-detection accuracy.", capabilityAvailable=False, limitation="Anomaly-detection consent is not active.")
        items = self.transaction_list(customer_id, active, resolved_ids=resolved_ids)
        result = protection(self.state(customer_id, active, audit=False, resolved_ids=resolved_ids), items)
        if session:
            self._audit(customer_id, "anomaly_evaluated", session=session, scenario=active, unresolved=result.unresolvedCount)
        return result

    def resolve_protection(self, session: SessionRecord, event_id: str, status: str) -> ProtectionResponse:
        scope = self.consent_scope(session)
        current = self.protection(session.customer_id, session.scenario_id, consent_scope=scope, resolved_ids=self.resolved_ids(session), session=session)
        if not any(item.id == event_id for item in current.anomalies):
            raise HTTPException(status_code=404, detail={"code": "PROTECTION_EVENT_NOT_FOUND", "message": "The unresolved protection event was not found."})
        self.protection_events.save(ProtectionEventRecord(session_id=session.id, customer_id=session.customer_id, event_id=event_id, status=status, updated_at=datetime.now(timezone.utc)))
        self.audit_service.record(customer_id=session.customer_id, action="PROTECTION_EVENT_RESOLVED", session=session, entity_type="transaction", entity_id=event_id, decision=status, reason="User recorded a verification response")
        return self.protection(session.customer_id, session.scenario_id, consent_scope=scope, resolved_ids=self.resolved_ids(session), session=session)

    def goals_for(self, customer_id: str, scenario: ScenarioId | None = None, *, consent_scope: str | None = None, resolved_ids: set[str] | None = None) -> list[GoalResponse]:
        consent = self._consent_status(customer_id, consent_scope)
        return goals_with_state(self.goals.list_for(customer_id), self.state(customer_id, scenario, audit=False, detect_anomalies=consent.get("anomaly_detection") == "consented", resolved_ids=resolved_ids))

    def simulate_goals(self, customer_id: str, scenario: ScenarioId | None, extra: int, *, consent_scope: str | None = None, resolved_ids: set[str] | None = None, session: SessionRecord | None = None) -> list[GoalResponse]:
        state = self.state(customer_id, scenario, audit=False, resolved_ids=resolved_ids)
        baseline = goals_with_state(self.goals.list_for(customer_id), state)
        remaining_extra = min(extra, max(0, state.cashFlow.monthlySurplus - sum(goal.monthlyContribution for goal in baseline)))
        result: list[GoalResponse] = []
        for goal in baseline:
            allocated_extra = remaining_extra if goal.priority == 1 else 0
            remaining_extra -= allocated_extra
            contribution = max(1, goal.monthlyContribution + allocated_extra)
            months = (goal.remainingAmount + contribution - 1) // contribution
            year = 2026 + (9 - 1 + months) // 12
            month = (9 - 1 + months) % 12 + 1
            result.append(goal.model_copy(update={"monthlyContribution": contribution, "monthsToCompletion": months, "monthsSaved": max(0, goal.monthsToCompletion - months), "projectedCompletion": date(year, month, 1)}))
        self._audit(customer_id, "goal_simulation_performed", session=session, extra=extra)
        return result

    def transaction_intelligence(self, customer_id: str, scenario: ScenarioId | None = None, *, consent_scope: str | None = None, resolved_ids: set[str] | None = None) -> TransactionIntelligenceResponse:
        consent = self._consent_status(customer_id, consent_scope)
        if consent.get("transaction_history") != "consented" or consent.get("spending_categories") != "consented":
            raise HTTPException(status_code=403, detail={"code": "CONSENT_REQUIRED", "message": "Transaction and spending-category consent are required for this intelligence."})
        active = self._scenario(customer_id, scenario)
        items = self.transaction_list(customer_id, active, detect_anomalies=consent.get("anomaly_detection") == "consented", resolved_ids=resolved_ids)
        return self.intelligence.transaction_intelligence(items, self.state(customer_id, active, audit=False, detect_anomalies=consent.get("anomaly_detection") == "consented", resolved_ids=resolved_ids))

    def demo_state(self, customer_id: str, scenario: ScenarioId | None = None, *, consent_scope: str | None = None, resolved_ids: set[str] | None = None, session: SessionRecord | None = None) -> DemoStateResponse:
        persona, active = self._ensure_persona(customer_id), self._scenario(customer_id, scenario)
        consent = self.consent_list(customer_id, consent_scope)
        statuses = {item.id: item.status for item in consent}
        anomaly_allowed = statuses.get("anomaly_detection") == "consented"
        customer = self.customer(customer_id, active)
        transactions = self.transaction_list(customer_id, active, detect_anomalies=anomaly_allowed, resolved_ids=resolved_ids)
        state = self.intelligence.state(self._source(customer_id, active), transactions)
        insights = self.insight_list(customer_id, active, consent_scope=consent_scope, resolved_ids=resolved_ids)
        recommendations = self.intelligence.recommendations(persona, active, state, insights)
        loan = self.decisions.loan(customer_id, state, 500_000, 60, 13.2, "personal", statuses)
        plan = self.planning.plan(state)
        protected = self.protection(customer_id, active, consent_scope=consent_scope, resolved_ids=resolved_ids, session=session)
        dna = financial_dna(customer_id, state, transactions)
        if statuses.get("spending_categories") != "consented": dna.categories = [item for item in dna.categories if item.category not in {"SPENDING", "BEHAVIOUR"}]
        if statuses.get("savings") != "consented": dna.categories = [item for item in dna.categories if item.category not in {"SAVINGS", "OPPORTUNITY"}]
        if statuses.get("debt") != "consented": dna.categories = [item for item in dna.categories if item.category != "DEBT"]
        reference_date = self._source(customer_id, active).reference_date
        return DemoStateResponse(persona=persona, scenario=active, customer=customer, financialState=state, transactions=transactions, insights=insights, signals=self.intelligence.signals(state), recommendations=recommendations, timeline=timeline(state, reference_date), trajectory=plan.trajectory, goals=goals_with_state(self.goals.list_for(customer_id), state), modelInference=self.intelligence.inference(state), consentItems=consent, loanAssessment=loan, recoveryPlan=plan, whatIf=self.planning.what_if(state, 5000, 0, 0), cashFlow=cash_flow(state, reference_date), protection=protected, financialDna=dna, nextBestAction=self.intelligence.next_best_action(recommendations), explainability=self.decisions.explain(loan), auditTrail=self.audit_service.list_for(customer_id, session))

    def customer_matrix(self) -> list[CustomerSummaryResponse]:
        rows: list[CustomerSummaryResponse] = []
        definitions = self.scenarios.list_definitions()
        for persona in self.customers.list_personas():
            customer_id = f"cust-{persona}"
            for scenario, (label, _) in definitions.items():
                if self.scenarios.is_valid(customer_id, scenario):
                    state = self.demo_state(customer_id, scenario, consent_scope=f"catalog:{persona}:{scenario}")
                    rows.append(CustomerSummaryResponse(label=f"{state.customer.firstName} · {label}", persona=persona, scenario=scenario, customer=state.customer, financialState=state.financialState, recommendation=state.recommendations[0]))
        return rows

    def scenarios_list(self) -> list[ScenarioResponse]:
        return [ScenarioResponse(id=scenario, label=label, description=description, supportedPersonas=[persona for persona in self.customers.list_personas() if self.scenarios.is_valid(f"cust-{persona}", scenario)]) for scenario, (label, description) in self.scenarios.list_definitions().items()]

    def ask(self, request: AskRequest, *, consent_scope: str | None = None, resolved_ids: set[str] | None = None, session: SessionRecord | None = None) -> AskResponse:
        active = self._scenario(request.customer_id, request.scenario)
        customer = self.customer(request.customer_id, active)
        consent = self._consent_status(request.customer_id, consent_scope)
        if consent.get("ai_assistant") != "consented":
            raise HTTPException(status_code=403, detail={"code": "CONSENT_REQUIRED", "message": "AI assistant context consent is required for conversational explanations."})
        state = self.state(request.customer_id, active, audit=False, detect_anomalies=consent.get("anomaly_detection") == "consented", resolved_ids=resolved_ids)
        lower = request.question.casefold()
        is_loan = any(token in lower for token in ("loan", "lakh", "लाख", "उधार", "borrow"))
        loan = self.loan(request.customer_id, LoanSimulationRequest(amount=500_000, tenure_months=60, illustrative_apr=13.2, purpose="personal", scenario=active), consent_scope=consent_scope, resolved_ids=resolved_ids, session=session) if is_loan else None
        result = self.ai.explain(question=request.question, first_name=customer.firstName, language=request.language, state=state, loan=loan)
        self.artifacts.ai(session, request.question, result)
        self._audit(request.customer_id, "AI_REQUESTED", session=session, scenario=active, intent=result.intent)
        self._audit(request.customer_id, "AI_EXPLANATION_CREATED", session=session, scenario=active, intent=result.intent, provider=result.provider)
        return result

    def audits_for(self, customer_id: str, session: SessionRecord | None = None) -> list[AuditEventResponse]:
        self._ensure_persona(customer_id)
        return self.audit_service.list_for(customer_id, session)

    @staticmethod
    def consent_scope(session: SessionRecord) -> str:
        return session.account_id

    def resolved_ids(self, session: SessionRecord) -> set[str]:
        return self.protection_events.resolved_ids(session.id, session.customer_id)
