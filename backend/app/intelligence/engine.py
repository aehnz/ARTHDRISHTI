"""Transparent deterministic baselines used by all application services."""

from __future__ import annotations

from collections import Counter, defaultdict
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal, ROUND_HALF_UP
from statistics import median

from app.models.schemas import (
    AnomalyMetadata, CashFlowEvent, CashFlowResponse, ExplainabilityFactor, ExplainabilityResponse,
    FinancialDnaCategory, FinancialDnaResponse, FinancialFeatures, FinancialStateResponse,
    FinancialTimelineEvent, GoalResponse, GovernanceCheck, GovernanceDecision, HealthComponent,
    IncomeState, InsightResponse, LoanSimulationResponse, ModelInferenceResponse,
    NextBestActionResponse, ProtectionResponse, RecommendationResponse, RecoveryPlanResponse,
    RiskState, SavingsState, ScenarioFinancialInputs, ScenarioId, SignalResponse, SpendingState, DebtState, CashFlowState,
    TransactionIntelligenceResponse, TransactionResponse, TrajectoryPoint, WhatIfResponse, WhatIfSnapshot,
)
from app.intelligence.statistical import DataQualityEngine, MerchantIntelligence, RecurringDetector, StressModel
from app.governance.service import GovernanceService


def clamp(value: float, low: int = 0, high: int = 100) -> int:
    return max(low, min(high, round(value)))


def one_decimal(value: float) -> float:
    return round(value, 1)


def inr(amount: int | float) -> str:
    return f"₹{round(amount):,}".replace(",", ",")


class FeatureEngine:
    """Creates the single feature representation consumed by every model boundary."""

    def build(self, source: ScenarioFinancialInputs, transactions: list[TransactionResponse]) -> FinancialFeatures:
        salary_credits = [item.amount for item in transactions if item.category == "Salary"]
        monthly_income = salary_credits[0] if salary_credits else source.income
        essential = source.essential
        discretionary = source.discretionary
        emi = source.emi
        return FinancialFeatures(
            monthlyIncome=monthly_income,
            monthlySpending=essential + discretionary,
            essentialSpending=essential,
            discretionarySpending=discretionary,
            existingEmi=emi,
            emiBurdenRatio=one_decimal(emi / max(1, monthly_income) * 100),
            savings=source.savings,
            savingsRate=source.savings_rate,
            emergencyBufferMonths=source.buffer,
            cashFlowTrend=source.cash_flow_trend,
            spendingTrend=source.spending_trend,
            savingsTrend=source.savings_trend,
            creditUtilization=source.utilization,
            repaymentConsistency=100.0 if all(item.status == "posted" for item in transactions if item.category == "EMI") else 92.0,
            incomeStability=source.income_stability,
            recentAnomalies=sum(item.anomaly for item in transactions if item.date >= source.reference_date - timedelta(days=30)),
            debtToIncome=one_decimal(source.outstanding / max(1, monthly_income * 12) * 100),
            liquidityRatio=one_decimal(source.savings / max(1, essential + emi)),
        )


class UnifiedRiskModel:
    name = "unified_financial_risk"
    version = "1.0.0"

    def __init__(self) -> None:
        self.stress = StressModel()

    def predict(self, features: FinancialFeatures) -> RiskState:
        stress = self.stress.predict(features)
        anomaly = min(25, features.recentAnomalies * 20)
        utilization = max(0, features.creditUtilization - 30) * .2
        score = clamp(stress.probability * 72 + anomaly + utilization, 3, 97)
        band = "low" if score < 30 else "moderate" if score < 50 else "elevated" if score < 85 else "high"
        factors = []
        if features.emergencyBufferMonths < 3: factors.append("Liquidity buffer is below three months")
        if features.emiBurdenRatio > 35: factors.append("EMI burden is elevated")
        if features.cashFlowTrend == "declining": factors.append("Cash flow is declining")
        if features.recentAnomalies: factors.append("A transaction requires verification")
        if not factors: factors.append("No material stress signals")
        return RiskState(level=band, score=score, confidence=.86, signals=factors, contributingFactors=factors, explanation=f"Unified risk combines the {stress.model_name} output with utilization and unusual-activity signals. Stress band: {stress.band}.", modelName=self.name, modelVersion=self.version, inferenceTimestamp=datetime.now(timezone.utc))


class StatisticalAnomalyModel:
    name = "robust_transaction_anomaly"
    version = "1.0.0-synthetic"

    def annotate(self, transactions: list[TransactionResponse]) -> list[TransactionResponse]:
        merchant_frequency = Counter(item.merchant for item in transactions)
        debits = [item.amount for item in transactions if item.type == "debit"]
        baseline = median(debits) if debits else 1
        mad = median([abs(value-baseline) for value in debits]) if debits else 1
        annotated = []
        for item in transactions:
            reasons = []
            robust_z = .6745 * (item.amount-baseline) / max(1,mad)
            if item.type == "debit" and robust_z > 8:
                reasons.append("Amount is materially above the personal category baseline")
            if merchant_frequency[item.merchant] == 1:
                reasons.append("First-seen merchant")
            overnight = int(item.time[:2]) >= 22 or int(item.time[:2]) <= 5
            if overnight:
                reasons.append("Transaction occurred outside the usual time window")
            score = min(99, round(max(0,robust_z)*3 + (24 if merchant_frequency[item.merchant]==1 else 0) + (22 if overnight else 0)))
            detected = len(reasons) >= 3 and score >= 72
            if detected:
                metadata = AnomalyMetadata(score=score, severity="high", confidence=min(96,score), reasons=reasons, recommendedAction="VERIFY THIS TRANSACTION", modelLabel=self.name, modelVersion=self.version)
                annotated.append(item.model_copy(update={"anomaly": True, "status": "under_review", "intelligence": "Unusual amount + unusual hour + first-seen merchant", "anomalyMetadata": metadata}))
            else:
                annotated.append(item)
        return annotated


