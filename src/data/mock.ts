// ============================================
// ARTHDRISHTI - Mock Data Layer
// ============================================

import type {
  Customer,
  Transaction,
  FinancialState,
  Insight,
  Signal,
  Recommendation,
  LoanAssessment,
  GovernanceCheck,
  GovernanceDecision,
  ChatMessage,
  ConsentItem,
  FinancialTimelineEvent,
  DemoScenario,
  Language,
  DemoState,
} from '@/types';

// ============================================
// CUSTOMER PROFILE
// ============================================

export const getCustomer = (): Customer => ({
  id: 'cust_ravi_sharma',
  name: 'Ravi Sharma',
  age: 32,
  location: 'Ahmedabad, Gujarat',
  occupation: 'Salaried Professional',
  monthlyIncome: 82000,
  existingEmi: 31500,
  savings: 182000,
  financialBuffer: 2.4,
  cashFlowTrend: 'declining',
  joinDate: '2023-06-15',
  kycStatus: 'verified',
});

// ============================================
// TRANSACTIONS
// ============================================

const today = new Date('2026-09-12');
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

const generateTransactions = (): Transaction[] => {
  const txns: Transaction[] = [];

  // Salary credits
  for (let i = 0; i < 12; i++) {
    const date = daysAgo(i * 30);
    if (date >= '2025-09-01') {
      txns.push({
        id: `txn_salary_${i}`,
        date,
        description: 'Salary Credit - TechCorp India Pvt Ltd',
        amount: 82000,
        type: 'credit',
        category: 'income',
        merchant: 'TechCorp India',
        notes: 'Monthly salary with HRA component',
      });
    }
  }

  // Housing - Rent
  for (let i = 0; i < 12; i++) {
    const date = daysAgo(i * 30 + 2);
    if (date >= '2025-09-01') {
      txns.push({
        id: `txn_rent_${i}`,
        date,
        description: 'Rent Payment - Satellite Towers',
        amount: 18000,
        type: 'debit',
        category: 'housing',
        merchant: 'Satellite Towers',
        isRecurring: true,
      });
    }
  }

  // EMI - Car Loan
  for (let i = 0; i < 24; i++) {
    const date = daysAgo(i * 30 + 5);
    if (date >= '2025-09-01') {
      txns.push({
        id: `txn_emi_car_${i}`,
        date,
        description: 'EMI Auto Debit - HDFC Car Loan',
        amount: 12500,
        type: 'debit',
        category: 'bills',
        merchant: 'HDFC Bank',
        isRecurring: true,
      });
    }
  }

  // EMI - Personal Loan
  for (let i = 0; i < 18; i++) {
    const date = daysAgo(i * 30 + 7);
    if (date >= '2025-09-01') {
      txns.push({
        id: `txn_emi_pl_${i}`,
        date,
        description: 'EMI Auto Debit - ICICI Personal Loan',
        amount: 9500,
        type: 'debit',
        category: 'bills',
        merchant: 'ICICI Bank',
        isRecurring: true,
      });
    }
  }

  // EMI - Credit Card
  for (let i = 0; i < 12; i++) {
    const date = daysAgo(i * 30 + 10);
    if (date >= '2025-09-01') {
      txns.push({
        id: `txn_emi_cc_${i}`,
        date,
        description: 'CC Payment - SBI Card',
        amount: 3500,
        type: 'debit',
        category: 'bills',
        merchant: 'SBI Card',
        isRecurring: true,
      });
    }
  }

  // Food & Dining
  const foodMerchants = ['Zomato', 'Swiggy', 'Local Restaurant', 'McDonald\'s', 'Cafe Coffee Day', 'Haldiram\'s'];
  for (let i = 0; i < 60; i++) {
    const date = daysAgo(i);
    if (date >= '2025-09-01' && Math.random() > 0.4) {
      const amount = Math.floor(Math.random() * 800) + 100;
      const merchant = foodMerchants[Math.floor(Math.random() * foodMerchants.length)];
      txns.push({
        id: `txn_food_${i}`,
        date,
        description: `${merchant} - Food Order`,
        amount,
        type: 'debit',
        category: 'food',
        merchant,
      });
    }
  }

  // Mobility
  for (let i = 0; i < 45; i++) {
    const date = daysAgo(i);
    if (date >= '2025-09-01' && Math.random() > 0.5) {
      const type = Math.random() > 0.5 ? 'Uber' : 'Ola';
      const amount = Math.floor(Math.random() * 300) + 80;
      txns.push({
        id: `txn_mobility_${i}`,
        date,
        description: `${type} Ride`,
        amount,
        type: 'debit',
        category: 'mobility',
        merchant: type,
      });
    }
  }

  // Subscriptions
  const subscriptions = [
    { name: 'Netflix', amount: 649, frequency: 30 },
    { name: 'Spotify', amount: 119, frequency: 30 },
    { name: 'Amazon Prime', amount: 1499 / 12, frequency: 30 },
    { name: 'Hotstar', amount: 299, frequency: 30 },
    { name: 'Gym Membership', amount: 1500, frequency: 30 },
  ];
  subscriptions.forEach((sub, si) => {
    for (let i = 0; i < 6; i++) {
      const date = daysAgo(i * 30 + 15);
      if (date >= '2025-09-01') {
        txns.push({
          id: `txn_sub_${si}_${i}`,
          date,
          description: `${sub.name} - Subscription`,
          amount: Math.round(sub.amount),
          type: 'debit',
          category: 'subscriptions',
          merchant: sub.name,
          isRecurring: true,
        });
      }
    }
  });

  // Shopping
  const shoppingEvents = [
    { desc: 'Amazon - Electronics', amount: 4500 },
    { desc: 'Flipkart - Clothing', amount: 2800 },
    { desc: 'Myntra - Shoes', amount: 3200 },
    { desc: 'Reliance Digital', amount: 8900 },
    { desc: 'Big Bazaar - Groceries', amount: 3500 },
  ];
  shoppingEvents.forEach((item, i) => {
    const date = daysAgo(i * 20 + 5);
    if (date >= '2025-09-01') {
      txns.push({
        id: `txn_shop_${i}`,
        date,
        description: item.desc,
        amount: item.amount,
        type: 'debit',
        category: 'shopping',
      });
    }
  });

  // Bills - Utilities
  for (let i = 0; i < 6; i++) {
    const date = daysAgo(i * 30 + 20);
    if (date >= '2025-09-01') {
      txns.push({
        id: `txn_electricity_${i}`,
        date,
        description: 'Electricity Bill - Torrent Power',
        amount: Math.floor(Math.random() * 2000) + 1200,
        type: 'debit',
        category: 'bills',
        merchant: 'Torrent Power',
        isRecurring: true,
      });
    }
  }

  for (let i = 0; i < 3; i++) {
    const date = daysAgo(i * 90 + 25);
    if (date >= '2025-09-01') {
      txns.push({
        id: `txn_internet_${i}`,
        date,
        description: 'Internet Bill - JioFiber',
        amount: 1199,
        type: 'debit',
        category: 'bills',
        merchant: 'JioFiber',
        isRecurring: true,
      });
    }
  }

  // Savings Transfer
  for (let i = 0; i < 6; i++) {
    const date = daysAgo(i * 30 + 3);
    if (date >= '2025-09-01') {
      const amount = 15000 + Math.floor(Math.random() * 5000);
      txns.push({
        id: `txn_savings_${i}`,
        date,
        description: 'Savings Transfer - RD Account',
        amount,
        type: 'debit',
        category: 'investments',
        merchant: 'Self Transfer',
        notes: 'Monthly savings',
      });
    }
  }

  // Healthcare
  txns.push({
    id: 'txn_health_1',
    date: daysAgo(45),
    description: 'Apollo Pharmacy - Medicines',
    amount: 1200,
    type: 'debit',
    category: 'healthcare',
    merchant: 'Apollo Pharmacy',
  });

  // UPI transactions
  const upiMerchants = ['Raju Chaiwala', 'Local Kirana', 'Auto Driver', 'Water Supplier', 'Milk Vendor'];
  for (let i = 0; i < 40; i++) {
    const date = daysAgo(i);
    if (date >= '2025-09-01' && Math.random() > 0.6) {
      const amount = Math.floor(Math.random() * 500) + 50;
      const merchant = upiMerchants[Math.floor(Math.random() * upiMerchants.length)];
      txns.push({
        id: `txn_upi_${i}`,
        date,
        description: `UPI - ${merchant}`,
        amount,
        type: 'debit',
        category: 'upi',
        merchant,
      });
    }
  }

  return txns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const getTransactions = (): Transaction[] => generateTransactions();

// ============================================
// FINANCIAL STATE
// ============================================

export const getFinancialState = (): FinancialState => {
  const customer = getCustomer();
  const transactions = getTransactions();

  const monthlySpending = transactions
    .filter(t => t.type === 'debit' && t.category !== 'investments' && t.category !== 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const avgMonthlySpending = monthlySpending / 6;
  const essentialSpending = avgMonthlySpending * 0.55;
  const discretionarySpending = avgMonthlySpending * 0.45;

  const spendingTrend = 11; // increased 11%
  const savingsRate = ((customer.monthlyIncome - avgMonthlySpending - customer.existingEmi) / customer.monthlyIncome) * 100;
  const savingsTrend = -8; // decreased 8%
  const emiBurdenRatio = (customer.existingEmi / customer.monthlyIncome) * 100;

  let riskLevel: FinancialState['risk']['level'] = 'low';
  let riskScore = 0;
  const riskSignals: string[] = [];

  if (emiBurdenRatio > 35) {
    riskScore += 25;
    riskSignals.push('EMI burden elevated');
  }
  if (customer.financialBuffer < 3) {
    riskScore += 20;
    riskSignals.push('Financial buffer below 3 months');
  }
  if (customer.cashFlowTrend === 'declining') {
    riskScore += 25;
    riskSignals.push('Cash flow trend declining');
  }
  if (spendingTrend > 10) {
    riskScore += 15;
    riskSignals.push('Discretionary spending increased');
  }
  if (savingsTrend < 0) {
    riskScore += 15;
    riskSignals.push('Savings rate declining');
  }

  if (riskScore >= 70) riskLevel = 'high';
  else if (riskScore >= 50) riskLevel = 'elevated';
  else if (riskScore >= 30) riskLevel = 'moderate';

  return {
    income: {
      monthly: customer.monthlyIncome,
      annual: customer.monthlyIncome * 12,
      stability: customer.cashFlowTrend === 'stable' ? 'stable' : customer.cashFlowTrend === 'improving' ? 'stable' : 'declining',
      lastCreditDate: daysAgo(7),
    },
    spending: {
      essential: Math.round(essentialSpending),
      discretionary: Math.round(discretionarySpending),
      total: Math.round(avgMonthlySpending),
      trend: spendingTrend,
    },
    debt: {
      existingEmi: customer.existingEmi,
      emiBurdenRatio: Math.round(emiBurdenRatio),
      totalOutstanding: 1850000,
      accounts: 3,
    },
    savings: {
      total: customer.savings,
      rate: Math.round(savingsRate),
      trend: savingsTrend,
      bufferMonths: customer.financialBuffer,
    },
    risk: {
      level: riskLevel,
      signals: riskSignals,
      score: riskScore,
    },
  };
};

// ============================================
// INSIGHTS
// ============================================

export const getInsights = (): Insight[] => {
  const state = getFinancialState();
  const customer = getCustomer();

  const insights: Insight[] = [
    {
      id: 'insight_1',
      type: 'warning',
      category: 'savings',
      title: 'Financial buffer has tightened',
      description: `Your financial buffer has decreased to ${customer.financialBuffer} months of essential expenses, down from 3.2 months eight weeks ago. This reduces your cushion for unexpected expenses.`,
      dataPoints: [
        `Current buffer: ${customer.financialBuffer} months`,
        '8 weeks ago: 3.2 months',
        'Recommended minimum: 3 months',
        'Change: -0.8 months',
      ],
      timestamp: daysAgo(1),
      priority: 1,
      actionable: true,
      action: 'Build my 90-day buffer',
    },
    {
      id: 'insight_2',
      type: 'caution',
      category: 'spending',
      title: 'Discretionary spending up 11%',
      description: 'Your dining and delivery spending has increased by 11% over the last 30 days compared to your 90-day average. This is the biggest driver of your declining buffer.',
      dataPoints: [
        'Current month: +11%',
        'Biggest category: Food & Dining',
        'Secondary: Shopping',
        'Impact on buffer: -₹8,400/month',
      ],
      timestamp: daysAgo(2),
      priority: 2,
      actionable: true,
      action: 'Review recurring expenses',
    },
    {
      id: 'insight_3',
      type: 'warning',
      category: 'debt',
      title: 'EMI burden remains elevated',
      description: `Your total EMI burden is ${state.debt.emiBurdenRatio}% of your monthly income. The general guideline is below 40%. You have 3 active EMIs totaling ₹${customer.existingEmi.toLocaleString('en-IN')}/month.`,
      dataPoints: [
        `Current EMI: ₹${customer.existingEmi.toLocaleString('en-IN')}/month`,
        `EMI-to-income: ${state.debt.emiBurdenRatio}%`,
        'Guideline: Below 40%',
        'Active accounts: 3',
      ],
      timestamp: daysAgo(3),
      priority: 3,
      actionable: true,
      action: 'Explore debt optimization',
    },
    {
      id: 'insight_4',
      type: 'neutral',
      category: 'income',
      title: 'Salary credit arrived on schedule',
      description: 'Your monthly salary from TechCorp India arrived as expected. Your income pattern has been consistent for 12 months.',
      dataPoints: [
        'Amount: ₹82,000',
        'Pattern: Consistent',
        'Duration: 12 months',
        'Variability: Low',
      ],
      timestamp: daysAgo(7),
      priority: 5,
      actionable: false,
    },
    {
      id: 'insight_5',
      type: 'caution',
      category: 'behavior',
      title: 'Savings transfer delayed this month',
      description: 'Your regular savings transfer happened 4 days later than usual. Small timing changes can sometimes signal shifts in cash-flow management.',
      dataPoints: [
        'Usual timing: 3rd of month',
        'This month: 7th of month',
        'Impact: 4 days',
        'Amount: ₹18,000',
      ],
      timestamp: daysAgo(14),
      priority: 4,
      actionable: false,
    },
    {
      id: 'insight_6',
      type: 'positive',
      category: 'savings',
      title: 'Emergency fund growing steadily',
      description: 'Despite recent pressures, your savings fund has grown by ₹72,000 over the last year. Consistent saving behavior is a strong financial habit.',
      dataPoints: [
        'Current savings: ₹1,82,000',
        'Growth last year: +₹72,000',
        'Average monthly save: ₹15,000',
        'Savings rate: 22%',
      ],
      timestamp: daysAgo(30),
      priority: 4,
      actionable: false,
    },
  ];

  return insights.sort((a, b) => a.priority - b.priority);
};

// ============================================
// SIGNALS
// ============================================

export const getSignals = (): Signal[] => {
  const state = getFinancialState();
  const customer = getCustomer();

  return [
    {
      id: 'signal_1',
      label: 'Financial Buffer',
      value: `${customer.financialBuffer} months`,
      change: -25,
      direction: 'down',
      severity: 'warning',
      description: 'Your buffer has decreased 25% over the last 8 weeks. It is now below the 3-month recommended threshold.',
      evidence: [
        'Savings: ₹1,82,000',
        'Essential expenses: ~₹76,000/month',
        'Buffer calculation: 1,82,000 / 76,000 = 2.4 months',
      ],
    },
    {
      id: 'signal_2',
      label: 'EMI Burden',
      value: `${state.debt.emiBurdenRatio}%`,
      change: 0,
      direction: 'stable',
      severity: 'warning',
      description: 'Your EMI burden is at 38.4% of income, just below the 40% concern threshold. Any additional commitment could push you over.',
      evidence: [
        `Total EMI: ₹${customer.existingEmi.toLocaleString('en-IN')}/month`,
        `Monthly income: ₹${customer.monthlyIncome.toLocaleString('en-IN')}`,
        'Calculation: 31,500 / 82,000 = 38.4%',
        'Threshold: 40%',
      ],
    },
    {
      id: 'signal_3',
      label: 'Cash Flow Trend',
      value: 'Declining',
      change: -15,
      direction: 'down',
      severity: 'warning',
      description: 'Your cash flow has weakened over the last 6 weeks. Discretionary spending is up and savings rate is down.',
      evidence: [
        'Spending trend: +11%',
        'Savings rate: -8%',
        'Delayed savings transfer detected',
        'Buffer compression: -0.8 months',
      ],
    },
    {
      id: 'signal_4',
      label: 'Income Stability',
      value: 'Stable',
      change: 0,
      direction: 'stable',
      severity: 'positive',
      description: 'Your salary has been credited consistently for 12 months. Income stability is one of your strongest financial signals.',
      evidence: [
        'Employer: TechCorp India Pvt Ltd',
        'Pattern: Consistent',
        'Duration: 12 months',
        'Variability: None detected',
      ],
    },
    {
      id: 'signal_5',
      label: 'Spending Pattern',
      value: 'Elevated',
      change: 11,
      direction: 'up',
      severity: 'warning',
      description: 'Discretionary spending increased 11% in the last 30 days. Food and shopping categories are the primary drivers.',
      evidence: [
        'Food & dining: +18%',
        'Shopping: +8%',
        'UPI micro-spending: +12%',
        'Recurring subscriptions: No change',
      ],
    },
    {
      id: 'signal_6',
      label: 'Savings Rate',
      value: `${state.savings.rate}%`,
      change: -8,
      direction: 'down',
      severity: 'warning',
      description: 'Your savings rate has decreased from 30% to 22%. The primary cause is increased discretionary spending.',
      evidence: [
        'Current rate: 22%',
        'Previous rate: 30%',
        'Change: -8 percentage points',
        'Target: 25% minimum',
      ],
    },
  ];
};

// ============================================
// RECOMMENDATIONS
// ============================================

export const getRecommendations = (): Recommendation[] => {
  return [
    {
      id: 'rec_1',
      type: 'action',
      title: 'Build a 90-day financial buffer',
      description: 'Given your current financial state, building a stronger emergency buffer should be your top priority before taking on any new obligations.',
      whyNow: 'Your buffer has fallen below the 3-month threshold, and your cash flow is under pressure.',
      signals: ['buffer_declining', 'cash_flow_weakening', 'spending_increased'],
      priority: 1,
      cta: 'Build my 90-day plan',
      ctaAction: 'build-buffer-plan',
    },
    {
      id: 'rec_2',
      type: 'action',
      title: 'Review recurring expenses',
      description: 'You have 5 active subscriptions and recurring payments. A review could help identify services you may not be using regularly.',
      whyNow: 'Reducing fixed monthly outflows directly improves your savings rate.',
      signals: ['subscription_review', 'spending_increased'],
      priority: 2,
      cta: 'Review my subscriptions',
      ctaAction: 'review-subscriptions',
    },
    {
      id: 'rec_3',
      type: 'protection',
      title: 'Review your protection coverage',
      description: 'While building your buffer, ensure you have basic protection in place. Health insurance and term insurance protect what you have built.',
      whyNow: 'Financial stress makes unexpected expenses harder to absorb.',
      signals: ['buffer_below_threshold', 'emi_elevated'],
      priority: 3,
      cta: 'Understand my protection options',
      ctaAction: 'review-protection',
    },
    {
      id: 'rec_4',
      type: 'education',
      title: 'Understand your financial risk profile',
      description: 'ARTHDRISHTI can show you exactly what factors are creating pressure in your financial life and what you can do about each one.',
      whyNow: 'Clarity reduces stress. Understanding your signals helps you make better decisions.',
      signals: ['financial_stress_detected', 'multiple_signals_active'],
      priority: 4,
      cta: 'See my full risk profile',
      ctaAction: 'view-risk-profile',
    },
  ];
};

// ============================================
// GOVERNANCE ENGINE
// ============================================

export const evaluateLoanSuitability = (amount: number, tenure: number): LoanAssessment => {
  const customer = getCustomer();
  const state = getFinancialState();

  const monthlyRate = 0.011; // ~13.2% annual
  const monthlyEmi = Math.round((amount * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1));
  const totalEmiAfter = customer.existingEmi + monthlyEmi;
  const affordabilityRatio = (totalEmiAfter / customer.monthlyIncome) * 100;
  const remainingAfterEmi = customer.monthlyIncome - totalEmiAfter;
  const bufferAfterEmi = customer.savings / (remainingAfterEmi - 25000); // rough estimate

  const reasoning: string[] = [];
  reasoning.push(`Existing EMI burden: ₹${customer.existingEmi.toLocaleString('en-IN')}/month (${state.debt.emiBurdenRatio}% of income)`);
  reasoning.push(`Proposed EMI: ₹${monthlyEmi.toLocaleString('en-IN')}/month`);
  reasoning.push(`Total EMI burden after: ₹${totalEmiAfter.toLocaleString('en-IN')}/month (${Math.round(affordabilityRatio)}% of income)`);
  reasoning.push(`Financial buffer: ${customer.financialBuffer} months (below recommended 3 months)`);
  reasoning.push(`Cash flow trend: ${customer.cashFlowTrend}`);
  reasoning.push(`Savings rate: declining (-8%)`);
  reasoning.push(`Discretionary spending: elevated (+11%)`);

  const checks: GovernanceCheck[] = [
    { name: 'Consent Verified', status: 'passed', detail: 'Customer has consented to financial analysis' },
    { name: 'Purpose Understood', status: 'passed', detail: 'Loan purpose: Personal use' },
    { name: 'Financial Context Available', status: 'passed', detail: '12 months of transaction history available' },
    { name: 'Suitability Check', status: 'caution', detail: 'Multiple risk signals present. Additional debt may reduce financial resilience.' },
    { name: 'Financial Stress Signal', status: 'caution', detail: 'Buffer below threshold, cash flow declining, spending elevated' },
    { name: 'Predatory Nudge Prevention', status: 'passed', detail: 'System will not push unsuitable product' },
    { name: 'Explainability Available', status: 'passed', detail: 'Full reasoning trail available to customer' },
  ];

  const decision: GovernanceDecision = {
    decision: 'NOT_RECOMMENDED_RIGHT_NOW',
    reasoning,
    checks,
    alternativeAction: 'BUILD_90_DAY_BUFFER',
    confidence: 0.85,
  };

  return {
    requestedAmount: amount,
    tenure,
    monthlyEmi,
    affordabilityRatio,
    bufferAfterEmi: Math.round(bufferAfterEmi * 10) / 10,
    recommendation: decision.decision,
    reasoning,
    governance: decision,
  };
};

// ============================================
// TIMELINE
// ============================================

export const getTimeline = (): FinancialTimelineEvent[] => {
  return [
    {
      date: daysAgo(56),
      event: 'Buffer healthy',
      type: 'positive',
      description: 'Financial buffer was at 3.2 months, above the 3-month threshold.',
      impact: 'Comfortable cushion',
    },
    {
      date: daysAgo(42),
      event: 'Discretionary spending begins rising',
      type: 'negative',
      description: 'Food delivery and dining out increased 8% above average.',
      impact: '-₹4,200/month',
    },
    {
      date: daysAgo(28),
      event: 'Savings rate declines',
      type: 'negative',
      description: 'Savings transfer rate dropped from 30% to 24% of income.',
      impact: 'Buffer compression starts',
    },
    {
      date: daysAgo(21),
      event: 'Savings transfer delayed',
      type: 'negative',
      description: 'Monthly savings transfer happened 4 days later than usual.',
      impact: 'Cash flow management signal',
    },
    {
      date: daysAgo(14),
      event: 'Buffer crosses 3-month threshold',
      type: 'negative',
      description: 'Financial buffer fell below the recommended 3-month minimum.',
      impact: 'Risk signal activated',
    },
    {
      date: daysAgo(7),
      event: 'Current state',
      type: 'neutral',
      description: `Buffer at ${getCustomer().financialBuffer} months. Spending elevated. Cash flow under pressure.`,
      impact: 'Caution zone',
    },
  ];
};

// ============================================
// CONSENT ITEMS
// ============================================

export const getConsentItems = (): ConsentItem[] => {
  return [
    {
      id: 'consent_1',
      category: 'Transaction History',
      description: 'Read your transaction history',
      purpose: 'To understand your spending patterns and financial behavior',
      status: 'consented',
      required: true,
      dataPoints: ['UPI transactions', 'Card transactions', 'NEFT/IMPS transfers'],
    },
    {
      id: 'consent_2',
      category: 'Income Patterns',
      description: 'Analyze your income credits',
      purpose: 'To assess income stability and build accurate financial models',
      status: 'consented',
      required: true,
      dataPoints: ['Salary credits', 'Frequency', 'Amount patterns'],
    },
    {
      id: 'consent_3',
      category: 'EMI & Debt Data',
      description: 'Access your EMI and loan records',
      purpose: 'To evaluate debt burden and recommend suitable financial products',
      status: 'consented',
      required: true,
      dataPoints: ['EMI amounts', 'Payment history', 'Outstanding balances'],
    },
    {
      id: 'consent_4',
      category: 'Savings Behavior',
      description: 'Track savings patterns',
      purpose: 'To build personalized savings recommendations',
      status: 'consented',
      required: true,
      dataPoints: ['Savings account activity', 'Transfer patterns', 'Growth rate'],
    },
    {
      id: 'consent_5',
      category: 'Spending Categories',
      description: 'Categorize your expenses',
      purpose: 'To identify spending patterns and suggest optimizations',
      status: 'consented',
      required: false,
      dataPoints: ['Category assignments', 'Spending trends', 'Recurring payments'],
    },
    {
      id: 'consent_6',
      category: 'Anomaly Detection',
      description: 'Detect unusual transactions',
      purpose: 'To protect you from potential fraud',
      status: 'consented',
      required: false,
      dataPoints: ['Transaction patterns', 'Amount thresholds', 'Merchant categories'],
    },
  ];
};

// ============================================
// DEMO STATE
// ============================================

export const getDemoState = (scenario: DemoScenario = 'tightening'): DemoState => {
  const customer = getCustomer();
  const baseTransactions = getTransactions();
  const baseState = getFinancialState();
  const baseInsights = getInsights();
  const baseSignals = getSignals();
  const baseRecommendations = getRecommendations();
  const baseTimeline = getTimeline();

  switch (scenario) {
    case 'loan-decision':
      return {
        scenario: 'loan-decision',
        customer,
        financialState: baseState,
        transactions: baseTransactions,
        insights: baseInsights,
        signals: baseSignals,
        recommendations: baseRecommendations,
        timeline: baseTimeline,
      };
    case 'anomaly':
      return {
        scenario: 'anomaly',
        customer,
        financialState: baseState,
        transactions: baseTransactions,
        insights: baseInsights,
        signals: baseSignals,
        recommendations: baseRecommendations,
        timeline: baseTimeline,
      };
    default:
      return {
        scenario: 'tightening',
        customer,
        financialState: baseState,
        transactions: baseTransactions,
        insights: baseInsights,
        signals: baseSignals,
        recommendations: baseRecommendations,
        timeline: baseTimeline,
      };
  }
};

// ============================================
// CHAT SERVICE
// ============================================

export const getChatResponses = (): Record<string, { en: string; hi: string; hinglish: string }> => {
  return {
    'mujhe 5 lakh ka loan chahiye': {
      en: `Based on your current financial context, ARTHDRISHTI's assessment is:

**NOT RECOMMENDED RIGHT NOW**

Here's why:

- Your existing EMI burden is ₹31,500/month (38.4% of income)
- Your financial buffer has tightened to 2.4 months
- Your cash flow trend is declining
- Your discretionary spending has increased 11%

Taking on a ₹5 lakh loan at ~13.2% interest would add approximately ₹11,000-12,000/month to your commitments, pushing your total EMI burden to nearly 52% of income.

**Better next step:** Let's build your 90-day financial buffer first. This will strengthen your financial resilience before taking on new obligations.`,
      hi: `आपकी वर्तमान वित्तीय स्थिति के आधार पर, ARTHDRISHTI का मूल्यांकन है:

**अभी अनुशंसित नहीं है**

यह क्यों:

- आपका मौजूदा EMI बोझ ₹31,500/महीना है (आय का 38.4%)
- आपका वित्तीय सुरक्षा कवच 2.4 महीने तक कम हो गया है
- आपकी नकदी प्रवाह प्रवृत्ति गिर रही है
- आपकी मुक्तपेंपुर्स खर्च में 11% की वृद्धि हुई है

₹5 लाख के लोन को लेने से आपकी कुल EMI बोझ आय का लगभग 52% तक पहुंच जाएगी।

**बेहतर अगला कदम:** पहले 90-दिन के वित्तीय बफर का निर्माण करें।`,
      hinglish: `Aapki current financial situation ke aadhar pe, ARTHDRISHTI ka assessment hai:

**Right now NOT RECOMMENDED**

Yeh kyun:

- Aapka existing EMI burden ₹31,500/month hai (income ka 38.4%)
- Aapka financial buffer 2.4 months pe tight ho gaya hai
- Cash flow trend declining ja raha hai
- Discretionary spending mein 11% increase hua hai

₹5 lakh loan lene se total EMI burden nearly 52% of income pe pahuch jayega.

**Better approach:** Pehle apna 90-day financial buffer build karo.`,
    },
    'mere kharche kahan badhe': {
      en: `ARTHDRISHTI analyzed your spending patterns over the last 90 days:

**Biggest increases:**
1. Food & Dining: +18% (Zomato, Swiggy, restaurants)
2. Shopping: +8% (Amazon, Flipkart, Myntra)
3. UPI micro-spending: +12%

**Total impact:** Approximately ₹8,400/month additional spending

**Where money is going:**
- Essential spending: ₹41,800/month (55%)
- Discretionary spending: ₹34,200/month (45%)
- EMIs: ₹31,500/month

The biggest lever is reducing food delivery frequency. Switching 3-4 orders per week to home cooking could save ₹4,000-5,000/month.`,
      hi: `ARTHDRISHTI ने पिछले 90 दिनों में आपके खर्च के पैटर्न का विश्लेषण किया है:

**सबसे बड़ी वृद्धि:**
1. खाना और बाहर खाना: +18%
2. शॉपिंग: +8%
3. छोटे UPI खर्च: +12%

**कुल प्रभाव:** लगभग ₹8,400/महीना अतिरिक्त खर्च

बड़ा लीवर फूड डिलीवरी की आवृत्ति कम करना है।`,
      hinglish: `ARTHDRISHTI ne last 90 days ke spending patterns ka analysis kiya hai:

**Sabse badi increases:**
1. Food & Dining: +18%
2. Shopping: +8%
3. UPI micro-spending: +12%

**Total impact:** ₹8,400/month extra spending

**Biggest lever:** Food delivery frequency kam karo. 3-4 orders per week home cooking mein badalne se ₹4,000-5,000/month bach sakta hai.`,
    },
    'why is my savings buffer falling': {
      en: `Your financial buffer is declining because of three connected factors:

1. **Spending increased 11%** — Your discretionary spending on food, shopping, and UPI micro-transactions has grown.

2. **Savings rate dropped 8%** — Your monthly savings transfer decreased from ~₹24,600 to ~₹18,000.

3. **Buffer compression** — With ₹1,82,000 in savings and essential expenses of ~₹76,000/month, your buffer is 2.4 months. Eight weeks ago it was 3.2 months.

The pattern is clear: money that was being saved is now being spent. The good news is that this is reversible by controlling discretionary spending.`,
      hi: `आपका वित्तीय सुरक्षा कवच तीन संबंधित कारकों के कारण गिर रहा है:

1. **खर्च में 11% की वृद्धि**
2. **बचत दर में 8% की कमी**
3. **बफर संपीड़न**

अच्छी खबर है कि यह मुक्तपेंपुर्स खर्च को नियंत्रित करके पूर्ववत किया जा सकता है।`,
      hinglish: `Aapka savings buffer is declining because of 3 connected factors:

1. **Spending increased 11%** — Food, shopping, UPI transactions mein growth
2. **Savings rate dropped 8%** — Monthly savings transfer kam ho gaya
3. **Buffer compression** — 3.2 months se 2.4 months pe aa gaya

Ye reversible hai. Discretionary spending control karke fix kar sakte ho.`,
    },
    'explain my financial health': {
      en: `Here's ARTHDRISHTI's read on your financial health:

**Overall Assessment: CAUTION**

Your income is stable and you have a consistent savings habit. However, recent signals suggest your financial resilience is under pressure.

**What's working well:**
- Consistent ₹82,000/month income (12 months)
- Active savings habit: ₹1.82L accumulated
- KYC verified, accounts in good standing

**What needs attention:**
- Financial buffer: 2.4 months (below 3-month recommendation)
- EMI burden: 38.4% (approaching 40% concern level)
- Cash flow: Declining trend over 6 weeks
- Discretionary spending: +11% increase

**ARTHDRISHTI's recommendation:** Focus on building liquidity before taking on new financial obligations. Your current pattern suggests that a stronger emergency buffer will serve you better than additional debt.`,
      hi: `यहाँ ARTHDRISHTI का आपके वित्तीय स्वास्थ्य पर मूल्यांकन है:

**समग्र मूल्यांकन: सावधानी**

आपकी आय स्थिर है और बचत की आदत अच्छी है। लेकिन हालिया संकेत बताते हैं कि आपकी वित्तीय क्षमता दबाव में है।

**सलाह:** नई वित्तीय दायित्व लेने से पहले तरलता बढ़ाएं।`,
      hinglish: `ARTHDRISHTI ka assessment hai:

**Overall: CAUTION**

Income stable hai, savings habit acchi hai. Lekin recent signals batate hain ki financial resilience under pressure hai.

**Recommendation:** Naye financial obligations lene se pehle liquidity build karo.`,
    },
    'how can i save 10000 this month': {
      en: `ARTHDRISHTI analyzed your spending to find ₹10,000 in potential savings:

**Immediate actions (₹6,000-7,000/month):**
1. Reduce food delivery: 3-4 fewer orders = ₹4,000-5,000
2. Review subscriptions: Cancel unused services = ₹1,000-2,000
3. Reduce UPI micro-spending: Set a daily limit = ₹500-1,000

**Medium-term actions:**
1. Set up auto-transfer on salary day (not mid-month)
2. Create a "spending pause" day each week
3. Track every expense for 7 days

Your income supports this — you just need to redirect spending from discretionary to savings.

Would you like me to create a specific 30-day savings plan?`,
      hi: `ARTHDRISHTI ने ₹10,000 की बचत के लिए संभावनाएं खोजी हैं:

**तत्काल कार्य:**
1. फूड डिलीवरी कम करें = ₹4,000-5,000
2. सदस्यताओं की समीक्षा = ₹1,000-2,000
3. UPI माइक्रो-खर्च कम करें = ₹500-1,000

क्या आप 30-दिन की बचत योजना बनाना चाहेंगे?`,
      hinglish: `Potential savings found: ₹10,000/month

**Immediate:**
1. Food delivery kam karo = ₹4,000-5,000
2. Subscriptions review karo = ₹1,000-2,000
3. UPI micro-spending kam karo = ₹500-1,000

Chahte ho 30-day savings plan banaye?`,
    },
    'mujhe loan kyun nahi lena chahiye': {
      en: `This is exactly the right question. Here's why ARTHDRISHTI would not recommend a new loan right now:

**Your current position:**
- Existing EMIs: ₹31,500/month (38.4% of income)
- Financial buffer: 2.4 months (below recommended 3 months)
- Cash flow: Declining
- Savings rate: Dropping

**What a new ₹5L loan would mean:**
- Additional EMI: ~₹11,500/month
- Total EMI burden: ~52% of income
- Buffer after payments: Even tighter

**The key insight:**
Your income is stable. That's good. But your commitments are already high and your buffer is shrinking. Adding more debt when your buffer is below 3 months is like adding weight to a backpack that's already too heavy.

**Better path:** Build your buffer to 4-6 months first. Then you'll have the capacity to take on new obligations confidently.`,
      hi: `यही सही सवाल है। यहां क्यों नहीं:

**आपकी वर्तमान स्थिति:**
- मौजूदा EMI: ₹31,500/महीना
- वित्तीय बफर: 2.4 महीने
- नकदी प्रवाह: गिर रहा है

**बेहतर रास्ता:** पहले अपना बफर 4-6 महीने तक बढ़ाएं।`,
      hinglish: `Ye exactly the right question hai. Kyun nahi:

**Current situation:**
- EMI burden already high: 38.4%
- Buffer tight: 2.4 months
- Cash flow declining

**Better path:** Pehle buffer 4-6 months pe le jao. Phir confidently naya obligation le sakte ho.`,
    },
  };

  const defaultResponse = {
    en: `I understand your question. Let me think about this in the context of your financial situation.

Based on what I can see:
- Your income is stable at ₹82,000/month
- Your EMI burden is at 38.4% of income
- Your financial buffer is 2.4 months
- Your cash flow has been declining

I'd like to help you with this. Could you tell me more specifically what you'd like to know? You can ask about your spending, savings, debt, or any financial concern.`,
    hi: `मैं आपके प्रश्न को समझता हूं। मुझे आपकी वित्तीय स्थिति के संदर्भ में इसके बारे में सोचने दें।

आपकी आय स्थिर है, आपका EMI बोझ 38.4% है, और आपका वित्तीय बफर 2.4 महीने है।

आप अपने खर्च, बचत, कर्ज या किसी वित्तीय चिंता के बारे में पूछ सकते हैं।`,
    hinglish: `I understand your question. Let me help based on your financial context:

- Income stable: ₹82,000/month
- EMI burden: 38.4%
- Buffer: 2.4 months
- Cash flow: Declining

Aap apne spending, savings, debt ya kisi financial concern ke baare mein pooch sakte ho.`,
  };

  return { default: defaultResponse };
};

// ============================================
// ANOMALY DETECTION (DEMO)
// ============================================

export const getPotentialAnomaly = () => {
  return {
    amount: 18450,
    merchant: 'Unknown Online Merchant',
    time: '11:48 PM',
    date: daysAgo(3),
    location: 'Mumbai, Maharashtra',
    reasons: [
      'Unusual amount for this time of day',
      'Merchant pattern not in your usual categories',
      'Transaction at unusual hour (11:48 PM)',
      'Location differs from your usual activity area',
    ],
    message: {
      en: `We noticed a transaction that doesn't match your usual pattern. This doesn't necessarily mean it's fraudulent, but we wanted to check with you.

**Transaction details:**
- Amount: ₹18,450
- Time: 11:48 PM
- Merchant: Unknown Online Merchant
- Location: Mumbai, Maharashtra

**Why we flagged it:**
1. Unusual amount for this time
2. New merchant pattern
3. Unusual hour (late night)
4. Location mismatch

Was this transaction made by you?`,
      hi: `हमें एक लेन-देन की पता चली है जो आपके सामान्य पैटर्न से मेल नहीं खाता। क्या यह लेन-देन आपके द्वारा किया गया था?`,
      hinglish: `Humein ek transaction ka notice aaya hai jo aapke usual pattern se match nahi karta. Kya ye transaction aapne kiya tha?`,
    },
  };
};

// ============================================
// TRANSLATIONS
// ============================================

export const translations: Record<string, Record<Language, string>> = {
  'nav.overview': {
    en: 'Overview',
    hi: 'सारांश',
    hinglish: 'Overview',
  },
  'nav.financialLife': {
    en: 'Financial Life',
    hi: 'वित्तीय जीवन',
    hinglish: 'Financial Life',
  },
  'nav.insights': {
    en: 'Insights',
    hi: 'अंतर्दृष्टि',
    hinglish: 'Insights',
  },
  'nav.protection': {
    en: 'Protection',
    hi: 'सुरक्षा',
    hinglish: 'Protection',
  },
  'nav.ask': {
    en: 'Ask ARTHDRISHTI',
    hi: 'ARTHDRISHTI से पूछें',
    hinglish: 'Ask ARTHDRISHTI',
  },
  'dashboard.headline': {
    en: "Here's what ARTHDRISHTI understands about your financial life.",
    hi: 'ARTHDRISHTI आपके वित्तीय जीवन को समझता है।',
    hinglish: "ARTHDRISHTI samajhta hai aapke financial life ke baare mein.",
  },
  'financialState.title': {
    en: 'Financial State',
    hi: 'वित्तीय स्थिति',
    hinglish: 'Financial State',
  },
  'whatChanged.title': {
    en: 'What changed?',
    hi: 'क्या बदलाव हुआ?',
    hinglish: 'What changed?',
  },
  'whatMayMatter.title': {
    en: 'What may matter next',
    hi: 'आगे क्या महत्वपूर्ण हो सकता है',
    hinglish: 'What may matter next',
  },
  'loan.notRecommended': {
    en: 'NOT RECOMMENDED RIGHT NOW',
    hi: 'अभी अनुशंसित नहीं है',
    hinglish: 'NOT RECOMMENDED RIGHT NOW',
  },
  'governance.title': {
    en: 'ARTHDRISHTI Trust Layer',
    hi: 'ARTHDRISHTI विश्वास परत',
    hinglish: 'ARTHDRISHTI Trust Layer',
  },
  'governance.aiProposes': {
    en: 'AI proposes',
    hi: 'AI प्रस्तावित करता है',
    hinglish: 'AI proposes',
  },
  'governance.governanceDecides': {
    en: 'Governance decides',
    hi: 'गवर्नेंस तय करता है',
    hinglish: 'Governance decides',
  },
  'demo.badge': {
    en: 'Demo Mode',
    hi: 'डेमो मोड',
    hinglish: 'Demo Mode',
  },
};

export const t = (key: string, lang: Language = 'en'): string => {
  return translations[key]?.[lang] || translations[key]?.['en'] || key;
};
