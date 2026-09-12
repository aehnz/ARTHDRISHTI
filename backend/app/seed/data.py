"""Synthetic domain entities for the deterministic demonstration environment."""

from __future__ import annotations

from calendar import monthrange
from datetime import date

from app.models.schemas import ConsentItemResponse, CustomerResponse, DebtAccountResponse, GoalResponse, ScenarioId, TransactionResponse

DEMO_DATE = date(2026, 9, 12)

CUSTOMERS = {
    "ravi": dict(id="cust-ravi", name="Ravi Sharma", firstName="Ravi", age=32,
                 location="Ahmedabad, Gujarat", occupation="Salaried professional",
                 joinDate="2023-06-15", kycStatus="verified", languagePreference="hinglish"),
    "ananya": dict(id="cust-ananya", name="Ananya Mehta", firstName="Ananya", age=36,
                   location="Pune, Maharashtra", occupation="Product leader",
                   joinDate="2022-03-04", kycStatus="verified", languagePreference="en"),
}

# These are source facts, not computed outcomes. All scores and decisions are derived downstream.
SCENARIO_INPUTS: dict[str, dict[ScenarioId, dict[str, int | float | str]]] = {
    "ravi": {
        "tightening": dict(income=82000, emi=31500, savings=182000, buffer=2.4, essential=24800, discretionary=15700, savings_rate=12, savings_trend=-8, spending_trend=11, monthly_contribution=9800, utilization=61, outstanding=1850000, accounts=3, income_stability="stable", cash_flow_trend="declining", upcoming=27400),
        "stable": dict(income=82000, emi=25500, savings=304000, buffer=4.1, essential=24500, discretionary=11900, savings_rate=24, savings_trend=2, spending_trend=-2, monthly_contribution=19700, utilization=34, outstanding=1480000, accounts=2, income_stability="stable", cash_flow_trend="stable", upcoming=22900),
        "stress": dict(income=58000, emi=33000, savings=28000, buffer=.4, essential=17000, discretionary=6200, savings_rate=3, savings_trend=-17, spending_trend=19, monthly_contribution=1700, utilization=82, outstanding=1920000, accounts=4, income_stability="declining", cash_flow_trend="declining", upcoming=34200),
        "anomaly": dict(income=82000, emi=31500, savings=196000, buffer=2.6, essential=24800, discretionary=13900, savings_rate=14, savings_trend=-3, spending_trend=6, monthly_contribution=11500, utilization=58, outstanding=1850000, accounts=3, income_stability="stable", cash_flow_trend="declining", upcoming=27400),
        "growth": dict(income=92000, emi=25500, savings=410000, buffer=5.4, essential=25000, discretionary=12000, savings_rate=31, savings_trend=9, spending_trend=-5, monthly_contribution=28500, utilization=25, outstanding=1320000, accounts=2, income_stability="stable", cash_flow_trend="improving", upcoming=22100),
    },
    "ananya": {
        "growth": dict(income=180000, emi=32400, savings=1030000, buffer=8.2, essential=42000, discretionary=28400, savings_rate=34, savings_trend=7, spending_trend=-3, monthly_contribution=61200, utilization=18, outstanding=2340000, accounts=2, income_stability="stable", cash_flow_trend="improving", upcoming=38800),
        "stable": dict(income=180000, emi=32400, savings=920000, buffer=7.3, essential=42000, discretionary=31500, savings_rate=31, savings_trend=3, spending_trend=1, monthly_contribution=55800, utilization=21, outstanding=2380000, accounts=2, income_stability="stable", cash_flow_trend="stable", upcoming=38800),
        "tightening": dict(income=180000, emi=46000, savings=730000, buffer=5.7, essential=44000, discretionary=39000, savings_rate=23, savings_trend=-6, spending_trend=10, monthly_contribution=41400, utilization=36, outstanding=2920000, accounts=3, income_stability="stable", cash_flow_trend="declining", upcoming=51400),
        "stress": dict(income=126000, emi=60000, savings=155000, buffer=1.5, essential=36000, discretionary=16000, savings_rate=7, savings_trend=-19, spending_trend=15, monthly_contribution=8800, utilization=75, outstanding=3210000, accounts=4, income_stability="declining", cash_flow_trend="declining", upcoming=64200),
        "anomaly": dict(income=180000, emi=32400, savings=995000, buffer=7.9, essential=42000, discretionary=31000, savings_rate=32, savings_trend=3, spending_trend=2, monthly_contribution=57600, utilization=24, outstanding=2340000, accounts=2, income_stability="stable", cash_flow_trend="stable", upcoming=38800),
    },
}

