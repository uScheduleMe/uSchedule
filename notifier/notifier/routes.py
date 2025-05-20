"""
A module for the routes of the app.

All routes are defined using FastAPI's APIRouter. The routes are
then mounted on the app in notifier/__init__.py. This is done so
that they can be defined independently of the app.
"""

from fastapi import (
    APIRouter,
    Depends,
)
from jinja2 import Template

from notifier.utils import send_templated_content
from notifier.dependencies import (
    get_template,
    feedback_url,
    maintenance_url,
)
from notifier.models import (
    FeedbackRequest,
    MaintenanceRequest,
    StatusResponse,
)

router = APIRouter()


@router.get(
    "/heartbeat",
    response_model=StatusResponse,
    summary="Check the status of the app",
    description="A route for checking the status of the app.",
)
async def heartbeat() -> StatusResponse:
    """
    Return a status response to indicate that the service is up and running.

    A route for checking the status of the app.

    Returns:
        A status response message
    """
    return StatusResponse(msg="Service is up and running")


@router.post(
    "/feedback/mailto",
    response_model=StatusResponse,
    summary="Send feedback messages to the team",
    description="A route for sending feedback to the feedback webhook.",
)
async def feedback_mailto(
    request: FeedbackRequest,
    template: Template = Depends(get_template("feedback.jinja2")),
    url: str = Depends(feedback_url),
) -> StatusResponse:
    """
    Send feedback messages to the team.

    Args:
        request: The feedback request.
        template: The template to use for the feedback message.
        url: The URL of the feedback webhook.
    """
    await send_templated_content(
        "/feedback/mailto",
        url,
        request,
        lambda req: template.render_async(
            metadata=req.metadata,
            message=req.message,
        ),
    )

    return StatusResponse(msg="Feedback successfully submitted")


@router.post(
    "/maintenance/mailto",
    response_model=StatusResponse,
    summary="Send maintenance notifications to the team",
    description="A route for sending maintenance notifications to the "
    + "maintenance webhook.",
)
async def mailto(
    request: MaintenanceRequest,
    template: Template = Depends(get_template("maintenance.jinja2")),
    url: str = Depends(maintenance_url),
) -> StatusResponse:
    """
    Send maintenance notifications to the maintenance webhook.

    Args:
        request: The maintenance request.
        template: The template to use for the maintenance message.
        url: The URL of the maintenance webhook.
    """
    await send_templated_content(
        "/mailto",
        url,
        request,
        lambda req: template.render_async(
            subject=req.subject,
            messages=req.messages,
            priority=req.priority,
        ),
    )

    return StatusResponse(msg="Maintenance message successfully submitted")
