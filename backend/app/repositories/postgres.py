from __future__ import annotations

from datetime import date, datetime, timezone
from hashlib import sha256
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session, sessionmaker

from app.db.base import session_scope
from app.db.models import (
    AccountModel, AuditEventModel, ConsentModel, CustomerModel, DebtModel, GoalModel,
    OnboardingModel, OTPChallengeModel, ProtectionEventModel, ScenarioFixtureModel,
    SessionModel, TransactionModel, UserModel,
)
from app.models.domain import OnboardingRecord, OTPChallengeRecord, ProtectionEventRecord, SessionRecord, UserRecord
from app.models.schemas import AuditEventResponse, ConsentItemResponse, CustomerResponse, DebtAccountResponse, GoalResponse, ScenarioFinancialInputs, ScenarioId, TransactionResponse
from app.repositories.interfaces import AuditRepository, ConsentRepository, CustomerRepository, DebtRepository, GoalRepository, OnboardingRepository, OTPChallengeRepository, ProtectionEventRepository, ScenarioRepository, SessionRepository, TransactionRepository, UserRepository
from app.seed.data import DEMO_DATE, SCENARIOS, make_consents


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def otp_digest(value: str) -> str:
    return "sha256$" + sha256(value.encode("utf-8")).hexdigest()


def account_for_user(db: Session, user_id: str) -> AccountModel | None:
    return db.scalar(select(AccountModel).where(AccountModel.user_id == user_id, AccountModel.status == "active").limit(1))


def user_record(db: Session, row: UserModel | None) -> UserRecord | None:
    if not row:
        return None
    account = account_for_user(db, row.id)
    if not account:
        return None
    return UserRecord(id=row.id, phone=row.phone, name=row.name, customer_id=account.customer_id, language_preference=row.language_preference, onboarding_status=row.onboarding_status, created_at=row.created_at, scenario_id=account.scenario_id, is_demo_account=row.is_demo_account, mock_otp=row.demo_otp, account_id=account.id)


class PostgresUserRepository(UserRepository):
    def __init__(self, factory: sessionmaker[Session]) -> None:
        self.factory = factory

    def get(self, user_id: str) -> UserRecord | None:
        with session_scope(self.factory) as db:
            return user_record(db, db.get(UserModel, user_id))

    def get_for_phone(self, phone: str) -> UserRecord | None:
        with session_scope(self.factory) as db:
            return user_record(db, db.scalar(select(UserModel).where(UserModel.phone == phone)))

    def get_or_create_for_phone(self, phone: str) -> UserRecord:
        existing = self.get_for_phone(phone)
        if existing:
            return existing
        now, suffix = utcnow(), uuid4().hex[:12]
        user_id, customer_id, account_id = f"user-normal-{suffix}", f"cust-normal-{suffix}", f"acct-normal-{suffix}"
        with session_scope(self.factory) as db:
            db.add(CustomerModel(id=customer_id, name="ARTHDRISHTI Customer", first_name="Customer", age=18, location="India", occupation="Connected customer", join_date=date.today(), kyc_status="incomplete", language_preference="en", synthetic=True, created_at=now))
            db.add(UserModel(id=user_id, phone=phone, name="New customer", language_preference="en", onboarding_status="incomplete", is_demo_account=False, demo_otp=None, created_at=now))
            db.flush()
            db.add(AccountModel(id=account_id, user_id=user_id, customer_id=customer_id, scenario_id="stable", provider="mock_bank", status="active", created_at=now))
            db.flush()
            db.add(OnboardingModel(user_id=user_id, selected_goals=[], updated_at=now))
            db.add(ScenarioFixtureModel(id=f"{customer_id}:stable", customer_id=customer_id, scenario_id="stable", label="Awaiting connected data", description="Financial intelligence is constrained until account data is available.", source_values={"income": 0, "emi": 0, "savings": 0, "buffer": 0, "essential": 0, "discretionary": 0, "savings_rate": 0, "savings_trend": 0, "spending_trend": 0, "monthly_contribution": 0, "utilization": 0, "outstanding": 0, "accounts": 0, "income_stability": "variable", "cash_flow_trend": "stable", "upcoming": 0}, reference_date=DEMO_DATE))
        created = self.get(user_id)
        assert created
        return created

    def list_demo_accounts(self) -> list[UserRecord]:
        with session_scope(self.factory) as db:
            rows = db.execute(select(UserModel, AccountModel).join(AccountModel, AccountModel.user_id == UserModel.id).where(UserModel.is_demo_account.is_(True), AccountModel.status == "active").order_by(UserModel.id)).all()
            return [UserRecord(id=user.id, phone=user.phone, name=user.name, customer_id=account.customer_id, language_preference=user.language_preference, onboarding_status=user.onboarding_status, created_at=user.created_at, scenario_id=account.scenario_id, is_demo_account=True, mock_otp=user.demo_otp, account_id=account.id) for user, account in rows]

    def save(self, user: UserRecord) -> None:
        with session_scope(self.factory) as db:
            row = db.get(UserModel, user.id)
            if not row:
                row = UserModel(id=user.id, phone=user.phone, name=user.name, language_preference=user.language_preference, onboarding_status=user.onboarding_status, is_demo_account=user.is_demo_account, demo_otp=user.mock_otp, created_at=user.created_at)
                db.add(row)
            else:
                row.phone, row.name, row.language_preference, row.onboarding_status = user.phone, user.name, user.language_preference, user.onboarding_status
                row.updated_at = utcnow()


