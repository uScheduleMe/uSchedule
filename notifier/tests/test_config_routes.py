import pytest
from fastapi.testclient import TestClient


@pytest.mark.routes
@pytest.mark.unit
def test_heartbeat(client: TestClient):
    """
    Test that the heartbeat endpoint returns a valid response.

    Args:
        client: The test client.
    """

    response = client.get("/heartbeat")
    assert response.status_code == 200
    assert response.json() == {
        "msg": "Service is up and running",
        "status": "ok",
    }


@pytest.mark.routes
def test_openapi_not_available_outside_dev(client: TestClient):
    """
    Test that the OpenAPI endpoint is not available outside of the dev
    environment.

    Args:
        client: The test client.
    """
    response = client.get("/openapi.json")
    assert response.status_code == 404
