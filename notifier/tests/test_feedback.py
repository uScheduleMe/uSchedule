"""
Tests for the feedback endpoint.

This module contains tests for the feedback endpoint, including
template generation under different conditions, and the correct
submission of the feedback to the webhook.
"""

import pytest
from unittest import mock
from fastapi.testclient import TestClient

from httpx import Response

from notifier.models import (
    FeedbackRequest,
    MessageMetadata,
)
from notifier.config import Settings


@pytest.fixture(scope="function")
def feedback_request():
    """Fixture for a valid feedback request."""
    return FeedbackRequest(
        metadata=MessageMetadata(
            email="test@uschedule.me",  # pyright: ignore
            name="Test User",
            subject="Test Subject",
        ),
        message="Test Message",
    )


def post_request(client: TestClient, request: FeedbackRequest) -> Response:
    """
    Post a request to the feedback endpoint.

    Args:
        client: The test client.
        request: The request to post.
    """
    return client.post(
        "/feedback/mailto",
        json=request.dict(by_alias=True),
    )


def ok_feedback_response(response: Response):
    """Check that the response is a valid feedback response."""
    return response.status_code == 200 and response.json() == {
        "msg": "Feedback successfully submitted",
        "status": "ok",
    }


def mock_called_with_right_webhook(mock_post: mock.Mock, settings: Settings):
    """Check that the mock was called with the right webhook URL."""
    mock_post.assert_called_once()

    return mock_post.call_args[0][0] == settings.feedback_webhook_url


@pytest.mark.routes
def test_feedback_msg(
    feedback_request: FeedbackRequest,
    client: TestClient,
    mock_send_templated_content: mock.Mock,
    settings: Settings,
):
    """
    Tests feedback endpoint with happy path.

    Test that the feedback endpoint returns a valid response,
    and submits the correct endpoint & webhook URL.

    Args:
        feedback_request: A valid feedback request.
        client: The test client.
        mock_send_templated_content: A mock of the send_templated_content
            function.
        settings: The settings to use for the app.
    """
    response = post_request(client, feedback_request)

    assert ok_feedback_response(response)

    mock_send_templated_content.assert_called_once_with(
        "/feedback/mailto",
        settings.feedback_webhook_url,
        feedback_request,
        mock.ANY,
    )


@pytest.mark.routes
def test_feedback_with_subject(
    feedback_request: FeedbackRequest,
    client: TestClient,
    mock_post: mock.Mock,
    settings: Settings,
):
    """
    Tests template with subject line.

    Tests that the template generated correctly
    includes the subject line if it is provided.

    Args:
        feedback_request: A valid feedback request.
        client: The test client.
        mock_post: A mock of the post_discord_webhook function.
        settings: The settings to use for the app.
    """
    response = post_request(client, feedback_request)

    assert ok_feedback_response(response)

    assert mock_called_with_right_webhook(mock_post, settings)

    content = mock_post.call_args[0][1]

    assert feedback_request.metadata.subject in content
    assert feedback_request.metadata.name in content
    assert feedback_request.metadata.email in content
    assert feedback_request.message in content


@pytest.mark.routes
def test_feedback_with_no_subject(
    feedback_request: FeedbackRequest,
    client: TestClient,
    mock_post: mock.Mock,
    settings: Settings,
):
    """
    Test template without subject line.

    Tests that the template generated correctly
    does not include the subject line if it is not provided.

    Args:
        feedback_request: A valid feedback request.
        client: The test client.
        mock_post: A mock of the post_discord_webhook function.
        settings: The settings to use for the app.
    """
    feedback_request.metadata.subject = ""

    response = post_request(client, feedback_request)

    assert ok_feedback_response(response)

    assert mock_called_with_right_webhook(mock_post, settings)

    content = mock_post.call_args[0][1]

    assert "uSchedule Feedback" in content
    assert "uSchedule Feedback: " not in content
    assert feedback_request.message in content


@pytest.mark.routes
def test_feedback_with_no_name(
    feedback_request: FeedbackRequest,
    client: TestClient,
    mock_post: mock.Mock,
    settings: Settings,
):
    """
    Test template without name.

    Tests that the template generated correctly
    does not include the name if it is not provided.

    Args:
        feedback_request: A valid feedback request.
        client: The test client.
        mock_post: A mock of the post_discord_webhook function.
        settings: The settings to use for the app.
    """
    feedback_request.metadata.name = None

    response = post_request(client, feedback_request)

    assert ok_feedback_response(response)

    assert mock_called_with_right_webhook(mock_post, settings)

    content = mock_post.call_args[0][1]

    assert "Submitter name" not in content
    assert feedback_request.message in content


@pytest.mark.routes
def test_feedback_with_no_email(
    feedback_request: FeedbackRequest,
    client: TestClient,
    mock_post: mock.Mock,
    settings: Settings,
):
    """
    Test template without email.

    Tests that the template generated correctly
    does not include the email if it is not provided.

    Args:
        feedback_request: A valid feedback request.
        client: The test client.
        mock_post: A mock of the post_discord_webhook function.
        settings: The settings to use for the app.
    """
    feedback_request.metadata.email = None

    response = post_request(client, feedback_request)

    assert ok_feedback_response(response)

    assert mock_called_with_right_webhook(mock_post, settings)

    content = mock_post.call_args[0][1]

    assert "Submitter email" not in content
    assert feedback_request.message in content


@pytest.mark.routes
@pytest.mark.parametrize(
    "status_code",
    (400, 401, 403, 404, 500),
)
def test_feedback_fails_with_failed_webhook(
    status_code: int,
    feedback_request: FeedbackRequest,
    client: TestClient,
    mock_post: mock.Mock,
    settings: Settings,
):
    """
    Tests endpoint status code from webhook response.

    Tests that the feedback endpoint returns a 500 response if the
    webhook fails to send with any status code above 400.

    Args:
        status_code: The status code to return.
        feedback_request: A valid feedback request.
        client: The test client.
        mock_post: A mock of the post_discord_webhook function.
        settings: The settings to use for the app.
    """
    mock_post.return_value = mock.Mock(status_code=status_code)

    response = post_request(client, feedback_request)

    assert response.status_code == 500

    assert mock_called_with_right_webhook(mock_post, settings)
