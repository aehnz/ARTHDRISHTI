from __future__ import annotations

from datetime import date, datetime
from app.core.reference import DEMO_REFERENCE_DATE
from typing import Literal

from pydantic import BaseModel, Field, field_validator


PersonaId = Literal["ravi", "ananya"]
ScenarioId = Literal["stable", "tightening", "stress", "anomaly", "growth"]
Language = Literal["en", "hi", "hinglish"]
RiskBand = Literal["low", "moderate", "elevated", "high"]
SessionMode = Literal["NORMAL", "DEMO"]


class CustomerResponse(BaseModel):
    id: str
    name: str
    firstName: str
    age: int
    location: str
    occupation: str
    monthlyIncome: int
    existingEmi: int
    savings: int
    financialBuffer: float
    cashFlowTrend: Literal["stable", "improving", "declining"]
    joinDate: date
    kycStatus: Literal["verified", "pending", "incomplete"]
    languagePreference: Language
    synthetic: bool = True


class AnomalyMetadata(BaseModel):
    score: int
    severity: Literal["low", "moderate", "high", "critical"]
    confidence: int
    reasons: list[str]
    recommendedAction: str
    modelLabel: str = "Robust transaction anomaly model"
    modelVersion: str = "1.0.0-synthetic"


class TransactionResponse(BaseModel):
    id: str
    customerId: str
    date: date
    time: str
    description: str
    amount: int
    type: Literal["credit", "debit"]
    category: str
    merchant: str
    paymentMethod: str = "bank_account"
    isRecurring: bool = False
    status: Literal["posted", "under_review"] = "posted"
    notes: str | None = None
    intelligence: str
    insightIds: list[str] = Field(default_factory=list)
    anomaly: bool = False
    anomalyMetadata: AnomalyMetadata | None = None


class FinancialFeatures(BaseModel):
    monthlyIncome: int
    monthlySpending: int
    essentialSpending: int
    discretionarySpending: int
    existingEmi: int
    emiBurdenRatio: float
    savings: int
    savingsRate: float
    emergencyBufferMonths: float
    cashFlowTrend: str
    spendingTrend: float
    savingsTrend: float
    creditUtilization: float
    repaymentConsistency: float
    incomeStability: str
    recentAnomalies: int
    debtToIncome: float
    liquidityRatio: float


class HealthComponent(BaseModel):
    key: Literal["resilience", "liquidity", "debt", "savings", "income", "discipline"]
    label: str
    score: int
    weight: int
    trend: float
    explanation: str
    signals: list[str]


class IncomeState(BaseModel):
    monthly: int
    annual: int
    stability: Literal["stable", "variable", "declining"]
    lastCreditDate: date
    volatility: float


class SpendingState(BaseModel):
    essential: int
    discretionary: int
    total: int
    trend: float
    potentialLeaks: int


class DebtState(BaseModel):
    existingEmi: int
    emiBurdenRatio: float
    totalOutstanding: int
    accounts: int
    utilization: float


class DebtAccountResponse(BaseModel):
    id: str
    customerId: str
    lender: str
    kind: str
    outstanding: int
    monthlyEmi: int
    utilization: float
    repaymentStatus: Literal["on_schedule", "attention"]


class SavingsState(BaseModel):
    total: int
    rate: float
    trend: float
    bufferMonths: float
    monthlyContribution: int


class CashFlowState(BaseModel):
    monthlySurplus: int
    trend: Literal["stable", "improving", "declining"]
    upcomingObligations: int


class RiskState(BaseModel):
    level: RiskBand
    signals: list[str]
    score: int
    confidence: float
    explanation: str
    contributingFactors: list[str]
    modelName: str = "unified_financial_risk"
    modelVersion: str = "1.0.0"
    inferenceTimestamp: datetime | None = None


class CreditHealthSummary(BaseModel):
    index: Literal["STRONG", "MODERATE", "NEEDS ATTENTION"]
    score: int
    factors: list[str]


class CreditHealthResponse(BaseModel):
    label: Literal["Indicative Credit Health"]
    index: Literal["STRONG", "MODERATE", "NEEDS ATTENTION"]
    score: int
    factors: list[str]
    riskBand: RiskBand
    recommendations: list[str]
    disclaimer: str


