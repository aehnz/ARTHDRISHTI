"""Replaceable inference boundaries for Iteration 2+ model implementations."""

from typing import Protocol

from app.models.schemas import FinancialFeatures, RiskState, TransactionResponse


class RiskModel(Protocol):
    name: str
    version: str

    def predict(self, features: FinancialFeatures) -> RiskState: ...


class AnomalyModel(Protocol):
    name: str
    version: str

    def annotate(self, transactions: list[TransactionResponse]) -> list[TransactionResponse]: ...


class AffordabilityModel(Protocol):
    name: str
    version: str

    def monthly_emi(self, amount: int, tenure: int, apr: float) -> int: ...
