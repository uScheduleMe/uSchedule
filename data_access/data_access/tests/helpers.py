from types import SimpleNamespace
from data_access.models import Accreditation, AccreditationUnit, Timetable
from data_access.serializers import (
    ScheduleSerializer,
    UserSerializer,
)
import os
import json
import base64
import random
import string
from deepdiff import DeepDiff
from ..views import TimetableViewSet
from django import test
from django.utils.functional import cached_property

data_dir = os.path.join(*"data_access/tests/data".split("/"))

class CourseData:
    """
    Data class to store objects that are fetced from the test data.

    This is a specific course in a specific year/term/school.

    This includes the raw scraper data,
    the normalized output of the updater,
    and the serialized contents of the DB.

    From the serialized contents of the DB,
    a stub of the test course.

    Generate the `search` dict used to query for the
    test course.

    Generate the `reason` which identifies the timestamp
    of fullscrapes from the test year/term/school.
    """

    def __init__(self, course_code, term='winter'):
        """
        Constructor for CourseData object

        Args:
            course_code: the full code for a course ex: ADM1100
        """
        self.course_code = course_code

        # The other placeholder will be filled in later
        self.test_name = "uottawa-2020-{}-{}_{{}}.json".format(term, course_code)
        self.model = None
    
    @cached_property
    def norm(self):
        """
        Normalized representation of the course, as stored in the db.
        """
        with open(os.path.join(data_dir, self.test_name.format("norm")), "r") as f:
            return json.load(f)

    @property
    def search(self):
        """
        Get only the properties that would be used to uniquely identify a course.
        """
        return {
            key: self.norm[key]
            for key in TimetableViewSet.filterset_fields
        }

    @cached_property
    def ser(self):
        """
        Serialized representation of the course, as returned by the endpoint.
        """
        with open(os.path.join(data_dir, self.test_name.format("ser")), "r") as f:
            return json.load(f)

    @property
    def stub(self):
        """
        Get a db stub of this course
        """
        stub = self.ser.copy()
        stub["sections"] = {}
        stub["course_name"] = ""
        return stub

    @cached_property
    def raw(self):
        """
        Raw scraper output for the course.
        """
        with open(os.path.join(data_dir, self.test_name.format("raw")), "r") as f:
            return [
                json.loads(x.strip())
                for x in f.readlines()
                if x.strip() != ""
            ]

    def upsert(self):
        """
        Upsert the course into the database.

        Calling this method populates the `.model` attribute on this object.
        """
        self.model = Timetable.objects.update_or_create(
            **self.norm
        )[0]
        return self.model

def create_accreditation() -> Accreditation:
    # This is based on the actual cips accreditation but is only a subset of the requirements
    au_cs_course = AccreditationUnit(name="Computer science course")
    au_cs_course.save()
    au_mat_course = AccreditationUnit(name="Mathematics course")
    au_mat_course.save()
    au_non_cs_non_mat_course = AccreditationUnit(name="Course in a subject other than CS, SEG, CEG or Math")
    au_non_cs_non_mat_course.save()

    res = Accreditation(
        name="CIPS CS Program Accreditation",
        description="Computer science program accreditation offered by the CIPS",
        required_aus={
            "and": [
                {
                    "req": {
                        "times": {
                            "quantity": 15,
                            "options": [
                                au_cs_course.id,
                            ],
                        },
                    },
                },
                {
                    "req": {
                        "times": {
                            "quantity": 5,
                            "options": [
                                au_mat_course.id,
                            ],
                        },
                    },
                },
                {
                    "req": {
                        "times": {
                            "quantity": 10,
                            "options": [
                                au_non_cs_non_mat_course.id,
                            ],
                        },
                    },
                },
            ],
        },
    )
    res.save()
    return res


def build_jwt(sub = 0, scopes = [], client_id = ''):

    def encode_and_clean(string):
        return base64.b64encode(bytes(string, 'utf-8')).rstrip(b'=').decode('utf-8')

    fields = [
        json.dumps({
            "alg": "RS256",
            "kid": "1aYn4MeyBs5y7puozg5euWvB-qsWPmzMzn4nsJE1kns",
            "typ": "JWT"
        }),
        json.dumps({
            "scopes": scopes,
            "client_id": client_id,
            "csrf": "2f1ef06dd7fbfdccdb2c56293d9c4343",
            "aud": "dev",
            "exp": 1613599675,
            "iat": 1613596075,
            "iss": "uschedule.me",
            "sub": str(sub)
        }),
        "this could be literally anything because we don't validate the signature here"
    ]

    return "{}.{}.{}".format(*map(encode_and_clean, fields))

def create_test_user(user_data=None):
    """
    Helper to instantiate a full user in the database

    We go through the Serializer rather than the model
    because it allows us to create all the data at once
    instead of creating the user then as a separate action
    to create the related fields.
    """
    ser_data = user_data if user_data != None else {
        "providers": [
            {
                "provider": "google",
                "provider_uid": "{}".format(''.join(str(random.randint(0,9)) for _ in range(21)))
            }
        ],
        "emails": [
            {
                "email_address": "{}@example.com".format(''.join(random.choices(string.ascii_uppercase + string.digits, k=10)))
            }
        ],
        "given_name": "Guy",
        "family_name": "Some",
        "disp_name": "Some Guy"
    }
    ser = UserSerializer(data=ser_data)
    ser.is_valid(raise_exception=True)
    return ser.save()

def create_schedule(sched_dict, user_uuid):
    ser = ScheduleSerializer(data=sched_dict, context = {
        'request': SimpleNamespace(jwt=SimpleNamespace(sub=user_uuid))
    })
    ser.is_valid(raise_exception=True)
    ser.save()
    return ser.data


class TestCase(test.TestCase):
    @staticmethod
    def _simplify_dict(obj):
        # json.dumps + json.load is to convert any ordered dicts to regular dicts
        return json.loads(json.dumps(obj))

    def assertDeepEqual(self, old, new):
        self.assertEqual(
            DeepDiff(
                self._simplify_dict(old),
                self._simplify_dict(new),
            ),
            {}
        )
