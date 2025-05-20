"""
A module containing settings for the app.

While this module defines some defaults, all settings
can be overridden by setting environment variables with
the same name as the setting.
"""

from pathlib import Path
from pydantic import (
    BaseSettings,
    HttpUrl,
)


class Settings(BaseSettings):
    """
    Settings for the app.

    Any settings that are not set will be
    read from the environment automatically by pydantic.

    Attributes:
        feedback_webhook_url: The URL to send feedback to.
        maintenance_webhook_url: The URL to send maintenance messages to.
        env: The environment the app is running in.
        version: The version of the app.
        log_dir: The directory to store logs in.
        log_filename: The filename to store logs in.
    """

    feedback_webhook_url: HttpUrl
    maintenance_webhook_url: HttpUrl
    env: str = "dev"
    debug: bool = False
    version: str = "2.0"
    datetime_format: str = "%Y-%m-%dT%H:%M:%S%Z"
    log_dir: Path = Path("/var/log/uschedule")
    log_filename: str = "notifier.log"

    @property
    def openapi_url(self) -> str:  # pragma: no cover
        """
        Get the URL to the OpenAPI docs.

        This allows the docs to be disabled in production.
        """
        if self.env == "dev":
            return "/openapi.json"
        return ""

    class Config:  # pyright: ignore
        """
        Configurations for the settings.

        Attributes:
            env_file: The file to read environment variables from,
                if it exists.
        """

        env_file = ".env"
