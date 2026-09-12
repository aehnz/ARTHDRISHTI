"""Persistence boundary for derived intelligence and decision artifacts.

The application remains fully usable with the in-memory repositories, while the
PostgreSQL implementation records the evidence needed to reproduce a decision.
"""

from __future__ import annotations

from datetime import datetime, timezone
from hashlib import sha256
import json
from uuid import uuid4

from sqlalchemy.orm import Session, sessionmaker

from app.ai.prompts import PROMPT_VERSION
from app.db.base import session_scope
from app.db.models import (
    AIConversationModel,
    AIMessageModel,
    DecisionModel,
    DecisionTraceModel,
    FinancialFeatureModel,
    FinancialSnapshotModel,
    RecommendationModel,
    SimulationModel,
)
from app.models.domain import SessionRecord
from app.models.schemas import (
    AskResponse,
    FinancialStateResponse,
    LoanSimulationRequest,
    LoanSimulationResponse,
    RecommendationResponse,
    WhatIfRequest,
    WhatIfResponse,
)


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def json_value(value) -> dict:
    return value.model_dump(mode="json")


class ArtifactStore:
    """No-op adapter used for local, dependency-free test execution."""

    def financial_state(self, session: SessionRecord | None, state: FinancialStateResponse) -> str | None:
        return None

    def recommendations(self, session: SessionRecord | None, items: list[RecommendationResponse]) -> None:
        return None

    def loan(self, session: SessionRecord | None, request: LoanSimulationRequest, result: LoanSimulationResponse, state: FinancialStateResponse) -> None:
        return None

    def what_if(self, session: SessionRecord | None, request: WhatIfRequest, result: WhatIfResponse) -> None:
        return None

    def ai(self, session: SessionRecord | None, question: str, result: AskResponse) -> None:
        return None