SCENARIOS = {
    "stable": ("Stable", "Consistent income, controlled obligations and stable cash flow."),
    "tightening": ("Tightening", "Rising discretionary spend and a thinner liquidity cushion."),
    "stress": ("Financial stress", "Low liquidity, elevated EMI burden and declining cash flow."),
    "anomaly": ("Fraud / anomaly", "A stable ledger with one deterministic pattern-breaking transaction."),
    "growth": ("Growth", "Strong buffer, savings habit and goal acceleration capacity."),
}

# Authentication fixtures only. Financial truth remains in CUSTOMERS and
# SCENARIO_INPUTS and is not duplicated per account.
DEMO_ACCOUNTS = tuple(
    {
        "account_id": f"demo-{persona}-{scenario}",
        "user_id": f"user-demo-{persona}-{scenario}",
        "phone": f"+9191000000{index:02d}",
        "otp": f"51{index:04d}",
        "persona": persona,
        "customer_id": f"cust-{persona}",
        "scenario_id": scenario,
    }
    for index, (persona, scenario) in enumerate(
        (
            ("ravi", "stable"),
            ("ravi", "tightening"),
            ("ravi", "stress"),
            ("ravi", "anomaly"),
            ("ravi", "growth"),
            ("ananya", "stable"),
            ("ananya", "tightening"),
            ("ananya", "stress"),
            ("ananya", "anomaly"),
            ("ananya", "growth"),
        ),
        start=1,
    )
)


def month_date(month_offset: int, day: int) -> date:
    year, month = DEMO_DATE.year, DEMO_DATE.month - month_offset
    while month <= 0:
        year -= 1
        month += 12
    return date(year, month, min(day, monthrange(year, month)[1]))


