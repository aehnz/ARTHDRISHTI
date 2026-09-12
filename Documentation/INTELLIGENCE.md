# Financial intelligence and evaluation

## Transaction pipeline

Raw providers feed deterministic validation, deduplication, merchant normalization, category mapping, currency/direction checks, and canonical transaction records. Merchant profiles derive frequency, average, variance, first/last seen, dominant category, and recurrence. Recurrence requires multi-month repetition and bounded amount variance.

## Features and data quality

`financial_features_v1` computes income, essential/discretionary spend, EMI burden, savings rate/trend, emergency buffer, cash-flow and spending trends, utilization, repayment consistency, anomalies, debt-to-income, and liquidity. Quality checks flag absent history, unverifiable income, short history, and absent debt information. State confidence is capped by coverage and limitations are returned to the API.

## Health, stress, anomaly, and risk

The Financial Health Index is a transparent weighted composite of resilience (25%), liquidity (20%), debt (20%), savings (15%), income stability (10%), and spending discipline (10%). It is not a bureau or CIBIL score.

The versioned synthetic stress baseline applies a documented logistic transform to EMI burden, buffer, savings rate, spending direction, cash-flow direction, and income stability. It returns probability, band, and drivers. It has not been trained or calibrated on real outcomes.

The robust anomaly baseline combines median absolute deviation, first-seen merchant behavior, and an unusual local-time window. A transaction must meet all three high-signal conditions and the score threshold. Output says “unusual activity,” never confirmed fraud.

Unified risk combines stress probability, unusual activity, and utilization. Financial state is derived from health, risk, buffer, trend, and savings behavior into `STABLE`, `TIGHTENING`, `STRESSED`, or `GROWTH`.

## Recommendations and decisions

Recommendations rank customer benefit and urgency: verify unusual activity, rebuild buffer, reduce discretionary leakage, accelerate a goal, or return no action/no product when evidence is inadequate. Product suppression is a valid success outcome.

Loan simulation uses a standard amortizing EMI formula, then projected EMI burden, headroom, buffer, health, risk, consent, unusual-activity hold, suitability, data coverage, fairness policy, and anti-predatory checks. Outcomes are `RECOMMENDED`, `RECOMMENDED_WITH_CAUTION`, `NOT_RECOMMENDED_RIGHT_NOW`, `BLOCKED`, or `ESCALATE`. Purpose is captured and disclosed; the current baseline uses uniform affordability thresholds.

## Evaluation

Run `PYTHONPATH=. .venv/bin/python -m app.evaluation.run` from `backend/`. Results are written to `Documentation/ITERATION3_EVALUATION.json` and `.md`. The ten-account matrix is regression evidence only. It is too small and synthetic for fairness statistics, ROC-AUC claims, production fraud accuracy, credit approval performance, or regulatory conclusions.
