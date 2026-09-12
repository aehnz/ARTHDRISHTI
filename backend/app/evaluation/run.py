"""Run the reproducible ten-account evaluation and emit machine/human reports."""

from __future__ import annotations

import json
from pathlib import Path

from app.core.config import get_settings
from app.core.container import create_container
from app.models.schemas import LoanSimulationRequest


EXPECTED_STATE = {
    "stable": "STABLE",
    "tightening": "TIGHTENING",
    "stress": "STRESSED",
    "anomaly": "TIGHTENING",
    "growth": "GROWTH",
}


def evaluate() -> dict:
    container = create_container(get_settings())
    rows = []
    for user in container.auth.users.list_demo_accounts():
        platform = container.platform
        scope = f"evaluation:{user.account_id}"
        transactions = platform.transaction_list(user.customer_id, user.scenario_id)
        state = platform.state(user.customer_id, user.scenario_id, audit=False)
        insights = platform.insight_list(user.customer_id, user.scenario_id, consent_scope=scope)
        recommendations = platform.recommendation_list(user.customer_id, user.scenario_id, consent_scope=scope)
        loan = platform.loan(user.customer_id, LoanSimulationRequest(amount=500_000, tenure_months=60, illustrative_apr=13.2, purpose="personal", scenario=user.scenario_id), consent_scope=scope)
        anomaly_count = sum(item.anomaly for item in transactions)
        expected_anomaly = user.scenario_id == "anomaly"
        fairness = next(item for item in loan.governance.checks if item.name == "Fairness")
        expected_state = "STABLE" if user.scenario_id == "anomaly" and user.customer_id == "cust-ananya" else EXPECTED_STATE[user.scenario_id]
        rows.append({
            "account": user.account_id,
            "scenario": user.scenario_id,
            "health": state.healthScore,
            "state": state.currentStateLabel,
            "expectedState": expected_state,
            "risk": state.risk.level,
            "stressModel": state.risk.modelName,
            "coverage": state.coverage,
            "anomalies": anomaly_count,
            "anomalyExpected": expected_anomaly,
            "primaryAction": recommendations[0].actionCode,
            "productSuppressed": recommendations[0].productRecommendation == "NO_PRODUCT_RECOMMENDATION",
            "loanDecision": loan.recommendation,
            "governanceChecks": len(loan.governance.checks),
            "fairness": fairness.status,
            "insights": len(insights),
        })
    state_correct = sum(row["state"] == row["expectedState"] for row in rows)
    anomaly_correct = sum(bool(row["anomalies"]) == row["anomalyExpected"] for row in rows)
    summary = {
        "accounts": len(rows),
        "stateClassificationAccuracy": state_correct / len(rows),
        "anomalyScenarioAccuracy": anomaly_correct / len(rows),
        "governanceCoverage": sum(row["governanceChecks"] >= 10 for row in rows) / len(rows),
        "productSuppressionCoverage": sum(row["productSuppressed"] for row in rows) / len(rows),
        "limitations": [
            "All labels and ledger records are synthetic; metrics are regression evidence, not real-world model performance.",
            "Ten accounts are too few for statistical fairness evaluation, calibration, or production fraud claims.",
            "The stress baseline is transparent and versioned but has not been trained on real customer outcomes.",
        ],
    }
    return {"summary": summary, "accounts": rows}


def markdown(report: dict) -> str:
    summary, rows = report["summary"], report["accounts"]
    lines = [
        "# Iteration 3 synthetic evaluation",
        "",
        "This is a deterministic regression evaluation over the ten seeded account assignments. It is not evidence of production fraud, credit, fairness, or banking accuracy.",
        "",
        "## Summary",
        "",
        f"- Accounts: {summary['accounts']}",
        f"- Financial-state fixture alignment: {summary['stateClassificationAccuracy']:.0%}",
        f"- Anomaly scenario alignment: {summary['anomalyScenarioAccuracy']:.0%}",
        f"- Governance pipeline coverage: {summary['governanceCoverage']:.0%}",
        f"- Customer-benefit product suppression coverage: {summary['productSuppressionCoverage']:.0%}",
        "",
        "## Account matrix",
        "",
        "| Account | Scenario | Health | State | Risk | Anomalies | Primary action | Loan decision |",
        "|---|---:|---:|---|---|---:|---|---|",
    ]
    lines.extend(f"| {row['account']} | {row['scenario']} | {row['health']} | {row['state']} | {row['risk']} | {row['anomalies']} | {row['primaryAction']} | {row['loanDecision']} |" for row in rows)
    lines.extend(["", "## Limitations", ""] + [f"- {item}" for item in summary["limitations"]] + [""])
    return "\n".join(lines)


def main() -> None:
    report = evaluate()
    root = Path(__file__).resolve().parents[3]
    (root / "Documentation" / "ITERATION3_EVALUATION.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    (root / "Documentation" / "ITERATION3_EVALUATION.md").write_text(markdown(report), encoding="utf-8")
    print(json.dumps(report["summary"], indent=2))


if __name__ == "__main__":
    main()