class PostgresSessionRepository(SessionRepository):
    def __init__(self, factory: sessionmaker[Session]) -> None: self.factory = factory
    def get(self, session_id: str) -> SessionRecord | None:
        with session_scope(self.factory) as db:
            row = db.get(SessionModel, session_id)
            return None if not row else SessionRecord(id=row.id, user_id=row.user_id, mode=row.mode, customer_id=row.customer_id, scenario_id=row.scenario_id, created_at=row.created_at, expires_at=row.expires_at, last_seen_at=row.last_seen_at, account_id=row.account_id, revoked_at=row.revoked_at)
    def save(self, item: SessionRecord) -> None:
        with session_scope(self.factory) as db:
            row = db.get(SessionModel, item.id)
            values = dict(user_id=item.user_id, account_id=item.account_id, customer_id=item.customer_id, scenario_id=item.scenario_id, mode=item.mode, created_at=item.created_at, expires_at=item.expires_at, last_seen_at=item.last_seen_at, revoked_at=item.revoked_at)
            if row:
                for key, value in values.items(): setattr(row, key, value)
            else: db.add(SessionModel(id=item.id, metadata_json={}, **values))
    def delete(self, session_id: str) -> None:
        with session_scope(self.factory) as db:
            row = db.get(SessionModel, session_id)
            if row: row.revoked_at = utcnow()


class PostgresOTPChallengeRepository(OTPChallengeRepository):
    def __init__(self, factory: sessionmaker[Session]) -> None: self.factory = factory
    def get(self, challenge_id: str) -> OTPChallengeRecord | None:
        with session_scope(self.factory) as db:
            row = db.get(OTPChallengeModel, challenge_id)
            return None if not row else OTPChallengeRecord(id=row.id, phone=row.phone, otp=row.otp_hash, created_at=row.created_at, expires_at=row.expires_at, attempts=row.attempts, used=row.used_at is not None, max_attempts=row.max_attempts)
    def save(self, item: OTPChallengeRecord) -> None:
        with session_scope(self.factory) as db:
            row = db.get(OTPChallengeModel, item.id)
            stored = item.otp if item.otp.startswith("sha256$") else otp_digest(item.otp)
            if row:
                row.attempts, row.used_at = item.attempts, utcnow() if item.used and not row.used_at else row.used_at
            else: db.add(OTPChallengeModel(id=item.id, phone=item.phone, otp_hash=stored, created_at=item.created_at, expires_at=item.expires_at, attempts=item.attempts, max_attempts=item.max_attempts))


