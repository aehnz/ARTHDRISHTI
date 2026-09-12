from __future__ import annotations

from app.ai.provider import FallbackAIProvider, OpusMaxAIProvider
from app.core.config import Settings
from app.core.container import create_container
from app.governance.service import FairnessPolicy
from app.intelligence.statistical import DataQualityEngine, MerchantIntelligence, RecurringDetector, StressModel
from app.models.schemas import FinancialFeatures, LoanSimulationRequest
from app.providers.transactions import RawTransaction, TransactionNormalizer
import pytest


def memory_container():
    return create_container(Settings(repository_backend="memory", database_url="", ai_provider="fallback"))


def test_production_requires_postgres_and_forces_secure_cookie():
    with pytest.raises(ValueError):
        Settings(backend_env="production", repository_backend="memory")
    settings = Settings(backend_env="production", repository_backend="postgres", database_url="postgresql+psycopg://example.invalid/db", session_cookie_secure=False)
    assert settings.session_cookie_secure is True


def test_transaction_normalization_deduplicates_and_normalizes_merchants():
    row = RawTransaction("bank-1", "2026-09-01", "09:00", 82_000, "credit", "  HDFC   Bank Ltd ", "Salary credit")
    invalid = RawTransaction("bank-2", "2026-09-01", "09:00", -2, "debit", "Bad", "invalid")
    result = TransactionNormalizer().normalize([row, row, invalid], "cust-test")
    assert len(result) == 1
    assert result[0].merchant == "HDFC Bank"
    assert result[0].category == "Salary"


def test_recurring_and_merchant_intelligence_use_ledger_history():
    platform = memory_container().platform
    items = platform.transactions.list_for("cust-ravi", "stable")
    profiles = MerchantIntelligence().profiles(items)
    recurring = RecurringDetector().detect(items)
    assert profiles["HDFC Bank"]["frequency"] == 6
    assert {"HDFC Bank", "ICICI Bank", "SBI Card"} <= recurring


def test_stress_model_moves_with_financial_pressure():
    base = dict(monthlyIncome=100_000, monthlySpending=50_000, essentialSpending=35_000, discretionarySpending=15_000, existingEmi=10_000, emiBurdenRatio=10, savings=600_000, savingsRate=30, emergencyBufferMonths=8, cashFlowTrend="stable", spendingTrend=0, savingsTrend=4, creditUtilization=20, repaymentConsistency=100, incomeStability="stable", recentAnomalies=0, debtToIncome=12, liquidityRatio=10)
    healthy = FinancialFeatures(**base)
    stressed = FinancialFeatures(**{**base, "existingEmi": 55_000, "emiBurdenRatio": 55, "emergencyBufferMonths": .4, "cashFlowTrend": "declining", "spendingTrend": 18, "incomeStability": "declining"})
    model = StressModel()
    assert model.predict(stressed).probability > model.predict(healthy).probability
    assert model.predict(stressed).band in {"HIGH", "CRITICAL"}


def test_anomaly_engine_finds_only_pattern_breaking_scenarios():
    platform = memory_container().platform
    for customer in ("cust-ravi", "cust-ananya"):
        assert not any(item.anomaly for item in platform.transaction_list(customer, "stable"))
        anomaly = [item for item in platform.transaction_list(customer, "anomaly") if item.anomaly]
        assert len(anomaly) == 1
        assert len(anomaly[0].anomalyMetadata.reasons) == 3


def test_data_quality_constrains_incomplete_inputs():
    features = FinancialFeatures(monthlyIncome=0, monthlySpending=0, essentialSpending=0, discretionarySpending=0, existingEmi=0, emiBurdenRatio=0, savings=0, savingsRate=0, emergencyBufferMonths=0, cashFlowTrend="stable", spendingTrend=0, savingsTrend=0, creditUtilization=0, repaymentConsistency=100, incomeStability="variable", recentAnomalies=0, debtToIncome=0, liquidityRatio=0)
    report = DataQualityEngine().evaluate([], features)
    assert report.status == "insufficient"
    assert report.coverage < .6
    assert len(report.limitations) >= 3


def test_fairness_policy_is_structural_and_honest():
    policy = FairnessPolicy()
    assert policy.evaluate({"income", "emiBurdenRatio"}).status == "not_applicable"
    assert "NOT_EVALUABLE" in policy.evaluate({"income"}).detail
    assert policy.evaluate({"income", "age"}).status == "failed"


def test_seed_matrix_is_derived_into_distinct_states_and_actions():
    container = memory_container()
    rows = []
    for user in container.auth.users.list_demo_accounts():
        state = container.platform.state(user.customer_id, user.scenario_id, audit=False)
        rec = container.platform.recommendation_list(user.customer_id, user.scenario_id, consent_scope=f"test:{user.account_id}")[0]
        rows.append((user.scenario_id, state.currentStateLabel, state.healthScore, rec.actionCode))
    assert len(rows) == 10
    assert {row[1] for row in rows} >= {"STABLE", "TIGHTENING", "STRESSED", "GROWTH"}
    assert {row[3] for row in rows} >= {"BUILD_90_DAY_BUFFER", "VERIFY_ANOMALY", "ACCELERATE_GOAL"}


def test_governed_loan_blocks_anomaly_and_missing_consent():
    container = memory_container()
    platform = container.platform
    request = LoanSimulationRequest(amount=500_000, tenure_months=60, illustrative_apr=13.2, purpose="education", scenario="anomaly")
    result = platform.loan("cust-ravi", request, consent_scope="governance-test")
    assert result.recommendation == "BLOCKED"
    assert result.purpose == "education"
    assert next(check for check in result.governance.checks if check.name == "Protection hold").status == "failed"
    platform.update_consent("cust-ravi", "debt", "not_consented", consent_scope="governance-test")
    missing = platform.loan("cust-ravi", request.model_copy(update={"scenario": "stable"}), consent_scope="governance-test")
    assert missing.recommendation == "BLOCKED"


def test_fallback_ai_supports_three_languages_without_changing_decision():
    platform = memory_container().platform
    state = platform.state("cust-ravi", "stress", audit=False)
    loan = platform.decisions.loan("cust-ravi", state, 500_000, 60, 13.2, "personal", {"income": "consented", "debt": "consented"})
    provider = FallbackAIProvider()
    for language in ("en", "hi", "hinglish"):
        result = provider.explain(question="Can I afford a 5 lakh loan?", first_name="Ravi", language=language, state=state, loan=loan)
        assert result.language == language
        assert result.decisionReference == loan.simulationId
        assert result.provider == "deterministic-fallback"


def test_opusmax_validates_output_and_falls_back_on_unsafe_claim(monkeypatch):
    platform = memory_container().platform
    state = platform.state("cust-ravi", "stress", audit=False)
    loan = platform.decisions.loan("cust-ravi", state, 500_000, 60, 13.2, "personal", {"income": "consented", "debt": "consented"})
    settings = Settings(ai_provider="opusmax", opusmax_api_key="runtime-secret", opusmax_model="configured-model")
    provider = OpusMaxAIProvider(settings, FallbackAIProvider())

    class Response:
        def raise_for_status(self): pass
        def json(self): return {"content": [{"type": "text", "text": "The bank has approved this loan."}]}

    monkeypatch.setattr("app.ai.provider.httpx.post", lambda *args, **kwargs: Response())
    result = provider.explain(question="loan", first_name="Ravi", language="en", state=state, loan=loan)
    assert result.provider == "deterministic-fallback"
    assert "approved" not in result.message.casefold()
