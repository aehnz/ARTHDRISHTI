import type {
  ConsentItem, Customer, DemoScenario, DemoState, FinancialState, Goal,
  GovernanceCheck, Insight, LoanAssessment, ModelInference, PersonaId,
  Recommendation, Signal, Transaction, TransactionCategory, TrajectoryPoint,
} from '@/types';

type ScenarioInput = {
  income: number; emi: number; savings: number; buffer: number; essential: number;
  discretionary: number; savingsRate: number; savingsTrend: number; spendingTrend: number;
  monthlyContribution: number; utilization: number; outstanding: number; accounts: number;
  incomeStability: 'stable' | 'variable' | 'declining'; cashFlowTrend: 'stable' | 'improving' | 'declining';
  risk: FinancialState['risk']['level']; riskScore: number; health: number; upcoming: number;
};

export const DEMO_DATE = '2026-09-12';
export const formatINR = (amount: number, compact = false) => {
  if (compact && Math.abs(amount) >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (compact && Math.abs(amount) >= 1000) return `₹${Math.round(amount / 1000)}K`;
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
};
export const pct = (value: number) => Math.round(value * 10) / 10;

const customers: Record<PersonaId, Customer> = {
  ravi: {
    id: 'cust-ravi', name: 'Ravi Sharma', firstName: 'Ravi', age: 32,
    location: 'Ahmedabad, Gujarat', occupation: 'Salaried professional',
    monthlyIncome: 82000, existingEmi: 31500, savings: 182000, financialBuffer: 2.4,
    cashFlowTrend: 'declining', joinDate: '2023-06-15', kycStatus: 'verified',
  },
  ananya: {
    id: 'cust-ananya', name: 'Ananya Mehta', firstName: 'Ananya', age: 36,
    location: 'Pune, Maharashtra', occupation: 'Product leader',
    monthlyIncome: 180000, existingEmi: 32400, savings: 1030000, financialBuffer: 8.2,
    cashFlowTrend: 'improving', joinDate: '2022-03-04', kycStatus: 'verified',
  },
};

const raviInputs: Record<DemoScenario, ScenarioInput> = {
  tightening: { income: 82000, emi: 31500, savings: 182000, buffer: 2.4, essential: 24800, discretionary: 15700, savingsRate: 12, savingsTrend: -8, spendingTrend: 11, monthlyContribution: 9800, utilization: 61, outstanding: 1850000, accounts: 3, incomeStability: 'stable', cashFlowTrend: 'declining', risk: 'elevated', riskScore: 68, health: 64, upcoming: 27400 },
  stable: { income: 82000, emi: 25500, savings: 304000, buffer: 4.1, essential: 24500, discretionary: 11900, savingsRate: 24, savingsTrend: 2, spendingTrend: -2, monthlyContribution: 19700, utilization: 34, outstanding: 1480000, accounts: 2, incomeStability: 'stable', cashFlowTrend: 'stable', risk: 'low', riskScore: 25, health: 78, upcoming: 22900 },
  stress: { income: 58000, emi: 33000, savings: 28000, buffer: 0.4, essential: 17000, discretionary: 6200, savingsRate: 3, savingsTrend: -17, spendingTrend: 19, monthlyContribution: 1700, utilization: 82, outstanding: 1920000, accounts: 4, incomeStability: 'declining', cashFlowTrend: 'declining', risk: 'high', riskScore: 91, health: 31, upcoming: 34200 },
  anomaly: { income: 82000, emi: 31500, savings: 196000, buffer: 2.6, essential: 24800, discretionary: 13900, savingsRate: 14, savingsTrend: -3, spendingTrend: 6, monthlyContribution: 11500, utilization: 58, outstanding: 1850000, accounts: 3, incomeStability: 'stable', cashFlowTrend: 'declining', risk: 'elevated', riskScore: 72, health: 60, upcoming: 27400 },
  growth: { income: 92000, emi: 25500, savings: 410000, buffer: 5.4, essential: 25000, discretionary: 12000, savingsRate: 31, savingsTrend: 9, spendingTrend: -5, monthlyContribution: 28500, utilization: 25, outstanding: 1320000, accounts: 2, incomeStability: 'stable', cashFlowTrend: 'improving', risk: 'low', riskScore: 19, health: 84, upcoming: 22100 },
};

const ananyaInputs: Record<DemoScenario, ScenarioInput> = {
  growth: { income: 180000, emi: 32400, savings: 1030000, buffer: 8.2, essential: 42000, discretionary: 28400, savingsRate: 34, savingsTrend: 7, spendingTrend: -3, monthlyContribution: 61200, utilization: 18, outstanding: 2340000, accounts: 2, incomeStability: 'stable', cashFlowTrend: 'improving', risk: 'low', riskScore: 12, health: 89, upcoming: 38800 },
  stable: { income: 180000, emi: 32400, savings: 920000, buffer: 7.3, essential: 42000, discretionary: 31500, savingsRate: 31, savingsTrend: 3, spendingTrend: 1, monthlyContribution: 55800, utilization: 21, outstanding: 2380000, accounts: 2, incomeStability: 'stable', cashFlowTrend: 'stable', risk: 'low', riskScore: 17, health: 86, upcoming: 38800 },
  tightening: { income: 180000, emi: 46000, savings: 730000, buffer: 5.7, essential: 44000, discretionary: 39000, savingsRate: 23, savingsTrend: -6, spendingTrend: 10, monthlyContribution: 41400, utilization: 36, outstanding: 2920000, accounts: 3, incomeStability: 'stable', cashFlowTrend: 'declining', risk: 'moderate', riskScore: 38, health: 72, upcoming: 51400 },
  stress: { income: 126000, emi: 60000, savings: 155000, buffer: 1.5, essential: 36000, discretionary: 16000, savingsRate: 7, savingsTrend: -19, spendingTrend: 15, monthlyContribution: 8800, utilization: 75, outstanding: 3210000, accounts: 4, incomeStability: 'declining', cashFlowTrend: 'declining', risk: 'high', riskScore: 86, health: 38, upcoming: 64200 },
  anomaly: { income: 180000, emi: 32400, savings: 995000, buffer: 7.9, essential: 42000, discretionary: 31000, savingsRate: 32, savingsTrend: 3, spendingTrend: 2, monthlyContribution: 57600, utilization: 24, outstanding: 2340000, accounts: 2, incomeStability: 'stable', cashFlowTrend: 'stable', risk: 'moderate', riskScore: 43, health: 79, upcoming: 38800 },
};

const dateFor = (monthOffset: number, day: number) => {
  const d = new Date('2026-09-12T12:00:00.000Z');
  d.setUTCMonth(d.getUTCMonth() - monthOffset);
  d.setUTCDate(day);
  return d.toISOString().slice(0, 10);
};

const merchantSets: Record<TransactionCategory, string[]> = {
  Salary: ['TechCorp India', 'Meridian Systems'],
  Rent: ['Satellite Towers', 'Blue Ridge Housing'],
  EMI: ['HDFC Bank', 'ICICI Bank', 'SBI Card'],
  Food: ['Swiggy', 'Zomato', 'Fresh Basket'],
  Dining: ['The Green House', 'Urban Tadka', 'Coffee Culture'],
  Shopping: ['Myntra', 'Amazon India', 'Westside'],
  Mobility: ['Uber', 'Ola', 'Ahmedabad Metro'],
  Utilities: ['Torrent Power', 'Jio Fiber', 'Adani Gas'],
  Healthcare: ['Apollo Pharmacy', 'HealthCare Clinic'],
  Subscriptions: ['Netflix', 'Spotify', 'FitPass'],
  Savings: ['Emergency Fund', 'Goal Vault'],
  UPI: ['UPI • K Patel', 'UPI • Corner Store'],
  Other: ['ATM Withdrawal', 'Bank Fee'],
};

const makeTransactions = (persona: PersonaId, scenario: DemoScenario, input: ScenarioInput): Transaction[] => {
  const tx: Transaction[] = [];
  const suffix = `${persona}-${scenario}`;
  for (let month = 0; month < 6; month += 1) {
    const incomeMerchant = persona === 'ravi' ? merchantSets.Salary[0] : merchantSets.Salary[1];
    tx.push({ id: `${suffix}-salary-${month}`, date: dateFor(month, 1), time: '09:08', description: 'Monthly salary credit', amount: input.income, type: 'credit', category: 'Salary', merchant: incomeMerchant, isRecurring: true, intelligence: 'Stable recurring income • 6/6 months on schedule', insightIds: ['income-stable'] });
    const rent = persona === 'ravi' ? 18000 : 32000;
    tx.push({ id: `${suffix}-rent-${month}`, date: dateFor(month, 3), time: '08:30', description: 'Home rent', amount: rent, type: 'debit', category: 'Rent', merchant: persona === 'ravi' ? merchantSets.Rent[0] : merchantSets.Rent[1], isRecurring: true, intelligence: 'Expected fixed obligation', insightIds: ['cash-pressure'] });
    [0.4, 0.3, 0.3].forEach((share, idx) => tx.push({ id: `${suffix}-emi-${month}-${idx}`, date: dateFor(month, 5 + idx * 3), time: '06:00', description: ['Vehicle loan EMI', 'Personal loan EMI', 'Card instalment'][idx], amount: Math.round(input.emi * share), type: 'debit', category: 'EMI', merchant: merchantSets.EMI[idx], isRecurring: true, intelligence: 'Debt obligation • repayment on schedule', insightIds: ['emi-burden'] }));
    const foodScale = scenario === 'stress' ? 1.25 : scenario === 'tightening' ? 1.12 : scenario === 'growth' ? 0.88 : 1;
    for (let i = 0; i < 4; i += 1) {
      const amount = Math.round((420 + month * 31 + i * 117) * foodScale);
      tx.push({ id: `${suffix}-food-${month}-${i}`, date: dateFor(month, 7 + i * 5), time: ['13:10', '20:42', '12:18', '21:04'][i], description: i % 2 ? 'Food delivery' : 'Groceries', amount, type: 'debit', category: 'Food', merchant: merchantSets.Food[i % 3], intelligence: scenario === 'tightening' || scenario === 'stress' ? 'Food delivery +18% vs 90-day baseline' : 'Within your normal range', insightIds: ['spending-rise', 'leak-food'] });
    }
    for (let i = 0; i < 2; i += 1) {
      tx.push({ id: `${suffix}-mobility-${month}-${i}`, date: dateFor(month, 11 + i * 8), time: '18:20', description: 'Urban commute', amount: 310 + month * 17 + i * 94, type: 'debit', category: 'Mobility', merchant: merchantSets.Mobility[i], intelligence: 'Normal weekly mobility pattern' });
      tx.push({ id: `${suffix}-dining-${month}-${i}`, date: dateFor(month, 9 + i * 11), time: '20:15', description: 'Dining out', amount: Math.round((780 + month * 49 + i * 210) * foodScale), type: 'debit', category: 'Dining', merchant: merchantSets.Dining[i], intelligence: scenario === 'tightening' || scenario === 'stress' ? 'Dining +9% vs baseline' : 'Within your normal range', insightIds: ['spending-rise'] });
    }
    tx.push({ id: `${suffix}-utility-${month}`, date: dateFor(month, 10), time: '07:45', description: 'Electricity and broadband', amount: persona === 'ravi' ? 2840 : 4620, type: 'debit', category: 'Utilities', merchant: merchantSets.Utilities[month % 2], isRecurring: true, intelligence: 'Expected recurring obligation' });
    tx.push({ id: `${suffix}-subscription-${month}`, date: dateFor(month, 15), time: '04:05', description: 'Digital subscriptions', amount: persona === 'ravi' ? 1648 : 2397, type: 'debit', category: 'Subscriptions', merchant: '3 recurring services', isRecurring: true, intelligence: persona === 'ravi' ? 'One low-use subscription detected • ₹699 potential saving' : 'Subscription set is within your baseline', insightIds: ['unused-subscription'] });
    tx.push({ id: `${suffix}-saving-${month}`, date: dateFor(month, scenario === 'tightening' && month === 0 ? 7 : 2), time: '10:00', description: 'Goal savings transfer', amount: input.monthlyContribution, type: 'debit', category: 'Savings', merchant: 'Emergency Fund', isRecurring: true, intelligence: scenario === 'tightening' && month === 0 ? 'Transfer was 5 days later than usual' : 'Recurring wealth-building habit', insightIds: ['savings-trend'] });
  }
  if (scenario === 'anomaly') tx.unshift({ id: `${suffix}-anomaly-1`, date: '2026-09-11', time: '23:48', description: 'Online electronics purchase', amount: persona === 'ravi' ? 18450 : 42800, type: 'debit', category: 'Shopping', merchant: 'NovaKart Online', intelligence: 'Unusual amount + unusual hour + first-seen merchant', insightIds: ['anomaly-detected'], anomaly: true });
  return tx.sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
};

const buildState = (input: ScenarioInput): FinancialState => {
  const emiBurdenRatio = pct((input.emi / input.income) * 100);
  const monthlySurplus = input.income - input.emi - input.essential - input.discretionary;
  const componentSeed = input.health;
  const components: FinancialState['healthComponents'] = [
    { key: 'resilience', label: 'Resilience', score: Math.max(15, Math.min(96, componentSeed - (input.buffer < 3 ? 12 : -4))), weight: 25, trend: input.savingsTrend, explanation: `${input.buffer} months of essential commitments are covered.`, signals: [`Buffer ${input.buffer} months`, `Savings ${formatINR(input.savings)}`] },
    { key: 'liquidity', label: 'Liquidity', score: Math.max(12, Math.min(96, componentSeed - (input.cashFlowTrend === 'declining' ? 10 : -3))), weight: 20, trend: input.cashFlowTrend === 'declining' ? -6 : 3, explanation: `${formatINR(monthlySurplus)} remains after current monthly outflows.`, signals: [`Upcoming ${formatINR(input.upcoming)}`, `Cash flow ${input.cashFlowTrend}`] },
    { key: 'debt', label: 'Debt', score: Math.max(10, Math.min(96, Math.round(100 - emiBurdenRatio * 1.35))), weight: 20, trend: emiBurdenRatio > 35 ? -2 : 2, explanation: `${emiBurdenRatio}% of income is committed to EMIs.`, signals: [`${input.accounts} active obligations`, `${formatINR(input.outstanding)} outstanding`] },
    { key: 'savings', label: 'Savings', score: Math.max(10, Math.min(96, Math.round(input.savingsRate * 2.25 + 20))), weight: 15, trend: input.savingsTrend, explanation: `${input.savingsRate}% of monthly income is being saved.`, signals: [`${formatINR(input.monthlyContribution)}/month`, `${input.savingsTrend > 0 ? '+' : ''}${input.savingsTrend}% trend`] },
    { key: 'income', label: 'Income stability', score: input.incomeStability === 'stable' ? 91 : input.incomeStability === 'variable' ? 62 : 39, weight: 10, trend: input.incomeStability === 'declining' ? -12 : 0, explanation: input.incomeStability === 'stable' ? 'Income arrived consistently for six months.' : 'Recent income is less predictable.', signals: [`Volatility ${input.incomeStability === 'stable' ? '2%' : '18%'}`] },
    { key: 'discipline', label: 'Spending discipline', score: Math.max(12, Math.min(94, Math.round(74 - input.spendingTrend * 1.4))), weight: 10, trend: -input.spendingTrend, explanation: `Discretionary spending is ${input.spendingTrend >= 0 ? 'up' : 'down'} ${Math.abs(input.spendingTrend)}%.`, signals: [`Potential leaks ${formatINR(input.discretionary * 0.18)}`] },
  ];
  return {
    income: { monthly: input.income, annual: input.income * 12, stability: input.incomeStability, lastCreditDate: '2026-09-01', volatility: input.incomeStability === 'stable' ? 2 : 18 },
    spending: { essential: input.essential, discretionary: input.discretionary, total: input.essential + input.discretionary, trend: input.spendingTrend, potentialLeaks: Math.round(input.discretionary * 0.18) },
    debt: { existingEmi: input.emi, emiBurdenRatio, totalOutstanding: input.outstanding, accounts: input.accounts, utilization: input.utilization },
    savings: { total: input.savings, rate: input.savingsRate, trend: input.savingsTrend, bufferMonths: input.buffer, monthlyContribution: input.monthlyContribution },
    cashFlow: { monthlySurplus, trend: input.cashFlowTrend, upcomingObligations: input.upcoming },
    risk: { level: input.risk, score: input.riskScore, signals: input.risk === 'low' ? ['No material stress signals'] : ['Financial cushion is getting thinner', emiBurdenRatio > 35 ? 'EMI burden is elevated' : 'Cash-flow pattern changed', input.cashFlowTrend === 'declining' ? 'Cash flow is declining' : 'Transaction needs verification'] },
    healthScore: input.health,
    healthComponents: components,
    creditHealth: { index: input.health >= 80 ? 'STRONG' : input.health >= 58 ? 'MODERATE' : 'NEEDS ATTENTION', score: Math.max(25, Math.min(94, Math.round((100 - input.utilization) * 0.45 + (100 - emiBurdenRatio) * 0.35 + (input.health * 0.2)))), factors: ['Repayment consistency', `Utilization ${input.utilization}%`, `Debt burden ${emiBurdenRatio}%`, 'Prototype index—not a bureau score'] },
  };
};

const makeInsights = (persona: PersonaId, scenario: DemoScenario, state: FinancialState): Insight[] => {
  if (scenario === 'anomaly') return [
    { id: 'anomaly-detected', type: 'warning', category: 'risk', title: 'A transaction breaks your usual pattern', description: 'A late-night purchase at a first-seen merchant is materially above your typical shopping amount.', dataPoints: ['Amount above baseline', 'First-seen merchant', 'Unusual transaction hour'], transactionIds: [`${persona}-${scenario}-anomaly-1`], timestamp: '11 Sep · 23:49', priority: 1, actionable: true, action: 'Verify transaction', confidence: 96, impact: 'Protect ₹18,450 from potential loss' },
    { id: 'buffer-watch', type: 'caution', category: 'risk', title: 'Keep the cushion protected', description: 'The unusual debit would reduce accessible liquidity if left unresolved.', dataPoints: [`Current buffer ${state.savings.bufferMonths} months`], transactionIds: [], timestamp: 'Today', priority: 2, actionable: true, action: 'Review impact', confidence: 89, impact: '-0.2 months of buffer' },
  ];
  if (persona === 'ananya' && (scenario === 'growth' || scenario === 'stable')) return [
    { id: 'goal-acceleration', type: 'positive', category: 'opportunity', title: 'Your position can support faster goals', description: 'Strong liquidity and a 34% savings rate create room to increase goal allocation without weakening resilience.', dataPoints: [`Buffer ${state.savings.bufferMonths} months`, `Savings rate ${state.savings.rate}%`, `EMI burden ${state.debt.emiBurdenRatio}%`], transactionIds: [], timestamp: 'Today', priority: 1, actionable: true, action: 'Accelerate goals', confidence: 91, impact: 'Home goal up to 7 months sooner' },
    { id: 'idle-cash', type: 'neutral', category: 'opportunity', title: 'A portion of cash is above your reserve target', description: 'Your liquid buffer exceeds eight months of commitments. Preserve six months and earmark the surplus against priorities.', dataPoints: [`Savings ${formatINR(state.savings.total)}`, 'Reserve target 6 months'], transactionIds: [], timestamp: 'Today', priority: 2, actionable: true, action: 'Build allocation plan', confidence: 87, impact: '₹2.7L available for goal allocation' },
    { id: 'positive-savings', type: 'positive', category: 'positive', title: 'Savings improved for a third month', description: 'Consistent transfers are strengthening long-term flexibility.', dataPoints: [`Monthly transfer ${formatINR(state.savings.monthlyContribution)}`], transactionIds: [`${persona}-${scenario}-saving-0`], timestamp: '2 Sep', priority: 3, actionable: false, confidence: 98, impact: '+0.5 months of resilience this quarter' },
  ];
  return [
    { id: 'spending-rise', type: 'caution', category: 'money-leak', title: 'Discretionary spending increased 11%', description: 'Food delivery, shopping and dining rose together for a third month and are compressing your financial cushion.', dataPoints: ['Food delivery +18%', 'Shopping +13%', 'Dining +9%', '12 underlying transactions'], transactionIds: Array.from({ length: 8 }, (_, i) => `${persona}-${scenario}-food-${Math.floor(i / 4)}-${i % 4}`), timestamp: 'Today', priority: 1, actionable: true, action: 'Review the 12 transactions', confidence: 94, impact: '₹4,800 potential monthly saving' },
    { id: 'emi-burden', type: 'warning', category: 'risk', title: 'EMI burden is near a high-stress range', description: `${state.debt.emiBurdenRatio}% of monthly income is already committed before a new borrowing decision.`, dataPoints: [`Income ${formatINR(state.income.monthly)}`, `EMIs ${formatINR(state.debt.existingEmi)}`, `${state.debt.accounts} active obligations`], transactionIds: [`${persona}-${scenario}-emi-0-0`, `${persona}-${scenario}-emi-0-1`, `${persona}-${scenario}-emi-0-2`], timestamp: 'Today', priority: 2, actionable: true, action: 'Open Loan Lab', confidence: 99, impact: 'New credit could push burden above 50%' },
    { id: 'savings-trend', type: 'caution', category: 'behaviour', title: 'Your savings rhythm changed', description: 'This month’s recurring transfer happened later and the saving rate remains below your recent baseline.', dataPoints: [`Savings rate ${state.savings.rate}%`, `Trend ${state.savings.trend}%`, 'Transfer delayed 5 days'], transactionIds: [`${persona}-${scenario}-saving-0`], timestamp: '7 Sep', priority: 3, actionable: true, action: 'Restore auto-transfer', confidence: 88, impact: 'Recover ₹5,000–₹8,000/month' },
    { id: 'income-stable', type: 'positive', category: 'positive', title: 'Income remains a stabilising signal', description: 'Salary arrived on schedule for the sixth consecutive month.', dataPoints: ['6/6 salary credits on schedule', 'Volatility 2%'], transactionIds: [`${persona}-${scenario}-salary-0`], timestamp: '1 Sep', priority: 4, actionable: false, confidence: 99, impact: 'Supports a structured recovery plan' },
  ];
};

const makeRecommendations = (persona: PersonaId, scenario: DemoScenario, state: FinancialState): Recommendation[] => {
  if (scenario === 'anomaly') return [{ id: 'verify', type: 'protection', title: 'Verify the NovaKart transaction', description: 'Confirm or flag the purchase before making other financial changes.', whyNow: 'The amount, merchant and time are all outside your normal pattern.', ifYouAct: 'You contain a possible loss and restore a trusted transaction baseline.', ifYouDont: 'The debit remains part of your accessible-cash calculation.', expectedImpact: 'Protect up to ₹18,450', timeHorizon: 'Now', signals: ['anomaly'], priority: 1, cta: 'Review transaction', ctaAction: '/protection' }];
  if (persona === 'ananya' && state.healthScore > 80) return [{ id: 'grow', type: 'planning', title: 'Accelerate your home goal', description: 'Redirect part of the monthly surplus while retaining a six-month reserve.', whyNow: 'Your liquidity, income stability and debt load are all strong.', ifYouAct: 'Your goal could arrive seven months earlier.', ifYouDont: 'Your position remains healthy, but surplus cash stays unassigned.', expectedImpact: '7 months sooner', timeHorizon: '12–24 months', signals: ['strong-buffer', 'high-savings'], priority: 1, cta: 'Open growth plan', ctaAction: '/recovery' }];
  return [{ id: 'recover', type: 'protection', title: 'Build your 90-day buffer', description: 'Reduce avoidable leaks, restore your transfer rhythm, then lift the cushion above three months before adding debt.', whyNow: `Your buffer is ${state.savings.bufferMonths} months and cash flow is ${state.cashFlow.trend}.`, ifYouAct: 'Your cushion can recover toward 3.2 months and improve borrowing suitability.', ifYouDont: 'A new obligation would leave less room for income or expense shocks.', expectedImpact: '+12 health points', timeHorizon: '90 days', signals: ['buffer', 'spending', 'debt'], priority: 1, cta: 'Start recovery plan', ctaAction: '/recovery' }];
};

const makeTrajectory = (persona: PersonaId, scenario: DemoScenario, state: FinancialState): TrajectoryPoint[] => {
  if (persona === 'ananya' && scenario === 'growth') return [
    { label: '6 mo ago', health: 80, buffer: 6.8, cashFlow: 49000 }, { label: '3 mo ago', health: 84, buffer: 7.4, cashFlow: 54500 },
    { label: 'Today', health: state.healthScore, buffer: state.savings.bufferMonths, cashFlow: state.cashFlow.monthlySurplus },
    { label: '6 months', health: 92, buffer: 8.8, cashFlow: 81000, projected: true }, { label: '12 months', health: 94, buffer: 9.4, cashFlow: 86000, projected: true },
  ];
  if (scenario === 'stress') return [
    { label: 'Today', health: 31, buffer: 0.4, cashFlow: 1800 }, { label: '30 days', health: 39, buffer: 0.7, cashFlow: 5200, projected: true },
    { label: '60 days', health: 48, buffer: 1.1, cashFlow: 8800, projected: true }, { label: '90 days', health: 58, buffer: 1.7, cashFlow: 12600, projected: true },
  ];
  return [
    { label: '6 mo ago', health: 76, buffer: 3.5, cashFlow: 17800 }, { label: '3 mo ago', health: 70, buffer: 3.0, cashFlow: 14800 },
    { label: 'Today', health: state.healthScore, buffer: state.savings.bufferMonths, cashFlow: state.cashFlow.monthlySurplus },
    { label: '90 days', health: Math.min(88, state.healthScore + 12), buffer: pct(state.savings.bufferMonths + 0.8), cashFlow: state.cashFlow.monthlySurplus + 7000, projected: true },
    { label: '6 months', health: Math.min(91, state.healthScore + 18), buffer: pct(state.savings.bufferMonths + 1.5), cashFlow: state.cashFlow.monthlySurplus + 10000, projected: true },
  ];
};

const makeGoals = (persona: PersonaId): Goal[] => persona === 'ravi' ? [
  { id: 'emergency', name: '90-day emergency fund', target: 240000, current: 182000, monthlyContribution: 9800, targetDate: 'Mar 2027', icon: 'shield' },
  { id: 'education', name: 'Professional course', target: 150000, current: 48000, monthlyContribution: 5000, targetDate: 'Jun 2028', icon: 'book' },
] : [
  { id: 'home', name: 'Home down payment', target: 3500000, current: 1680000, monthlyContribution: 55000, targetDate: 'Dec 2028', icon: 'home' },
  { id: 'reserve', name: 'Long-term reserve', target: 1500000, current: 1030000, monthlyContribution: 30000, targetDate: 'Jan 2028', icon: 'shield' },
];

const makeSignals = (state: FinancialState): Signal[] => [
  { id: 'health', label: 'Financial health', value: `${state.healthScore}/100`, change: state.cashFlow.trend === 'declining' ? -6 : 4, direction: state.cashFlow.trend === 'declining' ? 'down' : 'up', severity: state.healthScore > 78 ? 'positive' : state.healthScore > 55 ? 'warning' : 'critical', description: 'Composite of resilience, liquidity, debt, savings, income and spending discipline.', evidence: state.healthComponents.map(c => `${c.label}: ${c.score}`) },
  { id: 'buffer', label: 'Emergency buffer', value: `${state.savings.bufferMonths} months`, change: state.savings.trend, direction: state.savings.trend < 0 ? 'down' : 'up', severity: state.savings.bufferMonths >= 6 ? 'positive' : state.savings.bufferMonths >= 3 ? 'info' : 'warning', description: 'Accessible savings expressed as months of core commitments.', evidence: [`Savings ${formatINR(state.savings.total)}`, `Current buffer ${state.savings.bufferMonths} months`] },
  { id: 'emi', label: 'EMI burden', value: `${state.debt.emiBurdenRatio}%`, direction: 'stable', severity: state.debt.emiBurdenRatio > 45 ? 'critical' : state.debt.emiBurdenRatio > 35 ? 'warning' : 'positive', description: 'Share of income committed to existing EMIs.', evidence: [`EMIs ${formatINR(state.debt.existingEmi)}`, `Income ${formatINR(state.income.monthly)}`] },
  { id: 'cash', label: 'Monthly headroom', value: formatINR(state.cashFlow.monthlySurplus), direction: state.cashFlow.trend === 'declining' ? 'down' : state.cashFlow.trend === 'improving' ? 'up' : 'stable', severity: state.cashFlow.monthlySurplus > 30000 ? 'positive' : state.cashFlow.monthlySurplus > 5000 ? 'info' : 'critical', description: 'Income remaining after current spending and debt commitments.', evidence: [`Upcoming obligations ${formatINR(state.cashFlow.upcomingObligations)}`] },
];

const makeInference = (state: FinancialState): ModelInference => ({
  model: 'Financial resilience model', score: state.healthScore, confidence: 88,
  band: state.healthScore >= 80 ? 'Strong' : state.healthScore >= 58 ? 'Tightening' : 'High stress',
  contributions: [
    { feature: 'EMI burden', value: `${state.debt.emiBurdenRatio}%`, impact: state.debt.emiBurdenRatio > 35 ? -22 : 8 },
    { feature: 'Emergency buffer', value: `${state.savings.bufferMonths} months`, impact: state.savings.bufferMonths < 3 ? -18 : 16 },
    { feature: 'Cash-flow trend', value: state.cashFlow.trend, impact: state.cashFlow.trend === 'declining' ? -13 : 10 },
    { feature: 'Savings rate', value: `${state.savings.rate}%`, impact: state.savings.rate > 25 ? 14 : -8 },
    { feature: 'Income stability', value: state.income.stability, impact: state.income.stability === 'stable' ? 17 : -12 },
  ],
  disclaimer: 'Prototype inference for financial education. This is not a bureau score, underwriting result, credit limit, or guarantee of approval.',
});

export const getDemoState = (persona: PersonaId = 'ravi', scenario?: DemoScenario): DemoState => {
  const resolvedScenario = scenario ?? (persona === 'ananya' ? 'growth' : 'tightening');
  const input = persona === 'ravi' ? raviInputs[resolvedScenario] : ananyaInputs[resolvedScenario];
  const base = customers[persona];
  const customer: Customer = { ...base, monthlyIncome: input.income, existingEmi: input.emi, savings: input.savings, financialBuffer: input.buffer, cashFlowTrend: input.cashFlowTrend };
  const financialState = buildState(input);
  return {
    persona, scenario: resolvedScenario, customer, financialState,
    transactions: makeTransactions(persona, resolvedScenario, input),
    insights: makeInsights(persona, resolvedScenario, financialState),
    signals: makeSignals(financialState),
    recommendations: makeRecommendations(persona, resolvedScenario, financialState),
    timeline: [],
    trajectory: makeTrajectory(persona, resolvedScenario, financialState),
    goals: makeGoals(persona),
    modelInference: makeInference(financialState),
  };
};

export const evaluateLoan = (state: DemoState, amount: number, tenure: number, apr = 13.2): LoanAssessment => {
  const monthlyRate = apr / 1200;
  const factor = Math.pow(1 + monthlyRate, tenure);
  const monthlyEmi = Math.round((amount * monthlyRate * factor) / (factor - 1));
  const totalEmiAfter = state.financialState.debt.existingEmi + monthlyEmi;
  const affordabilityRatio = pct((totalEmiAfter / state.financialState.income.monthly) * 100);
  const remainingCashFlow = state.financialState.cashFlow.monthlySurplus - monthlyEmi;
  const bufferAfterEmi = Math.max(0, pct(state.financialState.savings.bufferMonths - monthlyEmi / 18000));
  const healthAfter = Math.max(18, Math.round(state.financialState.healthScore - Math.max(4, monthlyEmi / 1100) - (affordabilityRatio > 50 ? 7 : 0)));
  const affordabilityBand = affordabilityRatio <= 32 && bufferAfterEmi >= 3 ? 'Comfortable' : affordabilityRatio <= 45 && remainingCashFlow > 0 ? 'Stretched' : 'High stress';
  let decision: LoanAssessment['recommendation'] = 'RECOMMENDED';
  if (affordabilityRatio > 50 || remainingCashFlow < 0 || state.financialState.savings.bufferMonths < 1) decision = affordabilityRatio > 65 ? 'BLOCKED' : 'NOT_RECOMMENDED_RIGHT_NOW';
  else if (affordabilityRatio > 35 || bufferAfterEmi < 3) decision = 'RECOMMENDED_WITH_CAUTION';
  const reasoning = [
    `Existing EMI burden is ${state.financialState.debt.emiBurdenRatio}% of income.`,
    `The new illustrative EMI is ${formatINR(monthlyEmi)} per month.`,
    `Total EMI burden would become ${affordabilityRatio}%.`,
    `The simulated buffer falls from ${state.financialState.savings.bufferMonths} to ${bufferAfterEmi} months.`,
    `Cash flow is currently ${state.financialState.cashFlow.trend}.`,
  ];
  const checks: GovernanceCheck[] = [
    { name: 'Consent', status: 'passed', detail: 'Purpose-specific affordability consent is active.' },
    { name: 'Purpose limitation', status: 'passed', detail: 'Only affordability-relevant fields were used.' },
    { name: 'Eligibility context', status: 'passed', detail: 'This is a simulation—not lender eligibility or approval.' },
    { name: 'Fairness', status: 'passed', detail: 'Protected attributes were excluded from the decision.' },
    { name: 'Suitability', status: affordabilityBand === 'Comfortable' ? 'passed' : 'caution', detail: `Projected affordability is ${affordabilityBand.toLowerCase()}.` },
    { name: 'Financial stress', status: state.financialState.risk.level === 'high' ? 'failed' : state.financialState.risk.level === 'elevated' ? 'caution' : 'passed', detail: `Current financial risk is ${state.financialState.risk.level}.` },
    { name: 'Anti-predatory nudge', status: decision === 'RECOMMENDED' ? 'passed' : 'caution', detail: decision === 'RECOMMENDED' ? 'No suppression needed.' : 'Product promotion suppressed; recovery action substituted.' },
    { name: 'Explainability', status: 'passed', detail: 'Inputs, formula, impact and alternative are available.' },
  ];
  return { requestedAmount: amount, tenure, apr, monthlyEmi, totalEmiAfter, affordabilityRatio, remainingCashFlow, bufferAfterEmi, healthAfter, affordabilityBand, recommendation: decision, reasoning, governance: { decision, reasoning, checks, alternativeAction: decision === 'RECOMMENDED' ? undefined : 'BUILD_90_DAY_BUFFER', confidence: 0.91 } };
};

export const simulateWhatIf = (state: DemoState, monthlySavingDelta: number, incomeDeltaPct: number, emiDelta: number) => {
  const newIncome = Math.round(state.financialState.income.monthly * (1 + incomeDeltaPct / 100));
  const newSurplus = state.financialState.cashFlow.monthlySurplus + (newIncome - state.financialState.income.monthly) + monthlySavingDelta - emiDelta;
  const newBuffer = pct(Math.max(0, state.financialState.savings.bufferMonths + (monthlySavingDelta * 12) / Math.max(1, state.financialState.spending.essential + state.financialState.debt.existingEmi)));
  const newEmiBurden = pct(((state.financialState.debt.existingEmi + emiDelta) / newIncome) * 100);
  const healthDelta = Math.round(monthlySavingDelta / 1200 + incomeDeltaPct * 0.35 - emiDelta / 1800);
  return { income: newIncome, monthlySurplus: newSurplus, buffer: newBuffer, emiBurden: newEmiBurden, health: Math.max(15, Math.min(96, state.financialState.healthScore + healthDelta)), direction: healthDelta > 1 ? 'BETTER' : healthDelta < -1 ? 'WORSE' : 'NEUTRAL' } as const;
};

export const consentItems: ConsentItem[] = [
  { id: 'transactions', category: 'Transaction history', description: 'Credits, debits, merchants and timing', purpose: 'Spending intelligence and cash-flow patterns', status: 'consented', required: true, dataPoints: ['Amount', 'Date', 'Merchant', 'Category'] },
  { id: 'income', category: 'Income', description: 'Recurring salary and income variability', purpose: 'Financial health and simulated affordability', status: 'consented', required: true, dataPoints: ['Salary credits', 'Income trend'] },
  { id: 'debt', category: 'EMI and debt', description: 'Recurring obligations and repayment pattern', purpose: 'Debt burden and suitability', status: 'consented', required: false, dataPoints: ['EMIs', 'Repayment dates', 'Outstanding debt'] },
  { id: 'savings', category: 'Savings', description: 'Accessible balances and recurring transfers', purpose: 'Liquidity and financial resilience', status: 'consented', required: false, dataPoints: ['Balance', 'Transfers', 'Goal vaults'] },
  { id: 'anomaly', category: 'Anomaly detection', description: 'Unusual amounts, times and merchants', purpose: 'Transaction protection', status: 'consented', required: false, dataPoints: ['Transaction patterns', 'Merchant history'] },
];