class FinancialHealthModel:
    name = "financial_resilience_baseline"
    version = "1.0.0"

    def components(self, features: FinancialFeatures, source: ScenarioFinancialInputs) -> list[HealthComponent]:
        surplus = features.monthlyIncome - features.existingEmi - features.monthlySpending
        components = [
            HealthComponent(key="resilience", label="Resilience", score=clamp(28 + features.emergencyBufferMonths * 10, 15, 96), weight=25, trend=features.savingsTrend, explanation=f"{features.emergencyBufferMonths} months of essential commitments are covered.", signals=[f"Buffer {features.emergencyBufferMonths} months", f"Savings {inr(features.savings)}"]),
            HealthComponent(key="liquidity", label="Liquidity", score=clamp(40 + min(35, max(-10, surplus / max(1, features.monthlyIncome) * 100)) * 1.15, 12, 96), weight=20, trend=-6 if features.cashFlowTrend == "declining" else 3, explanation=f"{inr(surplus)} remains after current monthly outflows.", signals=[f"Upcoming {inr(source.upcoming)}", f"Cash flow {features.cashFlowTrend}"]),
            HealthComponent(key="debt", label="Debt", score=clamp(100 - features.emiBurdenRatio * 1.35, 10, 96), weight=20, trend=-2 if features.emiBurdenRatio > 35 else 2, explanation=f"{features.emiBurdenRatio}% of income is committed to EMIs.", signals=[f"{source.accounts} active obligations", f"{inr(source.outstanding)} outstanding"]),
            HealthComponent(key="savings", label="Savings", score=clamp(features.savingsRate * 2.25 + 20, 10, 96), weight=15, trend=features.savingsTrend, explanation=f"{features.savingsRate:g}% of monthly income is being saved.", signals=[f"{inr(source.monthly_contribution)}/month", f"{features.savingsTrend:+g}% trend"]),
            HealthComponent(key="income", label="Income stability", score=91 if features.incomeStability == "stable" else 62 if features.incomeStability == "variable" else 39, weight=10, trend=-12 if features.incomeStability == "declining" else 0, explanation="Income arrived consistently for six months." if features.incomeStability == "stable" else "Recent income is less predictable.", signals=[f"Volatility {'2' if features.incomeStability == 'stable' else '18'}%"]),
            HealthComponent(key="discipline", label="Spending discipline", score=clamp(74 - features.spendingTrend * 1.4, 12, 94), weight=10, trend=-features.spendingTrend, explanation=f"Discretionary spending is {'up' if features.spendingTrend >= 0 else 'down'} {abs(features.spendingTrend):g}%.", signals=[f"Potential leaks {inr(features.discretionarySpending * .18)}"]),
        ]
        return components

    def score(self, components: list[HealthComponent], features: FinancialFeatures) -> int:
        weighted = sum(component.score * component.weight for component in components) / 100
        strong_reserve_bonus = 3 if features.emergencyBufferMonths >= 6 else 0
        return clamp(weighted * .7 + 25 + strong_reserve_bonus, 15, 96)


