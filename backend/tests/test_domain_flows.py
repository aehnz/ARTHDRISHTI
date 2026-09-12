import pytest


BASE = {"tenure_months": 60, "illustrative_apr": 13.2, "purpose": "personal"}


def loan(client, amount):
    return client.post("/api/v1/me/loan-simulation", json={**BASE, "amount": amount}).json()


def test_larger_loan_never_has_lower_emi(client):
    assert loan(client, 800_000)["monthlyEmi"] >= loan(client, 500_000)["monthlyEmi"] >= loan(client, 200_000)["monthlyEmi"]


def test_emi_increase_never_improves_state(client):
    base = client.post("/api/v1/me/what-if", json={"monthly_saving_delta": 0, "income_delta_pct": 0, "emi_delta": 0}).json()
    raised = client.post("/api/v1/me/what-if", json={"monthly_saving_delta": 0, "income_delta_pct": 0, "emi_delta": 10_000}).json()
    assert raised["after"]["emiBurden"] >= base["after"]["emiBurden"]
    assert raised["after"]["health"] <= base["after"]["health"]


def test_more_saving_never_reduces_buffer(client):
    base = client.post("/api/v1/me/what-if", json={"monthly_saving_delta": 0, "income_delta_pct": 0, "emi_delta": 0}).json()
    increased = client.post("/api/v1/me/what-if", json={"monthly_saving_delta": 10_000, "income_delta_pct": 0, "emi_delta": 0}).json()
    assert increased["after"]["buffer"] >= base["after"]["buffer"]


def test_goal_allocation_never_exceeds_headroom(client):
    state = client.get("/api/v1/me/financial-state").json()
    goals = client.post("/api/v1/me/goals/simulate", json={"extra_monthly_contribution": 500_000}).json()
    assert sum(goal["monthlyContribution"] for goal in goals) <= state["cashFlow"]["monthlySurplus"]
    assert all(goal["monthsSaved"] >= 0 for goal in goals)


def test_consent_changes_capability_and_governance(client):
    assert client.patch("/api/v1/me/consent/income", json={"status": "not_consented"}).status_code == 409
    assert client.patch("/api/v1/me/consent/debt", json={"status": "not_consented"}).status_code == 200
    assert loan(client, 500_000)["recommendation"] == "BLOCKED"
    assert client.patch("/api/v1/me/consent/debt", json={"status": "consented"}).status_code == 200


def test_revoked_anomaly_consent_pauses_protection(ravi_anomaly_client):
    ravi_anomaly_client.patch("/api/v1/me/consent/anomaly_detection", json={"status": "not_consented"})
    protection = ravi_anomaly_client.get("/api/v1/me/protection").json()
    assert protection["capabilityAvailable"] is False
    assert protection["anomalies"] == []


def test_protection_resolution_updates_financial_truth(ananya_anomaly_client):
    before = ananya_anomaly_client.get("/api/v1/me/protection").json()
    event_id = before["anomalies"][0]["id"]
    after = ananya_anomaly_client.patch(f"/api/v1/me/protection/{event_id}", json={"status": "CONFIRMED"}).json()
    assert after["unresolvedCount"] == 0
    assert ananya_anomaly_client.get("/api/v1/me/financial-state").json()["features"]["recentAnomalies"] == 0
    refreshed = ananya_anomaly_client.get("/api/v1/me/overview")
    assert refreshed.status_code == 200
    assert refreshed.json()["recommendations"][0]["actionCode"] != "VERIFY_ANOMALY"


@pytest.mark.golden
def test_ananya_anomaly_is_protection_first(ananya_anomaly_client):
    overview = ananya_anomaly_client.get("/api/v1/me/overview").json()
    assert overview["recommendations"][0]["actionCode"] == "VERIFY_ANOMALY"
    assert overview["loanAssessment"]["recommendation"] == "BLOCKED"


@pytest.mark.golden
def test_ravi_growth_recommends_goal_acceleration(ravi_growth_client):
    overview = ravi_growth_client.get("/api/v1/me/overview").json()
    assert overview["recommendations"][0]["actionCode"] == "ACCELERATE_GOAL"
    assert overview["recoveryPlan"]["planType"] == "GROWTH"


def test_cash_flow_dates_share_one_reference_period(client):
    flow = client.get("/api/v1/me/cash-flow").json()
    assert flow["referenceDate"] == "2026-09-12"
    assert "September 2026" in flow["periodLabel"]
    assert flow["upcomingObligations"] == sum(item["amount"] for item in flow["next10Days"] if item["type"] == "expense")


def test_audit_contains_real_decision_and_consent_events(client):
    client.patch("/api/v1/me/consent/debt", json={"status": "not_consented"})
    loan(client, 500_000)
    events = client.get("/api/v1/me/audit").json()
    actions = {event["action"] for event in events}
    assert {"CONSENT_UPDATED", "LOAN_SIMULATED", "RECOMMENDATION_SUPPRESSED"} <= actions
    assert all(event["actorType"] in {"DEMO_USER", "USER", "SYSTEM"} for event in events)


def test_ai_communicates_authoritative_decision(client):
    response = client.post("/api/v1/me/ask", json={"language": "hinglish", "question": "Mujhe ₹5 lakh ka personal loan lena chahiye?"})
    assert response.status_code == 200
    body = response.json()
    assert body["intent"] == "LOAN_AFFORDABILITY"
    assert body["decisionReference"].startswith("sim-")
