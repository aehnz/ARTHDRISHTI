// Compatibility exports. All demo data now originates in the canonical intelligence engine.
import type { DemoScenario, Language } from '@/types';
import { consentItems, evaluateLoan, getDemoState as getCanonicalState } from '@/data/intelligence';

export * from '@/data/intelligence';

const normalizeScenario = (scenario?: DemoScenario | 'loan-decision') =>
  scenario === 'loan-decision' ? 'tightening' : scenario;

export const getDemoState = (scenario: DemoScenario | 'loan-decision' = 'tightening') =>
  getCanonicalState('ravi', normalizeScenario(scenario));
export const getCustomer = () => getCanonicalState('ravi', 'tightening').customer;
export const getTransactions = () => getCanonicalState('ravi', 'tightening').transactions;
export const getFinancialState = () => getCanonicalState('ravi', 'tightening').financialState;
export const getInsights = () => getCanonicalState('ravi', 'tightening').insights;
export const getSignals = () => getCanonicalState('ravi', 'tightening').signals;
export const getRecommendations = () => getCanonicalState('ravi', 'tightening').recommendations;
export const getConsentItems = () => consentItems;
export const getTimeline = () => getCanonicalState('ravi', 'tightening').timeline;
export const getPotentialAnomaly = () => getCanonicalState('ravi', 'anomaly').transactions.find(t => t.anomaly);
export const evaluateLoanSuitability = (amount: number, tenure: number) =>
  evaluateLoan(getCanonicalState('ravi', 'tightening'), amount, tenure);

export const translations: Record<string, Record<Language, string>> = {
  'nav.overview': { en: 'Overview', hi: 'सारांश', hinglish: 'Overview' },
  'nav.financialLife': { en: 'Financial DNA', hi: 'वित्तीय पहचान', hinglish: 'Financial DNA' },
  'nav.insights': { en: 'Insights', hi: 'समझ', hinglish: 'Insights' },
  'nav.protection': { en: 'Protection', hi: 'सुरक्षा', hinglish: 'Protection' },
  'nav.ask': { en: 'Ask ARTHDRISHTI', hi: 'ARTHDRISHTI से पूछें', hinglish: 'Ask ARTHDRISHTI' },
  'dashboard.headline': { en: 'Your financial life, understood.', hi: 'आपका वित्तीय जीवन, समझा हुआ।', hinglish: 'Aapki financial life, clearly understood.' },
  'loan.notRecommended': { en: 'NOT RECOMMENDED RIGHT NOW', hi: 'अभी सही नहीं है', hinglish: 'ABHI RECOMMENDED NAHI HAI' },
};
export const t = (key: string, lang: Language = 'en') => translations[key]?.[lang] ?? translations[key]?.en ?? key;
