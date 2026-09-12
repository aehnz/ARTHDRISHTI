export type Language = 'en' | 'hi' | 'hinglish';
export type PersonaId = string;
export type DemoScenario = string;
export type RiskBand = 'low' | 'moderate' | 'elevated' | 'high';
export type TransactionCategory =
  | 'Salary' | 'Rent' | 'EMI' | 'Food' | 'Dining' | 'Shopping' | 'Mobility'
  | 'Utilities' | 'Healthcare' | 'Subscriptions' | 'Savings' | 'UPI' | 'Other';

export interface Customer {
  id: string; name: string; firstName: string; age: number; location: string;
  occupation: string; monthlyIncome: number; existingEmi: number; savings: number;
  financialBuffer: number; cashFlowTrend: 'stable' | 'improving' | 'declining';
  joinDate: string; kycStatus: 'verified' | 'pending' | 'incomplete'; languagePreference?: Language;
}

export interface Transaction {
  id: string; date: string; time: string; description: string; amount: number;
  type: 'credit' | 'debit'; category: TransactionCategory; merchant: string;
  isRecurring?: boolean; notes?: string; intelligence: string;
  insightIds?: string[]; anomaly?: boolean;
  customerId?: string; paymentMethod?: string; status?: 'posted' | 'under_review';
  anomalyMetadata?: { score: number; severity: string; confidence: number; reasons: string[]; recommendedAction: string; modelLabel: string };
}

export interface HealthComponent {
  key: 'resilience' | 'liquidity' | 'debt' | 'savings' | 'income' | 'discipline';
  label: string; score: number; weight: number; trend: number;
  explanation: string; signals: string[];
}

export interface FinancialState {
  income: { monthly: number; annual: number; stability: 'stable' | 'variable' | 'declining'; lastCreditDate: string; volatility: number };
  spending: { essential: number; discretionary: number; total: number; trend: number; potentialLeaks: number };
  debt: { existingEmi: number; emiBurdenRatio: number; totalOutstanding: number; accounts: number; utilization: number };
  savings: { total: number; rate: number; trend: number; bufferMonths: number; monthlyContribution: number };
  cashFlow: { monthlySurplus: number; trend: 'stable' | 'improving' | 'declining'; upcomingObligations: number };
  risk: { level: RiskBand; signals: string[]; score: number; confidence?: number; explanation?: string; contributingFactors?: string[] };
  healthScore: number;
  healthBand: 'STRONG' | 'STABLE' | 'TIGHTENING' | 'STRESSED'; healthLabel: string;
  currentStateLabel?: string; headroom?: number;
  healthComponents: HealthComponent[];
  creditHealth: { index: 'STRONG' | 'MODERATE' | 'NEEDS ATTENTION'; score: number; factors: string[] };
}

export interface Insight {
  id: string; type: 'positive' | 'warning' | 'caution' | 'neutral';
  category: 'money-leak' | 'risk' | 'opportunity' | 'behaviour' | 'positive';
  title: string; description: string; dataPoints: string[]; transactionIds: string[];
  timestamp: string; priority: number; actionable: boolean; action?: string;
  confidence: number; impact: string;
  whyItMatters?: string; suggestedAction?: string;
}

export interface Signal {
  id: string; label: string; value: string | number; change?: number;
  direction: 'up' | 'down' | 'stable'; severity: 'info' | 'positive' | 'warning' | 'critical';
  description: string; evidence: string[];
}

export interface Recommendation {
  id: string; type: 'action' | 'education' | 'protection' | 'planning';
  title: string; description: string; whyNow: string; ifYouAct: string; ifYouDont: string;
  expectedImpact: string; timeHorizon: string; signals: string[]; priority: number;
  cta: string; ctaAction: string;
  actionCode?: 'BUILD_90_DAY_BUFFER' | 'VERIFY_ANOMALY' | 'REDUCE_DISCRETIONARY_SPEND' | 'ACCELERATE_GOAL' | 'CONSIDER_LOAN' | 'NO_PRODUCT_RECOMMENDED';
  insightIds?: string[]; productRecommendation?: 'NO_PRODUCT_RECOMMENDATION' | null;
}

