##############################################################################
#       IMPORTS
##############################################################################

# Standard Library
## Logging
import logging
from updater.timetables import TimetableUpdater
logging.getLogger(__name__)
##
import argparse
import json
import re

# Third-party
import requests

# First-party
from . import _utils
from . import _config
import uoapi
import notifier.logda as logda

# Typing
from typing import (
    AnyStr,
    Optional,
)


##############################################################################
#       CONSTANTS
##############################################################################


class AvailableTermsConfig:
    terms: _config.EndpointConfig
    timestamp: _config.EndpointConfig

    def __init__(self,
        terms: _config.EndpointConfig,
        timestamp: _config.EndpointConfig,
    ):
        self.terms = terms
        self.timestamp = timestamp

    @classmethod
    def from_args(cls, args):
        return cls(
            _config.make_terms_config(args),
            _config.make_timestamp_config(args),
        )

    @classmethod
    def default(cls):
        return cls.from_args(
            _config.EndpointConfig.configure_parser().parse_args([])
        )

    @staticmethod
    def configure_parser(parser):
        return _config.EndpointConfig.configure_parser(parser)


DEFAULT_AT_CONFIG = AvailableTermsConfig.default()


##############################################################################
#       UPDATE AVAILABLE TERMS
##############################################################################

class AvailableTermsUpdater:

    def __init__(self,
        retries: int = 2,
        notes: Optional["AvailableTermsNotifier"] = None,
        saveraw: Optional[AnyStr] = None,
        config: AvailableTermsConfig = DEFAULT_AT_CONFIG,
        trigger_timetables: bool = False,
    **_):
        self.retries = retries
        if notes is None:
            notes = AvailableTermsNotifier()
        self.notes = notes
        self.saveraw = saveraw
        self.config = config
        self.trigger_timetables = trigger_timetables

    def retrieve(self, **kwargs):
        at = uoapi.timetable.available(self.retries)
        if any(
            msg["type"] == "success"
            for msg in at["messages"]
        ):
            return at["available"]

    def transform(self, available_terms):
        return available_terms

    def forward(self, available_terms):
        response = requests.put(
            self.config.terms.endpoint,
            headers=self.config.terms.headers,
            data=json.dumps(available_terms),
        )
        if not(200 <= response.status_code < 300):
            raise Exception("Failed to send update to DA: {}".format(
                response.status_code
            ))
        return response.json()

    def scrape_new(self, terms_dict: dict):
        '''
        Scrape all newly added terms

        Given a dict of terms containing a list of new and old terms,
        this function will run a fullscrape on all terms in the new
        list not present in the old.
        '''
        tu = TimetableUpdater(
            retries=self.retries,
            saveraw=self.saveraw,
        )
        for term in terms_dict['new']:
            if term not in terms_dict['old']:
                tu.update_timetables(
                    year=term['year'],
                    term=term['term'],
                )

    def update(self):
        self.notes.maintainer("Starting available terms update")
        terms_response = dict()
        try:
            with self.notes.block_wrap(
                message="Available terms could not be retrieved",
                level="ERROR",
                raise_=True,
            ):
                available_terms = self.retrieve()
            # This step (transformation) should never fail.
            # Retrieval and forwarding may fail
            # due to network conditions
            # or external resource unavailability,
            # but if the retrieval step succeeds,
            # then transformation will only fail
            # due to programmer error,
            # or external API changes,
            # both of which may be deemed CRITICAL.
            with self.notes.block_wrap(
                message="Available terms could not be transformed",
                level="CRITICAL",
                raise_=True,
            ):
                available_terms = self.transform(available_terms)
            with self.notes.block_wrap(
                message="Available terms could not be forwarded",
                level="ERROR",
                raise_=True,
            ):
                terms_response = self.forward(available_terms)["data"]
        except Exception:
            pass
        else:
            self.notes.maintainer("Available terms successfully updated")
            with self.notes.block_wrap(
                message="Timestamp could not be updated",
                level="WARNING",
                raise_=False,
            ):
                reason = "uottawa-available_terms"
                response = requests.put(self.config.timestamp.endpoint,
                    headers=self.config.timestamp.headers,
                    data=json.dumps({"reason": reason}),
                )
                if not(200 <= response.status_code < 300):
                    raise Exception(
                        "Failed to update timestamp {}".format(reason)
                    )
        finally:
            self.notes.send_notifications()
            if self.trigger_timetables:
                self.scrape_new(terms_response)



##############################################################################
#       EXCEPTION AND NOTIFICATION HANDLING
##############################################################################

class AvailableTermsNotifier(_utils.NotifierHandler):

    def format_data(self) -> dict:
        return {
            "messages": list(self.maintenance_msgs)
                + ["---- ISSUES ----"]
                + [
                    "{message} -> {exception}".format(**x)
                    for x in self.problems
                ],
            "is_fullscrape": False,
            "subject": "Updating Available Terms",
            "priority": 1,
        }


##############################################################################
#       CLI AND MAIN
##############################################################################

def get_parser(**kwargs) -> argparse.ArgumentParser:
    """Create the argument parser used when this script is called.
    """
    parser = argparse.ArgumentParser(
        description="Update available terms.",
        **kwargs,
    )
    parser.add_argument("-r", "--retries",
        action="store",
        metavar="RETRIES",
        type=int,
        default=2,
        required=False,
        help="how many times to try an retrieve the available terms",
    )
    parser.add_argument("-s", "--saveraw",
        action="store",
        metavar="/PATH/TO/DIR/",
        default=None,
        required=False,
        help="if given, save raw html in this folder",
    )
    parser.add_argument("-t", "--trigger-timetables",
        action="store_true",
        default=False,
        help="trigger a timetable scrape if a new term is found",
    )
    parser = logda.configure_parser(parser)
    parser = AvailableTermsConfig.configure_parser(parser)
    return parser

def main(args=None, kwargs={}):
    """The main body of this script when called.

    Args:
        args: Script arguments to be parsed.  If `None`, then
            the command line arguments are parsed.
        kwargs: Arguments passed to `get_parser` which generates
            the `argparse.ArgumentParser`.
    """
    args = get_parser(**kwargs).parse_args(args)
    logda.configure_logging(args)
    AvailableTermsUpdater(
        retries=args.retries,
        saveraw=args.saveraw,
        config=AvailableTermsConfig.from_args(args),
        trigger_timetables=args.trigger_timetables,
    ).update()

##############################################################################

if __name__ == "__main__":
    exit(main())