class PostgresOnboardingRepository(OnboardingRepository):
    def __init__(self, factory: sessionmaker[Session]) -> None: self.factory = factory
    def get(self, user_id: str) -> OnboardingRecord:
        with session_scope(self.factory) as db:
            row = db.get(OnboardingModel, user_id)
            if not row:
                row = OnboardingModel(user_id=user_id, selected_goals=[], updated_at=utcnow()); db.add(row); db.flush()
            return OnboardingRecord(user_id=user_id, profile_completed=row.profile_completed, data_connection_completed=row.data_connection_completed, goals_completed=row.goals_completed, consent_completed=row.consent_completed, selected_goals=list(row.selected_goals or []), connection_label=row.connection_label)
    def save(self, item: OnboardingRecord) -> None:
        with session_scope(self.factory) as db:
            row = db.get(OnboardingModel, item.user_id) or OnboardingModel(user_id=item.user_id, selected_goals=[], updated_at=utcnow())
            row.profile_completed, row.data_connection_completed, row.goals_completed, row.consent_completed = item.profile_completed, item.data_connection_completed, item.goals_completed, item.consent_completed
            row.selected_goals, row.connection_label, row.updated_at = item.selected_goals, item.connection_label, utcnow()
            db.add(row)


class PostgresCustomerRepository(CustomerRepository):
    def __init__(self, factory: sessionmaker[Session]) -> None: self.factory = factory
    def get(self, customer_id: str, scenario: ScenarioId) -> CustomerResponse | None:
        with session_scope(self.factory) as db:
            customer = db.get(CustomerModel, customer_id)
            fixture = db.scalar(select(ScenarioFixtureModel).where(ScenarioFixtureModel.customer_id == customer_id, ScenarioFixtureModel.scenario_id == scenario))
            if not customer or not fixture: return None
            source = fixture.source_values
            return CustomerResponse(id=customer.id, name=customer.name, firstName=customer.first_name, age=customer.age, location=customer.location, occupation=customer.occupation, monthlyIncome=source["income"], existingEmi=source["emi"], savings=source["savings"], financialBuffer=source["buffer"], cashFlowTrend=source["cash_flow_trend"], joinDate=customer.join_date, kycStatus=customer.kyc_status, languagePreference=customer.language_preference, synthetic=customer.synthetic)
    def list_personas(self) -> list[str]:
        with session_scope(self.factory) as db:
            ids = db.scalars(select(CustomerModel.id).where(CustomerModel.id.in_(["cust-ravi", "cust-ananya"]))).all()
            return [item.removeprefix("cust-") for item in ids]


class PostgresScenarioRepository(ScenarioRepository):
    def __init__(self, factory: sessionmaker[Session]) -> None: self.factory = factory
    def source_for(self, customer_id: str, scenario: ScenarioId) -> ScenarioFinancialInputs | None:
        with session_scope(self.factory) as db:
            row = db.scalar(select(ScenarioFixtureModel).where(ScenarioFixtureModel.customer_id == customer_id, ScenarioFixtureModel.scenario_id == scenario))
            return ScenarioFinancialInputs(**row.source_values, reference_date=row.reference_date) if row else None
    def is_valid(self, customer_id: str, scenario: ScenarioId) -> bool: return self.source_for(customer_id, scenario) is not None
    def list_definitions(self) -> dict[ScenarioId, tuple[str, str]]:
        with session_scope(self.factory) as db:
            rows = db.scalars(select(ScenarioFixtureModel).where(ScenarioFixtureModel.customer_id == "cust-ravi")).all()
            return {row.scenario_id: (row.label, row.description) for row in rows} or dict(SCENARIOS)


class PostgresTransactionRepository(TransactionRepository):
    def __init__(self, factory: sessionmaker[Session]) -> None: self.factory = factory
    def list_for(self, customer_id: str, scenario: ScenarioId) -> list[TransactionResponse]:
        with session_scope(self.factory) as db:
            rows = db.scalars(select(TransactionModel).where(TransactionModel.customer_id == customer_id, TransactionModel.scenario_id == scenario).order_by(TransactionModel.timestamp.desc()).limit(1000)).all()
            return [TransactionResponse(id=row.id, customerId=row.customer_id, date=row.timestamp.date(), time=row.timestamp.strftime("%H:%M"), description=row.description, amount=int(row.amount), type=row.direction, category=row.category, merchant=row.merchant, paymentMethod=row.channel, isRecurring=bool(row.recurring_group_id), status=row.status, intelligence=row.intelligence, insightIds=row.insight_ids or []) for row in rows]