class PostgresArtifactStore(ArtifactStore):
    def __init__(self, factory: sessionmaker[Session]) -> None:
        self.factory = factory

    @staticmethod
    def _identity(session: SessionRecord | None) -> tuple[str, str] | None:
        if not session or not session.account_id:
            return None
        return session.account_id, session.customer_id

    def financial_state(self, session: SessionRecord | None, state: FinancialStateResponse) -> str | None:
        identity = self._identity(session)
        if not identity:
            return None
        account_id, customer_id = identity
        snapshot_id = f"state-{account_id}-{state.featureSetVersion}"
        feature_id = f"features-{account_id}-{state.featureSetVersion}"
        now = utcnow()
        with session_scope(self.factory) as db:
            snapshot = db.get(FinancialSnapshotModel, snapshot_id)
            values = json_value(state)
            coverage = {"ratio": state.coverage, "confidence": state.confidence, "limitations": state.limitations}
            if snapshot:
                snapshot.calculated_at, snapshot.state, snapshot.coverage = now, values, coverage
            else:
                db.add(FinancialSnapshotModel(id=snapshot_id, account_id=account_id, customer_id=customer_id, calculated_at=now, state=values, coverage=coverage, engine_version="financial_state_v1"))
            feature = db.get(FinancialFeatureModel, feature_id)
            provenance = {"source": "account_transaction_ledger", "featureSetVersion": state.featureSetVersion, "coverage": state.coverage}
            if feature:
                feature.calculated_at, feature.features, feature.provenance = now, json_value(state.features), provenance
            else:
                db.add(FinancialFeatureModel(id=feature_id, account_id=account_id, customer_id=customer_id, feature_set_version=state.featureSetVersion, calculated_at=now, features=json_value(state.features), provenance=provenance))
        return snapshot_id

    def recommendations(self, session: SessionRecord | None, items: list[RecommendationResponse]) -> None:
        identity = self._identity(session)
        if not identity:
            return
        account_id, customer_id = identity
        now = utcnow()
        with session_scope(self.factory) as db:
            for item in items:
                row_id = f"{account_id}:{item.id}"
                row = db.get(RecommendationModel, row_id)
                payload = json_value(item)
                governance_status = item.governanceStatus
                if row:
                    row.priority, row.payload, row.governance_status, row.created_at = item.priority, payload, governance_status, now
                else:
                    db.add(RecommendationModel(id=row_id, account_id=account_id, customer_id=customer_id, recommendation_type=item.type, priority=item.priority, payload=payload, governance_status=governance_status, created_at=now))

    def loan(self, session: SessionRecord | None, request: LoanSimulationRequest, result: LoanSimulationResponse, state: FinancialStateResponse) -> None:
        identity = self._identity(session)
        if not identity:
            return
        account_id, customer_id = identity
        now = utcnow()
        decision_id = f"{account_id}:{result.simulationId}"
        trace_id = f"{account_id}:{result.traceId}"
        snapshot_id = self.financial_state(session, state)
        inputs = json_value(request)
        output = json_value(result)
        with session_scope(self.factory) as db:
            simulation = db.get(SimulationModel, decision_id)
            if simulation:
                simulation.inputs, simulation.output, simulation.created_at = inputs, output, now
            else:
                db.add(SimulationModel(id=decision_id, account_id=account_id, customer_id=customer_id, kind="loan_affordability", inputs=inputs, output=output, created_at=now))
            decision = db.get(DecisionModel, decision_id)
            if decision:
                decision.timestamp, decision.outcome, decision.inputs = now, result.recommendation, inputs
            else:
                db.add(DecisionModel(id=decision_id, customer_id=customer_id, account_id=account_id, timestamp=now, decision_type="loan_affordability", outcome=result.recommendation, policy_version="affordability_v1", governance_version="governance_v1", inputs=inputs))
            trace = db.get(DecisionTraceModel, trace_id)
            factors = [item.model_dump(mode="json") for item in result.governance.checks]
            outputs = {"monthlyEmi": result.monthlyEmi, "affordabilityRatio": result.affordabilityRatio, "bufferAfterEmi": result.bufferAfterEmi, "healthAfter": result.healthAfter, "outcome": result.recommendation}
            if trace:
                trace.feature_snapshot_id, trace.model_outputs, trace.policy_checks, trace.explanation_factors, trace.created_at = snapshot_id, outputs, factors, factors, now
            else:
                db.add(DecisionTraceModel(id=trace_id, decision_id=decision_id, feature_snapshot_id=snapshot_id, model_outputs=outputs, policy_checks=factors, explanation_factors=factors, created_at=now))

    def what_if(self, session: SessionRecord | None, request: WhatIfRequest, result: WhatIfResponse) -> None:
        identity = self._identity(session)
        if not identity:
            return
        account_id, customer_id = identity
        inputs = json_value(request)
        fingerprint = sha256(json.dumps(inputs, sort_keys=True).encode("utf-8")).hexdigest()[:24]
        row_id = f"what-if-{account_id}-{fingerprint}"
        with session_scope(self.factory) as db:
            row = db.get(SimulationModel, row_id)
            if row:
                row.inputs, row.output, row.created_at = inputs, json_value(result), utcnow()
            else:
                db.add(SimulationModel(id=row_id, account_id=account_id, customer_id=customer_id, kind="what_if", inputs=inputs, output=json_value(result), created_at=utcnow()))

    def ai(self, session: SessionRecord | None, question: str, result: AskResponse) -> None:
        identity = self._identity(session)
        if not identity or not session:
            return
        account_id, _ = identity
        conversation_id = f"conversation-{account_id}-{session.user_id}"
        now = utcnow()
        with session_scope(self.factory) as db:
            conversation = db.get(AIConversationModel, conversation_id)
            if conversation:
                conversation.updated_at = now
            else:
                db.add(AIConversationModel(id=conversation_id, user_id=session.user_id, account_id=account_id, created_at=now, updated_at=now))
            db.add(AIMessageModel(id=f"message-{uuid4().hex}", conversation_id=conversation_id, role="user", content=question, provider=None, prompt_version=PROMPT_VERSION, created_at=now))
            db.add(AIMessageModel(id=f"message-{uuid4().hex}", conversation_id=conversation_id, role="assistant", content=result.message, provider=result.provider, prompt_version=PROMPT_VERSION, created_at=now))
