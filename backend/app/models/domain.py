from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime

from app.models.schemas import Language, ScenarioId, SessionMode


@dataclass
class UserRecord:
    id: str
    phone: str
    name: str
    customer_id: str
    language_preference: Language
    onboarding_status: str
    created_at: datetime
    scenario_id: ScenarioId = "stable"
    is_demo_account: bool = False
    mock_otp: str | None = None
    account_id: str = ""
    account_id: str | None = None


@dataclass
class SessionRecord:
    id: str
    user_id: str
    mode: SessionMode
    customer_id: str
    scenario_id: ScenarioId
    created_at: datetime
    expires_at: datetime
    last_seen_at: datetime
    account_id: str = ""
    revoked_at: datetime | None = None
    account_id: str | None = None
    revoked_at: datetime | None = None
    metadata: dict[str, str] = field(default_factory=dict)


@dataclass
class OTPChallengeRecord:
    id: str
    phone: str
    otp: str
    created_at: datetime
    expires_at: datetime
    attempts: int = 0
    max_attempts: int = 5
    used: bool = False
    max_attempts: int = 5


@dataclass
class OnboardingRecord:
    user_id: str
    profile_completed: bool = False
    data_connection_completed: bool = False
    goals_completed: bool = False
    consent_completed: bool = False
    selected_goals: list[str] = field(default_factory=list)
    connection_label: str | None = None


@dataclass
class ProtectionEventRecord:
    session_id: str
    customer_id: str
    event_id: str
    status: str
    updated_at: datetime
