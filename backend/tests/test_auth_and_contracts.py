from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient

from app.main import app
from conftest import authenticate_demo


def test_health_and_docs_are_public(public_client):
    health = public_client.get("/api/v1/health")
    assert health.status_code == 200
    assert health.json()["version"] == "3.0.0"
    assert public_client.get("/docs").status_code == 200


def test_financial_routes_require_a_session(public_client):
    assert public_client.get("/api/v1/me/overview").status_code == 401
    assert public_client.get("/api/v1/customers/ravi/overview").status_code == 401


def test_otp_is_one_time_and_session_cookie_is_http_only(public_client):
    start = public_client.post("/api/v1/auth/start", json={"phone": "+91 98765 43210"})
    challenge = start.json()["challenge_id"]
    verify = public_client.post("/api/v1/auth/verify", json={"challenge_id": challenge, "otp": "123456"})
    assert verify.status_code == 200
    assert "HttpOnly" in verify.headers["set-cookie"]
    assert public_client.post("/api/v1/auth/verify", json={"challenge_id": challenge, "otp": "123456"}).status_code == 401


def test_bad_otp_is_rejected(public_client):
    challenge = public_client.post("/api/v1/auth/start", json={"phone": "+91 90000 10000"}).json()["challenge_id"]
    response = public_client.post("/api/v1/auth/verify", json={"challenge_id": challenge, "otp": "000000"})
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "OTP_INVALID"
    assert response.json()["error"]["requestId"]


def test_invalid_phone_is_rejected(public_client):
    assert public_client.post("/api/v1/auth/start", json={"phone": "123"}).status_code == 422


def test_expired_otp_is_rejected(public_client):
    challenge_id = public_client.post("/api/v1/auth/start", json={"phone": "+91 90000 20000"}).json()["challenge_id"]
    challenge = app.state.container.auth.challenges.get(challenge_id)
    challenge.expires_at = datetime.now(timezone.utc) - timedelta(seconds=1)
    app.state.container.auth.challenges.save(challenge)
    assert public_client.post("/api/v1/auth/verify", json={"challenge_id": challenge_id, "otp": "123456"}).status_code == 401


def test_logout_invalidates_session(client):
    assert client.get("/api/v1/auth/me").status_code == 200
    assert client.post("/api/v1/auth/logout").status_code == 204
    assert client.get("/api/v1/auth/me").status_code == 401


def test_expired_session_is_rejected(client):
    session_id = client.cookies.get("arthdrishti_session")
    session = app.state.container.auth.sessions.get(session_id)
    session.expires_at = datetime.now(timezone.utc) - timedelta(seconds=1)
    app.state.container.auth.sessions.save(session)
    assert client.get("/api/v1/auth/me").status_code == 401


def test_demo_catalog_is_backend_driven(public_client):
    result = public_client.get("/api/v1/demo/catalog")
    assert result.status_code == 200
    accounts = result.json()["accounts"]
    assert len(accounts) == 10
    assert {item["persona"] for item in accounts} == {"ravi", "ananya"}
    assert len({item["accountId"] for item in accounts}) == 10
    assert len({item["phone"] for item in accounts}) == 10
    assert all(item["otp"] and item["situation"] for item in accounts)


def test_all_demo_accounts_authenticate_to_fixed_assignment(public_client):
    accounts = public_client.get("/api/v1/demo/catalog").json()["accounts"]
    expected = {(persona, scenario) for persona in ("ravi", "ananya") for scenario in ("stable", "tightening", "stress", "anomaly", "growth")}
    observed = set()
    for account in accounts:
        public_client.cookies.clear()
        challenge = public_client.post("/api/v1/auth/start", json={"phone": account["phone"]}).json()["challenge_id"]
        verify = public_client.post("/api/v1/auth/verify", json={"challenge_id": challenge, "otp": account["otp"]})
        assert verify.status_code == 200
        context = public_client.get("/api/v1/auth/me").json()
        overview = public_client.get("/api/v1/me/overview").json()
        assert context["user"]["id"] == f'user-{account["accountId"]}'
        assert context["customer"]["id"] == f'cust-{account["persona"]}'
        assert context["onboarding"]["status"] == "complete"
        assert overview["persona"] == account["persona"]
        assert overview["scenario"] == account["scenario"]
        observed.add((overview["persona"], overview["scenario"]))
    assert observed == expected


