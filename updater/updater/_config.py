##############################################################################
#       IMPORTS
##############################################################################

# Standard Library
import argparse

##############################################################################
#       ENDPOINT CONFIG
##############################################################################

class EndpointConfig:
    base_headers: dict = {"Content-type": "application/json"}
    extra_headers: dict = {}
    domain: str
    port: int
    path: str

    @property
    def headers(self) -> dict:
        return {
            **self.base_headers,
            **self.extra_headers,
        }

    @property
    def endpoint(self) -> str:
        return "http://{}:{}/{}".format(
            self.domain,
            self.port,
            self.path,
        )

    @staticmethod
    def configure_parser(parser = None):
        if parser is None:
            parser = argparse.ArgumentParser()
        parser.add_argument("-d", "--domain",
            action="store",
            default="data-access",
            help="the domain name of the data access layer",
        )
        parser.add_argument("-p", "--port",
            action="store",
            type=int,
            default=8000,
            help="the port exposed by the data access layer",
        )
        parser.add_argument("-e", "--extra-headers",
            action="store",
            type=dict,
            default={},
            help="any extra headers required to contact the data access layer"
                +" (should convert to a python dict)",
        )
        return parser

    def __init__(self, extra_headers, domain, port, path):
        self.extra_headers = extra_headers
        self.domain = domain
        self.port = port
        self.path = path

    @classmethod
    def from_args_and_path(cls, args, path: str):
        return cls(
            args.extra_headers,
            args.domain,
            args.port,
            path,
        )




##############################################################################
#       ENDPOINT CONFIG FACTORIES
##############################################################################


def make_terms_config(args) -> EndpointConfig:
    return EndpointConfig.from_args_and_path(
        args,
        "api/da/v1/backend-available-terms/",
    )


def make_timetable_config(args) -> EndpointConfig:
    return EndpointConfig.from_args_and_path(
        args,
        "api/da/v1/timetables/",
    )


def make_users_config(args) -> EndpointConfig:
    return EndpointConfig.from_args_and_path(
        args,
        "api/da/v1/users/",
    )


def make_timestamp_config(args) -> EndpointConfig:
    return EndpointConfig.from_args_and_path(
        args,
        "api/da/v1/timestamps/",
    )

