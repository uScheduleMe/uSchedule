import functools as ft
import re
from rest_framework.response import Response
from typing import Tuple


def is_subject_course_code(s: str) -> bool:
    """
    Checks if the provided string is the concatenation
    of a subject code with a course code.
    """
    s = s.upper().strip()
    return re.match("[A-Z]{3,4}[0-9]{4,5}[A-Z]?", s) is not None

def separate_codes(s: str) -> Tuple[str, str]:
    """
    Splits the concatenation of a subject code with a
    course code into those respective components.

    E.g. "MaT1320a" -> ("MAT", "1320A")
    """
    s = s.upper().strip()
    return re.match("([A-Z]{3,4}[0-9])({4,5}[A-Z]?)", s).groups()

def search_to_str(search: dict) -> str:
    """
    Turns a search dict into a string for ease of
    identification in logging and other such uses.
    """
    if "id" in search:
        return "tt_id:{id}".format(**search)
    else:
        return "-".join(s.format(**search) for s in (
            "{year}:{term}:{school}",
            "{subject_code}{course_code}",
    ))

def http_responder(serializer):
    """
    Wraps a function so its output is serialized
    with `serializer` and wrapped in a Django
    `Response` object before being returned.

    This is useful for writing functions which
    respond to requests to Django.

    Otherwise, for example, if a function returns
    in multiple places, then `serializer` and `Response`
    would have to be used each time.
    """
    def responder_wrapper(func):
        @ft.wraps(func)
        def responder(*args, **kwargs):
            out = func(*args, **kwargs)
            out = serializer(out, many=True)
            return Response(
                out.data,
                status = 200 if len(out.data) > 0 else 404,
            )
        return responder
    return responder_wrapper