def test_demo_assignment_survives_refresh_and_cannot_be_switched(client):
    before = client.get("/api/v1/me/overview").json()
    assert client.get("/api/v1/auth/me").status_code == 200
    after = client.get("/api/v1/me/overview").json()
    assert (before["persona"], before["scenario"]) == ("ravi", "tightening")
    assert (after["persona"], after["scenario"]) == ("ravi", "tightening")
    assert client.post("/api/v1/demo/select", json={"customer_id": "cust-ananya", "scenario_id": "growth"}).status_code == 404
    assert client.post("/api/v1/scenarios/select", json={"customer_id": "cust-ananya", "scenario": "growth"}).status_code == 404


def test_two_demo_sessions_are_isolated():
    with TestClient(app) as first, TestClient(app) as second:
        authenticate_demo(first, "ravi", "stress")
        authenticate_demo(second, "ananya", "growth")
        first_state = first.get("/api/v1/me/overview").json()
        second_state = second.get("/api/v1/me/overview").json()
        assert (first_state["persona"], first_state["scenario"]) == ("ravi", "stress")
        assert (second_state["persona"], second_state["scenario"]) == ("ananya", "growth")
        first.post("/api/v1/auth/logout")
        assert first.get("/api/v1/auth/me").status_code == 401
        assert second.get("/api/v1/auth/me").status_code == 200
        assert second.get("/api/v1/me/overview").json()["scenario"] == "growth"


def test_cross_customer_access_is_denied(client):
    response = client.get("/api/v1/customers/ananya")
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "CUSTOMER_ACCESS_DENIED"


def test_overview_contract_is_complete(client):
    body = client.get("/api/v1/me/overview").json()
    for key in ("customer", "financialState", "transactions", "insights", "recommendations", "trajectory", "goals", "modelInference", "consentItems", "loanAssessment", "recoveryPlan", "whatIf", "cashFlow", "protection", "financialDna", "nextBestAction", "explainability", "auditTrail"):
        assert key in body
    assert body["financialState"]["healthBand"] == "TIGHTENING"


def test_normal_onboarding_is_backend_persisted(public_client):
    challenge = public_client.post("/api/v1/auth/start", json={"phone": "+91 98888 77777"}).json()["challenge_id"]
    public_client.post("/api/v1/auth/verify", json={"challenge_id": challenge, "otp": "123456"})
    initial = public_client.get("/api/v1/auth/me").json()
    assert initial["onboarding"]["status"] == "incomplete"
    assert initial["customer"]["id"].startswith("cust-normal-")
    assert initial["customer"]["name"] != "Ravi Sharma"
    assert public_client.patch("/api/v1/onboarding/profile", json={"name": "Test User", "language_preference": "en"}).status_code == 200
    assert public_client.patch("/api/v1/onboarding/goals", json={"goals": ["Build emergency fund"]}).status_code == 200
    assert public_client.post("/api/v1/onboarding/connection", json={"provider": "mock_bank", "consent_to_connect": True}).status_code == 200
    assert public_client.patch("/api/v1/onboarding/consent", json={"consent_ids": ["transaction_history", "income", "debt", "savings", "spending_categories", "anomaly_detection"]}).status_code == 200
    assert public_client.post("/api/v1/onboarding/complete").json()["status"] == "complete"
    assert public_client.get("/api/v1/auth/me").json()["user"]["name"] == "Test User"
    overview = public_client.get("/api/v1/me/overview")
    assert overview.status_code == 200
    assert overview.json()["persona"].startswith("normal-")


def test_normal_user_cannot_access_demo_only_routes(public_client):
    challenge = public_client.post("/api/v1/auth/start", json={"phone": "+91 98888 66666"}).json()["challenge_id"]
    public_client.post("/api/v1/auth/verify", json={"challenge_id": challenge, "otp": "123456"})
    assert public_client.get("/api/v1/demo/customers").status_code == 403
    assert public_client.get("/api/v1/customers").status_code == 403
    assert public_client.post("/api/v1/demo/select", json={"customer_id": "cust-ananya", "scenario_id": "growth"}).status_code == 404


def test_customer_and_scenario_injection_is_rejected_or_ignored(client):
    assert client.get("/api/v1/customers/ananya").status_code == 403
    result = client.post("/api/v1/me/what-if", json={"monthly_saving_delta": 0, "income_delta_pct": 0, "emi_delta": 0, "scenario": "growth"})
    assert result.status_code == 200
    assert client.get("/api/v1/me/overview").json()["scenario"] == "tightening"
