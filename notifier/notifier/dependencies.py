"""
A module to define dependencies for the app.

Dependencies are used to inject objects into routes. This allows
the routes to be as simple as possible, and allows for the
injection of objects that are used by multiple routes.
"""


from datetime import datetime
from functools import lru_cache
from typing import (
    Callable,
    Coroutine,
    Any,
)

from fastapi import (
    Depends,
    Request,
    Header,
)
from jinja2 import (
    Environment,
    PackageLoader,
    Template,
)
from pydantic import HttpUrl

from loguru import logger

from notifier.config import Settings


jinja_env = Environment(
    loader=PackageLoader("notifier", "templates"),
    enable_async=True,
    autoescape=True,
)


@lru_cache()
def get_settings() -> Settings:  # pragma: no cover
    """
    Get the settings for the app.

    This is cached so that the settings are only created once.

    Dependency is used to inject the settings into routes that
    need them.

    Returns:
        The default app settings.
    """
    # Need to initialize this way to prevent pylance from complaining about
    # the Settings class not being given values for things that get
    # pulled from the environment.
    # https://docs.pydantic.dev/visual_studio_code/#basesettings-and-ignoring-pylancepyright-errors
    return Settings.parse_obj({})


async def access_log(request: Request) -> None:
    """
    Log the request to the access log.

    This dependency is used by the app to log all requests to the
    access log.

    Args:
        request: The request to log. This is injected by FastAPI.
    """
    logger.info(
        f"{request.method} {request.url.path} "
        + f"{request.url.query} {request.headers.get('User-Agent')}"
    )


async def feedback_url(
    settings: Settings = Depends(get_settings),
) -> HttpUrl:
    """
    Return the feedback webhook URL, which is defined in the settings.

    This function is used as a dependency for routes to fetch the
    feedback webhook URL without having to fetch the entire settings
    object.

    Args:
        settings: The settings object. This is injected by FastAPI.

    Returns:
        The feedback webhook URL.
    """
    return settings.feedback_webhook_url


async def maintenance_url(
    settings: Settings = Depends(get_settings),
) -> HttpUrl:
    """
    Return the maintenance webhook URL, which is defined in the settings.

    This function is used as a dependency for routes to fetch the
    maintenance webhook URL without having to fetch the entire
    settings object.

    Args:
        settings: The settings object. This is injected by FastAPI.

    Returns:
        The maintenance webhook URL.
    """
    return settings.maintenance_webhook_url


@lru_cache()
def get_template(
    file_name: str,
) -> Callable[[Request, Settings, str | None], Coroutine[Any, Any, Template]]:
    """
    Generate a function that can be used to get a template.

    The generated function is used as a dependency for routes
    that require a template. The template is cached so that
    the function only needs to be generated once, but the template
    itself is not cached. This is because the template needs to
    be rendered with different variables each time, namely the
    current time.

    Args:
        file_name: The name of the template file.

    Returns:
        A function that can be used as a dependency to retrieve
        a specific template.
    """

    async def inner_tmpl(
        request: Request,
        settings: Settings = Depends(get_settings),
        user_agent: str | None = Header(default=None),
    ) -> Template:
        """
        Retrieve a template from the environment.

        The template retrieved from this function will have
        specific global variables made available to it.

        This simplifies the process of retrieving a template and
        reduces the amount of data that is required for an endpoint
        to have to populate the template.

        This inner function is what is actually used as a dependency
        for routes.

        Args:
            settings: The settings for the app.
            user_agent: The user agent of the request, retrieved from
                the header.

        Returns:
            A jinja2 template object, with the global variables set.
        """
        logger.debug(f"Fetching template '{file_name}' for route {request.url.path}")

        return jinja_env.get_template(
            file_name,
            globals={
                "settings": settings,
                "now": datetime.utcnow().strftime(settings.datetime_format),
                "user_agent": user_agent,
            },
        )

    return inner_tmpl