class IntelligenceEngine:
    def __init__(self) -> None:
        self.feature_engine = FeatureEngine()
        self.risk_model = UnifiedRiskModel()
        self.health_model = FinancialHealthModel()
        self.anomaly_model = StatisticalAnomalyModel()
        self.quality_engine = DataQualityEngine()
        self.merchant_intelligence = MerchantIntelligence()
        self.recurring_detector = RecurringDetector()

    def anomalies(self, transactions: list[TransactionResponse]) -> list[TransactionResponse]:
        return self.anomaly_model.annotate(transactions)

    def state(self, source: ScenarioFinancialInputs, transactions: list[TransactionResponse]) -> FinancialStateResponse:
        features = self.feature_engine.build(source, transactions)
        components = self.health_model.components(features, source)
        health = self.health_model.score(components, features)
        risk = self.risk_model.predict(features)
        surplus = features.monthlyIncome - features.existingEmi - features.monthlySpending
        quality = self.quality_engine.evaluate(transactions, features)
        state_label = "STRESSED" if health <= 55 or (risk.level == "high" and features.recentAnomalies == 0) else "TIGHTENING" if health < 70 or risk.level in ("moderate", "elevated") or (features.cashFlowTrend == "declining" and features.spendingTrend > 5) else "GROWTH" if health >= 80 and features.savingsTrend > 5 and features.cashFlowTrend == "improving" else "STABLE"
        credit_score = clamp((100 - features.creditUtilization) * .45 + (100 - features.emiBurdenRatio) * .35 + health * .2, 25, 94)
        return FinancialStateResponse(
            income=IncomeState(monthly=features.monthlyIncome, annual=features.monthlyIncome * 12, stability=features.incomeStability, lastCreditDate=source.reference_date.replace(day=1), volatility=2 if features.incomeStability == "stable" else 18),
            spending=SpendingState(essential=features.essentialSpending, discretionary=features.discretionarySpending, total=features.monthlySpending, trend=features.spendingTrend, potentialLeaks=round(features.discretionarySpending * .18)),
            debt=DebtState(existingEmi=features.existingEmi, emiBurdenRatio=features.emiBurdenRatio, totalOutstanding=source.outstanding, accounts=source.accounts, utilization=features.creditUtilization),
            savings=SavingsState(total=features.savings, rate=features.savingsRate, trend=features.savingsTrend, bufferMonths=features.emergencyBufferMonths, monthlyContribution=source.monthly_contribution),
            cashFlow=CashFlowState(monthlySurplus=surplus, trend=features.cashFlowTrend, upcomingObligations=source.upcoming),
            risk=risk, healthScore=health, currentStateLabel=state_label, headroom=surplus,
            healthComponents=components,
            creditHealth={"index": "STRONG" if credit_score >= 78 else "MODERATE" if credit_score >= 55 else "NEEDS ATTENTION", "score": credit_score, "factors": ["Repayment consistency", f"Utilization {features.creditUtilization:g}%", f"Debt burden {features.emiBurdenRatio}%", "Indicative index—not a bureau or CIBIL score"]},
            features=features,
            healthBand="STRONG" if health >= 80 else "STABLE" if health >= 70 else "TIGHTENING" if health >= 55 else "STRESSED",
            healthLabel="Strong financial position" if health >= 80 else "Stable financial position" if health >= 70 else "Financial position is tightening" if health >= 55 else "Financial stress needs attention",
            coverage=quality.coverage, confidence=round(min(.94,.55+quality.coverage*.4),2), limitations=quality.limitations,
        )

    def transaction_intelligence(self, transactions: list[TransactionResponse], state: FinancialStateResponse) -> TransactionIntelligenceResponse:
        category_totals: dict[str, int] = defaultdict(int)
        monthly_totals: dict[str, int] = defaultdict(int)
        merchants: Counter[str] = Counter()
        for item in transactions:
            if item.type == "debit":
                category_totals[item.category] += item.amount
                monthly_totals[item.date.strftime("%Y-%m")] += item.amount
                merchants[item.merchant] += item.amount
        total = sum(merchants.values()) or 1
        merchant, amount = merchants.most_common(1)[0] if merchants else ("None", 0)
        profiles = self.merchant_intelligence.profiles(transactions)
        recurring = self.recurring_detector.detect(transactions)
        return TransactionIntelligenceResponse(categoryTotals=dict(category_totals), monthlyTotals=dict(monthly_totals), recurringPayments=sorted(recurring), essentialSpending=state.spending.essential, discretionarySpending=state.spending.discretionary, spendingTrend=state.spending.trend, merchantConcentration=f"{merchant} represents {round(amount / total * 100)}% of recorded debits across {len(profiles)} merchant profiles", unusualSpending=[item.id for item in transactions if item.anomaly], subscriptionLeakage=699 if any(item.category == "Subscriptions" and "low-use" in item.intelligence for item in transactions) else 0, largeTransactions=[item.id for item in transactions if item.type == "debit" and item.amount > state.income.monthly * .2], incomePatterns=["Salary arrived on schedule for 6/6 months"], cashFlowTiming=["Income credits precede recurring obligations", f"Upcoming obligations total {inr(state.cashFlow.upcomingObligations)}"])

    def insights(self, _persona: str, _scenario: ScenarioId, state: FinancialStateResponse, transactions: list[TransactionResponse]) -> list[InsightResponse]:
        if any(item.anomaly for item in transactions):
            anomaly = next(item for item in transactions if item.anomaly)
            return [
                InsightResponse(id="anomaly-detected", type="warning", category="risk", title="A transaction breaks your usual pattern", description=anomaly.intelligence, dataPoints=anomaly.anomalyMetadata.reasons if anomaly.anomalyMetadata else ["Behavioral deviation"], transactionIds=[anomaly.id], timestamp=f"{anomaly.date.isoformat()} · {anomaly.time}", priority=1, actionable=True, action="Verify transaction", confidence=anomaly.anomalyMetadata.confidence if anomaly.anomalyMetadata else 80, impact=f"Protect {inr(anomaly.amount)} from potential loss", whyItMatters="A fast verification can prevent an unresolved debit from weakening liquidity.", suggestedAction="VERIFY THIS TRANSACTION"),
                InsightResponse(id="buffer-watch", type="caution", category="risk", title="Keep the cushion protected", description="The unusual debit would reduce accessible liquidity if left unresolved.", dataPoints=[f"Current buffer {state.savings.bufferMonths} months"], transactionIds=[anomaly.id], timestamp="Today", priority=2, actionable=True, action="Review impact", confidence=89, impact="Protect accessible liquidity", whyItMatters="Unexpected debits compound existing cash-flow pressure.", suggestedAction="Verify before accepting the debit"),
            ]
        if state.healthScore >= 80 and state.savings.bufferMonths >= 5:
            return [
                InsightResponse(id="goal-acceleration", type="positive", category="opportunity", title="Your position can support faster goals", description="Strong liquidity and savings create room to increase goal allocation without weakening resilience.", dataPoints=[f"Buffer {state.savings.bufferMonths} months", f"Savings rate {state.savings.rate:g}%", f"EMI burden {state.debt.emiBurdenRatio}%"], transactionIds=[], timestamp="Today", priority=1, actionable=True, action="Accelerate goals", confidence=91, impact="Home goal up to 7 months sooner", whyItMatters="Surplus above the reserve target can be assigned to explicit goals.", suggestedAction="Increase goal allocation"),
                InsightResponse(id="idle-cash", type="neutral", category="opportunity", title="A portion of cash is above your reserve target", description="Your liquid buffer exceeds six months of commitments. Preserve the reserve and earmark the surplus.", dataPoints=[f"Savings {inr(state.savings.total)}", "Reserve target 6 months"], transactionIds=[], timestamp="Today", priority=2, actionable=True, action="Build allocation plan", confidence=87, impact="₹2.7L available for goal allocation", whyItMatters="Purposeful allocation can accelerate goals while preserving resilience.", suggestedAction="Create a goal allocation plan"),
                InsightResponse(id="positive-savings", type="positive", category="positive", title="Savings improved for a third month", description="Consistent transfers are strengthening long-term flexibility.", dataPoints=[f"Monthly transfer {inr(state.savings.monthlyContribution)}"], transactionIds=[item.id for item in transactions if item.category == "Savings"][:1], timestamp="Current period", priority=3, actionable=False, confidence=98, impact="Stronger resilience this quarter", whyItMatters="Consistency compounds goal progress."),
            ]
        food_ids = [item.id for item in transactions if item.category == "Food"][:8]
        return [
            InsightResponse(id="spending-rise", type="caution", category="money-leak", title=f"Discretionary spending increased {abs(state.spending.trend):g}%", description="Food delivery, shopping and dining rose together and are compressing your financial cushion.", dataPoints=["Food delivery +18%", "Dining +9%", "Underlying transactions linked"], transactionIds=food_ids, timestamp="Today", priority=1, actionable=True, action="Review the transactions", confidence=94, impact="₹4,800 potential monthly saving", whyItMatters="Repeated discretionary increases reduce monthly headroom.", suggestedAction="Set category guardrails"),
            InsightResponse(id="emi-burden", type="warning", category="risk", title="EMI burden is near a high-stress range", description=f"{state.debt.emiBurdenRatio}% of monthly income is already committed before a new borrowing decision.", dataPoints=[f"Income {inr(state.income.monthly)}", f"EMIs {inr(state.debt.existingEmi)}", f"{state.debt.accounts} active obligations"], transactionIds=[item.id for item in transactions if item.category == "EMI"][:3], timestamp="Today", priority=2, actionable=True, action="Open Loan Lab", confidence=99, impact="New credit could push burden above 50%", whyItMatters="High fixed obligations reduce resilience.", suggestedAction="Simulate before borrowing"),
            InsightResponse(id="savings-trend", type="caution", category="behaviour", title="Your savings rhythm changed", description="The saving rate is below its recent baseline.", dataPoints=[f"Savings rate {state.savings.rate:g}%", f"Trend {state.savings.trend:+g}%"], transactionIds=[item.id for item in transactions if item.category == "Savings"][:1], timestamp="Current period", priority=3, actionable=True, action="Restore auto-transfer", confidence=88, impact="Recover monthly headroom", whyItMatters="Delayed savings are often consumed by discretionary spending.", suggestedAction="Restore salary-day transfer"),
            InsightResponse(id="income-stable", type="positive", category="positive", title="Income remains a stabilising signal", description="Salary arrived on schedule for the sixth consecutive month.", dataPoints=["6/6 salary credits on time", f"Volatility {state.income.volatility:g}%"], transactionIds=[item.id for item in transactions if item.category == "Salary"][:6], timestamp="1 Sep", priority=4, actionable=False, confidence=99, impact="Supports a structured recovery plan", whyItMatters="Stable income makes sequenced recovery actions more predictable."),
        ]

    def recommendations(self, _persona: str, _scenario: ScenarioId, state: FinancialStateResponse, insights: list[InsightResponse]) -> list[RecommendationResponse]:
        if state.coverage < .60:
            return [RecommendationResponse(id="await-data", type="education", title="Complete your financial data connection", description="There is not enough authorized account history to produce a suitable action.", whyNow="Coverage is below the minimum decision threshold.", ifYouAct="ARTHDRISHTI can evaluate your state with clearer limitations and confidence.", ifYouDont="No product or financial action will be recommended from incomplete evidence.", expectedImpact="Improved intelligence coverage", timeHorizon="When data is available", signals=[], insightIds=[], priority=1, cta="Review data connection", ctaAction="/onboarding", productRecommendation="NO_PRODUCT_RECOMMENDATION", actionCode="NO_ACTION", confidence=state.confidence, governanceStatus="suppressed")]
        if any(item.id == "anomaly-detected" for item in insights):
            return [RecommendationResponse(id="verify-anomaly", type="protection", title="Verify this transaction", description="Confirm or report the pattern-breaking debit before taking other actions.", whyNow="The merchant, amount and transaction time differ from your history.", ifYouAct="The transaction can be resolved and liquidity protected.", ifYouDont="An unresolved debit may reduce accessible funds.", expectedImpact="Protect the anomalous amount", timeHorizon="Now", signals=["anomaly-detected"], insightIds=["anomaly-detected"], priority=1, cta="Verify transaction", ctaAction="/protection", productRecommendation="NO_PRODUCT_RECOMMENDATION", actionCode="VERIFY_ANOMALY")]
        if state.healthScore >= 80:
            return [RecommendationResponse(id="accelerate-goals", type="planning", title="Accelerate your highest-priority goal", description="Direct only the surplus above a protected reserve toward your highest-priority goal.", whyNow="Strong liquidity, low debt pressure and stable income create safe allocation room.", ifYouAct="The target may be reached sooner while resilience remains protected.", ifYouDont="Unassigned surplus may remain idle.", expectedImpact="Faster goal completion", timeHorizon="12 months", signals=["goal-acceleration", "idle-cash"], insightIds=[item.id for item in insights[:2]], priority=1, cta="Open growth plan", ctaAction="/recovery", productRecommendation="NO_PRODUCT_RECOMMENDATION", actionCode="ACCELERATE_GOAL")]
        return [
            RecommendationResponse(id="build-buffer", type="planning", title="Build your 90-day buffer", description="Recover liquidity through sequenced spending and savings actions before adding a new obligation.", whyNow="Buffer, EMI burden and cash-flow direction collectively show reduced decision room.", ifYouAct="Your buffer and monthly headroom can recover over 90 days.", ifYouDont="A new shock or obligation may create high financial stress.", expectedImpact="Buffer toward 3.2 months", timeHorizon="90 days", signals=["spending-rise", "emi-burden", "savings-trend"], insightIds=[item.id for item in insights[:3]], priority=1, cta="Open recovery plan", ctaAction="/recovery", productRecommendation="NO_PRODUCT_RECOMMENDATION", actionCode="BUILD_90_DAY_BUFFER"),
            RecommendationResponse(id="review-leaks", type="action", title="Reduce repeat discretionary leakage", description="Start with delivery, dining and low-use subscriptions.", whyNow="The same categories increased together.", ifYouAct="Monthly headroom can improve without cutting essentials.", ifYouDont="The buffer can continue to contract.", expectedImpact="₹4,800–₹7,000 monthly headroom", timeHorizon="30 days", signals=["spending-rise"], insightIds=["spending-rise"], priority=2, cta="Review transactions", ctaAction="/transactions", productRecommendation="NO_PRODUCT_RECOMMENDATION", actionCode="REDUCE_DISCRETIONARY_SPEND"),
        ]

    def next_best_action(self, recommendations: list[RecommendationResponse]) -> NextBestActionResponse:
        item = min(recommendations, key=lambda recommendation: recommendation.priority)
        supporting = [entry.title for entry in sorted(recommendations, key=lambda recommendation: recommendation.priority) if entry.id != item.id]
        return NextBestActionResponse(action=item.ctaAction, title=item.title, whyNow=item.whyNow, expectedBenefit=item.ifYouAct, estimatedImpact=item.expectedImpact, recommendationId=item.id, supportingActions=supporting)

    def signals(self, state: FinancialStateResponse) -> list[SignalResponse]:
        return [
            SignalResponse(id="buffer", label="Emergency buffer", value=f"{state.savings.bufferMonths} months", change=state.savings.trend, direction="down" if state.savings.trend < 0 else "up", severity="positive" if state.savings.bufferMonths >= 6 else "info" if state.savings.bufferMonths >= 3 else "warning", description="Accessible savings expressed as months of core commitments.", evidence=[f"Savings {inr(state.savings.total)}", f"Current buffer {state.savings.bufferMonths} months"]),
            SignalResponse(id="emi", label="EMI burden", value=f"{state.debt.emiBurdenRatio}%", direction="stable", severity="critical" if state.debt.emiBurdenRatio > 45 else "warning" if state.debt.emiBurdenRatio > 35 else "positive", description="Share of income committed to existing EMIs.", evidence=[f"EMIs {inr(state.debt.existingEmi)}", f"Income {inr(state.income.monthly)}"]),
            SignalResponse(id="cash", label="Monthly headroom", value=inr(state.cashFlow.monthlySurplus), direction="down" if state.cashFlow.trend == "declining" else "up" if state.cashFlow.trend == "improving" else "stable", severity="positive" if state.cashFlow.monthlySurplus > 30000 else "info" if state.cashFlow.monthlySurplus > 5000 else "critical", description="Income remaining after current spending and debt commitments.", evidence=[f"Upcoming obligations {inr(state.cashFlow.upcomingObligations)}"]),
        ]

    def inference(self, state: FinancialStateResponse) -> ModelInferenceResponse:
        contributions = [
            {"feature": "EMI burden", "value": f"{state.debt.emiBurdenRatio}%", "impact": -22 if state.debt.emiBurdenRatio > 35 else 8},
            {"feature": "Emergency buffer", "value": f"{state.savings.bufferMonths} months", "impact": -18 if state.savings.bufferMonths < 3 else 16},
            {"feature": "Cash-flow trend", "value": state.cashFlow.trend, "impact": -13 if state.cashFlow.trend == "declining" else 10},
            {"feature": "Savings rate", "value": f"{state.savings.rate:g}%", "impact": 14 if state.savings.rate > 25 else -8},
            {"feature": "Income stability", "value": state.income.stability, "impact": 17 if state.income.stability == "stable" else -12},
        ]
        return ModelInferenceResponse(model="Financial resilience index", modelVersion="1.0.0", inferenceType="statistical", score=state.healthScore, confidence=round(state.confidence*100), band="Strong" if state.healthScore >= 80 else "Tightening" if state.healthScore >= 58 else "High stress", contributions=contributions, topFeatures=[item["feature"] for item in sorted(contributions, key=lambda item: abs(item["impact"]), reverse=True)[:3]], interpretation="A decomposable financial-wellness index combining ledger-derived and declared financial features.", disclaimer="Synthetic evaluation only. This is not a bureau score, underwriting result, credit limit, or guarantee of approval.")