class FinancialStateResponse(BaseModel):
    income: IncomeState
    spending: SpendingState
    debt: DebtState
    savings: SavingsState
    cashFlow: CashFlowState
    risk: RiskState
    healthScore: int
    currentStateLabel: Literal["HEALTHY", "STABLE", "TIGHTENING", "STRESSED", "RECOVERY", "GROWTH"]
    headroom: int
    healthComponents: list[HealthComponent]
    creditHealth: CreditHealthSummary
    features: FinancialFeatures
    healthBand: Literal["STRONG", "STABLE", "TIGHTENING", "STRESSED"] = "STABLE"
    healthLabel: str = "Stable financial position"
    coverage: float = 1.0
    confidence: float = .85
    limitations: list[str] = Field(default_factory=list)
    featureSetVersion: str = "financial_features_v1"


class InsightResponse(BaseModel):
    id: str
    type: Literal["positive", "warning", "caution", "neutral"]
    category: Literal["money-leak", "risk", "opportunity", "behaviour", "positive"]
    title: str
    description: str
    dataPoints: list[str]
    transactionIds: list[str]
    timestamp: str
    priority: int
    actionable: bool
    action: str | None = None
    confidence: int
    impact: str
    whyItMatters: str
    suggestedAction: str | None = None


class SignalResponse(BaseModel):
    id: str
    label: str
    value: str | int | float
    change: float | None = None
    direction: Literal["up", "down", "stable"]
    severity: Literal["info", "positive", "warning", "critical"]
    description: str
    evidence: list[str]


class RecommendationResponse(BaseModel):
    id: str
    type: Literal["action", "education", "protection", "planning"]
    title: str
    description: str
    whyNow: str
    ifYouAct: str
    ifYouDont: str
    expectedImpact: str
    timeHorizon: str
    signals: list[str]
    insightIds: list[str]
    priority: int
    cta: str
    ctaAction: str
    productRecommendation: Literal["NO_PRODUCT_RECOMMENDATION"] | None = None
    actionCode: Literal["BUILD_90_DAY_BUFFER", "BUILD_BUFFER", "VERIFY_ANOMALY", "REDUCE_DISCRETIONARY_SPEND", "REDUCE_SPENDING", "ACCELERATE_GOAL", "PROTECT_LIQUIDITY", "CONSIDER_LOAN", "NO_PRODUCT_RECOMMENDED", "NO_ACTION"] = "NO_PRODUCT_RECOMMENDED"
    confidence: float = .85
    governanceStatus: Literal["eligible", "caution", "suppressed"] = "suppressed"


class NextBestActionResponse(BaseModel):
    action: str
    title: str
    whyNow: str
    expectedBenefit: str
    estimatedImpact: str
    recommendationId: str
    supportingActions: list[str] = Field(default_factory=list)


class GoalResponse(BaseModel):
    id: str
    customerId: str
    name: str
    target: int
    current: int
    monthlyContribution: int
    targetDate: date
    icon: str
    category: str
    priority: int
    progress: float
    remainingAmount: int
    projectedCompletion: date
    monthsToCompletion: int
    monthsSaved: int = 0


class GoalSimulationRequest(BaseModel):
    extra_monthly_contribution: int = Field(default=0, ge=0, le=500_000)
    scenario: ScenarioId | None = None


class TrajectoryPoint(BaseModel):
    label: str
    health: int
    buffer: float
    cashFlow: int
    projected: bool = False
    savings: int | None = None
    debtBurden: float | None = None
    risk: RiskBand | None = None


class FinancialTimelineEvent(BaseModel):
    date: str
    event: str
    type: Literal["positive", "negative", "neutral"]
    description: str
    impact: str | None = None


class FeatureContribution(BaseModel):
    feature: str
    value: str
    impact: int


class ModelInferenceResponse(BaseModel):
    model: str
    modelVersion: str
    inferenceType: Literal["deterministic", "statistical", "model"]
    score: int
    confidence: int
    band: str
    contributions: list[FeatureContribution]
    topFeatures: list[str]
    interpretation: str
    disclaimer: str


