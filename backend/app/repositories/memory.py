from __future__ import annotations

from datetime import datetime, timezone

from app.models.domain import OnboardingRecord, OTPChallengeRecord, ProtectionEventRecord, SessionRecord, UserRecord
from app.models.schemas import AuditEventResponse, ConsentItemResponse, CustomerResponse, DebtAccountResponse, GoalResponse, ScenarioFinancialInputs, ScenarioId, TransactionResponse
from app.repositories.interfaces import AuditRepository, ConsentRepository, CustomerRepository, DebtRepository, GoalRepository, OnboardingRepository, OTPChallengeRepository, ProtectionEventRepository, ScenarioRepository, SessionRepository, TransactionRepository, UserRepository
from app.seed.data import CUSTOMERS, DEMO_ACCOUNTS, SCENARIOS, SCENARIO_INPUTS, make_consents, make_customer, make_debts, make_goals, make_transactions


def persona_for(customer_id: str) -> str | None:
    if customer_id.startswith("cust-normal-"):
        return "ravi"
    normalized = customer_id.removeprefix("cust-")
    return normalized if normalized in CUSTOMERS else None


def with_customer_id(items: list, customer_id: str) -> list:
    if not customer_id.startswith("cust-normal-"):
        return items
    return [item.model_copy(update={"customerId": customer_id}) for item in items]


class InMemoryCustomerRepository(CustomerRepository):
    def get(self, customer_id: str, scenario: ScenarioId) -> CustomerResponse | None:
        persona = persona_for(customer_id)
        if not persona:
            return None
        customer = make_customer(persona, scenario)
        if customer_id.startswith("cust-normal-"):
            return customer.model_copy(update={
                "id": customer_id,
                "name": "ARTHDRISHTI Customer",
                "firstName": "Customer",
                "location": "India",
                "occupation": "Connected customer",
                "languagePreference": "en",
            })
        return customer

    def list_personas(self) -> list[str]:
        return list(CUSTOMERS)


class InMemoryTransactionRepository(TransactionRepository):
    def list_for(self, customer_id: str, scenario: ScenarioId) -> list[TransactionResponse]:
        persona = persona_for(customer_id)
        return with_customer_id(make_transactions(persona, scenario), customer_id) if persona else []


class InMemoryDebtRepository(DebtRepository):
    def list_for(self, customer_id: str, scenario: ScenarioId) -> list[DebtAccountResponse]:
        persona = persona_for(customer_id)
        return with_customer_id(make_debts(persona, scenario), customer_id) if persona else []


class InMemoryGoalRepository(GoalRepository):
    def list_for(self, customer_id: str) -> list[GoalResponse]:
        persona = persona_for(customer_id)
        return with_customer_id(make_goals(persona), customer_id) if persona else []


class InMemoryConsentRepository(ConsentRepository):
    def __init__(self) -> None:
        self._items: dict[str, list[ConsentItemResponse]] = {}

    def _for(self, customer_id: str, scope_id: str | None) -> list[ConsentItemResponse]:
        persona = persona_for(customer_id)
        if not persona:
            return []
        key = scope_id or persona
        if key not in self._items:
            self._items[key] = make_consents(persona)
        return self._items[key]

    def list_for(self, customer_id: str, scope_id: str | None = None) -> list[ConsentItemResponse]:
        return [item.model_copy(deep=True) for item in self._for(customer_id, scope_id)]

    def update(self, customer_id: str, consent_id: str, status: str, scope_id: str | None = None) -> ConsentItemResponse | None:
        items = self._for(customer_id, scope_id)
        for index, item in enumerate(items):
            if item.id == consent_id:
                if item.required and status != "consented":
                    return None
                updated = item.model_copy(update={"status": status, "updatedAt": datetime.now(timezone.utc)})
                items[index] = updated
                return updated.model_copy(deep=True)
        return None


class InMemoryScenarioRepository(ScenarioRepository):
    def source_for(self, customer_id: str, scenario: ScenarioId) -> ScenarioFinancialInputs | None:
        persona = persona_for(customer_id)
        if not persona or scenario not in SCENARIO_INPUTS[persona]:
            return None
        return ScenarioFinancialInputs(**SCENARIO_INPUTS[persona][scenario])

    def is_valid(self, customer_id: str, scenario: ScenarioId) -> bool:
        return self.source_for(customer_id, scenario) is not None

    def list_definitions(self) -> dict[ScenarioId, tuple[str, str]]:
        return dict(SCENARIOS)