def make_transactions(persona: str, scenario: ScenarioId) -> list[TransactionResponse]:
    values = SCENARIO_INPUTS[persona][scenario]
    customer_id = CUSTOMERS[persona]["id"]
    suffix = f"{persona}-{scenario}"
    result: list[TransactionResponse] = []
    income_merchant = "TechCorp India" if persona == "ravi" else "Meridian Systems"
    rent_merchant = "Satellite Towers" if persona == "ravi" else "Blue Ridge Housing"
    rent = 18_000 if persona == "ravi" else 32_000
    for month in range(6):
        result.append(TransactionResponse(id=f"{suffix}-salary-{month}", customerId=customer_id, date=month_date(month, 1), time="09:08", description="Monthly salary credit", amount=int(values["income"]), type="credit", category="Salary", merchant=income_merchant, isRecurring=True, intelligence="Stable recurring income • 6/6 months on schedule", insightIds=["income-stable"]))
        result.append(TransactionResponse(id=f"{suffix}-rent-{month}", customerId=customer_id, date=month_date(month, 3), time="08:30", description="Home rent", amount=rent, type="debit", category="Rent", merchant=rent_merchant, isRecurring=True, intelligence="Expected fixed obligation", insightIds=["cash-pressure"]))
        for index, share in enumerate((.4, .3, .3)):
            result.append(TransactionResponse(id=f"{suffix}-emi-{month}-{index}", customerId=customer_id, date=month_date(month, 5 + index * 3), time="06:00", description=("Vehicle loan EMI", "Personal loan EMI", "Card instalment")[index], amount=round(int(values["emi"]) * share), type="debit", category="EMI", merchant=("HDFC Bank", "ICICI Bank", "SBI Card")[index], isRecurring=True, intelligence="Debt obligation • repayment on schedule", insightIds=["emi-burden"]))
        scale = 1.25 if scenario == "stress" else 1.12 if scenario == "tightening" else .88 if scenario == "growth" else 1
        for index in range(4):
            result.append(TransactionResponse(id=f"{suffix}-food-{month}-{index}", customerId=customer_id, date=month_date(month, 7 + index * 5), time=("13:10", "20:42", "12:18", "21:04")[index], description="Food delivery" if index % 2 else "Groceries", amount=round((420 + month * 31 + index * 117) * scale), type="debit", category="Food", merchant=("Swiggy", "Zomato", "Fresh Basket")[index % 3], intelligence="Food delivery +18% vs 90-day baseline" if scenario in ("tightening", "stress") else "Within your normal range", insightIds=["spending-rise", "leak-food"]))
        for index in range(2):
            result.append(TransactionResponse(id=f"{suffix}-mobility-{month}-{index}", customerId=customer_id, date=month_date(month, 11 + index * 8), time="18:20", description="Urban commute", amount=310 + month * 17 + index * 94, type="debit", category="Mobility", merchant=("Uber", "Ola")[index], intelligence="Normal weekly mobility pattern"))
            result.append(TransactionResponse(id=f"{suffix}-dining-{month}-{index}", customerId=customer_id, date=month_date(month, 9 + index * 11), time="20:15", description="Dining out", amount=round((780 + month * 49 + index * 210) * scale), type="debit", category="Dining", merchant=("The Green House", "Urban Tadka")[index], intelligence="Dining +9% vs baseline" if scenario in ("tightening", "stress") else "Within your normal range", insightIds=["spending-rise"]))
        result.append(TransactionResponse(id=f"{suffix}-utility-{month}", customerId=customer_id, date=month_date(month, 10), time="07:45", description="Electricity and broadband", amount=2840 if persona == "ravi" else 4620, type="debit", category="Utilities", merchant="Torrent Power" if persona == "ravi" else "Jio Fiber", isRecurring=True, intelligence="Expected recurring obligation"))
        result.append(TransactionResponse(id=f"{suffix}-subscription-{month}", customerId=customer_id, date=month_date(month, 15), time="04:05", description="Digital subscriptions", amount=1648 if persona == "ravi" else 2397, type="debit", category="Subscriptions", merchant="3 recurring services", isRecurring=True, intelligence="One low-use subscription detected • ₹699 potential saving" if persona == "ravi" else "Subscription set is within your baseline", insightIds=["unused-subscription"]))
        result.append(TransactionResponse(id=f"{suffix}-saving-{month}", customerId=customer_id, date=month_date(month, 7 if scenario == "tightening" and month == 0 else 2), time="10:00", description="Goal savings transfer", amount=int(values["monthly_contribution"]), type="debit", category="Savings", merchant="Emergency Fund", isRecurring=True, intelligence="Transfer was 5 days later than usual" if scenario == "tightening" and month == 0 else "Recurring wealth-building habit", insightIds=["savings-trend"]))
    if scenario == "anomaly":
        amount = 18_450 if persona == "ravi" else 42_800
        result.append(TransactionResponse(id=f"{suffix}-anomaly-1", customerId=customer_id, date=date(2026, 9, 11), time="23:48", description="Online electronics purchase", amount=amount, type="debit", category="Shopping", merchant="NovaKart Online", intelligence="Transaction awaiting pattern analysis", insightIds=["anomaly-detected"]))
    return sorted(result, key=lambda item: (item.date, item.time), reverse=True)


def make_customer(persona: str, scenario: ScenarioId) -> CustomerResponse:
    values = SCENARIO_INPUTS[persona][scenario]
    return CustomerResponse(**CUSTOMERS[persona], monthlyIncome=values["income"], existingEmi=values["emi"], savings=values["savings"], financialBuffer=values["buffer"], cashFlowTrend=values["cash_flow_trend"])