class ConsentItemResponse(BaseModel):
    id: str
    category: str
    description: str
    purpose: str
    status: Literal["consented", "not_consented", "partial"]
    required: bool
    dataPoints: list[str]
    timestamp: datetime
    version: str
    source: str
    updatedAt: datetime | None = None


class ConsentUpdateRequest(BaseModel):
    status: Literal["consented", "not_consented", "partial"]


class GovernanceCheck(BaseModel):
    name: str
    status: Literal["passed", "caution", "failed", "not_applicable"]
    detail: str


class GovernanceDecision(BaseModel):
    decision: Literal["RECOMMENDED", "RECOMMENDED_WITH_CAUTION", "NOT_RECOMMENDED_RIGHT_NOW", "BLOCKED", "ESCALATE"]
    reasoning: list[str]
    checks: list[GovernanceCheck]
    alternativeAction: str | None = None
    confidence: float


class LoanSimulationRequest(BaseModel):
    amount: int = Field(ge=10_000, le=10_000_000)
    tenure_months: int = Field(ge=3, le=360)
    illustrative_apr: float = Field(default=13.2, ge=0, le=50)
    purpose: str = Field(default="personal", min_length=2, max_length=100)
    scenario: ScenarioId | None = None


class LoanSimulationResponse(BaseModel):
    simulationId: str
    requestedAmount: int
    tenure: int
    apr: float
    monthlyEmi: int
    totalRepayment: int
    totalInterest: int
    currentEmi: int
    totalEmiAfter: int
    currentEmiBurden: float
    affordabilityRatio: float
    remainingCashFlow: int
    bufferBefore: float
    bufferAfterEmi: float
    healthAfter: int
    affordabilityBand: Literal["Comfortable", "Stretched", "High stress"]
    borrowingCapacityEstimate: int
    riskImpact: str
    recommendation: Literal["RECOMMENDED", "RECOMMENDED_WITH_CAUTION", "NOT_RECOMMENDED_RIGHT_NOW", "BLOCKED", "ESCALATE"]
    reasoning: list[str]
    governance: GovernanceDecision
    alternativeAction: str | None
    confidence: float
    disclaimer: str
    traceId: str = ""
    purpose: str = "personal"
    purposePolicy: str = "Captured for the simulation; the current mock policy applies the same affordability thresholds to every supported purpose."


class WhatIfRequest(BaseModel):
    monthly_saving_delta: int = Field(default=0, ge=-200_000, le=500_000)
    income_delta_pct: float = Field(default=0, ge=-90, le=300)
    emi_delta: int = Field(default=0, ge=-500_000, le=1_000_000)
    scenario: ScenarioId | None = None


class WhatIfSnapshot(BaseModel):
    income: int
    monthlySurplus: int
    buffer: float
    emiBurden: float
    health: int
    risk: RiskBand


class WhatIfResponse(BaseModel):
    before: WhatIfSnapshot
    after: WhatIfSnapshot
    delta: WhatIfSnapshot
    direction: Literal["BETTER", "WORSE", "NEUTRAL"]
    goalImpact: str
    trajectory: list[TrajectoryPoint]
    disclaimer: str


class RecoveryPlanResponse(BaseModel):
    planType: Literal["RECOVERY", "GROWTH"]
    title: str
    description: str
    priorityActions: list[str]
    spendingReductionTarget: int
    savingsTarget: int
    debtGuidance: str
    bufferTarget: float
    before: WhatIfSnapshot
    after: WhatIfSnapshot
    trajectory: list[TrajectoryPoint]
    projectedHealthImpact: int
    projectedRisk: RiskBand
    disclaimer: str


class PlanSimulationRequest(BaseModel):
    adherence: int = Field(default=80, ge=0, le=100)
    scenario: ScenarioId | None = None


class CashFlowEvent(BaseModel):
    date: date
    label: str
    amount: int
    type: Literal["income", "expense", "saving"]
    recurring: bool


