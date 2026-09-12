import { z } from 'zod';
import type {
  AskResponse, AuditEvent, AuthContext, AuthStart, ConsentItem, DemoAccount,
  DemoState, Goal, Language, LoanAssessment,
  OnboardingState, ProtectionPayload, RecoveryPlan, UserProfile, WhatIfResult,
} from '@/types';
import { ApiError, request } from './client';

const authContextSchema = z.object({
  authenticated: z.literal(true),
  mode: z.enum(['NORMAL', 'DEMO']),
  user: z.object({ name: z.string(), customerId: z.string(), languagePreference: z.enum(['en', 'hi', 'hinglish']), onboardingStatus: z.enum(['incomplete', 'complete']) }).passthrough(),
  customer: z.object({ id: z.string(), name: z.string() }).passthrough(),
  onboarding: z.object({ status: z.enum(['incomplete', 'complete']), currentStep: z.string() }).passthrough(),
  session: z.object({ mode: z.enum(['NORMAL', 'DEMO']) }).passthrough(),
  demo: z.object({ customerId: z.string(), persona: z.string(), scenario: z.string() }).passthrough().nullable(),
}).passthrough() as unknown as z.ZodType<AuthContext>;

const demoStateSchema = z.object({
  persona: z.string(), scenario: z.string(),
  customer: z.object({ id: z.string(), name: z.string() }).passthrough(),
  financialState: z.object({ healthScore: z.number(), healthBand: z.string(), risk: z.object({ level: z.string() }).passthrough() }).passthrough(),
  transactions: z.array(z.object({ id: z.string() }).passthrough()),
  insights: z.array(z.object({ id: z.string() }).passthrough()),
  recommendations: z.array(z.object({ id: z.string() }).passthrough()),
}).passthrough() as unknown as z.ZodType<DemoState>;

export const api = {
  authMe: () => request<AuthContext>('/api/v1/auth/me', undefined, authContextSchema),
  authMeOptional: async () => {
    try { return await request<AuthContext>('/api/v1/auth/me', undefined, authContextSchema); }
    catch (error) { if (error instanceof ApiError && error.status === 401) return null; throw error; }
  },
  startAuth: (phone: string) => request<AuthStart>('/api/v1/auth/start', { method: 'POST', body: JSON.stringify({ phone }) }),
  verifyAuth: (challengeId: string, otp: string) => request('/api/v1/auth/verify', { method: 'POST', body: JSON.stringify({ challenge_id: challengeId, otp }) }),
  logout: () => request<void>('/api/v1/auth/logout', { method: 'POST' }),

  overview: () => request<DemoState>('/api/v1/me/overview', undefined, demoStateSchema),
  demoCatalog: async () => (await request<{ accounts: DemoAccount[] }>('/api/v1/demo/catalog')).accounts,

  onboardingProfile: (name: string, languagePreference: Language) => request<OnboardingState>('/api/v1/onboarding/profile', { method: 'PATCH', body: JSON.stringify({ name, language_preference: languagePreference }) }),
  onboardingConnection: () => request<OnboardingState>('/api/v1/onboarding/connection', { method: 'POST', body: JSON.stringify({ provider: 'mock_bank', consent_to_connect: true }) }),
  onboardingGoals: (goals: string[]) => request<OnboardingState>('/api/v1/onboarding/goals', { method: 'PATCH', body: JSON.stringify({ goals }) }),
  onboardingConsent: (consentIds: string[]) => request<OnboardingState>('/api/v1/onboarding/consent', { method: 'PATCH', body: JSON.stringify({ consent_ids: consentIds }) }),
  completeOnboarding: () => request<OnboardingState>('/api/v1/onboarding/complete', { method: 'POST' }),
  updateLanguage: (language: Language) => request<UserProfile>('/api/v1/me/language', { method: 'PATCH', body: JSON.stringify({ language }) }),

  simulateLoan: (amount: number, tenure: number, apr: number, purpose: string) => request<LoanAssessment>('/api/v1/me/loan-simulation', { method: 'POST', body: JSON.stringify({ amount, tenure_months: tenure, illustrative_apr: apr, purpose }) }),
  simulateWhatIf: (monthlySavingDelta: number, incomeDeltaPct: number, emiDelta: number) => request<WhatIfResult>('/api/v1/me/what-if', { method: 'POST', body: JSON.stringify({ monthly_saving_delta: monthlySavingDelta, income_delta_pct: incomeDeltaPct, emi_delta: emiDelta }) }),
  simulatePlan: (adherence: number) => request<RecoveryPlan>('/api/v1/me/plan-simulation', { method: 'POST', body: JSON.stringify({ adherence }) }),
  simulateGoals: (extraMonthlyContribution: number) => request<Goal[]>('/api/v1/me/goals/simulate', { method: 'POST', body: JSON.stringify({ extra_monthly_contribution: extraMonthlyContribution }) }),
  ask: (question: string, language: Language) => request<AskResponse>('/api/v1/me/ask', { method: 'POST', body: JSON.stringify({ question, language }) }),
  updateConsent: (consentId: string, status: ConsentItem['status']) => request<ConsentItem>(`/api/v1/me/consent/${consentId}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  resolveProtection: (eventId: string, status: 'CONFIRMED' | 'DISPUTED' | 'RESOLVED') => request<ProtectionPayload>(`/api/v1/me/protection/${eventId}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  audit: () => request<AuditEvent[]>('/api/v1/me/audit'),
};

export { ApiError } from './client';