export interface Goal {
  id: string; name: string; target: number; current: number;
  monthlyContribution: number; targetDate: string; icon: string;
  customerId?: string; category?: string; priority?: number; progress?: number;
  remainingAmount?: number; projectedCompletion?: string;
  monthsToCompletion?: number; monthsSaved?: number;
}

export interface TrajectoryPoint {
  label: string; health: number; buffer: number; cashFlow: number; projected?: boolean;
}

export interface GovernanceCheck {
  name: string; status: 'passed' | 'caution' | 'failed' | 'not_applicable'; detail: string;
}

export interface GovernanceDecision {
  decision: 'RECOMMENDED' | 'RECOMMENDED_WITH_CAUTION' | 'NOT_RECOMMENDED_RIGHT_NOW' | 'BLOCKED' | 'ESCALATE';
  reasoning: string[]; checks: GovernanceCheck[]; alternativeAction?: string; confidence: number;
}

export interface LoanAssessment {
  requestedAmount: number; tenure: number; apr: number; monthlyEmi: number;
  totalEmiAfter: number; affordabilityRatio: number; remainingCashFlow: number;
  bufferAfterEmi: number; healthAfter: number; affordabilityBand: 'Comfortable' | 'Stretched' | 'High stress';
  recommendation: GovernanceDecision['decision']; reasoning: string[]; governance: GovernanceDecision;
  simulationId?: string; totalRepayment?: number; totalInterest?: number; currentEmi?: number;
  currentEmiBurden?: number; bufferBefore?: number; borrowingCapacityEstimate?: number;
  riskImpact?: string; alternativeAction?: string; confidence?: number; disclaimer?: string;
  traceId?: string; purpose?: string; purposePolicy?: string;
}

export interface ConsentItem {
  id: string; category: string; description: string; purpose: string;
  status: 'consented' | 'not_consented' | 'partial'; required: boolean; dataPoints: string[];
  timestamp?: string; version?: string; source?: string;
  updatedAt?: string;
}

export interface FinancialTimelineEvent {
  date: string; event: string; type: 'positive' | 'negative' | 'neutral';
  description: string; impact?: string;
}

export interface ModelInference {
  model: string; score: number; confidence: number; band: string;
  contributions: Array<{ feature: string; value: string; impact: number }>; disclaimer: string;
  modelVersion?: string; inferenceType?: 'deterministic'; topFeatures?: string[]; interpretation?: string;
}

export interface RecoveryPlan {
  planType: 'RECOVERY' | 'GROWTH'; title: string; description: string;
  priorityActions: string[]; spendingReductionTarget: number; savingsTarget: number;
  debtGuidance: string; bufferTarget: number; before: WhatIfSnapshot; after: WhatIfSnapshot;
  trajectory: TrajectoryPoint[]; projectedHealthImpact: number; projectedRisk: RiskBand; disclaimer: string;
}

export interface CashFlowPayload {
  expectedIncome: number; recurringExpenses: number; emi: number; rent: number; utilities: number;
  savings: number; discretionarySpending: number; upcomingObligations: number;
  monthlyHeadroom: number; projectedBalance: number;
  next10Days: Array<{ date: string; label: string; amount: number; type: 'income' | 'expense' | 'saving'; recurring: boolean }>;
  next30Days: Array<{ date: string; label: string; amount: number; type: 'income' | 'expense' | 'saving'; recurring: boolean }>;
  referenceDate: string; periodLabel: string; trend: 'stable' | 'improving' | 'declining'; pressureLevel: 'comfortable' | 'watch' | 'tight';
}