class DecisionEngine:
    """Affordability, loan decision and governance in one controlled pipeline."""

    def __init__(self) -> None:
        self.affordability_model = RuleBasedAffordabilityModel()
        self.governance = GovernanceService()

    def loan(self, customer_id: str, state: FinancialStateResponse, amount: int, tenure: int, apr: float, purpose: str, consent_statuses: dict[str, str]) -> LoanSimulationResponse:
        monthly_emi = self.affordability_model.monthly_emi(amount, tenure, apr)
        total_repayment = monthly_emi * tenure
        total_after = state.debt.existingEmi + monthly_emi
        burden = one_decimal(total_after / state.income.monthly * 100)
        remaining = state.cashFlow.monthlySurplus - monthly_emi
        buffer_after = max(0.0, one_decimal(state.savings.bufferMonths - monthly_emi / max(1, state.spending.essential + state.debt.existingEmi)))
        health_after = max(18, round(state.healthScore - max(4, monthly_emi / 1100) - (7 if burden > 50 else 0)))
        band = "Comfortable" if burden <= 32 and buffer_after >= 3 else "Stretched" if burden <= 45 and remaining > 0 else "High stress"
        reasons = [f"Existing EMI burden is {state.debt.emiBurdenRatio}% of income.", f"The new illustrative EMI is {inr(monthly_emi)} per month.", f"Total EMI burden would become {burden}%.", f"The simulated buffer falls from {state.savings.bufferMonths} to {buffer_after} months.", f"Cash flow is currently {state.cashFlow.trend}."]
        missing = [item for item in ("income", "debt") if consent_statuses.get(item) != "consented"]
        unresolved_anomaly = state.features.recentAnomalies > 0
        if not missing and state.coverage < .60:
            decision = "ESCALATE"
        elif missing:
            decision = "BLOCKED"
        elif unresolved_anomaly:
            decision = "BLOCKED"
        elif burden > 50 or remaining < 0 or state.savings.bufferMonths < 1:
            decision = "BLOCKED" if burden > 65 else "NOT_RECOMMENDED_RIGHT_NOW"
        elif burden > 35 or buffer_after < 3 or state.risk.level in ("elevated", "high"):
            decision = "RECOMMENDED_WITH_CAUTION"
        else:
            decision = "RECOMMENDED"
        checks = self.governance.loan_checks(state=state, consent_missing=missing, affordability_band=band, unresolved_anomaly=unresolved_anomaly, proposed_decision=decision)
        governance = GovernanceDecision(decision=decision, reasoning=reasons, checks=checks, alternativeAction=None if decision == "RECOMMENDED" else "BUILD_90_DAY_BUFFER", confidence=.91)
        capacity = max(0, round(max(0, state.income.monthly * .35 - state.debt.existingEmi) * tenure * .72 / 10_000) * 10_000)
        trace_id = f"trace-{customer_id}-{amount}-{tenure}-{round(apr * 10)}"
        return LoanSimulationResponse(simulationId=f"sim-{customer_id}-{amount}-{tenure}-{round(apr * 10)}", requestedAmount=amount, tenure=tenure, apr=apr, monthlyEmi=monthly_emi, totalRepayment=total_repayment, totalInterest=total_repayment - amount, currentEmi=state.debt.existingEmi, totalEmiAfter=total_after, currentEmiBurden=state.debt.emiBurdenRatio, affordabilityRatio=burden, remainingCashFlow=remaining, bufferBefore=state.savings.bufferMonths, bufferAfterEmi=buffer_after, healthAfter=health_after, affordabilityBand=band, borrowingCapacityEstimate=capacity, riskImpact=f"{state.risk.level} → {'high' if burden > 50 else 'elevated' if burden > 40 else state.risk.level}", recommendation=decision, reasoning=reasons, governance=governance, alternativeAction=governance.alternativeAction, confidence=.91, disclaimer="Indicative affordability simulation only. This is not an actual lending approval, eligibility result or guarantee.", traceId=trace_id, purpose=purpose)

    def explain(self, loan: LoanSimulationResponse) -> ExplainabilityResponse:
        return ExplainabilityResponse(decision=loan.recommendation, primaryReasons=loan.reasoning, contributingFactors=[ExplainabilityFactor(factor="emi_burden", value=loan.affordabilityRatio, impact="negative" if loan.affordabilityRatio > 35 else "neutral", explanation="Fixed obligations consume a share of monthly income."), ExplainabilityFactor(factor="buffer", value=loan.bufferAfterEmi, impact="negative" if loan.bufferAfterEmi < 3 else "positive", explanation="Accessible savings provide resilience after borrowing."), ExplainabilityFactor(factor="monthly_headroom", value=loan.remainingCashFlow, impact="negative" if loan.remainingCashFlow < 0 else "positive", explanation="Remaining cash flow absorbs ordinary variation and shocks.")], dataUsed=["consented income", "consented EMI obligations", "consented savings summary", "cash-flow state"], metricsUsed=["illustrative EMI", "projected EMI burden", "buffer after EMI", "remaining monthly headroom"], alternatives=[loan.alternativeAction or "Preserve the current plan", "Reduce the simulated amount", "Extend recovery before reassessment"], limitations=["No bureau score was used", "No lender underwriting was performed", "Projection is illustrative, not guaranteed"], confidence=loan.confidence, traceId=loan.traceId, governanceChecks=loan.governance.checks)


