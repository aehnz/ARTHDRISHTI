# ARTHDRISHTI architecture

ARTHDRISHTI Iteration 3 is a production-shaped modular monolith. The Next.js application is a frozen presentation surface; identity, financial truth, intelligence, policy, governance, explanation, and AI grounding are backend-owned.

```text
Next.js UI
  -> credentialed /api/v1/me/* contracts
FastAPI routes
  -> authenticated session + account assignment
Application services
  -> transaction provider / repository interfaces
PostgreSQL ledger and records
  -> normalization -> features -> financial state
  -> stress + anomaly + unified risk + health
  -> customer-benefit recommendations -> next best action
  -> affordability -> decision -> governance -> trace -> audit
  -> controlled context -> OpusMax or deterministic fallback
```

## Source-of-truth boundaries

| Concern | Source of truth |
|---|---|
| Authentication and identity | server-side session |
| Demo assignment | persisted user/account row |
| Transactions, debt, goals, consent | PostgreSQL/provider repositories |
| Features and financial state | versioned intelligence engine |
| Loan outcome | deterministic decision engine |
| Governance and fairness control | governance service |
| Explanation | decision result and persisted trace |
| Natural-language communication | controlled AI provider |

The AI layer cannot change scores, classifications, recommendations, or loan outcomes. The seed package supplies synthetic source facts; the intelligence package never imports seed fixtures.

## Session-bound API

The frontend uses `/api/v1/me/*`. Routes take customer and scenario identity from the session even when a legacy request field is present. Compatibility customer routes authorize the path against the same session assignment. There is no global scenario state.

## Service boundaries

`AuthService` owns OTP/session/onboarding identity. `PlatformService` orchestrates customer, transaction, consent, protection, planning, recommendation, decision, audit, and AI use cases. `IntelligenceEngine`, `DecisionEngine`, `PlanningEngine`, and `GovernanceService` own calculations. Repository and provider adapters isolate persistence and external-data concerns without introducing microservices.