class CashFlowResponse(BaseModel):
    expectedIncome: int
    recurringExpenses: int
    emi: int
    rent: int
    utilities: int
    savings: int
    discretionarySpending: int
    upcomingObligations: int
    monthlyHeadroom: int
    projectedBalance: int
    next10Days: list[CashFlowEvent]
    next30Days: list[CashFlowEvent]
    referenceDate: date
    periodLabel: str
    trend: Literal["stable", "improving", "declining"]
    pressureLevel: Literal["comfortable", "watch", "tight"]


class FinancialDnaCategory(BaseModel):
    category: Literal["INCOME", "SPENDING", "DEBT", "SAVINGS", "BEHAVIOUR", "RISK", "OPPORTUNITY"]
    metrics: dict[str, str | int | float]
    signals: list[str]


class FinancialDnaResponse(BaseModel):
    customerId: str
    stateLabel: str
    categories: list[FinancialDnaCategory]
    features: FinancialFeatures
    generatedBy: str = "Financial feature engine v1"


class ProtectionResponse(BaseModel):
    unresolvedCount: int
    anomalies: list[TransactionResponse]
    stressRisk: RiskState
    recommendedAction: str
    disclaimer: str
    capabilityAvailable: bool = True
    limitation: str | None = None


class ExplainabilityFactor(BaseModel):
    factor: str
    value: str | int | float
    impact: Literal["positive", "neutral", "negative"]
    explanation: str


class ExplainabilityResponse(BaseModel):
    decision: str
    primaryReasons: list[str]
    contributingFactors: list[ExplainabilityFactor]
    dataUsed: list[str]
    metricsUsed: list[str]
    alternatives: list[str]
    limitations: list[str]
    confidence: float
    traceId: str = ""
    governanceChecks: list[GovernanceCheck] = Field(default_factory=list)


class TransactionIntelligenceResponse(BaseModel):
    categoryTotals: dict[str, int]
    monthlyTotals: dict[str, int]
    recurringPayments: list[str]
    essentialSpending: int
    discretionarySpending: int
    spendingTrend: float
    merchantConcentration: str
    unusualSpending: list[str]
    subscriptionLeakage: int
    largeTransactions: list[str]
    incomePatterns: list[str]
    cashFlowTiming: list[str]


class AuditEventResponse(BaseModel):
    eventId: str
    timestamp: datetime
    customerId: str
    eventType: str
    metadata: dict[str, str | int | float | bool | None]
    actorType: Literal["USER", "DEMO_USER", "SYSTEM", "AI"] = "SYSTEM"
    actorId: str | None = None
    action: str | None = None
    decision: str | None = None
    entityType: str | None = None
    entityId: str | None = None
    reason: str | None = None
    traceId: str | None = None


class ScenarioResponse(BaseModel):
    id: ScenarioId
    label: str
    description: str
    supportedPersonas: list[PersonaId]