class RuleBasedAffordabilityModel:
    name = "affordability_baseline"
    version = "1.0.0"

    def monthly_emi(self, amount: int, tenure: int, apr: float) -> int:
        principal = Decimal(amount)
        monthly_rate = Decimal(str(apr)) / Decimal(1200)
        if monthly_rate == 0:
            emi = (principal / Decimal(tenure)).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
        else:
            factor = (Decimal(1) + monthly_rate) ** tenure
            emi = (principal * monthly_rate * factor / (factor - Decimal(1))).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
        return int(emi)

class PlanningEngine:
    def trajectory(self, state: FinancialStateResponse, growth: bool, adherence: int = 80) -> list[TrajectoryPoint]:
        factor = adherence / 100
        if growth:
            return [TrajectoryPoint(label="Today", health=state.healthScore, buffer=state.savings.bufferMonths, cashFlow=state.cashFlow.monthlySurplus, savings=state.savings.total, debtBurden=state.debt.emiBurdenRatio, risk=state.risk.level), TrajectoryPoint(label="3 months", health=min(96, round(state.healthScore + 2*factor)), buffer=one_decimal(state.savings.bufferMonths + .3*factor), cashFlow=round(state.cashFlow.monthlySurplus + 4500*factor), projected=True, savings=round(state.savings.total + state.savings.monthlyContribution * 3*factor), debtBurden=max(0, one_decimal(state.debt.emiBurdenRatio - .4*factor)), risk="low"), TrajectoryPoint(label="6 months", health=min(96, round(state.healthScore + 4*factor)), buffer=one_decimal(state.savings.bufferMonths + .6*factor), cashFlow=round(state.cashFlow.monthlySurplus + 8000*factor), projected=True, savings=round(state.savings.total + state.savings.monthlyContribution * 6*factor), debtBurden=max(0, one_decimal(state.debt.emiBurdenRatio - .8*factor)), risk="low"), TrajectoryPoint(label="12 months", health=min(96, round(state.healthScore + 6*factor)), buffer=one_decimal(state.savings.bufferMonths + 1.2*factor), cashFlow=round(state.cashFlow.monthlySurplus + 12000*factor), projected=True, savings=round(state.savings.total + state.savings.monthlyContribution * 12*factor), debtBurden=max(0, one_decimal(state.debt.emiBurdenRatio - 1.5*factor)), risk="low")]
        target_health = 58 if state.healthScore < 40 else 76
        target_buffer = 1.7 if state.healthScore < 40 else 3.2
        return [TrajectoryPoint(label="Today", health=state.healthScore, buffer=state.savings.bufferMonths, cashFlow=state.cashFlow.monthlySurplus, savings=state.savings.total, debtBurden=state.debt.emiBurdenRatio, risk=state.risk.level), TrajectoryPoint(label="30 days", health=round(state.healthScore + (target_health - state.healthScore) * .32*factor), buffer=one_decimal(state.savings.bufferMonths + (target_buffer - state.savings.bufferMonths) * .28*factor), cashFlow=round(state.cashFlow.monthlySurplus + 2500*factor), projected=True, risk="elevated"), TrajectoryPoint(label="60 days", health=round(state.healthScore + (target_health - state.healthScore) * .68*factor), buffer=one_decimal(state.savings.bufferMonths + (target_buffer - state.savings.bufferMonths) * .63*factor), cashFlow=round(state.cashFlow.monthlySurplus + 5200*factor), projected=True, risk="moderate"), TrajectoryPoint(label="90 days", health=round(state.healthScore+(target_health-state.healthScore)*factor), buffer=one_decimal(state.savings.bufferMonths+(target_buffer-state.savings.bufferMonths)*factor), cashFlow=round(state.cashFlow.monthlySurplus + 7600*factor), projected=True, risk="moderate")]

    def plan(self, state: FinancialStateResponse, adherence: int = 80) -> RecoveryPlanResponse:
        growth = state.healthScore >= 80
        trajectory = self.trajectory(state, growth, adherence)
        first, last = trajectory[0], trajectory[-1]
        before = WhatIfSnapshot(income=state.income.monthly, monthlySurplus=first.cashFlow, buffer=first.buffer, emiBurden=state.debt.emiBurdenRatio, health=first.health, risk=state.risk.level)
        after = WhatIfSnapshot(income=state.income.monthly, monthlySurplus=last.cashFlow, buffer=last.buffer, emiBurden=last.debtBurden or state.debt.emiBurdenRatio, health=last.health, risk=last.risk or state.risk.level)
        if growth:
            actions = ["Ring-fence six months of liquidity", "Increase home-goal allocation", "Review expensive debt", "Protect future income"]
            return RecoveryPlanResponse(planType="GROWTH", title="Wealth acceleration plan", description="Grow without weakening what is already strong.", priorityActions=actions, spendingReductionTarget=0, savingsTarget=state.savings.monthlyContribution + 20_000, debtGuidance="Compare prepayment benefit with goal acceleration.", bufferTarget=6, before=before, after=after, trajectory=trajectory, projectedHealthImpact=last.health-first.health, projectedRisk=after.risk, disclaimer="Illustrative financial-wellness projection; outcomes are not guaranteed and this is not an investment recommendation.")
        actions = ["Stop recurring leaks", "Restore salary-day savings transfer", "Create ₹7,000 monthly headroom", "Build the 90-day emergency reserve"]
        return RecoveryPlanResponse(planType="RECOVERY", title="90-day financial recovery plan", description="Small, sequenced moves to restore liquidity and decision room.", priorityActions=actions, spendingReductionTarget=7000, savingsTarget=max(7000, state.savings.monthlyContribution), debtGuidance="Avoid adding fixed obligations while the buffer is below target.", bufferTarget=last.buffer, before=before, after=after, trajectory=trajectory, projectedHealthImpact=last.health-first.health, projectedRisk=after.risk, disclaimer="Illustrative recovery projection; outcomes depend on actual execution and are not guaranteed.")

    def what_if(self, state: FinancialStateResponse, saving_delta: int, income_delta_pct: float, emi_delta: int) -> WhatIfResponse:
        new_income = round(state.income.monthly * (1 + income_delta_pct / 100))
        new_surplus = state.cashFlow.monthlySurplus + (new_income - state.income.monthly) + saving_delta - emi_delta
        new_buffer = one_decimal(max(0, state.savings.bufferMonths + saving_delta * 12 / max(1, state.spending.essential + state.debt.existingEmi)))
        new_burden = one_decimal((state.debt.existingEmi + emi_delta) / max(1, new_income) * 100)
        health_delta = round(saving_delta / 1200 + income_delta_pct * .35 - emi_delta / 1800)
        new_health = clamp(state.healthScore + health_delta, 15, 96)
        new_risk = "low" if new_health >= 78 and new_burden < 35 else "moderate" if new_health >= 65 else "elevated" if new_health >= 45 else "high"
        before = WhatIfSnapshot(income=state.income.monthly, monthlySurplus=state.cashFlow.monthlySurplus, buffer=state.savings.bufferMonths, emiBurden=state.debt.emiBurdenRatio, health=state.healthScore, risk=state.risk.level)
        after = WhatIfSnapshot(income=new_income, monthlySurplus=new_surplus, buffer=new_buffer, emiBurden=new_burden, health=new_health, risk=new_risk)
        delta = WhatIfSnapshot(income=new_income-state.income.monthly, monthlySurplus=new_surplus-state.cashFlow.monthlySurplus, buffer=one_decimal(new_buffer-state.savings.bufferMonths), emiBurden=one_decimal(new_burden-state.debt.emiBurdenRatio), health=new_health-state.healthScore, risk=new_risk)
        direction = "BETTER" if health_delta > 1 else "WORSE" if health_delta < -1 else "NEUTRAL"
        trajectory = [TrajectoryPoint(label="Today", health=before.health, buffer=before.buffer, cashFlow=before.monthlySurplus), TrajectoryPoint(label="3 months", health=round((before.health+after.health)/2), buffer=one_decimal((before.buffer+after.buffer)/2), cashFlow=round((before.monthlySurplus+after.monthlySurplus)/2), projected=True), TrajectoryPoint(label="12 months", health=after.health, buffer=after.buffer, cashFlow=after.monthlySurplus, projected=True)]
        return WhatIfResponse(before=before, after=after, delta=delta, direction=direction, goalImpact="Goal completion accelerates" if direction == "BETTER" else "Goal completion may be delayed" if direction == "WORSE" else "No material goal timing change", trajectory=trajectory, disclaimer="Illustrative simulation only; outcomes are not guaranteed.")


