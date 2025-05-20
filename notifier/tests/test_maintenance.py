"""
Tests for the maintenance endpoint.

Tests that the maintenance endpoint returns a valid response,
and submits the correct endpoint & webhook URL.
"""

import pytest
from unittest import mock
from fastapi.testclient import TestClient

from httpx import Response

from notifier.models import (
    MaintenanceRequest,
)
from notifier.config import Settings


@pytest.fixture(scope="function")
def maintenance_request():
    """Fixture for a valid maintenance request."""
    return MaintenanceRequest(
        subject="Test Subject",
        messages=["Test Message"],
    )


def post_request(client: TestClient, request: MaintenanceRequest) -> Response:
    """
    Post a request to the maintenance endpoint.

    Args:
        client: The test client.
        request: The request to post.
    """
    return client.post(
        "/maintenance/mailto",
        json=request.dict(by_alias=True),
    )


def ok_maintenance_response(response: Response):
    """Check that the response is a valid maintenance response."""
    return response.status_code == 200 and response.json() == {
        "msg": "Maintenance message successfully submitted",
        "status": "ok",
    }


def mock_called_with_right_webhook(mock_post: mock.Mock, settings: Settings):
    """Check that the mock was called with the right webhook URL."""
    mock_post.assert_called_once()

    return mock_post.call_args[0][0] == settings.maintenance_webhook_url


@pytest.mark.routes
def test_maintenance_msg(
    maintenance_request: MaintenanceRequest,
    client: TestClient,
    mock_send_templated_content: mock.Mock,
    settings: Settings,
):
    """
    Tests the happy path for the maintenance endpoint.

    Test that the maintenance endpoint returns a valid response,
    and submits the correct endpoint & webhook URL.

    Args:
        maintenance_request: A valid maintenance request.
        client: The test client.
        mock_send_templated_content: A mock of the send_templated_content
            function.
        settings: The settings to use for the app.
    """
    response = post_request(client, maintenance_request)

    assert ok_maintenance_response(response)

    mock_send_templated_content.assert_called_once_with(
        "/mailto",
        settings.maintenance_webhook_url,
        maintenance_request,
        mock.ANY,
    )


@pytest.mark.routes
def test_maintenance_with_subject(
    maintenance_request: MaintenanceRequest,
    client: TestClient,
    mock_post: mock.Mock,
    settings: Settings,
):
    """
    Tests the template generation with a subject.

    Tests that the template generated correctly
    includes the subject line if it is provided.

    Args:
        maintenance_request: A valid maintenance request.
        client: The test client.
        mock_post: A mock of the post_discord_webhook function.
        settings: The settings to use for the app.
    """
    response = post_request(client, maintenance_request)

    assert ok_maintenance_response(response)

    assert mock_called_with_right_webhook(mock_post, settings)

    content = mock_post.call_args[0][1]

    assert maintenance_request.subject in content

    for message in maintenance_request.messages:
        assert message in content


@pytest.mark.routes
def test_maintenance_with_no_subject(
    maintenance_request: MaintenanceRequest,
    client: TestClient,
    mock_post: mock.Mock,
    settings: Settings,
):
    """
    Tests the template generation with no subject.

    Tests that the template generated correctly
    does not include the subject line if it is not provided.

    Args:
        maintenance_request: A valid maintenance request.
        client: The test client.
        mock_post: A mock of the post_discord_webhook function.
        settings: The settings to use for the app.
    """
    maintenance_request.subject = ""

    response = post_request(client, maintenance_request)

    assert ok_maintenance_response(response)

    assert mock_called_with_right_webhook(mock_post, settings)

    content = mock_post.call_args[0][1]

    assert "uSchedule Maintenance" in content
    assert "uSchedule Maintenance: " not in content

    for message in maintenance_request.messages:
        assert message in content


@pytest.mark.routes
@pytest.mark.parametrize(
    "status_code",
    (400, 401, 403, 404, 500),
)
def test_maintenance_fails_with_failed_webhook(
    status_code: int,
    maintenance_request: MaintenanceRequest,
    client: TestClient,
    mock_post: mock.Mock,
    settings: Settings,
):
    """
    Tests endpoint status code when webhook fails.

    Tests that the maintenance endpoint returns a 500 response if the
    webhook fails to send with any status code above 400.

    Args:
        status_code: The status code to return.
        maintenance_request: A valid maintenance request.
        client: The test client.
        mock_post: A mock of the post_discord_webhook function.
        settings: The settings to use for the app.
    """
    mock_post.return_value = mock.Mock(status_code=status_code)

    response = post_request(client, maintenance_request)

    assert response.status_code == 500

    assert mock_called_with_right_webhook(mock_post, settings)
