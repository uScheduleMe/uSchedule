##############################################################################
#       IMPORTS
##############################################################################

# Standard Library
## Logging
import logging
logging.getLogger(__name__)
##
import abc
import traceback as tb
from contextlib import contextmanager

# Third-party
import requests

# First-party
import notifier.logda as logda


##############################################################################
#       CONSTANTS
##############################################################################


headers = {"Content-type": "application/json"}

# Communicating with the notifier
maintainer_endpoint = "http://router:5000/notifier/maintenance/mailto"


##############################################################################
#       EXCEPTION AND NOTIFICATION HANDLING
##############################################################################

class IterWrapper:
    """This class wraps iterators to suppress exceptions.

    Iterators supplied to the `IterWrapper.iter_wrap`
    are returned; however, any exception raised during
    iteration (except `StopIteration`) are caught, kept,
    and logged.

    Kept exceptions may be accessed via the
    `IterWrapper.problems` attribute, and cleared via
    the `IterWrapper.clear_problems` method.
    """

    def __init__(self):
        self.problems = []

    def iter_wrap(self, iterable, message="", level=""):
        """Wraps iterables to suppress exceptions.

        Supplying `iterable` to this method allows iteration
        over it, catching any exceptions (derived from
        `Exception`, not `BaseException`), logging them
        with `message` at the given `level`.  The traceback
        is also logged at the DEBUG level.

        Args:
            iterable: The iterable to be wrapped.
            message: The message, added to the exception,
                is what is logged.
            level: The log level. Options are DEBUG, INFO,
                WARNING, ERROR, CRITICAL.

        Yields:
            The elements of `iterable` in order, until any
            subclass of `Exception` is raised.
        """
        level = level.upper()
        if level not in logda.FORMAT_COLOURS:
            level = "ERROR"
        iterable = iter(iterable)
        while True:
            try:
                yield next(iterable)
            except Exception as e:
                if not isinstance(e, StopIteration):
                    logging.debug(
                        str(message) + repr(e),
                        exc_info=True,
                    )
                    logging.log(
                        getattr(logging, level),
                        str(message) + repr(e),
                    )
                    self.problems.append({
                        "message": message,
                        "exception": e,
                        "traceback": tb.format_exc(),
                    })
                break

    @contextmanager
    def block_wrap(self, message="", level="", raise_=False):
        """Wraps blocks to suppress exceptions.

        Calling this method as a context manager
        catches any exceptions
        (derived from `Exception`, not `BaseException`),
        logs them with `message` at the given `level`.
        The traceback is also logged at the DEBUG level.

        Args:
            message: The message, added to the exception,
                is what is logged.
            level: The log level. Options are DEBUG, INFO,
                WARNING, ERROR (the default), CRITICAL.
            raise_: If `True`, and an `Exception` occurs,
                re-raise the error after it is logged.
        """
        level = level.upper()
        if level not in logda.FORMAT_COLOURS:
            level = "ERROR"
        try:
            yield self
        except Exception as e:
            logging.debug(
                str(message) + repr(e),
                exc_info=True,
            )
            logging.log(
                getattr(logging, level),
                str(message) + repr(e),
            )
            self.problems.append({
                "message": message,
                "exception": e,
                "traceback": tb.format_exc(),
            })
            if raise_:
                raise e


    def clear_problems(self):
        """Clears the `problems` logged during iteration."""
        del self.problems[:]

class NotifierHandler(abc.ABC, IterWrapper):
    """Subclasses handle notifications generated when updating certain
    relations.

    Over the lifetime of this object, notifications are cached from
    the `.iter_wrap` and `.maintainer` methods.

    Then the `.send_notifications` method can be called to send
    all the cached notifications (using the `notifier` module)
    and clear the cache.

    Since this is a subclass of `IterWrapper`,
    the `.iter_wrap` method can be used to wrap iteration
    during an update to catch and report exceptions which occur.

    The `.maintainer` method can be called to send a custom
    message to the maintainers of the project.
    """

    maintainer_endpoint = maintainer_endpoint

    def __init__(self):
        super().__init__()
        self.maintenance_msgs = list()

    def maintainer(self, msg: str):
        """Cache `msg` to be sent to the maintainers."""
        self.maintenance_msgs.append(msg)

    @abc.abstractmethod
    def format_data(self) -> dict:
        pass

    def notify_maintainers(self, only_on_problems: bool = False) -> bool:
        """Send and clear the messages and problems to the maintainers."""
        data = self.format_data()
        err_message = "Could not send maintenance email"
        if only_on_problems and len(self.problems) == 0:
            logging.info(data)
        else:
            try:
                response = requests.post(self.maintainer_endpoint, json=data)
                if not(200 <= response.status_code < 300):
                    raise Exception(err_message + " [status {}]".format(
                        response.status_code
                    ))
            except Exception as e:
                self.maintainer(err_message)
                logging.warning(err_message)
                logging.debug(err_message, exc_info=True)
                return False
        # Clear messages
        logging.info("Maintenance email sent successfully")
        logging.info("Clearing messages and issues")
        self.clear_maintenance_msgs()
        self.clear_problems()
        logging.info("Messages and issues cleared")
        return True

    def clear_maintenance_msgs(self):
        """Clear the maintenance messages.

        Automatically called when maintainer notifications are sent.
        """
        self.maintenance_msgs.clear()

    def send_notifications(self):
        """Send and clear all notifications."""
        self.notify_maintainers()
