from __future__ import annotations

from datetime import datetime, time, timezone
from hashlib import sha256

from sqlalchemy import delete

from app.core.config import get_settings
from app.db.base import create_database_engine, create_session_factory, session_scope
from app.db.models import AccountModel, ConsentModel, CustomerModel, DebtModel, GoalModel, OnboardingModel, ProtectionEventModel, ScenarioFixtureModel, TransactionModel, UserModel
from app.seed.data import CUSTOMERS, DEMO_ACCOUNTS, DEMO_DATE, SCENARIOS, SCENARIO_INPUTS, make_consents, make_debts, make_goals, make_transactions


SEED_TIMESTAMP = datetime(2026, 9, 12, 0, 0, tzinfo=timezone.utc)


def seed_database(database_url: str) -> None:
    engine = create_database_engine(database_url)
    factory = create_session_factory(engine)
    with session_scope(factory) as db:
        for persona, values in CUSTOMERS.items():
            customer_id = values["id"]
            customer = db.get(CustomerModel, customer_id)
            if not customer:
                db.add(CustomerModel(id=customer_id, name=values["name"], first_name=values["firstName"], age=values["age"], location=values["location"], occupation=values["occupation"], join_date=datetime.fromisoformat(values["joinDate"]).date(), kyc_status=values["kycStatus"], language_preference=values["languagePreference"], synthetic=True, created_at=SEED_TIMESTAMP))
            for scenario, source in SCENARIO_INPUTS[persona].items():
                label, description = SCENARIOS[scenario]
                fixture_id = f"{customer_id}:{scenario}"
                fixture = db.get(ScenarioFixtureModel, fixture_id)
                if fixture:
                    fixture.source_values, fixture.reference_date = dict(source), DEMO_DATE
                else:
                    db.add(ScenarioFixtureModel(id=fixture_id, customer_id=customer_id, scenario_id=scenario, label=label, description=description, source_values=dict(source), reference_date=DEMO_DATE))
        db.flush()

        for account in DEMO_ACCOUNTS:
            persona, scenario = str(account["persona"]), str(account["scenario_id"])
            user_id, account_id, customer_id = str(account["user_id"]), str(account["account_id"]), str(account["customer_id"])
            profile = CUSTOMERS[persona]
            user = db.get(UserModel, user_id)
            if not user:
                db.add(UserModel(id=user_id, phone=str(account["phone"]), name=profile["name"], language_preference=profile["languagePreference"], onboarding_status="complete", is_demo_account=True, demo_otp=str(account["otp"]), created_at=SEED_TIMESTAMP))
            else:
                user.phone, user.demo_otp, user.onboarding_status = str(account["phone"]), str(account["otp"]), "complete"
            db.flush()
            if not db.get(AccountModel, account_id):
                db.add(AccountModel(id=account_id, user_id=user_id, customer_id=customer_id, scenario_id=scenario, provider="deterministic_seed", status="active", created_at=SEED_TIMESTAMP))
            db.flush()
            if not db.get(OnboardingModel, user_id):
                db.add(OnboardingModel(user_id=user_id, profile_completed=True, data_connection_completed=True, goals_completed=True, consent_completed=True, selected_goals=[], connection_label="Deterministic seed provider", updated_at=SEED_TIMESTAMP))
            db.execute(delete(TransactionModel).where(TransactionModel.customer_id == customer_id, TransactionModel.scenario_id == scenario))
            seeded_transactions = make_transactions(persona, scenario)
            for item in seeded_transactions:
                timestamp = datetime.combine(item.date, time.fromisoformat(item.time), tzinfo=timezone.utc)
                db.add(TransactionModel(id=item.id, account_id=account_id, customer_id=customer_id, scenario_id=scenario, timestamp=timestamp, amount=item.amount, direction=item.type, merchant=item.merchant, category=item.category, subcategory=None, channel=item.paymentMethod, description=item.description, currency="INR", status="posted", source="deterministic_seed", recurring_group_id=f"recurring:{item.merchant}" if item.isRecurring else None, transaction_hash=sha256(f"{account_id}|{item.date}|{item.time}|{item.amount}|{item.merchant}".encode()).hexdigest(), external_reference=None, intelligence=item.intelligence, insight_ids=item.insightIds, created_at=SEED_TIMESTAMP))
            db.execute(delete(DebtModel).where(DebtModel.customer_id == customer_id, DebtModel.scenario_id == scenario))
            for item in make_debts(persona, scenario):
                db.add(DebtModel(id=f"{item.id}-{scenario}", account_id=account_id, customer_id=customer_id, scenario_id=scenario, lender=item.lender, kind=item.kind, outstanding=item.outstanding, monthly_emi=item.monthlyEmi, utilization=item.utilization, repayment_status=item.repaymentStatus, created_at=SEED_TIMESTAMP))
            for item in make_consents(persona):
                consent_id = f"{account_id}:{item.id}"
                consent = db.get(ConsentModel, consent_id)
                values = dict(account_id=account_id, customer_id=customer_id, scope_id=account_id, consent_key=item.id, category=item.category, description=item.description, purpose=item.purpose, status=item.status, required=item.required, data_points=item.dataPoints, version=item.version, source="deterministic_seed", updated_at=item.updatedAt or item.timestamp, row_version=1)
                if consent:
                    for key, value in values.items(): setattr(consent, key, value)
                else:
                    db.add(ConsentModel(id=consent_id, **values))
            if scenario == "anomaly":
                unusual = next(item for item in seeded_transactions if item.id.endswith("anomaly-1"))
                event_id = f"protection-{account_id}-{unusual.id}"
                detected_at = datetime.combine(unusual.date, time.fromisoformat(unusual.time), tzinfo=timezone.utc)
                event = db.get(ProtectionEventModel, event_id)
                if event:
                    event.status, event.detected_at, event.resolved_at, event.resolution = "unresolved", detected_at, None, None
                else:
                    db.add(ProtectionEventModel(id=event_id, account_id=account_id, customer_id=customer_id, transaction_id=unusual.id, status="unresolved", detected_at=detected_at, resolved_at=None, resolution=None, model_name="robust_transaction_anomaly", model_version="1.0.0-synthetic", drivers=["amount deviation", "first-seen merchant", "unusual time window"]))

        for persona in CUSTOMERS:
            customer_id = str(CUSTOMERS[persona]["id"])
            if not db.query(GoalModel).filter(GoalModel.customer_id == customer_id).first():
                account_id = next(str(item["account_id"]) for item in DEMO_ACCOUNTS if item["persona"] == persona)
                for item in make_goals(persona):
                    db.add(GoalModel(id=item.id, account_id=account_id, customer_id=customer_id, name=item.name, target=item.target, current=item.current, monthly_contribution=item.monthlyContribution, target_date=item.targetDate, icon=item.icon, category=item.category, priority=item.priority, status="active", version=1, created_at=SEED_TIMESTAMP))


def main() -> None:
    settings = get_settings()
    if not settings.database_url:
        raise SystemExit("DATABASE_URL is required to seed PostgreSQL")
    seed_database(settings.database_url)
    print("ARTHDRISHTI deterministic seed completed")


if __name__ == "__main__":
    main()
