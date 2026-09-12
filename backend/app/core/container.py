from __future__ import annotations

from dataclasses import dataclass
from sqlalchemy.engine import Engine

from app.ai.provider import create_provider
from app.core.config import Settings
from app.intelligence.engine import DecisionEngine, IntelligenceEngine, PlanningEngine
from app.repositories.memory import (
    InMemoryAuditRepository,
    InMemoryConsentRepository,
    InMemoryCustomerRepository,
    InMemoryDebtRepository,
    InMemoryGoalRepository,
    InMemoryOnboardingRepository,
    InMemoryOTPChallengeRepository,
    InMemoryProtectionEventRepository,
    InMemoryScenarioRepository,
    InMemorySessionRepository,
    InMemoryTransactionRepository,
    InMemoryUserRepository,
)
from app.services.audit import AuditService
from app.services.auth import AuthService
from app.services.platform import PlatformService
from app.services.artifacts import ArtifactStore, PostgresArtifactStore
from app.db.base import create_database_engine, create_session_factory
from app.repositories.postgres import (
    PostgresAuditRepository, PostgresConsentRepository, PostgresCustomerRepository,
    PostgresDebtRepository, PostgresGoalRepository, PostgresOnboardingRepository,
    PostgresOTPChallengeRepository, PostgresProtectionEventRepository,
    PostgresScenarioRepository, PostgresSessionRepository,
    PostgresTransactionRepository, PostgresUserRepository,
)


@dataclass
class AppContainer:
    settings: Settings
    auth: AuthService
    platform: PlatformService
    engine: Engine | None = None


def create_container(settings: Settings) -> AppContainer:
    use_postgres = settings.repository_backend.casefold() == "postgres"
    if settings.backend_env.casefold() == "production" and not settings.database_url:
        raise RuntimeError("DATABASE_URL is required in production")
    if use_postgres and not settings.database_url:
        raise RuntimeError("DATABASE_URL is required when REPOSITORY_BACKEND=postgres")
    engine = create_database_engine(settings.database_url) if use_postgres else None
    factory = create_session_factory(engine) if engine else None
    if factory:
        customers, scenarios = PostgresCustomerRepository(factory), PostgresScenarioRepository(factory)
        audit = AuditService(PostgresAuditRepository(factory))
        users, sessions, onboarding = PostgresUserRepository(factory), PostgresSessionRepository(factory), PostgresOnboardingRepository(factory)
        challenges, transactions = PostgresOTPChallengeRepository(factory), PostgresTransactionRepository(factory)
        debts, goals, consents = PostgresDebtRepository(factory), PostgresGoalRepository(factory), PostgresConsentRepository(factory)
        protection_events = PostgresProtectionEventRepository(factory)
        artifacts = PostgresArtifactStore(factory)
    else:
        customers, scenarios = InMemoryCustomerRepository(), InMemoryScenarioRepository()
        audit = AuditService(InMemoryAuditRepository())
        users, sessions, onboarding = InMemoryUserRepository(), InMemorySessionRepository(), InMemoryOnboardingRepository()
        challenges, transactions = InMemoryOTPChallengeRepository(), InMemoryTransactionRepository()
        debts, goals, consents = InMemoryDebtRepository(), InMemoryGoalRepository(), InMemoryConsentRepository()
        protection_events = InMemoryProtectionEventRepository()
        artifacts = ArtifactStore()
    auth = AuthService(
        settings=settings,
        users=users,
        sessions=sessions,
        challenges=challenges,
        onboarding=onboarding,
        customers=customers,
        scenarios=scenarios,
        audit=audit,
    )
    platform = PlatformService(
        customers=customers,
        transactions=transactions,
        debts=debts,
        goals=goals,
        consents=consents,
        scenarios=scenarios,
        protection_events=protection_events,
        audit=audit,
        intelligence=IntelligenceEngine(),
        decisions=DecisionEngine(),
        planning=PlanningEngine(),
        ai=create_provider(settings),
        environment=settings.backend_env,
        database_status="postgresql" if engine else "in-memory",
        artifacts=artifacts,
    )
    return AppContainer(settings=settings, auth=auth, platform=platform, engine=engine)
