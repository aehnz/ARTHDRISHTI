// ============================================
// ARTHDRISHTI - Type Definitions
// ============================================

export type Language = 'en' | 'hi' | 'hinglish';
export type DemoScenario = 'stable' | 'tightening' | 'loan-decision' | 'anomaly';

export interface Customer {
  id: string;
  name: string;
  age: number;
  location: string;
  occupation: string;
  monthlyIncome: number;
  existingEmi: number;
  savings: number;
  financialBuffer: number; // in months
  cashFlowTrend: 'stable' | 'improving' | 'declining';
  joinDate: string;
  kycStatus: 'verified' | 'pending' | 'incomplete';
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category: TransactionCategory;
  merchant?: string;
  isRecurring?: boolean;
  notes?: string;
}

export type TransactionCategory =
  | 'housing'
  | 'food'
  | 'mobility'
  | 'shopping'
  | 'subscriptions'
  | 'bills'
  | 'healthcare'
  | 'travel'
  | 'upi'
  | 'investments'
  | 'income';

export interface FinancialState {
  income: {
    monthly: number;
    annual: number;
    stability: 'stable' | 'variable' | 'declining';
    lastCreditDate: string;
  };
  spending: {
    essential: number;
    discretionary: number;
    total: number;
    trend: number; // percentage change
  };
  debt: {
    existingEmi: number;
    emiBurdenRatio: number; // percentage of income
    totalOutstanding: number;
    accounts: number;
  };
  savings: {
    total: number;
    rate: number; // percentage of income saved
    trend: number;
    bufferMonths: number;
  };
  risk: {
    level: 'low' | 'moderate' | 'elevated' | 'high';
    signals: string[];
    score: number; // 0-100, lower is better
  };
}

export interface Insight {
  id: string;
  type: 'positive' | 'warning' | 'caution' | 'neutral';
  category: 'spending' | 'savings' | 'debt' | 'income' | 'behavior';
  title: string;
  description: string;
  dataPoints: string[];
  timestamp: string;
  priority: number;
  actionable: boolean;
  action?: string;
}

export interface Signal {
  id: string;
  label: string;
  value: string | number;
  change?: number; // percentage
  direction: 'up' | 'down' | 'stable';
  severity: 'info' | 'positive' | 'warning' | 'critical';
  description: string;
  evidence?: string[];
}

export interface Recommendation {
  id: string;
  type: 'action' | 'education' | 'protection' | 'planning';
  title: string;
  description: string;
  whyNow: string;
  signals: string[];
  priority: number;
  cta: string;
  ctaAction: string;
}

export interface GovernanceCheck {
  name: string;
  status: 'passed' | 'caution' | 'failed' | 'not_applicable';
  detail: string;
}

export interface GovernanceDecision {
  decision: 'RECOMMENDED' | 'NOT_RECOMMENDED_RIGHT_NOW' | 'NEEDS_MORE_INFO' | 'ESCALATE';
  reasoning: string[];
  checks: GovernanceCheck[];
  alternativeAction?: string;
  confidence: number;
}

export interface LoanAssessment {
  requestedAmount: number;
  tenure: number;
  monthlyEmi: number;
  affordabilityRatio: number;
  bufferAfterEmi: number;
  recommendation: string;
  reasoning: string[];
  governance: GovernanceDecision;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  language?: Language;
  metadata?: {
    intent?: string;
    confidence?: number;
    signals?: string[];
  };
}

export interface ConsentItem {
  id: string;
  category: string;
  description: string;
  purpose: string;
  status: 'consented' | 'not_consented' | 'partial';
  required: boolean;
  dataPoints: string[];
}

export interface FinancialTimelineEvent {
  date: string;
  event: string;
  type: 'positive' | 'negative' | 'neutral';
  description: string;
  impact?: string;
}

export interface DemoState {
  scenario: DemoScenario;
  customer: Customer;
  financialState: FinancialState;
  transactions: Transaction[];
  insights: Insight[];
  signals: Signal[];
  recommendations: Recommendation[];
  timeline: FinancialTimelineEvent[];
}
