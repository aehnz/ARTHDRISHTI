export type Language = 'en' | 'hi' | 'hinglish';
export type PersonaId = 'ravi' | 'ananya';
export type DemoScenario = 'stable' | 'tightening' | 'stress' | 'anomaly' | 'growth';
export type RiskBand = 'low' | 'moderate' | 'elevated' | 'high';
export type TransactionCategory =
  | 'Salary' | 'Rent' | 'EMI' | 'Food' | 'Dining' | 'Shopping' | 'Mobility'
  | 'Utilities' | 'Healthcare' | 'Subscriptions' | 'Savings' | 'UPI' | 'Other';

export interface Customer {
  id: string; name: string; firstName: string; age: number; location: string;
  occupation: string; monthlyIncome: number; existingEmi: number; savings: number;
  financialBuffer: number; cashFlowTrend: 'stable' | 'improving' | 'declining';
  joinDate: string; kycStatus: 'verified' | 'pending' | 'incomplete';
}

export interface Transaction {
  id: string; date: string; time: string; description: string; amount: number;
  type: 'credit' | 'debit'; category: TransactionCategory; merchant: string;
  isRecurring?: boolean; notes?: string; intelligence: string;
  insightIds?: string[]; anomaly?: boolean;
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
  risk: { level: RiskBand; signals: string[]; score: number };
  healthScore: number;
  healthComponents: HealthComponent[];
  creditHealth: { index: 'STRONG' | 'MODERATE' | 'NEEDS ATTENTION'; score: number; factors: string[] };
}

export interface Insight {
  id: string; type: 'positive' | 'warning' | 'caution' | 'neutral';
  category: 'money-leak' | 'risk' | 'opportunity' | 'behaviour' | 'positive';
  title: string; description: string; dataPoints: string[]; transactionIds: string[];
  timestamp: string; priority: number; actionable: boolean; action?: string;
  confidence: number; impact: string;
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
}

export interface Goal {
  id: string; name: string; target: number; current: number;
  monthlyContribution: number; targetDate: string; icon: string;
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
}

export interface ConsentItem {
  id: string; category: string; description: string; purpose: string;
  status: 'consented' | 'not_consented' | 'partial'; required: boolean; dataPoints: string[];
}

export interface FinancialTimelineEvent {
  date: string; event: string; type: 'positive' | 'negative' | 'neutral';
  description: string; impact?: string;
}

export interface ModelInference {
  model: string; score: number; confidence: number; band: string;
  contributions: Array<{ feature: string; value: string; impact: number }>; disclaimer: string;
}

export interface DemoState {
  persona: PersonaId; scenario: DemoScenario; customer: Customer; financialState: FinancialState;
  transactions: Transaction[]; insights: Insight[]; signals: Signal[]; recommendations: Recommendation[];
  timeline: FinancialTimelineEvent[]; trajectory: TrajectoryPoint[]; goals: Goal[]; modelInference: ModelInference;
}

export interface ChatMessage {
  id?: string; role: 'user' | 'assistant'; content: string; timestamp?: string; language?: Language;
}
