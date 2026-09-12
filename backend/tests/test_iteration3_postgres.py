from __future__ import annotations

import os

import pytest
from sqlalchemy import func, select

from app.core.config import Settings
from app.core.container import create_container
from app.db.base import create_session_factory, session_scope
from app.db.models import AccountModel, DecisionModel, SessionModel, TransactionModel, UserModel
from app.db.seed import seed_database
from app.models.schemas import LoanSimulationRequest


DATABASE_URL = os.getenv("TEST_DATABASE_URL")
pytestmark = pytest.mark.skipif(not DATABASE_URL, reason="TEST_DATABASE_URL is not configured")


def postgres_container():
    return create_container(Settings(repository_backend="postgres", database_url=DATABASE_URL, ai_provider="fallback"))


def test_postgres_seed_auth_restart_isolation_and_artifacts():
    seed_database(DATABASE_URL)
    first = postgres_container()
    accounts = first.auth.demo_accounts()
    assert len(accounts) == 10
    selected = accounts[0]
    challenge = first.auth.start(selected.phone)
    verified, session = first.auth.verify(challenge.challenge_id, selected.otp)
    assert verified.authenticated
    state = first.platform.state(session.customer_id, session.scenario_id, session=session)
    decision = first.platform.loan(session.customer_id, LoanSimulationRequest(amount=500_000, tenure_months=60, illustrative_apr=13.2, purpose="personal", scenario=session.scenario_id), consent_scope=first.platform.consent_scope(session), session=session)
    second = postgres_container()
    restored = second.auth.resolve(session.id)
    assert restored.account_id == session.account_id
    assert second.auth.context(restored).user.customerId == session.customer_id
    other = next(item for item in accounts if item.accountId != selected.accountId)
    assert other.accountId != restored.account_id
    factory = create_session_factory(second.engine)
    with session_scope(factory) as db:
        assert db.scalar(select(func.count()).select_from(UserModel)) == 10
        assert db.scalar(select(func.count()).select_from(AccountModel)) == 10
        assert db.scalar(select(func.count()).select_from(TransactionModel)) > 900
        assert db.get(SessionModel, session.id) is not None
        assert db.scalar(select(func.count()).select_from(DecisionModel).where(DecisionModel.account_id == session.account_id)) >= 1
    second.auth.logout(session.id)
    with pytest.raises(Exception):
        second.auth.resolve(session.id)