export interface ProtectionPayload { unresolvedCount: number; anomalies: Transaction[]; stressRisk: FinancialState['risk']; recommendedAction: string; disclaimer: string; capabilityAvailable: boolean; limitation?: string }
export interface WhatIfSnapshot { income: number; monthlySurplus: number; buffer: number; emiBurden: number; health: number; risk: RiskBand }
export interface WhatIfResult { before: WhatIfSnapshot; after: WhatIfSnapshot; delta: WhatIfSnapshot; direction: 'BETTER' | 'WORSE' | 'NEUTRAL'; goalImpact: string; trajectory: TrajectoryPoint[]; disclaimer: string }
export interface AskResponse { message: string; language: Language; intent: string; decisionReference: string | null; supportingMetrics: Array<{label:string;value:string}>; suggestedAction: string; disclaimer: string; provider: string }

export interface DemoState {
  persona: string; scenario: DemoScenario; customer: Customer; financialState: FinancialState;
  transactions: Transaction[]; insights: Insight[]; signals: Signal[]; recommendations: Recommendation[];
  timeline: FinancialTimelineEvent[]; trajectory: TrajectoryPoint[]; goals: Goal[]; modelInference: ModelInference;
  consentItems: ConsentItem[]; loanAssessment: LoanAssessment; recoveryPlan: RecoveryPlan;
  whatIf: WhatIfResult; cashFlow: CashFlowPayload; protection: ProtectionPayload;
  financialDna: { customerId: string; stateLabel: string; categories: Array<{ category: string; metrics: Record<string,string|number>; signals: string[] }>; features: Record<string, unknown>; generatedBy: string };
  nextBestAction: { action: string; title: string; whyNow: string; expectedBenefit: string; estimatedImpact: string; recommendationId: string };
  explainability: { decision: string; primaryReasons: string[]; contributingFactors: Array<{factor:string;value:string|number;impact:'positive'|'neutral'|'negative';explanation:string}>; dataUsed:string[]; metricsUsed:string[]; alternatives:string[]; limitations:string[]; confidence:number; traceId:string; governanceChecks:GovernanceCheck[] };
  auditTrail: AuditEvent[];
}

export interface CustomerSummary {
  label: string; persona: PersonaId; scenario: DemoScenario; customer: Customer;
  financialState: FinancialState; recommendation: Recommendation;
}

export type SessionMode = 'NORMAL' | 'DEMO';
export interface UserProfile { id: string; phone: string; maskedPhone: string; name: string; customerId: string; languagePreference: Language; onboardingStatus: 'incomplete' | 'complete'; createdAt: string }
export interface OnboardingState { status: 'incomplete' | 'complete'; currentStep: 'profile' | 'connection' | 'goals' | 'consent' | 'complete'; profileCompleted: boolean; dataConnectionCompleted: boolean; goalsCompleted: boolean; consentCompleted: boolean; selectedGoals: string[]; connectionLabel?: string }
export interface DemoSelection { customerId: string; persona: PersonaId; scenario: DemoScenario; personaLabel: string; scenarioLabel: string }
export interface AuthContext { authenticated: true; session: { mode: SessionMode; createdAt: string; expiresAt: string; lastSeenAt: string }; mode: SessionMode; user: UserProfile; customer: Customer; onboarding: OnboardingState; demo: DemoSelection | null }
export interface AuthStart { challenge_id: string; masked_phone: string; expires_in: number }
export interface DemoAccount { accountId: string; displayName: string; phone: string; otp: string; persona: string; scenario: string; scenarioLabel: string; situation: string }
export interface AuditEvent { eventId: string; timestamp: string; customerId: string; eventType: string; metadata: Record<string, string | number | boolean | null>; actorType: 'USER' | 'DEMO_USER' | 'SYSTEM' | 'AI'; actorId?: string; action?: string; decision?: string; entityType?: string; entityId?: string; reason?: string; traceId?: string }

export interface ChatMessage {
  id?: string; role: 'user' | 'assistant'; content: string; timestamp?: string; language?: Language;
}
