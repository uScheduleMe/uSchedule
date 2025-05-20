"""
The main module for the notifier app.

This module contains the app factory for the notifier app, and
acts as the main entry point for the app.
"""

import sys
import json

from fastapi import (
    FastAPI,
    Depends,
)
from loguru import logger

from notifier.config import Settings
from notifier.dependencies import (
    access_log,
    get_settings,
)

from notifier.routes import router


def create_app(settings: Settings | None = None) -> FastAPI:
    """
    Create the notifier app.

    Application factory for the notifier app. This allows the app to be
    configured differently for different environments, e.g. testing.

    This factory also sets up the logging for the app.

    Args:
        settings: The settings to use for the app.

    Returns:
        The app.
    """
    active_settings = settings or get_settings()

    app = FastAPI(
        openapi_url=active_settings.openapi_url,
        dependencies=[Depends(access_log)],
    )

    app.include_router(router)

    @app.on_event("startup")  # pyright: ignore
    async def _() -> None:
        log_level = "DEBUG" if active_settings.debug else "INFO"

        file_format = {
            "time": "{time:%s}" % active_settings.datetime_format,
            "logger": "{name}",
            "level": "{level}",
            "module": "{module}",
            "pathname": "{file}",
            "function": "{function}",
            "lineno": "{line}",
            "processno": "{process}",
            "threadno": "{thread}",
            "message": "{message}",
            "exception": "{exception}",
            "traceback": "{extra}",
        }

        logger.remove(0)
        logger.add(
            active_settings.log_dir / active_settings.log_filename,
            rotation="00:00",
            retention="30 days",
            level=log_level,
            format=json.dumps(file_format),
        )
        logger.add(
            sys.stderr,
            level=log_level,
            format="<yellow>{time:YYYY-MM-DD HH:mm:ss}</yellow> ::"
            + " <level>{level:8s}</level> ::"
            + " [{name}:{file}:{function}:{line}] {message}",
            colorize=True,
        )

    return app
