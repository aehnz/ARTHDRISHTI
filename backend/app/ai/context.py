from __future__ import annotations

from app.models.schemas import FinancialStateResponse, LoanSimulationResponse


def build_controlled_context(intent: str, state: FinancialStateResponse, loan: LoanSimulationResponse | None) -> dict:
    common = {"health_index": state.healthScore, "financial_state": state.currentStateLabel, "risk_band": state.risk.level, "coverage_note": "Derived from consented synthetic/provider data"}
    if intent == "SPENDING_EXPLANATION":
        return {**common, "spending": state.spending.model_dump(), "cash_flow_trend": state.cashFlow.trend}
    if intent == "BUFFER_EXPLANATION":
        return {**common, "buffer_months": state.savings.bufferMonths, "monthly_headroom": state.cashFlow.monthlySurplus}
    if intent == "LOAN_AFFORDABILITY" and loan:
        return {**common, "decision": loan.recommendation, "trace_id": loan.traceId, "monthly_emi": loan.monthlyEmi, "projected_emi_ratio": loan.affordabilityRatio, "remaining_headroom": loan.remainingCashFlow, "governance": [item.model_dump() for item in loan.governance.checks], "limitations": loan.disclaimer}
    return common
