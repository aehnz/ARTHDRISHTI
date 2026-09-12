# Iteration 3 engineering report

## 1. Executive summary

Iteration 3 replaces the Iteration 2.5 in-memory runtime with a configurable PostgreSQL/SQLAlchemy/Alembic persistence path while retaining memory adapters for tests. It adds a provider-shaped transaction pipeline, versioned financial features, data quality, statistical stress and anomaly baselines, unified risk, governed decision traces, durable audit/artifacts, and a controlled OpusMax-compatible AI layer. The established frontend was not redesigned.

## 2. Final architecture

The system is one modular monolith: Next.js presentation → session-bound FastAPI API → application services → repositories/providers → PostgreSQL → intelligence → recommendations/decisioning → governance → explanation/audit → AI communication.

## 3. Before vs after architecture

Before, sessions, consents, protection responses, and audit were process memory; data engines directly depended on deterministic fixtures; the AI adapter was generic; derived artifacts were ephemeral. After, repository choice is configuration-driven, PostgreSQL is required in production, seeded identities and source data persist, intelligence consumes domain inputs, and consequential outputs have durable account-scoped records and traces.

## 4. PostgreSQL schema

The migration creates 21 application tables plus Alembic state: users, customers, accounts, sessions, OTP challenges, onboarding, scenario fixtures, transactions, debts, goals, consents, protection events, audit events, decisions, decision traces, simulations, recommendations, financial snapshots, financial features, AI conversations, and AI messages.

## 5. Repository architecture

Customer, transaction, debt, goal, consent, scenario, audit, user, session, OTP, onboarding, and protection interfaces have memory and PostgreSQL adapters. Derived artifacts use a no-op/test store or PostgreSQL store. The frontend and service contracts do not depend on adapter choice.

## 6. Authentication architecture

Phone starts an expiring one-use OTP challenge. Verification resolves or creates a persisted user/account and writes an opaque server-side session ID to an HTTP-only SameSite cookie. Each request checks revocation and expiry and updates last-seen time. Logout persists revocation.

## 7. Demo account architecture

Ten stable phone → user → account → customer → scenario assignments are seeded. Credentials use the normal OTP and session route. Scenario/customer values are session-authoritative after login, and the banking shell has no demo selector. The financial fixtures remain shared source facts rather than ten copied intelligence implementations.

## 8. Transaction pipeline

The repository-backed provider is active. Raw-provider normalization validates direction/amount, normalizes merchants, maps categories, fingerprints duplicates, and emits canonical transactions. Real bank, open-banking, and CSV classes are explicit unconfigured boundaries rather than fake integrations.

## 9. Feature engineering

`financial_features_v1` includes income, total/essential/discretionary spend, EMI burden, savings and trend, buffer, cash-flow direction, utilization, repayment consistency, anomalies, debt-to-income, and liquidity. PostgreSQL stores the feature payload with provenance and coverage.

## 10. Financial Health Index

The transparent resilience index weights resilience 25%, liquidity 20%, debt 20%, savings 15%, income stability 10%, and spending discipline 10%. Components, drivers, scores, trend, confidence, coverage, and limitations are returned. It is explicitly not CIBIL or a bureau score.

## 11. Financial State engine

State classification derives `STABLE`, `TIGHTENING`, `STRESSED`, or `GROWTH` from health, unified risk, cash-flow/spending direction, buffer, and savings improvement. No scenario-name branch chooses an outcome.

## 12. Stress model

The versioned synthetic logistic baseline transforms EMI burden, buffer, savings rate, spending trend, cash-flow decline, and income stability into a probability, band, and drivers. It is deterministic and transparent, not represented as a real-world trained model.

## 13. Anomaly model

The robust transaction baseline combines median absolute deviation, first-seen merchant behavior, and overnight timing. All high-signal conditions and a score threshold are required. Output says unusual activity/anomaly, never confirmed fraud.

## 14. Risk engine

