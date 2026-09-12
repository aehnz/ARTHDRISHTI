# Iteration 3 synthetic evaluation

This is a deterministic regression evaluation over the ten seeded account assignments. It is not evidence of production fraud, credit, fairness, or banking accuracy.

## Summary

- Accounts: 10
- Financial-state fixture alignment: 100%
- Anomaly scenario alignment: 100%
- Governance pipeline coverage: 100%
- Customer-benefit product suppression coverage: 100%

## Account matrix

| Account | Scenario | Health | State | Risk | Anomalies | Primary action | Loan decision |
|---|---:|---:|---|---|---:|---|---|
| demo-ananya-anomaly | anomaly | 88 | STABLE | low | 1 | VERIFY_ANOMALY | BLOCKED |
| demo-ananya-growth | growth | 89 | GROWTH | low | 0 | ACCELERATE_GOAL | RECOMMENDED |
| demo-ananya-stable | stable | 88 | STABLE | low | 0 | ACCELERATE_GOAL | RECOMMENDED |
| demo-ananya-stress | stress | 55 | STRESSED | elevated | 0 | BUILD_90_DAY_BUFFER | NOT_RECOMMENDED_RIGHT_NOW |
| demo-ananya-tightening | tightening | 77 | TIGHTENING | low | 0 | BUILD_90_DAY_BUFFER | RECOMMENDED |
| demo-ravi-anomaly | anomaly | 66 | TIGHTENING | moderate | 1 | VERIFY_ANOMALY | BLOCKED |
| demo-ravi-growth | growth | 80 | GROWTH | low | 0 | ACCELERATE_GOAL | RECOMMENDED_WITH_CAUTION |
| demo-ravi-stable | stable | 74 | STABLE | low | 0 | BUILD_90_DAY_BUFFER | RECOMMENDED_WITH_CAUTION |
| demo-ravi-stress | stress | 49 | STRESSED | elevated | 0 | BUILD_90_DAY_BUFFER | BLOCKED |
| demo-ravi-tightening | tightening | 64 | TIGHTENING | low | 0 | BUILD_90_DAY_BUFFER | NOT_RECOMMENDED_RIGHT_NOW |

## Limitations

- All labels and ledger records are synthetic; metrics are regression evidence, not real-world model performance.
- Ten accounts are too few for statistical fairness evaluation, calibration, or production fraud claims.
- The stress baseline is transparent and versioned but has not been trained on real customer outcomes.