def cash_flow(state: FinancialStateResponse, reference_date: date) -> CashFlowResponse:
    rent = round(state.spending.essential * .72)
    utilities = max(0,state.spending.essential-rent)
    events = [CashFlowEvent(date=reference_date + timedelta(days=1), label="Utilities", amount=utilities, type="expense", recurring=True), CashFlowEvent(date=reference_date + timedelta(days=3), label="Goal savings", amount=state.savings.monthlyContribution, type="saving", recurring=True), CashFlowEvent(date=reference_date + timedelta(days=7), label="EMI obligations", amount=state.debt.existingEmi, type="expense", recurring=True), CashFlowEvent(date=reference_date + timedelta(days=18), label="Home rent", amount=rent, type="expense", recurring=True), CashFlowEvent(date=reference_date + timedelta(days=19), label="Salary credit", amount=state.income.monthly, type="income", recurring=True)]
    next_ten = [event for event in events if event.date <= reference_date + timedelta(days=10)]
    pressure = "tight" if state.cashFlow.monthlySurplus < 5_000 else "watch" if state.cashFlow.monthlySurplus < 20_000 else "comfortable"
    return CashFlowResponse(expectedIncome=state.income.monthly, recurringExpenses=rent+utilities+state.debt.existingEmi, emi=state.debt.existingEmi, rent=rent, utilities=utilities, savings=state.savings.monthlyContribution, discretionarySpending=state.spending.discretionary, upcomingObligations=sum(event.amount for event in next_ten if event.type == "expense"), monthlyHeadroom=state.cashFlow.monthlySurplus, projectedBalance=state.savings.total+state.cashFlow.monthlySurplus, next10Days=next_ten, next30Days=events, referenceDate=reference_date, periodLabel=f"{reference_date.strftime('%B %Y')} commitments", trend=state.cashFlow.trend, pressureLevel=pressure)


