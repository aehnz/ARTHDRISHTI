from __future__ import annotations

from datetime import datetime, timedelta, timezone
from secrets import token_urlsafe
from hashlib import sha256

from fastapi import HTTPException

from app.core.config import Settings
from app.models.domain import OTPChallengeRecord, SessionRecord, UserRecord
from app.models.schemas import (
    AuthContextResponse, AuthStartResponse, AuthVerifyResponse, CustomerResponse,
    DemoAccountResponse, DemoSelectionResponse, LanguagePreferenceRequest, OnboardingConnectionRequest,
    OnboardingGoalsRequest, OnboardingProfileRequest, OnboardingStateResponse,
    ScenarioId, SessionResponse, UserResponse,
)
from app.repositories.interfaces import CustomerRepository, OnboardingRepository, OTPChallengeRepository, ScenarioRepository, SessionRepository, UserRepository
from app.services.audit import AuditService


def masked_phone(phone: str) -> str:
    return f"{phone[:3]}••••••{phone[-4:]}" if phone else "Demo access"


def demo_persona(customer_id: str) -> str | None:
    """Presentation metadata only; never used to derive financial state."""
    value = customer_id.removeprefix("cust-")
    return value if value in {"ravi", "ananya"} else None


class AuthService:
    def __init__(self, *, settings: Settings, users: UserRepository, sessions: SessionRepository, challenges: OTPChallengeRepository, onboarding: OnboardingRepository, customers: CustomerRepository, scenarios: ScenarioRepository, audit: AuditService) -> None:
        self.settings = settings
        self.users = users
        self.sessions = sessions
        self.challenges = challenges
        self.onboarding = onboarding
        self.customers = customers
        self.scenarios = scenarios
        self.audit = audit

    def start(self, phone: str) -> AuthStartResponse:
        now = datetime.now(timezone.utc)
        account = self.users.get_for_phone(phone)
        otp = account.mock_otp if account and account.is_demo_account and account.mock_otp else self.settings.mock_otp
        challenge = OTPChallengeRecord(id=f"otp-{token_urlsafe(18)}", phone=phone, otp=otp, created_at=now, expires_at=now + timedelta(seconds=self.settings.otp_ttl_seconds), max_attempts=self.settings.otp_max_attempts)
        self.challenges.save(challenge)
        return AuthStartResponse(challenge_id=challenge.id, masked_phone=masked_phone(phone), expires_in=self.settings.otp_ttl_seconds)

    def verify(self, challenge_id: str, otp: str) -> tuple[AuthVerifyResponse, SessionRecord]:
        challenge = self.challenges.get(challenge_id)
        now = datetime.now(timezone.utc)
        if not challenge or challenge.used or challenge.expires_at <= now:
            raise HTTPException(status_code=401, detail={"code": "OTP_CHALLENGE_INVALID", "message": "The verification challenge is invalid or expired."})
        challenge.attempts += 1
        if challenge.attempts > challenge.max_attempts:
            self.challenges.save(challenge)
            raise HTTPException(status_code=429, detail={"code": "OTP_ATTEMPTS_EXCEEDED", "message": "Too many verification attempts. Start again."})
        matches = challenge.otp == otp if not challenge.otp.startswith("sha256$") else challenge.otp == "sha256$" + sha256(otp.encode("utf-8")).hexdigest()
        if not matches:
            self.challenges.save(challenge)
            raise HTTPException(status_code=401, detail={"code": "OTP_INVALID", "message": "The one-time password is incorrect."})
        challenge.used = True
        self.challenges.save(challenge)
        user = self.users.get_or_create_for_phone(challenge.phone)
        session = self._new_session(user=user, mode="DEMO" if user.is_demo_account else "NORMAL", customer_id=user.customer_id, scenario=user.scenario_id)
        self.audit.record(customer_id=user.customer_id, action="LOGIN", session=session, entity_type="session", reason="Mock OTP verified")
        return AuthVerifyResponse(authenticated=True, user=self.user_response(user, session.customer_id), onboarding_required=user.onboarding_status != "complete"), session

    def demo_accounts(self) -> list[DemoAccountResponse]:
        definitions = self.scenarios.list_definitions()
        accounts: list[DemoAccountResponse] = []
        for user in self.users.list_demo_accounts():
            customer = self.customers.get(user.customer_id, user.scenario_id)
            if not customer or not user.mock_otp:
                continue
            scenario_label, situation = definitions[user.scenario_id]
            persona = demo_persona(user.customer_id)
            if not persona:
                continue
            accounts.append(DemoAccountResponse(
                accountId=user.id.removeprefix("user-"),
                displayName=f"{customer.firstName} / {scenario_label}",
                phone=user.phone,
                otp=user.mock_otp,
                persona=persona,
                scenario=user.scenario_id,
                scenarioLabel=scenario_label,
                situation=situation,
            ))
        return accounts

    def resolve(self, session_id: str | None) -> SessionRecord:
        if not session_id:
            raise HTTPException(status_code=401, detail={"code": "AUTH_REQUIRED", "message": "Sign in to continue."})
        session = self.sessions.get(session_id)
        now = datetime.now(timezone.utc)
        if not session or session.revoked_at is not None or session.expires_at <= now:
            if session:
                self.sessions.delete(session.id)
            raise HTTPException(status_code=401, detail={"code": "SESSION_EXPIRED", "message": "Your session expired. Sign in again."})
        session.last_seen_at = now
        self.sessions.save(session)
        return session

    def logout(self, session_id: str | None) -> None:
        if not session_id:
            return
        session = self.sessions.get(session_id)
        if session:
            self.audit.record(customer_id=session.customer_id, action="LOGOUT", session=session, entity_type="session")
        self.sessions.delete(session_id)

    def context(self, session: SessionRecord) -> AuthContextResponse:
        user = self.users.get(session.user_id)
        if not user:
            raise HTTPException(status_code=401, detail={"code": "SESSION_INVALID", "message": "The session is no longer valid."})
        customer = self.customers.get(session.customer_id, session.scenario_id)
        if not customer:
            raise HTTPException(status_code=404, detail={"code": "CUSTOMER_NOT_FOUND", "message": "Customer was not found."})
        onboarding = self.onboarding_response(user)
        demo = None
        if session.mode == "DEMO":
            persona = demo_persona(session.customer_id)
            definition = self.scenarios.list_definitions()[session.scenario_id]
            demo = DemoSelectionResponse(customerId=session.customer_id, persona=persona, scenario=session.scenario_id, personaLabel=customer.name, scenarioLabel=definition[0])
        return AuthContextResponse(authenticated=True, session=SessionResponse(mode=session.mode, createdAt=session.created_at, expiresAt=session.expires_at, lastSeenAt=session.last_seen_at), mode=session.mode, user=self.user_response(user, session.customer_id), customer=customer, onboarding=onboarding, demo=demo)

    def update_profile(self, session: SessionRecord, request: OnboardingProfileRequest) -> OnboardingStateResponse:
        user = self._normal_user(session)
        user.name = request.name
        user.language_preference = request.language_preference
        self.users.save(user)
        record = self.onboarding.get(user.id)
        record.profile_completed = True
        self.onboarding.save(record)
        self.audit.record(customer_id=session.customer_id, action="ONBOARDING_PROFILE_UPDATED", session=session, entity_type="user", entity_id=user.id)
        return self.onboarding_response(user)

    def connect_data(self, session: SessionRecord, request: OnboardingConnectionRequest) -> OnboardingStateResponse:
        user = self._normal_user(session)
        if not request.consent_to_connect:
            raise HTTPException(status_code=422, detail={"code": "CONNECTION_CONSENT_REQUIRED", "message": "Confirm the simulated connection to continue."})
        record = self.onboarding.get(user.id)
        record.data_connection_completed = True
        record.connection_label = "Mock bank connection"
        self.onboarding.save(record)
        self.audit.record(customer_id=session.customer_id, action="MOCK_DATA_CONNECTED", session=session, entity_type="data_connection", reason="No external bank was contacted")
        return self.onboarding_response(user)

    def update_goals(self, session: SessionRecord, request: OnboardingGoalsRequest) -> OnboardingStateResponse:
        user = self._normal_user(session)
        record = self.onboarding.get(user.id)
        record.selected_goals = list(dict.fromkeys(request.goals))
        record.goals_completed = True
        self.onboarding.save(record)
        self.audit.record(customer_id=session.customer_id, action="ONBOARDING_GOALS_UPDATED", session=session, entity_type="onboarding")
        return self.onboarding_response(user)

    def mark_consent(self, session: SessionRecord) -> OnboardingStateResponse:
        user = self._normal_user(session)
        record = self.onboarding.get(user.id)
        record.consent_completed = True
        self.onboarding.save(record)
        self.audit.record(customer_id=session.customer_id, action="ONBOARDING_CONSENT_CONFIRMED", session=session, entity_type="consent")
        return self.onboarding_response(user)

    def complete_onboarding(self, session: SessionRecord) -> OnboardingStateResponse:
        user = self._normal_user(session)
        record = self.onboarding.get(user.id)
        if not all((record.profile_completed, record.data_connection_completed, record.goals_completed, record.consent_completed)):
            raise HTTPException(status_code=409, detail={"code": "ONBOARDING_INCOMPLETE", "message": "Complete each onboarding step before continuing."})
        user.onboarding_status = "complete"
        self.users.save(user)
        self.audit.record(customer_id=session.customer_id, action="ONBOARDING_COMPLETED", session=session, entity_type="onboarding")
        return self.onboarding_response(user)

    def update_language(self, session: SessionRecord, request: LanguagePreferenceRequest) -> UserResponse:
        user = self.users.get(session.user_id)
        if not user:
            raise HTTPException(status_code=401, detail={"code": "SESSION_INVALID", "message": "The session is no longer valid."})
        user.language_preference = request.language
        self.users.save(user)
        self.audit.record(customer_id=session.customer_id, action="LANGUAGE_PREFERENCE_UPDATED", session=session, entity_type="user", entity_id=user.id)
        return self.user_response(user, session.customer_id)

    def onboarding_response(self, user: UserRecord) -> OnboardingStateResponse:
        if user.onboarding_status == "complete":
            return OnboardingStateResponse(status="complete", currentStep="complete", profileCompleted=True, dataConnectionCompleted=True, goalsCompleted=True, consentCompleted=True, selectedGoals=self.onboarding.get(user.id).selected_goals, connectionLabel=self.onboarding.get(user.id).connection_label)
        record = self.onboarding.get(user.id)
        step = "profile" if not record.profile_completed else "connection" if not record.data_connection_completed else "goals" if not record.goals_completed else "consent" if not record.consent_completed else "complete"
        return OnboardingStateResponse(status="incomplete", currentStep=step, profileCompleted=record.profile_completed, dataConnectionCompleted=record.data_connection_completed, goalsCompleted=record.goals_completed, consentCompleted=record.consent_completed, selectedGoals=record.selected_goals, connectionLabel=record.connection_label)

    @staticmethod
    def user_response(user: UserRecord, customer_id: str) -> UserResponse:
        return UserResponse(id=user.id, phone=user.phone, maskedPhone=masked_phone(user.phone), name=user.name, customerId=customer_id, languagePreference=user.language_preference, onboardingStatus=user.onboarding_status, createdAt=user.created_at)

    def _new_session(self, *, user: UserRecord, mode: str, customer_id: str, scenario: ScenarioId) -> SessionRecord:
        now = datetime.now(timezone.utc)
        session = SessionRecord(id=token_urlsafe(32), user_id=user.id, mode=mode, customer_id=customer_id, scenario_id=scenario, created_at=now, expires_at=now + timedelta(minutes=self.settings.session_ttl_minutes), last_seen_at=now, account_id=user.account_id)
        self.sessions.save(session)
        return session

    def _normal_user(self, session: SessionRecord) -> UserRecord:
        if session.mode != "NORMAL":
            raise HTTPException(status_code=403, detail={"code": "NORMAL_SESSION_REQUIRED", "message": "This operation belongs to normal-user onboarding."})
        user = self.users.get(session.user_id)
        if not user:
            raise HTTPException(status_code=401, detail={"code": "SESSION_INVALID", "message": "The session is no longer valid."})
        return user