class PostgresDebtRepository(DebtRepository):
    def __init__(self, factory: sessionmaker[Session]) -> None: self.factory = factory
    def list_for(self, customer_id: str, scenario: ScenarioId) -> list[DebtAccountResponse]:
        with session_scope(self.factory) as db:
            rows = db.scalars(select(DebtModel).where(DebtModel.customer_id == customer_id, DebtModel.scenario_id == scenario)).all()
            return [DebtAccountResponse(id=row.id, customerId=row.customer_id, lender=row.lender, kind=row.kind, outstanding=int(row.outstanding), monthlyEmi=int(row.monthly_emi), utilization=float(row.utilization), repaymentStatus=row.repayment_status) for row in rows]


class PostgresGoalRepository(GoalRepository):
    def __init__(self, factory: sessionmaker[Session]) -> None: self.factory = factory
    def list_for(self, customer_id: str) -> list[GoalResponse]:
        with session_scope(self.factory) as db:
            rows = db.scalars(select(GoalModel).where(GoalModel.customer_id == customer_id, GoalModel.status == "active").order_by(GoalModel.priority)).all()
            result=[]
            for row in rows:
                remaining=max(0,int(row.target-row.current)); contribution=max(1,int(row.monthly_contribution)); months=max(1,(remaining+contribution-1)//contribution)
                result.append(GoalResponse(id=row.id, customerId=row.customer_id, name=row.name, target=int(row.target), current=int(row.current), monthlyContribution=contribution, targetDate=row.target_date, icon=row.icon, category=row.category, priority=row.priority, progress=round(int(row.current)/max(1,int(row.target))*100,1), remainingAmount=remaining, projectedCompletion=row.target_date, monthsToCompletion=months))
            return result


class PostgresConsentRepository(ConsentRepository):
    def __init__(self, factory: sessionmaker[Session]) -> None: self.factory = factory
    def _ensure(self, db: Session, customer_id: str, scope_id: str) -> None:
        if db.scalar(select(ConsentModel.id).where(ConsentModel.scope_id == scope_id).limit(1)): return
        account_id = db.scalar(select(AccountModel.id).where(AccountModel.id == scope_id).limit(1)) or db.scalar(select(AccountModel.id).where(AccountModel.user_id == scope_id).limit(1)) or db.scalar(select(AccountModel.id).where(AccountModel.customer_id == customer_id).limit(1)) or "unassigned"
        for item in make_consents("ananya" if customer_id == "cust-ananya" else "ravi"):
            db.add(ConsentModel(id=f"{scope_id}:{item.id}", account_id=account_id, customer_id=customer_id, scope_id=scope_id, consent_key=item.id, category=item.category, description=item.description, purpose=item.purpose, status=item.status, required=item.required, data_points=item.dataPoints, version=item.version, source=item.source, updated_at=item.updatedAt or item.timestamp, row_version=1))
        db.flush()
    def list_for(self, customer_id: str, scope_id: str | None = None) -> list[ConsentItemResponse]:
        scope=scope_id or customer_id
        with session_scope(self.factory) as db:
            self._ensure(db,customer_id,scope); rows=db.scalars(select(ConsentModel).where(ConsentModel.scope_id==scope).order_by(ConsentModel.consent_key)).all()
            return [ConsentItemResponse(id=row.consent_key,category=row.category,description=row.description,purpose=row.purpose,status=row.status,required=row.required,dataPoints=row.data_points,timestamp=row.updated_at,version=row.version,source=row.source,updatedAt=row.updated_at) for row in rows]
    def update(self, customer_id: str, consent_id: str, status: str, scope_id: str | None = None) -> ConsentItemResponse | None:
        scope=scope_id or customer_id
        with session_scope(self.factory) as db:
            self._ensure(db,customer_id,scope); row=db.scalar(select(ConsentModel).where(ConsentModel.scope_id==scope,ConsentModel.consent_key==consent_id))
            if not row or (row.required and status!="consented"): return None
            row.status,row.updated_at,row.row_version=status,utcnow(),row.row_version+1
            return ConsentItemResponse(id=row.consent_key,category=row.category,description=row.description,purpose=row.purpose,status=row.status,required=row.required,dataPoints=row.data_points,timestamp=row.updated_at,version=row.version,source=row.source,updatedAt=row.updated_at)


class PostgresAuditRepository(AuditRepository):
    def __init__(self, factory: sessionmaker[Session]) -> None: self.factory=factory
    def append(self,item:AuditEventResponse)->None:
        with session_scope(self.factory) as db:
            metadata={**dict(item.metadata), "action": item.action}; db.add(AuditEventModel(id=item.eventId,timestamp=item.timestamp,customer_id=item.customerId,account_id=metadata.get("accountId"),session_id=metadata.get("sessionId"),event_type=item.eventType,actor_type=item.actorType,actor_id=item.actorId,entity_type=item.entityType,entity_id=item.entityId,decision=item.decision,reason=item.reason,trace_id=item.traceId,metadata_json=metadata))
    def list_for(self,customer_id:str)->list[AuditEventResponse]:
        with session_scope(self.factory) as db:
            rows=db.scalars(select(AuditEventModel).where(AuditEventModel.customer_id==customer_id).order_by(AuditEventModel.timestamp.desc()).limit(500)).all()
            return [AuditEventResponse(eventId=r.id,timestamp=r.timestamp,customerId=r.customer_id,eventType=r.event_type,metadata=r.metadata_json or {},actorType=r.actor_type,actorId=r.actor_id,action=(r.metadata_json or {}).get("action", r.event_type.upper()),decision=r.decision,entityType=r.entity_type,entityId=r.entity_id,reason=r.reason,traceId=r.trace_id) for r in rows]


class PostgresProtectionEventRepository(ProtectionEventRepository):
    def __init__(self,factory:sessionmaker[Session])->None:self.factory=factory
    def get(self,session_id:str,event_id:str)->ProtectionEventRecord|None:
        with session_scope(self.factory) as db:
            session=db.get(SessionModel,session_id)
            row=db.scalar(select(ProtectionEventModel).where(ProtectionEventModel.account_id==session.account_id,ProtectionEventModel.transaction_id==event_id)) if session else None
            return None if not row else ProtectionEventRecord(session_id=session_id,customer_id=row.customer_id,event_id=row.transaction_id,status=row.resolution or row.status,updated_at=row.resolved_at or row.detected_at)
    def save(self,item:ProtectionEventRecord)->None:
        with session_scope(self.factory) as db:
            session=db.get(SessionModel,item.session_id); assert session
            row=db.scalar(select(ProtectionEventModel).where(ProtectionEventModel.account_id==session.account_id,ProtectionEventModel.transaction_id==item.event_id))
            if row: row.status="resolved";row.resolution=item.status;row.resolved_at=item.updated_at
            else: db.add(ProtectionEventModel(id=f"protection-{session.account_id}-{item.event_id}",account_id=session.account_id,customer_id=item.customer_id,transaction_id=item.event_id,status="resolved",detected_at=item.updated_at,resolved_at=item.updated_at,resolution=item.status,model_name="robust_transaction_anomaly",model_version="1.0.0",drivers=[]))
    def resolved_ids(self,session_id:str,customer_id:str)->set[str]:
        with session_scope(self.factory) as db:
            session=db.get(SessionModel,session_id)
            if not session:return set()
            return set(db.scalars(select(ProtectionEventModel.transaction_id).where(ProtectionEventModel.account_id==session.account_id,ProtectionEventModel.customer_id==customer_id,ProtectionEventModel.resolved_at.is_not(None))).all())