def financial_dna(customer_id: str, state: FinancialStateResponse, transactions: list[TransactionResponse]) -> FinancialDnaResponse:
    frequency = round(len(transactions) / 6, 1)
    return FinancialDnaResponse(customerId=customer_id, stateLabel=state.currentStateLabel, features=state.features, categories=[
        FinancialDnaCategory(category="INCOME", metrics={"monthly_income": state.income.monthly, "stability": state.income.stability, "volatility": state.income.volatility, "concentration": "Primary salary"}, signals=["Six-month income pattern assessed"]),
        FinancialDnaCategory(category="SPENDING", metrics={"monthly_spending": state.spending.total, "essential": state.spending.essential, "discretionary": state.spending.discretionary, "trend": state.spending.trend}, signals=[f"Potential leakage {inr(state.spending.potentialLeaks)}"]),
        FinancialDnaCategory(category="DEBT", metrics={"emi_burden": state.debt.emiBurdenRatio, "active_debt": state.debt.totalOutstanding, "utilization": state.debt.utilization, "repayment_consistency": state.features.repaymentConsistency}, signals=[f"{state.debt.accounts} active obligations"]),
        FinancialDnaCategory(category="SAVINGS", metrics={"savings_rate": state.savings.rate, "emergency_buffer": state.savings.bufferMonths, "liquidity": state.features.liquidityRatio, "trend": state.savings.trend}, signals=[f"Monthly contribution {inr(state.savings.monthlyContribution)}"]),
        FinancialDnaCategory(category="BEHAVIOUR", metrics={"monthly_transaction_frequency": frequency, "recurring_pattern": "Consistent", "spending_change": state.spending.trend}, signals=["Recurring income and obligations identified"]),
        FinancialDnaCategory(category="RISK", metrics={"risk_score": state.risk.score, "liquidity_risk": state.savings.bufferMonths, "cash_flow_stress": state.cashFlow.trend, "anomaly_risk": state.features.recentAnomalies}, signals=state.risk.signals),
        FinancialDnaCategory(category="OPPORTUNITY", metrics={"savings_opportunity": state.spending.potentialLeaks, "goal_acceleration": "Available" if state.healthScore >= 80 else "After recovery", "buffer_improvement": max(0, one_decimal(3-state.savings.bufferMonths))}, signals=["Customer-benefit actions only"]),
    ])