class InMemoryAuditRepository(AuditRepository):
    def __init__(self) -> None:
        self._events: list[AuditEventResponse] = []

    def append(self, event: AuditEventResponse) -> None:
        self._events.append(event)

    def list_for(self, customer_id: str) -> list[AuditEventResponse]:
        return [event for event in self._events if event.customerId == customer_id or event.customerId == f"cust-{customer_id}"]


class InMemoryUserRepository(UserRepository):
    def __init__(self) -> None:
        self._users: dict[str, UserRecord] = {}
        self._phone_index: dict[str, str] = {}
        self._normal_user_count = 0
        now = datetime.now(timezone.utc)
        for account in DEMO_ACCOUNTS:
            persona = str(account["persona"])
            customer = CUSTOMERS[persona]
            self.save(UserRecord(
                id=str(account["user_id"]),
                phone=str(account["phone"]),
                name=str(customer["name"]),
                customer_id=str(account["customer_id"]),
                language_preference=customer["languagePreference"],
                onboarding_status="complete",
                created_at=now,
                scenario_id=account["scenario_id"],
                is_demo_account=True,
                mock_otp=str(account["otp"]),
                account_id=str(account["account_id"]),
            ))

    def get(self, user_id: str) -> UserRecord | None:
        return self._users.get(user_id)

    def get_for_phone(self, phone: str) -> UserRecord | None:
        user_id = self._phone_index.get(phone)
        return self._users.get(user_id) if user_id else None

    def get_or_create_for_phone(self, phone: str) -> UserRecord:
        existing = self.get_for_phone(phone)
        if existing:
            return existing
        self._normal_user_count += 1
        suffix = f"{self._normal_user_count:06d}"
        user = UserRecord(id=f"user-normal-{suffix}", phone=phone, name="New customer", customer_id=f"cust-normal-{suffix}", language_preference="en", onboarding_status="incomplete", created_at=datetime.now(timezone.utc), scenario_id="stable", account_id=f"acct-normal-{suffix}")
        self.save(user)
        return user

    def list_demo_accounts(self) -> list[UserRecord]:
        return [user for user in self._users.values() if user.is_demo_account]

    def save(self, user: UserRecord) -> None:
        self._users[user.id] = user
        if user.phone:
            self._phone_index[user.phone] = user.id


class InMemorySessionRepository(SessionRepository):
    def __init__(self) -> None:
        self._sessions: dict[str, SessionRecord] = {}

    def get(self, session_id: str) -> SessionRecord | None:
        return self._sessions.get(session_id)

    def save(self, session: SessionRecord) -> None:
        self._sessions[session.id] = session

    def delete(self, session_id: str) -> None:
        self._sessions.pop(session_id, None)


class InMemoryOTPChallengeRepository(OTPChallengeRepository):
    def __init__(self) -> None:
        self._challenges: dict[str, OTPChallengeRecord] = {}

    def get(self, challenge_id: str) -> OTPChallengeRecord | None:
        return self._challenges.get(challenge_id)

    def save(self, challenge: OTPChallengeRecord) -> None:
        self._challenges[challenge.id] = challenge


class InMemoryOnboardingRepository(OnboardingRepository):
    def __init__(self) -> None:
        self._records: dict[str, OnboardingRecord] = {}

    def get(self, user_id: str) -> OnboardingRecord:
        if user_id not in self._records:
            self._records[user_id] = OnboardingRecord(user_id=user_id)
        return self._records[user_id]

    def save(self, onboarding: OnboardingRecord) -> None:
        self._records[onboarding.user_id] = onboarding


class InMemoryProtectionEventRepository(ProtectionEventRepository):
    def __init__(self) -> None:
        self._events: dict[tuple[str, str], ProtectionEventRecord] = {}

    def get(self, session_id: str, event_id: str) -> ProtectionEventRecord | None:
        return self._events.get((session_id, event_id))

    def save(self, event: ProtectionEventRecord) -> None:
        self._events[(event.session_id, event.event_id)] = event

    def resolved_ids(self, session_id: str, customer_id: str) -> set[str]:
        return {event.event_id for event in self._events.values() if event.session_id == session_id and event.customer_id == customer_id and event.status in {"CONFIRMED", "DISPUTED", "RESOLVED"}}