def make_debts(persona: str, scenario: ScenarioId) -> list[DebtAccountResponse]:
    values = SCENARIO_INPUTS[persona][scenario]
    count = int(values["accounts"])
    shares = [0.52, 0.30, 0.12, 0.06][:count]
    total_share = sum(shares)
    return [DebtAccountResponse(id=f"debt-{persona}-{index+1}", customerId=CUSTOMERS[persona]["id"], lender=("HDFC Bank", "ICICI Bank", "SBI Card", "Retail credit")[index], kind=("vehicle_loan", "personal_loan", "card_instalment", "consumer_credit")[index], outstanding=round(int(values["outstanding"]) * share / total_share), monthlyEmi=round(int(values["emi"]) * share / total_share), utilization=float(values["utilization"]), repaymentStatus="on_schedule") for index, share in enumerate(shares)]


def make_goals(persona: str) -> list[GoalResponse]:
    if persona == "ananya":
        rows = [("goal-home", "Home down payment", 3_500_000, 1_840_000, 48_000, "2028-12-01", "home", "Home", 1), ("goal-reserve", "Opportunity reserve", 1_200_000, 830_000, 18_000, "2027-08-01", "reserve", "Reserve", 2)]
    else:
        rows = [("goal-buffer", "90-day emergency buffer", 300_000, 182_000, 9_800, "2027-09-01", "shield", "Emergency", 1), ("goal-education", "Learning fund", 120_000, 42_000, 4_000, "2028-04-01", "book", "Education", 2)]
    goals = []
    for goal_id, name, target, current, contribution, target_date, icon, category, priority in rows:
        remaining = target - current
        months = max(1, (remaining + contribution - 1) // contribution)
        year = DEMO_DATE.year + (DEMO_DATE.month - 1 + months) // 12
        month = (DEMO_DATE.month - 1 + months) % 12 + 1
        goals.append(GoalResponse(id=goal_id, customerId=CUSTOMERS[persona]["id"], name=name, target=target, current=current, monthlyContribution=contribution, targetDate=target_date, icon=icon, category=category, priority=priority, progress=round(current / target * 100, 1), remainingAmount=remaining, projectedCompletion=date(year, month, 1), monthsToCompletion=months))
    return goals


def make_consents(persona: str) -> list[ConsentItemResponse]:
    rows = [
        ("transaction_history", "Transaction history", "Credits, debits, merchants and timing", "Spending intelligence and cash-flow patterns", True, ["Amount", "Date", "Merchant", "Category"]),
        ("income", "Income", "Recurring salary and income variability", "Financial health and simulated affordability", True, ["Salary credits", "Income trend"]),
        ("debt", "EMI and debt", "Recurring obligations and repayment pattern", "Debt burden and suitability", False, ["EMIs", "Repayment dates", "Outstanding debt"]),
        ("savings", "Savings", "Accessible balances and recurring transfers", "Liquidity and financial resilience", False, ["Balance", "Transfers", "Goal vaults"]),
        ("spending_categories", "Spending categories", "Essential and discretionary category summaries", "Category patterns and leakage detection", False, ["Category", "Monthly total", "Trend"]),
        ("anomaly_detection", "Anomaly detection", "Unusual amounts, times and merchants", "Transaction protection", False, ["Transaction patterns", "Merchant history"]),
        ("ai_assistant", "AI assistant context", "Approved financial-state and governed-decision summaries", "Grounded conversational explanations", False, ["Financial state", "Decision trace", "Recommendations"]),
    ]
    return [ConsentItemResponse(id=item_id, category=category, description=description, purpose=purpose, status="consented", required=required, dataPoints=points, timestamp="2026-09-01T09:00:00+05:30", version="1.0", source="demo_onboarding") for item_id, category, description, purpose, required, points in rows]
