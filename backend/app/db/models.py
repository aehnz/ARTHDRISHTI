from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Index, Integer, JSON, Numeric, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class UserModel(Base, TimestampMixin):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    phone: Mapped[str] = mapped_column(String(24), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    language_preference: Mapped[str] = mapped_column(String(16), default="en")
    onboarding_status: Mapped[str] = mapped_column(String(24), default="incomplete")
    is_demo_account: Mapped[bool] = mapped_column(Boolean, default=False)
    demo_otp: Mapped[str | None] = mapped_column(String(12))


class CustomerModel(Base, TimestampMixin):
    __tablename__ = "customers"
    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    first_name: Mapped[str] = mapped_column(String(80))
    age: Mapped[int] = mapped_column(Integer)
    location: Mapped[str] = mapped_column(String(160))
    occupation: Mapped[str] = mapped_column(String(160))
    join_date: Mapped[date] = mapped_column(Date)
    kyc_status: Mapped[str] = mapped_column(String(24))
    language_preference: Mapped[str] = mapped_column(String(16))
    synthetic: Mapped[bool] = mapped_column(Boolean, default=True)


class AccountModel(Base, TimestampMixin):
    __tablename__ = "accounts"
    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    customer_id: Mapped[str] = mapped_column(ForeignKey("customers.id"), index=True)
    scenario_id: Mapped[str] = mapped_column(String(32), default="stable")
    provider: Mapped[str] = mapped_column(String(64), default="deterministic_seed")
    status: Mapped[str] = mapped_column(String(24), default="active")


class SessionModel(Base):
    __tablename__ = "sessions"
    id: Mapped[str] = mapped_column(String(128), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    account_id: Mapped[str] = mapped_column(ForeignKey("accounts.id"), index=True)
    customer_id: Mapped[str] = mapped_column(ForeignKey("customers.id"), index=True)
    scenario_id: Mapped[str] = mapped_column(String(32))
    mode: Mapped[str] = mapped_column(String(16))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    last_seen_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)


class OTPChallengeModel(Base):
    __tablename__ = "otp_challenges"
    id: Mapped[str] = mapped_column(String(128), primary_key=True)
    phone: Mapped[str] = mapped_column(String(24), index=True)
    otp_hash: Mapped[str] = mapped_column(String(128))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    max_attempts: Mapped[int] = mapped_column(Integer, default=5)
    used_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class OnboardingModel(Base):
    __tablename__ = "onboarding"
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), primary_key=True)
    profile_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    data_connection_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    goals_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    consent_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    selected_goals: Mapped[list[str]] = mapped_column(JSON, default=list)
    connection_label: Mapped[str | None] = mapped_column(String(120))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class ScenarioFixtureModel(Base):
    __tablename__ = "scenario_fixtures"
    id: Mapped[str] = mapped_column(String(120), primary_key=True)
    customer_id: Mapped[str] = mapped_column(ForeignKey("customers.id"), index=True)
    scenario_id: Mapped[str] = mapped_column(String(32), index=True)
    label: Mapped[str] = mapped_column(String(80))
    description: Mapped[str] = mapped_column(Text)
    source_values: Mapped[dict[str, Any]] = mapped_column(JSON)
    reference_date: Mapped[date] = mapped_column(Date)
    __table_args__ = (UniqueConstraint("customer_id", "scenario_id", name="uq_scenario_customer"),)


