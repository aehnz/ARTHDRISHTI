from __future__ import annotations

from abc import ABC, abstractmethod

from app.models.domain import OnboardingRecord, OTPChallengeRecord, ProtectionEventRecord, SessionRecord, UserRecord
from app.models.schemas import AuditEventResponse, ConsentItemResponse, CustomerResponse, DebtAccountResponse, GoalResponse, ScenarioFinancialInputs, ScenarioId, TransactionResponse


class CustomerRepository(ABC):
    @abstractmethod
    def get(self, customer_id: str, scenario: ScenarioId) -> CustomerResponse | None: ...

    @abstractmethod
    def list_personas(self) -> list[str]: ...


class TransactionRepository(ABC):
    @abstractmethod
    def list_for(self, customer_id: str, scenario: ScenarioId) -> list[TransactionResponse]: ...


class DebtRepository(ABC):
    @abstractmethod
    def list_for(self, customer_id: str, scenario: ScenarioId) -> list[DebtAccountResponse]: ...


class GoalRepository(ABC):
    @abstractmethod
    def list_for(self, customer_id: str) -> list[GoalResponse]: ...


class ConsentRepository(ABC):
    @abstractmethod
    def list_for(self, customer_id: str, scope_id: str | None = None) -> list[ConsentItemResponse]: ...

    @abstractmethod
    def update(self, customer_id: str, consent_id: str, status: str, scope_id: str | None = None) -> ConsentItemResponse | None: ...


class ScenarioRepository(ABC):
    @abstractmethod
    def source_for(self, customer_id: str, scenario: ScenarioId) -> ScenarioFinancialInputs | None: ...

    @abstractmethod
    def is_valid(self, customer_id: str, scenario: ScenarioId) -> bool: ...

    @abstractmethod
    def list_definitions(self) -> dict[ScenarioId, tuple[str, str]]: ...


class AuditRepository(ABC):
    @abstractmethod
    def append(self, event: AuditEventResponse) -> None: ...

    @abstractmethod
    def list_for(self, customer_id: str) -> list[AuditEventResponse]: ...


class UserRepository(ABC):
    @abstractmethod
    def get(self, user_id: str) -> UserRecord | None: ...

    @abstractmethod
    def get_for_phone(self, phone: str) -> UserRecord | None: ...

    @abstractmethod
    def get_or_create_for_phone(self, phone: str) -> UserRecord: ...

    @abstractmethod
    def list_demo_accounts(self) -> list[UserRecord]: ...

    @abstractmethod
    def save(self, user: UserRecord) -> None: ...


class SessionRepository(ABC):
    @abstractmethod
    def get(self, session_id: str) -> SessionRecord | None: ...

    @abstractmethod
    def save(self, session: SessionRecord) -> None: ...

    @abstractmethod
    def delete(self, session_id: str) -> None: ...


class OTPChallengeRepository(ABC):
    @abstractmethod
    def get(self, challenge_id: str) -> OTPChallengeRecord | None: ...

    @abstractmethod
    def save(self, challenge: OTPChallengeRecord) -> None: ...


class OnboardingRepository(ABC):
    @abstractmethod
    def get(self, user_id: str) -> OnboardingRecord: ...

    @abstractmethod
    def save(self, onboarding: OnboardingRecord) -> None: ...


class ProtectionEventRepository(ABC):
    @abstractmethod
    def get(self, session_id: str, event_id: str) -> ProtectionEventRecord | None: ...

    @abstractmethod
    def save(self, event: ProtectionEventRecord) -> None: ...

    @abstractmethod
    def resolved_ids(self, session_id: str, customer_id: str) -> set[str]: ...
