from __future__ import annotations

from collections import Counter, defaultdict
from dataclasses import dataclass
from math import exp
from statistics import mean, median, pstdev

from app.models.schemas import FinancialFeatures, TransactionResponse


FEATURE_SET_VERSION = "financial_features_v1"


@dataclass(frozen=True)
class DataQualityReport:
    coverage: float
    status: str
    limitations: list[str]
    duplicates: int = 0


@dataclass(frozen=True)
class StressInference:
    probability: float
    band: str
    drivers: list[str]
    model_name: str = "financial_stress_logistic_baseline"
    model_version: str = "1.0.0-synthetic"


class DataQualityEngine:
    def evaluate(self, transactions: list[TransactionResponse], features: FinancialFeatures) -> DataQualityReport:
        months = {item.date.strftime("%Y-%m") for item in transactions}
        limitations=[]
        if not transactions: limitations.append("No transaction history is available")
        if not any(item.category == "Salary" for item in transactions): limitations.append("Income could not be verified from transactions")
        if len(months) < 3: limitations.append("Less than three months of transaction history")
        if features.existingEmi == 0: limitations.append("No debt obligations were supplied")
        coverage=max(0.0, min(1.0, .25*(bool(transactions)+bool(features.monthlyIncome)+bool(features.savings)+bool(features.existingEmi or features.monthlyIncome))))
        return DataQualityReport(coverage=coverage,status="good" if coverage>=.75 else "limited" if coverage>=.5 else "insufficient",limitations=limitations)


class StressModel:
    name="financial_stress_logistic_baseline"; version="1.0.0-synthetic"
    def predict(self, features: FinancialFeatures) -> StressInference:
        z=-3.2 + .065*features.emiBurdenRatio - .42*features.emergencyBufferMonths - .035*features.savingsRate + .025*max(0,features.spendingTrend) + (1.0 if features.cashFlowTrend=="declining" else 0) + (.8 if features.incomeStability=="declining" else 0)
        probability=round(1/(1+exp(-z)),3)
        band="LOW" if probability<.25 else "MODERATE" if probability<.5 else "HIGH" if probability<.78 else "CRITICAL"
        drivers=[]
        if features.emiBurdenRatio>35:drivers.append("Elevated EMI-to-income ratio")
        if features.emergencyBufferMonths<3:drivers.append("Liquidity buffer below three months")
        if features.cashFlowTrend=="declining":drivers.append("Declining cash-flow trend")
        if features.incomeStability!="stable":drivers.append("Income instability")
        if not drivers:drivers.append("No material stress drivers")
        return StressInference(probability,band,drivers)


class MerchantIntelligence:
    def profiles(self, transactions:list[TransactionResponse])->dict[str,dict]:
        grouped=defaultdict(list)
        for item in transactions:grouped[item.merchant].append(item)
        return {merchant:{"frequency":len(items),"average_amount":round(mean(i.amount for i in items),2),"amount_variance":round(pstdev([i.amount for i in items])**2,2) if len(items)>1 else 0,"first_seen":min(i.date for i in items).isoformat(),"last_seen":max(i.date for i in items).isoformat(),"category":Counter(i.category for i in items).most_common(1)[0][0],"recurring":len({i.date.strftime('%Y-%m') for i in items})>=3} for merchant,items in grouped.items()}


class RecurringDetector:
    def detect(self,transactions:list[TransactionResponse])->set[str]:
        profiles=MerchantIntelligence().profiles(transactions)
        return {merchant for merchant,profile in profiles.items() if profile["recurring"] and profile["frequency"]>=3 and profile["amount_variance"]<=max(100,profile["average_amount"]*.15)**2}