Unified risk combines stress probability, unusual-activity count, and utilization, returning a versioned score, band, confidence, timestamp, factors, and explanation.

## 15. Recommendation engine

Recommendations prioritize customer benefit and urgency: verify anomalies, restore liquidity, reduce repeat leakage, or accelerate goals. Inadequate data yields `NO_ACTION`; product suppression is a normal governed outcome.

## 16. Next Best Action

The lowest-priority-number recommendation becomes the primary action and the remaining ranked titles become supporting actions. The response explains why now, expected benefit, estimated impact, and the source recommendation.

## 17. Recovery engine

Recovery targets derive from current health and buffer. Stress/tightening plans sequence leakage reduction, savings restoration, headroom recovery, and reserve rebuilding with explicit illustrative assumptions.

## 18. Growth engine

High-health, improving accounts preserve a six-month reserve before increasing goal allocation, reviewing expensive debt, or protecting future income. It does not force a product.

## 19. Goal engine

Goals persist target, current value, target date, contribution, priority, status, and version. Simulation caps total contributions at headroom, assigns incremental money once, and recomputes completion time without mutating actual rows.

## 20. What-if engine

Income, savings, and EMI deltas produce before/after/delta snapshots, health, buffer, burden, surplus, risk, goal impact, and trajectory. PostgreSQL stores an idempotent input-fingerprinted simulation; the source state is unchanged.

## 21. Affordability engine

The reusable versioned engine uses the standard amortizing EMI formula and returns monthly/total repayment, interest, combined EMI, burden, headroom, buffer, health impact, band, and capacity estimate.

## 22. Loan decision engine

The pipeline evaluates data coverage, consent, affordability, health, stress/risk, protection holds, stated purpose, suitability, governance, and alternatives. Outcomes cover recommended, caution, not-now, blocked, and escalation. Purpose is retained and the current uniform threshold policy is disclosed.

## 23. Governance core

`GovernanceService` evaluates consent, purpose limitation, data availability, eligibility context, suitability, financial stress, fairness, protection, anti-predatory behavior, and explainability before the final result.

## 24. Consent architecture

Seven account-scoped consent records are seeded per demo account. Required consent cannot be revoked. Debt withdrawal blocks affordability; spending scopes constrain insights/DNA; anomaly withdrawal disables screening; AI context withdrawal blocks Ask. Revocation controls use, not deletion of core records.

## 25. Fairness controls

`FairnessPolicy` structurally rejects prohibited direct features. Because ten synthetic accounts cannot support meaningful statistical fairness, the normal result is honestly `NOT_EVALUABLE`/`not_applicable`, not a fabricated percentage.

## 26. Nudge protection

Stress, missing evidence, poor suitability, and unresolved anomalies suppress product promotion and return a customer-benefit alternative. “No product should be recommended right now” is supported as a valid result.

## 27. Decision traces

Each PostgreSQL loan decision stores inputs, snapshot ID/version, model outputs, policy/governance checks, explanation factors, outcome, policy version, and governance version. Stable account-qualified IDs make retries idempotent.

## 28. Audit architecture

Durable UUID audit events record actor, account/session metadata, customer, event/action, entity, decision, reason, trace, and timestamp. Account-scoped history survives re-login and backend restart without crossing demo assignments.

## 29. Explainability architecture

Explanations are generated from the loan result/trace: reasons, EMI burden, buffer, headroom, data used, metrics, alternatives, limitations, governance checks, confidence, and trace ID. React renders these fields but does not invent the decision.

## 30. AI architecture

The AI provider receives only a controlled, intent-specific summary after backend intelligence and governance. It communicates authoritative results in English, Hindi, or Hinglish and has no mutation/database tool or decision authority.

## 31. OpusMax integration

`OpusMaxAIProvider` uses the configurable Anthropic-compatible messages endpoint, runtime-only credential, configurable fast/default/reasoning models, bounded timeout/tokens, and deterministic fallback. No live request ran because no credential was present.