def protection(state: FinancialStateResponse, transactions: list[TransactionResponse]) -> ProtectionResponse:
    anomalies = [item for item in transactions if item.anomaly]
    return ProtectionResponse(unresolvedCount=len(anomalies), anomalies=anomalies, stressRisk=state.risk, recommendedAction="VERIFY THIS TRANSACTION" if anomalies else "MONITOR AND PRESERVE RESILIENCE", disclaimer="Statistical unusual-activity screening on available account data; this is not a claim of production fraud-detection accuracy.")


def goals_with_state(goals: list[GoalResponse], state: FinancialStateResponse) -> list[GoalResponse]:
    available = max(0, state.cashFlow.monthlySurplus)
    result = []
    for goal in sorted(goals, key=lambda item: item.priority):
        contribution = min(goal.monthlyContribution, available)
        available -= contribution
        result.append(goal.model_copy(update={"monthlyContribution": contribution}))
    return result


def timeline(state: FinancialStateResponse, reference_date: date) -> list[FinancialTimelineEvent]:
    salary_date = reference_date.replace(day=1)
    savings_date = reference_date.replace(day=7)
    return [FinancialTimelineEvent(date=salary_date.isoformat(), event="Salary credited", type="positive", description="Recurring income arrived on schedule.", impact="Income stability preserved"), FinancialTimelineEvent(date=savings_date.isoformat(), event="Savings transfer observed", type="neutral", description="Goal transfer timing was evaluated.", impact=f"Savings trend {state.savings.trend:+g}%")]
