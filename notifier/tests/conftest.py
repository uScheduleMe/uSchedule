import pytest
from unittest import mock

from fastapi.testclient import TestClient

from notifier import create_app
from notifier.dependencies import get_settings
from notifier.config import Settings


def default_settings():
    """
    The settings to use for the app. This is a function so that
    the dependency override can be used.
    """
    return Settings(
        feedback_webhook_url="http://example.com/dev/null/feedback",
        maintenance_webhook_url="http://example.com/dev/null/maintenance",
        env="test",
        version="0.0.0",
        log_dir="/dev",
        log_filename="null",
    )


@pytest.fixture(scope="function", name="settings")
def settings_fixture():
    """
    Fixture for the settings.
    """
    return default_settings()


@pytest.fixture(scope="session")
def client():
    """
    A test client for the app.
    """
    app = create_app(default_settings())

    app.dependency_overrides[get_settings] = default_settings

    with TestClient(app) as client:
        yield client


@pytest.fixture(scope="function")
def mock_send_templated_content():
    """
    A mock of the send_templated_content function.
    """

    with mock.patch(
        "notifier.routes.send_templated_content"
    ) as mock_send_templated_content:
        yield mock_send_templated_content


@pytest.fixture(scope="function")
def mock_post():
    """
    A mock of the post_discord_webhook function.
    """

    with mock.patch("notifier.utils.post_discord_webhook") as mock_post:
        mock_request = mock.Mock()
        mock_request.status_code = 200

        mock_post.return_value = mock_request

        yield mock_post