## 32. AI safety and grounding

The prompt forbids approval, invented data, bureau claims, guarantees, and overrides. Output validation rejects unsafe claims, empty responses, and loan text that omits the exact authoritative outcome. Provider errors log only type and fall back.

## 33. ML evaluation methodology

The offline evaluator runs the same services for every seeded account and records health, state, risk, anomalies, primary action, loan outcome, governance coverage, fairness status, and suppression. Metrics are deterministic regression alignment, not external validity.

## 34. Ten-scenario evaluation results

All 10 assignments evaluated. Financial-state fixture alignment, anomaly scenario alignment, governance coverage, and no-product suppression coverage were each 100%. Detailed account rows and limitations are in `ITERATION3_EVALUATION.md/json`.

## 35. Database test results

A fresh PostgreSQL 16.14 database migrated to `20260913_0001`, seeded twice idempotently, and contained 10 users, 10 accounts, 962 transactions, 70 account consents, 2 protection events, 22 public tables including Alembic, and 79 indexes.

## 36. Authentication test results

Tests cover one-use/expired/invalid OTP, HTTP-only cookie, logout, expiry, ten account mappings, refresh, dual-session isolation, cross-customer denial, normal onboarding, and demo-route denial. PostgreSQL recreation of the application container restored the active session/account.

## 37. AI test results

Tests cover three-language fallback, authoritative decision reference, and unsafe live-provider output fallback. Ordinary tests perform no network AI call. The optional live test was skipped because the runtime credential was absent.

## 38. Frontend verification

ESLint, `tsc --noEmit`, and Next.js 16.3.5 production build passed. Browser QA logged into Ravi/stress, refreshed, loaded 13 authenticated pages, confirmed blocked loan/governance/fairness/audit/Ask, logged out, and logged into Ananya/growth with distinct 89 health and growth action. Browser console errors/warnings were empty for the controlled flow.

## 39. Security audit

Repository scanning found no real API key, wildcard credentialed CORS, or frontend provider credential. Session/customer/scenario injection routes override or deny client values. Errors are safe/request-ID tagged, production cookies are secure, queries are bounded, and logs exclude secrets and raw financial payloads.

## 40. Performance observations

Dashboard uses one composite overview contract. Transaction and audit access are bounded/paginated, indexed, and demo-catalog account loading was changed from N+1 queries to one join. Local PostgreSQL-backed browser requests completed without visible latency; distributed caching was intentionally not added.

## 41. Environment variables

Environment controls runtime mode, repository backend, database DSN, CORS origins, cookie name/security/session TTL, OTP TTL/attempts, request timeout, AI provider, provider base URL, and fast/default/reasoning model selection. The provider credential is backend-runtime-only and intentionally absent from examples and this report.

## 42. Clean setup instructions

Copy the two example environment files, start PostgreSQL with Docker Compose, create the Python environment, install requirements, run Alembic, run the seed module, start Uvicorn, install Node packages, and start Next.js. Exact commands are in the root README and database runbook.

## 43. Deployment instructions

Provision a least-privilege PostgreSQL role, inject runtime configuration/secrets, execute migrations as a release task, seed only demo environments, run FastAPI behind HTTPS, deploy the frontend with its public API URL, and monitor liveness/readiness.

## 44. Remaining limitations

Bank, SMS, KYC, credit-bureau, and regulatory integrations are not implemented. Source records and model labels are synthetic. Stress/anomaly baselines lack real-outcome calibration and production monitoring. Statistical fairness is not evaluable. OpusMax was integration-tested through mocks/fallback but not live in this environment.

## 45. Iteration 3 completion status

The requested production-shaped end-to-end architecture is implemented and verified for the available synthetic/mock boundaries. PostgreSQL persistence, sessions, seed matrix, intelligence, governed decisions, traces/audit, controlled AI, tests, evaluation, security checks, documentation, and frozen-frontend validation are complete. Claims remain deliberately limited to this verified scope.