class AskRequest(BaseModel):
    customer_id: str
    question: str = Field(min_length=2, max_length=2_000)
    language: Language = "en"
    scenario: ScenarioId | None = None

    @field_validator("question")
    @classmethod
    def no_blank_question(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Question must not be blank")
        return value.strip()


class SupportingMetric(BaseModel):
    label: str
    value: str


class AskResponse(BaseModel):
    message: str
    language: Language
    intent: str
    decisionReference: str | None
    supportingMetrics: list[SupportingMetric]
    suggestedAction: str
    disclaimer: str
    provider: str


class DemoStateResponse(BaseModel):
    persona: str
    scenario: ScenarioId
    customer: CustomerResponse
    financialState: FinancialStateResponse
    transactions: list[TransactionResponse]
    insights: list[InsightResponse]
    signals: list[SignalResponse]
    recommendations: list[RecommendationResponse]
    timeline: list[FinancialTimelineEvent]
    trajectory: list[TrajectoryPoint]
    goals: list[GoalResponse]
    modelInference: ModelInferenceResponse
    consentItems: list[ConsentItemResponse]
    loanAssessment: LoanSimulationResponse
    recoveryPlan: RecoveryPlanResponse
    whatIf: WhatIfResponse
    cashFlow: CashFlowResponse
    protection: ProtectionResponse
    financialDna: FinancialDnaResponse
    nextBestAction: NextBestActionResponse
    explainability: ExplainabilityResponse
    auditTrail: list[AuditEventResponse]


class CustomerSummaryResponse(BaseModel):
    label: str
    persona: PersonaId
    scenario: ScenarioId
    customer: CustomerResponse
    financialState: FinancialStateResponse
    recommendation: RecommendationResponse


class HealthResponse(BaseModel):
    status: Literal["ok"]
    service: str
    version: str
    environment: str
    intelligenceEngineStatus: str
    aiProviderStatus: str
    databaseStatus: Literal["in-memory", "postgresql"]


class ScenarioFinancialInputs(BaseModel):
    income: int
    emi: int
    savings: int
    buffer: float
    essential: int
    discretionary: int
    savings_rate: float
    savings_trend: float
    spending_trend: float
    monthly_contribution: int
    utilization: float
    outstanding: int
    accounts: int
    income_stability: Literal["stable", "variable", "declining"]
    cash_flow_trend: Literal["stable", "improving", "declining"]
    upcoming: int
    reference_date: date = DEMO_REFERENCE_DATE


class UserResponse(BaseModel):
    id: str
    phone: str
    maskedPhone: str
    name: str
    customerId: str
    languagePreference: Language
    onboardingStatus: Literal["incomplete", "complete"]
    createdAt: datetime


class SessionResponse(BaseModel):
    mode: SessionMode
    createdAt: datetime
    expiresAt: datetime
    lastSeenAt: datetime


class OnboardingStateResponse(BaseModel):
    status: Literal["incomplete", "complete"]
    currentStep: Literal["profile", "connection", "goals", "consent", "complete"]
    profileCompleted: bool
    dataConnectionCompleted: bool
    goalsCompleted: bool
    consentCompleted: bool
    selectedGoals: list[str]
    connectionLabel: str | None = None


class DemoSelectionResponse(BaseModel):
    customerId: str
    persona: PersonaId
    scenario: ScenarioId
    personaLabel: str
    scenarioLabel: str


class AuthContextResponse(BaseModel):
    authenticated: Literal[True] = True
    session: SessionResponse
    mode: SessionMode
    user: UserResponse
    customer: CustomerResponse
    onboarding: OnboardingStateResponse
    demo: DemoSelectionResponse | None = None


class AuthStartRequest(BaseModel):
    phone: str = Field(min_length=8, max_length=20)

    @field_validator("phone")
    @classmethod
    def valid_phone(cls, value: str) -> str:
        digits = "".join(character for character in value if character.isdigit())
        if len(digits) < 10 or len(digits) > 15:
            raise ValueError("Enter a valid mobile number")
        return f"+{digits}" if not value.strip().startswith("+") else f"+{digits}"


class AuthStartResponse(BaseModel):
    challenge_id: str
    masked_phone: str
    expires_in: int


class AuthVerifyRequest(BaseModel):
    challenge_id: str = Field(min_length=8)
    otp: str = Field(pattern=r"^\d{6}$")


class AuthVerifyResponse(BaseModel):
    authenticated: Literal[True] = True
    user: UserResponse
    onboarding_required: bool


class DemoAccountResponse(BaseModel):
    accountId: str
    displayName: str
    phone: str
    otp: str
    persona: PersonaId
    scenario: ScenarioId
    scenarioLabel: str
    situation: str


class DemoCatalogResponse(BaseModel):
    accounts: list[DemoAccountResponse]


class OnboardingProfileRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    language_preference: Language


class OnboardingConnectionRequest(BaseModel):
    provider: Literal["mock_bank"] = "mock_bank"
    consent_to_connect: bool


class OnboardingGoalsRequest(BaseModel):
    goals: list[str] = Field(min_length=1, max_length=6)


class OnboardingConsentRequest(BaseModel):
    consent_ids: list[str]


class LanguagePreferenceRequest(BaseModel):
    language: Language


class ProtectionResolutionRequest(BaseModel):
    status: Literal["CONFIRMED", "DISPUTED", "RESOLVED"]


class MeAskRequest(BaseModel):
    question: str = Field(min_length=2, max_length=2_000)
    language: Language | None = None

    @field_validator("question")
    @classmethod
    def no_blank_me_question(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Question must not be blank")
        return value.strip()
