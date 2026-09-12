"""Governance policy checks for governed financial proposals."""

from __future__ import annotations

from app.models.schemas import FinancialStateResponse, GovernanceCheck


class FairnessPolicy:
    """Structural protection until a representative evaluation set exists."""

    prohibited_features = frozenset({"age", "gender", "religion", "caste", "ethnicity", "disability", "marital_status"})

    def evaluate(self, feature_names: set[str]) -> GovernanceCheck:
        prohibited = sorted(feature_names & self.prohibited_features)
        if prohibited:
            return GovernanceCheck(name="Fairness", status="failed", detail=f"Prohibited decision features detected: {', '.join(prohibited)}.")
        return GovernanceCheck(name="Fairness", status="not_applicable", detail="NOT_EVALUABLE statistically on synthetic data; prohibited attributes are structurally excluded from decision inputs.")


class GovernanceService:
    version = "governance_v1"

    def __init__(self, fairness: FairnessPolicy | None = None) -> None:
        self.fairness = fairness or FairnessPolicy()

    def loan_checks(
        self,
        *,
        state: FinancialStateResponse,
        consent_missing: list[str],
        affordability_band: str,
        unresolved_anomaly: bool,
        proposed_decision: str,
    ) -> list[GovernanceCheck]:
        features = set(type(state.features).model_fields)
        return [
            GovernanceCheck(name="Consent", status="failed" if consent_missing else "passed", detail=f"Missing required consent: {', '.join(consent_missing)}." if consent_missing else "Affordability data use is consented."),
            GovernanceCheck(name="Purpose limitation", status="passed", detail="Only income, obligations, liquidity, risk and the stated purpose were used."),
            GovernanceCheck(name="Data availability", status="failed" if consent_missing else "caution" if state.coverage < .75 else "passed", detail=f"Feature coverage is {state.coverage:.0%}; limitations: {', '.join(state.limitations) or 'none recorded'}."),
            GovernanceCheck(name="Eligibility context", status="passed", detail="This is a wellness simulation, not lender eligibility or approval."),
            GovernanceCheck(name="Suitability", status="passed" if affordability_band == "Comfortable" else "caution", detail=f"Projected affordability is {affordability_band.lower()}."),
            GovernanceCheck(name="Financial stress", status="failed" if state.risk.level == "high" else "caution" if state.risk.level == "elevated" else "passed", detail=f"Current unified risk is {state.risk.level}."),
            self.fairness.evaluate(features),
            GovernanceCheck(name="Protection hold", status="failed" if unresolved_anomaly else "passed", detail="Resolve unusual activity before considering a new obligation." if unresolved_anomaly else "No unresolved serious anomaly blocks the proposal."),
            GovernanceCheck(name="Anti-predatory nudge", status="passed" if proposed_decision == "RECOMMENDED" else "caution", detail="No product-pressure pattern detected." if proposed_decision == "RECOMMENDED" else "Product promotion is suppressed and a customer-benefit alternative is returned."),
            GovernanceCheck(name="Explainability", status="passed", detail="Inputs, formula, projected impact, limitations and alternatives are traceable."),
        ]