class TransactionModel(Base, TimestampMixin):
    __tablename__ = "transactions"
    id: Mapped[str] = mapped_column(String(140), primary_key=True)
    account_id: Mapped[str] = mapped_column(String(80), index=True)
    customer_id: Mapped[str] = mapped_column(ForeignKey("customers.id"), index=True)
    scenario_id: Mapped[str] = mapped_column(String(32), index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    direction: Mapped[str] = mapped_column(String(12))
    merchant: Mapped[str] = mapped_column(String(180), index=True)
    category: Mapped[str] = mapped_column(String(80), index=True)
    subcategory: Mapped[str | None] = mapped_column(String(80))
    channel: Mapped[str] = mapped_column(String(40), default="bank_account")
    description: Mapped[str] = mapped_column(Text)
    currency: Mapped[str] = mapped_column(String(3), default="INR")
    status: Mapped[str] = mapped_column(String(24), default="posted")
    source: Mapped[str] = mapped_column(String(64), default="deterministic_seed")
    recurring_group_id: Mapped[str | None] = mapped_column(String(120), index=True)
    transaction_hash: Mapped[str | None] = mapped_column(String(128), unique=True)
    external_reference: Mapped[str | None] = mapped_column(String(140))
    intelligence: Mapped[str] = mapped_column(Text, default="")
    insight_ids: Mapped[list[str]] = mapped_column(JSON, default=list)


class DebtModel(Base, TimestampMixin):
    __tablename__ = "debts"
    id: Mapped[str] = mapped_column(String(120), primary_key=True)
    account_id: Mapped[str] = mapped_column(String(80), index=True)
    customer_id: Mapped[str] = mapped_column(ForeignKey("customers.id"), index=True)
    scenario_id: Mapped[str] = mapped_column(String(32), index=True)
    lender: Mapped[str] = mapped_column(String(160))
    kind: Mapped[str] = mapped_column(String(80))
    outstanding: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    monthly_emi: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    utilization: Mapped[float] = mapped_column(Numeric(7, 3))
    repayment_status: Mapped[str] = mapped_column(String(32))


class GoalModel(Base, TimestampMixin):
    __tablename__ = "goals"
    id: Mapped[str] = mapped_column(String(120), primary_key=True)
    account_id: Mapped[str] = mapped_column(String(80), index=True)
    customer_id: Mapped[str] = mapped_column(ForeignKey("customers.id"), index=True)
    name: Mapped[str] = mapped_column(String(180))
    target: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    current: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    monthly_contribution: Mapped[Decimal] = mapped_column(Numeric(18, 2))
    target_date: Mapped[date] = mapped_column(Date)
    icon: Mapped[str] = mapped_column(String(40))
    category: Mapped[str] = mapped_column(String(80))
    priority: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(24), default="active")
    version: Mapped[int] = mapped_column(Integer, default=1)


class ConsentModel(Base):
    __tablename__ = "consents"
    id: Mapped[str] = mapped_column(String(180), primary_key=True)
    account_id: Mapped[str] = mapped_column(String(80), index=True)
    customer_id: Mapped[str] = mapped_column(ForeignKey("customers.id"), index=True)
    scope_id: Mapped[str] = mapped_column(String(128), index=True)
    consent_key: Mapped[str] = mapped_column(String(80))
    category: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text)
    purpose: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(24))
    required: Mapped[bool] = mapped_column(Boolean, default=False)
    data_points: Mapped[list[str]] = mapped_column(JSON, default=list)
    version: Mapped[str] = mapped_column(String(20))
    source: Mapped[str] = mapped_column(String(80))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    row_version: Mapped[int] = mapped_column(Integer, default=1)
    __table_args__ = (UniqueConstraint("scope_id", "consent_key", name="uq_consent_scope_key"),)


class ProtectionEventModel(Base):
    __tablename__ = "protection_events"
    id: Mapped[str] = mapped_column(String(180), primary_key=True)
    account_id: Mapped[str] = mapped_column(String(80), index=True)
    customer_id: Mapped[str] = mapped_column(ForeignKey("customers.id"), index=True)
    transaction_id: Mapped[str] = mapped_column(String(140), index=True)
    status: Mapped[str] = mapped_column(String(32))
    detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    resolution: Mapped[str | None] = mapped_column(String(32))
    model_name: Mapped[str] = mapped_column(String(80))
    model_version: Mapped[str] = mapped_column(String(40))
    drivers: Mapped[list[str]] = mapped_column(JSON, default=list)
    __table_args__ = (UniqueConstraint("account_id", "transaction_id", name="uq_protection_account_transaction"),)


class AuditEventModel(Base):
    __tablename__ = "audit_events"
    id: Mapped[str] = mapped_column(String(80), primary_key=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    customer_id: Mapped[str] = mapped_column(String(80), index=True)
    account_id: Mapped[str | None] = mapped_column(String(80), index=True)
    session_id: Mapped[str | None] = mapped_column(String(128), index=True)
    event_type: Mapped[str] = mapped_column(String(80), index=True)
    actor_type: Mapped[str] = mapped_column(String(32))
    actor_id: Mapped[str | None] = mapped_column(String(80))
    entity_type: Mapped[str | None] = mapped_column(String(80))
    entity_id: Mapped[str | None] = mapped_column(String(140))
    decision: Mapped[str | None] = mapped_column(String(80))
    reason: Mapped[str | None] = mapped_column(Text)
    trace_id: Mapped[str | None] = mapped_column(String(120), index=True)
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)


