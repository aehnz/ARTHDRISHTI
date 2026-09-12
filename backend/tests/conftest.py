import pytest
from fastapi.testclient import TestClient

from app.main import app


def authenticate_demo(client: TestClient, persona: str = "ravi", scenario: str = "tightening") -> dict:
    accounts = client.get("/api/v1/demo/catalog").json()["accounts"]
    account = next(item for item in accounts if item["persona"] == persona and item["scenario"] == scenario)
    challenge = client.post("/api/v1/auth/start", json={"phone": account["phone"]}).json()["challenge_id"]
    response = client.post("/api/v1/auth/verify", json={"challenge_id": challenge, "otp": account["otp"]})
    assert response.status_code == 200
    return account


@pytest.fixture
def public_client() -> TestClient:
    with TestClient(app) as client:
        yield client


@pytest.fixture
def client() -> TestClient:
    with TestClient(app) as client:
        authenticate_demo(client)
        yield client


@pytest.fixture
def ravi_anomaly_client() -> TestClient:
    with TestClient(app) as client:
        authenticate_demo(client, "ravi", "anomaly")
        yield client


@pytest.fixture
def ananya_anomaly_client() -> TestClient:
    with TestClient(app) as client:
        authenticate_demo(client, "ananya", "anomaly")
        yield client


@pytest.fixture
def ravi_growth_client() -> TestClient:
    with TestClient(app) as client:
        authenticate_demo(client, "ravi", "growth")
        yield client


def pytest_configure(config):
    config.addinivalue_line("markers", "golden: primary end-to-end demo flow")
