"""
A module containing utility functions.

This module contains utility functions that are used by the routes,
abstracting away common functionality. This allows all routes to be as
simple as possible, and allows for the functionality to be tested
separately from the routes.
"""

from typing import (
    Callable,
    Awaitable,
    TypeVar,
)

import httpx

from fastapi import (
    HTTPException,
)
from loguru import logger

from notifier.models import BaseRequest


T = TypeVar("T", bound=BaseRequest)


async def post_discord_webhook(
    webhook_url: str,
    contents: str,
) -> httpx.Response:
    """
    Use an async HTTP client to post to a Discord webhook.

    Args:
        webhook_url: The URL of the webhook.
        contents: The contents to post to the webhook.

    Returns:
        The response from the webhook.
    """
    async with httpx.AsyncClient() as client:  # pragma: no cover
        return await client.post(
            webhook_url,
            json={"content": contents},
        )


async def send_templated_content(
    endpoint: str,
    webhook_url: str,
    request: T,
    templating_function: Callable[[T], Awaitable[str]],
) -> None:
    """
    Send a templated message to a webhook.

    This function provides shared functionality between all discord-posting
    routes, as well as enabling logging of the request model.

    The templating function must accept a request object of the same type as
    the request passed to this function, and returns an awaitable that resolves
    to a string. This is used to allow the templating function to be async, as
    well as to ensure that if the request needs to be modified before being
    passed to the templating function, it can be.

    Args:
        endpoint: The endpoint that the request was sent to.
        webhook_url: The URL of the webhook.
        request: The request that was sent.
        templating_function: A function that takes a request and returns a

    Raises:
        HTTPException: If the webhook returns a non-200 status code, or if
            the templating function raises an exception.
    """
    logger.info(f"Received request at {endpoint}")
    logger.debug(request.json())

    logger.info("Rendering template")
    contents = await templating_function(request)

    logger.info("Posting to Discord webhook")

    try:
        response = await post_discord_webhook(webhook_url, contents)

        if response.status_code >= 400:
            raise HTTPException(
                status_code=response.status_code,
                detail=response.text,
            )
    except Exception:
        logger.opt(exception=True).error(
            "Failed to post to Discord webhook",
        )
        raise HTTPException(
            status_code=500,
            detail="Failed to post to Discord webhook",
        )

    logger.info("Successfully posted to Discord webhook")