class DecisionModel(Base):
    __tablename__ = "decisions"
    id: Mapped[str] = mapped_column(String(120), primary_key=True)
    customer_id: Mapped[str] = mapped_column(String(80), index=True)
    account_id: Mapped[str] = mapped_column(String(80), index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    decision_type: Mapped[str] = mapped_column(String(80))
    outcome: Mapped[str] = mapped_column(String(80))
    policy_version: Mapped[str] = mapped_column(String(40))
    governance_version: Mapped[str] = mapped_column(String(40))
    inputs: Mapped[dict[str, Any]] = mapped_column(JSON)


class DecisionTraceModel(Base):
    __tablename__ = "decision_traces"
    id: Mapped[str] = mapped_column(String(120), primary_key=True)
    decision_id: Mapped[str] = mapped_column(ForeignKey("decisions.id"), unique=True, index=True)
    feature_snapshot_id: Mapped[str | None] = mapped_column(String(120))
    model_outputs: Mapped[dict[str, Any]] = mapped_column(JSON)
    policy_checks: Mapped[list[dict[str, Any]]] = mapped_column(JSON)
    explanation_factors: Mapped[list[dict[str, Any]]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class SimulationModel(Base):
    __tablename__ = "simulations"
    id: Mapped[str] = mapped_column(String(120), primary_key=True)
    account_id: Mapped[str] = mapped_column(String(80), index=True)
    customer_id: Mapped[str] = mapped_column(String(80), index=True)
    kind: Mapped[str] = mapped_column(String(60))
    inputs: Mapped[dict[str, Any]] = mapped_column(JSON)
    output: Mapped[dict[str, Any]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class RecommendationModel(Base):
    __tablename__ = "recommendations"
    id: Mapped[str] = mapped_column(String(140), primary_key=True)
    account_id: Mapped[str] = mapped_column(String(80), index=True)
    customer_id: Mapped[str] = mapped_column(String(80), index=True)
    recommendation_type: Mapped[str] = mapped_column(String(80))
    priority: Mapped[int] = mapped_column(Integer)
    payload: Mapped[dict[str, Any]] = mapped_column(JSON)
    governance_status: Mapped[str] = mapped_column(String(40))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class FinancialSnapshotModel(Base):
    __tablename__ = "financial_snapshots"
    id: Mapped[str] = mapped_column(String(120), primary_key=True)
    account_id: Mapped[str] = mapped_column(String(80), index=True)
    customer_id: Mapped[str] = mapped_column(String(80), index=True)
    calculated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    state: Mapped[dict[str, Any]] = mapped_column(JSON)
    coverage: Mapped[dict[str, Any]] = mapped_column(JSON)
    engine_version: Mapped[str] = mapped_column(String(40))


class FinancialFeatureModel(Base):
    __tablename__ = "financial_features"
    id: Mapped[str] = mapped_column(String(120), primary_key=True)
    account_id: Mapped[str] = mapped_column(String(80), index=True)
    customer_id: Mapped[str] = mapped_column(String(80), index=True)
    feature_set_version: Mapped[str] = mapped_column(String(40))
    calculated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    features: Mapped[dict[str, Any]] = mapped_column(JSON)
    provenance: Mapped[dict[str, Any]] = mapped_column(JSON)


class AIConversationModel(Base):
    __tablename__ = "ai_conversations"
    id: Mapped[str] = mapped_column(String(120), primary_key=True)
    user_id: Mapped[str] = mapped_column(String(80), index=True)
    account_id: Mapped[str] = mapped_column(String(80), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class AIMessageModel(Base):
    __tablename__ = "ai_messages"
    id: Mapped[str] = mapped_column(String(120), primary_key=True)
    conversation_id: Mapped[str] = mapped_column(ForeignKey("ai_conversations.id"), index=True)
    role: Mapped[str] = mapped_column(String(20))
    content: Mapped[str] = mapped_column(Text)
    provider: Mapped[str | None] = mapped_column(String(80))
    prompt_version: Mapped[str | None] = mapped_column(String(80))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


Index("ix_transactions_account_timestamp", TransactionModel.account_id, TransactionModel.timestamp)
Index("ix_audit_customer_timestamp", AuditEventModel.customer_id, AuditEventModel.timestamp)
