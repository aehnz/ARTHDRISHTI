from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from app.models.domain import SessionRecord
from app.models.schemas import AuditEventResponse
from app.repositories.interfaces import AuditRepository


class AuditService:
    def __init__(self, repository: AuditRepository) -> None:
        self.repository = repository

    def record(
        self,
        *,
        customer_id: str,
        action: str,
        session: SessionRecord | None = None,
        decision: str | None = None,
        entity_type: str | None = None,
        entity_id: str | None = None,
        reason: str | None = None,
        trace_id: str | None = None,
        **metadata: str | int | float | bool | None,
    ) -> AuditEventResponse:
        canonical = customer_id if customer_id.startswith("cust-") else f"cust-{customer_id}"
        if session:
            metadata = {**metadata, "sessionId": session.id, "accountId": session.account_id}
        event = AuditEventResponse(
            eventId=f"audit-{uuid4().hex}",
            timestamp=datetime.now(timezone.utc),
            customerId=canonical,
            eventType=action.casefold(),
            metadata=metadata,
            actorType="DEMO_USER" if session and session.mode == "DEMO" else "USER" if session else "SYSTEM",
            actorId=session.user_id if session else None,
            action=action,
            decision=decision,
            entityType=entity_type,
            entityId=entity_id,
            reason=reason,
            traceId=trace_id,
        )
        self.repository.append(event)
        return event

    def list_for(self, customer_id: str, session: SessionRecord | None = None) -> list[AuditEventResponse]:
        events = self.repository.list_for(customer_id)
        if not session:
            return events
        return [event for event in events if event.metadata.get("accountId") == session.account_id]
