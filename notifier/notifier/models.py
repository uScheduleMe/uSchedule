"""
A module for the models of the notifier service.

This module contains the models for the notifier service. These models are
used to validate the requests sent to the service, and to provide type
hints for the routes. The models are also used to generate the OpenAPI
schemas for the service.
"""

from pydantic import (
    BaseModel,
    EmailStr,
)


class MessageMetadata(BaseModel):
    """
    A model for the metadata of a message.

    Attributes:
        name: The name of the person sending the message.
        email: The email address of the person sending the message.
        subject: The subject of the message.
        is_signed_in: Whether the person sending the message is signed in.
    """

    name: str | None = None
    email: EmailStr | None = None
    subject: str
    is_signed_in: bool = False


class BaseRequest(BaseModel):
    """A base model for requests."""


class FeedbackRequest(BaseRequest, BaseModel):
    """
    A model for a feedback request.

    Attributes:
        metadata: The metadata of the request.
        message: The message.
    """

    metadata: MessageMetadata
    message: str


class MaintenanceRequest(BaseRequest, BaseModel):
    """
    A model for a maintenance request.

    Attributes:
        metadata: The metadata of the request.
        messages: The messages.
        subject: The subject of the message.
        priority: The priority of the message.
        is_fullscrape: Whether the message is a full scrape.
    """

    messages: list[str]
    subject: str = ""
    priority: int = 1
    is_fullscrape: bool = False


class StatusResponse(BaseModel):
    """
    A generic status response model.

    Attributes:
        msg: The status message.
        status: A short status code.
    """

    status: str = "ok"
    msg: str
