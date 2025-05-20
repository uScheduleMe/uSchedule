from django.test.client import Client
from django.test.testcases import SimpleTestCase
from ..views import (
    get_timetables,
    put_timetable_stub,
)
from ..models import (
    Accreditation,
    AccreditationUnit,
    Activity,
    ActivityAccreditationAssignment,
    Calendar,
    CalendarComponents,
    CalendarShare,
    Course,
    Schedule,
    Timetable,
    Timestamp,
    AvailableTerms,
)
from ..serializers import (
    AccreditationSerializer,
    AccreditationSummarySerializer,
    AccreditationUnitSerializer,
    ActivitySerializer,
    ActivitySummarySerializer,
    CourseSerializer,
    TimetableSummarySerializer,
    UserSerializer,
)
import os
import json
from unittest import mock
from typing import Optional
from .helpers import (
    CourseData,
    TestCase,
    build_jwt,
    create_accreditation,
    create_schedule,
    create_test_user,
)
from copy import deepcopy
import logging

logging.disable(logging.CRITICAL)

class TestHeartbeat(SimpleTestCase):
    def test_heartbeat(self):
        res = self.client.get('/api/da/v1/heartbeat/')
        self.assertEqual(res.status_code, 200)

class TestTimestamp(TestCase):
    def test_get(self):
        res = self.client.get('/api/da/v1/timestamps/')
        self.assertEqual(res.status_code, 200)

    def test_put(self):
        res = self.client.put(
            '/api/da/v1/timestamps/',
            {"reason": "blah"},
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 200)
        res = self.client.get('/api/da/v1/timestamps/', {"reason": "blah"})
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"][0]
        self.assertIn("reason", data)
        self.assertIn("timestamp", data)
        self.assertEqual("blah", data["reason"])

class TimetableViewSetTest(TestCase):
    '''Test the Timetable Viewset'''

    @classmethod
    def setUpTestData(cls):
        cls.course = CourseData("CSI2120")
        cls.course.upsert()

    def test_get(self):
        """
        Simple sanity check to ensure we are returning a 200 status and that the course is in the DB.
        """
        res = self.client.get('/api/da/v1/timetables/')
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(len(data), 1)
        course = data[0]
        self.assertEqual(course["subject_code"], "CSI")
        self.assertEqual(course["course_code"], "2120")

    def test_put_with_no_change(self):
        """
        Put test with the same data as already exists in the db
        """
        res = self.client.put('/api/da/v1/timetables/', content_type='application/json', data=self.course.norm)
        data = json.loads(res.content)["data"]
        self.assertEqual(data["new"], data["old"])

    def test_do_not_return_stubs(self):
        """
        Test that we don't get a stub even when we query the list endpoint
        """
        put_timetable_stub(self.course.search)
        res = self.client.get('/api/da/v1/timetables/')
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(len(data), 0)

    def test_matches_lowercase_subject_code(self):
        """
        Test that the course is returned if the subject code matches in a case insensitive way
        """
        res = self.client.get('/api/da/v1/timetables/?subject_code=csi')
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(len(data), 1)
        course = data[0]
        self.assertEqual(course["subject_code"], "CSI")
        self.assertEqual(course["course_code"], "2120")

def timetable_put(normalized_timetable):
    """
    Manually update or create a course timetable
    in the database.

    Args:
        normalized_timetable: A course timetable,
            normalized as done with the updater.
    """
    return Timetable.objects.update_or_create(
        normalized_timetable
    )

class MockTimetableUpdater:
    """
    An instance of this class mocks the
    `..views.update_timetables` function used
    in the API to refresh stale course timetables.
    """

    def __init__(self,
        search: dict,
        put: Optional[dict] = None,
        succeed: bool = True,
    ):
        """
        Args:
            search: The query to respond to.
            put: None, or a the a normalized course
                timetable to put in the DB when the
                __call__ method (mocking the updater)
                is called.
            succeed: Whether or not to succeed.
        """
        self.search = search
        self.put = put
        self.succeed = succeed
        self.called = 0

    def __call__(self, search: dict) -> bool:
        """
        Args:
            search: The course timetable query to update.
        """
        self.called += 1
        try:
            search["year"] = int(search["year"])
        except Exception:
            return False
        if self.succeed and search == self.search and self.put is not None:
            obj, created = timetable_put(self.put)
        return self.succeed

class TimetableDoubleCheckTest(TestCase):

    @classmethod
    def cleanup_helper(cls):
        """Delete the test course from the database."""
        get_timetables({"course_code": "3120", **cls.course.search}).delete()

    @classmethod
    def setUpTestData(cls):
        """
        Loads the test data.

        Generate the `reason` which identifies the timestamp
        of fullscrapes from the test year/term/school.
        """
        cls.course = CourseData("MAT3120")
        cls.reason = "{}-fullscrape".format(
            ":".join(str(cls.course.search[x]).strip()
            for x in ("year", "term", "school"))
        )
        cls.cleanup_helper()
        AvailableTerms(term='winter', year=2020).save()
        cls.timestamp = 123456  # This just needs to be some constant

    def tearDown(self):
        self.cleanup_helper()

    def update_timestamp(self):
        """
        Update the timestamp to mock a fullscrape for the
        test year/term/school.
        """
        Timestamp.objects.update_or_create(reason=self.reason)

    def put_tt(self):
        """See `timetable_put`."""
        return timetable_put(self.course.norm)

    def put_stub(self):
        """See `..views.put_timetable_stub`."""
        put_timetable_stub(self.course.search)

    @mock.patch.dict(os.environ, {"DOUBLE_CHECK": "true"})
    def get(self):
        """
        Mock a GET request for the test course.
        """
        response =  self.client.get(
            "/api/da/v1/timetables/",
            content_type="application/json",
            data=self.course.search
        )
        return response.status_code, json.loads(response.content)["data"]

    def got_tt(self, response):
        """
        Assert that exactly one timetable was returned
        in the `response` to a mocked GET request,
        and that it is for the correct course.
        """
        status_code, response = response
        self.assertEqual(status_code, 200)
        self.assertEqual(len(response), 1)
        response = response[0]
        response.pop("id", -1)
        self.assertDeepEqual(response, self.course.ser)

    def got_stub(self, response):
        """
        Assert that no timetables were returned
        in the `response` to a mocked GET request,
        or that one timetable was returned and it
        is a stub for the correct course.
        """
        status_code, response = response
        self.assertEqual(status_code, 404)
        self.assertEqual(len(response), 0)

    def stub_in_db(self):
        """
        Assert that there is a stub for the test course
        in the DB.
        """
        tt = Timetable.objects.filter(**self.course.search)
        self.assertEqual(len(tt), 1)
        tt = tt[0]
        for key, val in self.course.stub.items():
            if key == "course_name":
                continue
            self.assertEqual(val, getattr(tt, key))

    def test_timetable_recent(self):
        """
        The timetable is in the DB and the timestamp is recent.
        """
        with mock.patch('time.time', mock.MagicMock(return_value=(self.timestamp - 1))):
            self.update_timestamp()
        with mock.patch('time.time', mock.MagicMock(return_value=(self.timestamp))):
            self.put_tt()
        mtu = MockTimetableUpdater(self.course.search)
        with mock.patch('time.time', mock.MagicMock(return_value=(self.timestamp + 1))):
            with mock.patch("data_access.views.update_timetables", mtu):
                response = self.get()
        self.assertEqual(mtu.called, 0)
        self.got_tt(response)

    def test_stub_recent(self):
        """
        The stub is in the DB and the timestamp is recent.
        """
        with mock.patch('time.time', mock.MagicMock(return_value=(self.timestamp - 1))):
            self.update_timestamp()
        with mock.patch('time.time', mock.MagicMock(return_value=(self.timestamp))):
            self.put_stub()
        mtu = MockTimetableUpdater(self.course.search)
        with mock.patch('time.time', mock.MagicMock(return_value=(self.timestamp + 1))):
            with mock.patch("data_access.views.update_timetables", mtu):
                response = self.get()
        self.assertEqual(mtu.called, 0)
        self.got_stub(response)

    def test_timetable_expired_offered(self):
        """
        The timetable is in the DB and the timestamp is expired.
        The course is offered however,
        so it should be double-checked and found.
        """
        with mock.patch('time.time', mock.MagicMock(return_value=(self.timestamp - 1))):
            self.put_tt()
        with mock.patch('time.time', mock.MagicMock(return_value=(self.timestamp))):
            self.update_timestamp()
        mtu = MockTimetableUpdater(self.course.search, self.course.norm)
        with mock.patch('time.time', mock.MagicMock(return_value=(self.timestamp + 1))):
            with mock.patch("data_access.views.update_timetables", mtu):
                response = self.get()
        self.assertEqual(mtu.called, 1)
        self.got_tt(response)

    def test_stub_expired_offered(self):
        """
        The stub is in the DB and the timestamp is expired.
        The course is offered however,
        so it should be double-checked and found.
        """
        with mock.patch('time.time', mock.MagicMock(return_value=(self.timestamp - 1))):
            self.put_stub()
        with mock.patch('time.time', mock.MagicMock(return_value=(self.timestamp))):
            self.update_timestamp()
        mtu = MockTimetableUpdater(self.course.search, self.course.norm)
        with mock.patch('time.time', mock.MagicMock(return_value=(self.timestamp + 1))):
            with mock.patch("data_access.views.update_timetables", mtu):
                response = self.get()
        self.assertEqual(mtu.called, 1)
        self.got_tt(response)

    def test_timetable_expired_notoffered(self):
        """
        The timetable is in the DB and the timestamp is expired.
        The course is not offered,
        so it should be double-checked but not found.
        """
        with mock.patch('time.time', mock.MagicMock(return_value=(self.timestamp - 1))):
            self.put_tt()
        with mock.patch('time.time', mock.MagicMock(return_value=(self.timestamp))):
            self.update_timestamp()
        mtu = MockTimetableUpdater(self.course.search)
        with mock.patch('time.time', mock.MagicMock(return_value=(self.timestamp + 1))):
            with mock.patch("data_access.views.update_timetables", mtu):
                response = self.get()
        self.assertEqual(mtu.called, 1)
        self.got_stub(response)
        self.stub_in_db()

    def test_stub_expired_notoffered(self):
        """
        The stub is in the DB and the timestamp is expired.
        The course is not offered,
        so it should be double-checked but not found.
        """
        with mock.patch('time.time', mock.MagicMock(return_value=(self.timestamp - 1))):
            self.put_stub()
        with mock.patch('time.time', mock.MagicMock(return_value=(self.timestamp))):
            self.update_timestamp()
        mtu = MockTimetableUpdater(self.course.search)
        with mock.patch('time.time', mock.MagicMock(return_value=(self.timestamp + 1))):
            with mock.patch("data_access.views.update_timetables", mtu):
                response = self.get()
        self.assertEqual(mtu.called, 1)
        self.got_stub(response)
        self.stub_in_db()

    def test_nothing_offered(self):
        """
        There is nothing in the DB.
        The course is offered however,
        so it should be double-checked and found.
        """
        mtu = MockTimetableUpdater(self.course.search, self.course.norm)
        with mock.patch("data_access.views.update_timetables", mtu):
            response = self.get()
        self.assertEqual(mtu.called, 1)
        self.got_tt(response)

    def test_nothing_notoffered(self):
        """
        There is nothing in the DB.
        The course is not offered however,
        so it should be double-checked and not found.
        """
        mtu = MockTimetableUpdater(self.course.search)
        with mock.patch("data_access.views.update_timetables", mtu):
            response = self.get()
        self.assertEqual(mtu.called, 1)
        self.got_stub(response)
        self.stub_in_db()

    def test_term_not_available(self):
        """
        The timetable is in the DB and the timestamp is old but the term is no longer available.

        Since the term is unavailble the historic data should be returned.
        """
        self.put_tt()
        self.update_timestamp()
        AvailableTerms.objects.all().delete()
        mtu = MockTimetableUpdater(self.course.search)
        with mock.patch("data_access.views.update_timetables", mtu):
            response = self.get()
        self.assertEqual(mtu.called, 0)
        self.got_tt(response)

class ScheduleViewSetTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        """
        Setup the database and client that will be needed in this set of tests.

        This method populates the database with thre required courses for this test,
        since this endpoint does not modify any data in the database (it is read only)
        we can set everything up once at the start.
        """
        cls.courses = {
            course: CourseData(course)
            for course in [
                "CSI2120",
                "MAT3120",
            ]
        }
        cls.courses['CSI2101'] = CourseData('CSI2101', term='fall')
        for c in cls.courses.values():
            c.upsert()

    def setUp(self):
        self.user = create_test_user()
        self.client.cookies["access_token"] = build_jwt(
            sub = self.user.uuid,
            scopes = ['profile'],
            client_id = 'webapp',
        )

    def test_create_simple(self):
        """
        Simple create with a single timetable component
        """
        post_data = {
            "name": "My test Schedule",
            "in_calendar": False,
            "term": self.courses["CSI2120"].model.term_obj,
            "timetable_components": {
                str(self.courses["CSI2120"].model.id): {
                    "id": self.courses["CSI2120"].model.id,
                    "sections": {
                        "A": [
                            "A00-LEC-0",
                        ]
                    }
                },
            },
        }
        res = self.client.post(
            "/api/da/v1/schedules/",
            content_type="application/json",
            data=post_data
        )
        self.assertEqual(res.status_code, 201)
        data = res.json()["data"]
        data.pop("id")
        expected = deepcopy(post_data)
        expected['timetable_components'][str(self.courses["CSI2120"].model.id)] = {
            **expected['timetable_components'][str(self.courses["CSI2120"].model.id)],
            **self.courses["CSI2120"].search,
        }
        self.assertDeepEqual(data, expected)

    def test_create_no_name(self):
        """
        Simple create but without supplying a name

        Checks that:
            1. The status code is 201
            1. The response has an empty string as the name
            1. the rest of the body is the same
        """
        post_data = {
            "in_calendar": False,
            "term": self.courses["CSI2120"].model.term_obj,
            "timetable_components": {
                str(self.courses["CSI2120"].model.id): {
                    "id": self.courses["CSI2120"].model.id,
                    "sections": {
                        "A": [
                            "A00-LEC-0",
                        ]
                    }
                },
            },
        }
        res = self.client.post(
            "/api/da/v1/schedules/",
            content_type="application/json",
            data=post_data
        )
        self.assertEqual(res.status_code, 201)
        data = res.json()["data"]
        data.pop("id")
        expected = deepcopy(post_data)
        expected['name'] = ''
        expected['timetable_components'][str(self.courses["CSI2120"].model.id)] = {
            **expected['timetable_components'][str(self.courses["CSI2120"].model.id)],
            **self.courses["CSI2120"].search,
        }
        self.assertDeepEqual(data, expected)

    def test_create_multiple_courses(self):
        """
        Simple create with multiple timetable components
        """
        post_data = {
            "name": "",
            "in_calendar": False,
            "term": self.courses["CSI2120"].model.term_obj,
            "timetable_components": {
                str(self.courses["CSI2120"].model.id): {
                    "id": self.courses["CSI2120"].model.id,
                    **self.courses["CSI2120"].search,
                    "sections": {
                        "A": [
                            "A00-LEC-0",
                            "A01-LAB",
                            "A06-TUT",
                        ],
                    },
                },
                str(self.courses["MAT3120"].model.id): {
                    "id": self.courses["MAT3120"].model.id,
                    **self.courses["MAT3120"].search,
                    "sections": {
                        "A": [
                            "A00-LEC-0",
                            "A00-LEC-1",
                        ],
                    },
                },
            },
        }
        res = self.client.post(
            "/api/da/v1/schedules/",
            content_type="application/json",
            data=post_data
        )
        self.assertEqual(res.status_code, 201)
        data = res.json()["data"]
        data.pop("id")
        self.assertDeepEqual(data, post_data)

    def test_create_no_components(self):
        """
        Create schedule with no components

        Make sure that we get back a 201
        """
        post_data = {
            "name": "My test Schedule",
            "in_calendar": False,
            "term": self.courses["CSI2120"].model.term_obj,
            "timetable_components": {},
        }
        res = self.client.post(
            "/api/da/v1/schedules/",
            content_type="application/json",
            data=post_data
        )
        self.assertEqual(res.status_code, 201)

    def test_create_in_calendar(self):
        """
        Simple create directly to calendar
        """
        post_data = {
            "name": "",
            "in_calendar": True,
            "term": self.courses["CSI2120"].model.term_obj,
            "timetable_components": {
                str(self.courses["CSI2120"].model.id): {
                    "id": self.courses["CSI2120"].model.id,
                    **self.courses["CSI2120"].search,
                    "sections": {
                        "A": [
                            "A00-LEC-0",
                        ],
                    },
                },
            },
        }
        res = self.client.post(
            "/api/da/v1/schedules/",
            content_type="application/json",
            data=post_data
        )
        self.assertEqual(res.status_code, 201)
        data = res.json()["data"]
        data.pop("id")
        self.assertDeepEqual(data, post_data)

    def test_create_in_calendar_with_existing_schedule(self):
        """
        Simple create directly to calendar when there exists a term in that calendar already.

        The expected behavior in this circumstance it to move the current calendar term to a draft.
        """
        # Create the calender and populate with a term
        cal = Calendar.objects.create(user_id=self.user.id, is_primary=True)
        CalendarComponents.objects.create(
            calendar = cal,
            timetable = self.courses['CSI2120'].model,
            section_id = 'A',
            component_id = 'A00-LEC-0',
        )
        old_sched = Schedule.objects.create(
            calendar=cal,
            term=self.courses['CSI2120'].model.term,
            year=self.courses['CSI2120'].model.year,
        )

        post_data = {
            "name": "",
            "in_calendar": True,
            "term": self.courses["MAT3120"].model.term_obj,
            "timetable_components": {
                str(self.courses["MAT3120"].model.id): {
                    "id": self.courses["MAT3120"].model.id,
                    **self.courses["MAT3120"].search,
                    "sections": {
                        "A": [
                            "A00-LEC-0",
                        ],
                    },
                },
            },
        }
        res = self.client.post(
            "/api/da/v1/schedules/",
            content_type="application/json",
            data=post_data
        )
        self.assertEqual(res.status_code, 201)
        data = res.json()["data"]
        data.pop("id")
        self.assertDeepEqual(data, post_data)

        old_sched.refresh_from_db()
        self.assertEqual(len(old_sched.calendar.components.all()), 1)
        self.assertEqual(
            old_sched.calendar.components.first().timetable.id,
            self.courses['CSI2120'].model.id
        )

    def test_simple_retrieve(self):
        """
        Fetch a schedule for the current user.

        Checks that:
            1. The status code is 200
            1. The result is in the right format
        """
        post_data = {
            "name": "My test Schedule",
            "in_calendar": False,
            "term": self.courses["CSI2120"].model.term_obj,
            "timetable_components": {
                str(self.courses["CSI2120"].model.id): {
                    "id": self.courses["CSI2120"].model.id,
                    "sections": {
                        "A": [
                            "A00-LEC-0",
                        ]
                    }
                },
            },
        }
        id = create_schedule(post_data, self.user.uuid)['id']
        res = self.client.get("/api/da/v1/schedules/{}/".format(id))
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        data.pop("id")
        expected = deepcopy(post_data)
        expected['timetable_components'][str(self.courses["CSI2120"].model.id)] = {
            **expected['timetable_components'][str(self.courses["CSI2120"].model.id)],
            **self.courses["CSI2120"].search,
        }
        self.assertDeepEqual(data, expected)

    def test_list_from_current_user(self):
        """
        Fetch a schedule for the current user.

        Checks that:
            1. The status code is 200
            1. The result is a list of schedules with length equal
                the number of schedules the user has.
        """
        post_data = {
            "name": "My test Schedule",
            "in_calendar": False,
            "term": self.courses["CSI2120"].model.term_obj,
            "timetable_components": {
                str(self.courses["CSI2120"].model.id): {
                    "id": self.courses["CSI2120"].model.id,
                    "sections": {
                        "A": [
                            "A00-LEC-0",
                        ]
                    }
                },
            },
        }
        create_schedule(post_data, self.user.uuid)
        create_schedule(post_data, create_test_user().uuid)
        res = self.client.get("/api/da/v1/schedules/?user_uuid={}".format(self.user.uuid))
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(len(data), 1)

    def test_list_from_current_user_in_calendar(self):
        """
        Fetch a schedule for the current user.

        Checks that:
            1. The status code is 200
            1. The result is a list of schedules with length equal
                the number of schedules in the user's calendar.
            1. Check that the schedule returned is the right one.
        """
        sched_1 = {
            "name": "My test Schedule",
            "in_calendar": True,
            "term": self.courses["CSI2120"].model.term_obj,
            "timetable_components": {
                str(self.courses["CSI2120"].model.id): {
                    "id": self.courses["CSI2120"].model.id,
                    "sections": {
                        "A": [
                            "A00-LEC-0",
                        ]
                    }
                },
            },
        }
        sched_2 = {
            "name": "",
            "in_calendar": False,
            "term": self.courses["MAT3120"].model.term_obj,
            "timetable_components": {
                str(self.courses["MAT3120"].model.id): {
                    "id": self.courses["MAT3120"].model.id,
                    "sections": {
                        "A": [
                            "A00-LEC-0",
                        ],
                    },
                },
            },
        }
        create_schedule(sched_1, self.user.uuid)
        create_schedule(sched_2, self.user.uuid)
        res = self.client.get("/api/da/v1/schedules/?user_uuid={}&in_calendar=true".format(self.user.uuid))
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['name'], 'My test Schedule')

    def test_filter_by_invalid_uuid(self):
        """
        Test that filtering by an invalid uuid returns a 400
        """
        res = self.client.get("/api/da/v1/schedules/?user_uuid={}".format('asdf'))
        self.assertEqual(res.status_code, 400)

    def test_simple_delete(self):
        """
        Delete a schedule for the current user.

        Checks that:
            1. The status code is 204
        """
        sched = {
            "name": "My test Schedule",
            "in_calendar": False,
            "term": self.courses["CSI2120"].model.term_obj,
            "timetable_components": {
                str(self.courses["CSI2120"].model.id): {
                    "id": self.courses["CSI2120"].model.id,
                    "sections": {
                        "A": [
                            "A00-LEC-0",
                        ]
                    }
                },
            },
        }
        id = create_schedule(sched, self.user.uuid)['id']
        res = self.client.delete("/api/da/v1/schedules/{}/".format(id))
        self.assertEqual(res.status_code, 204)

    def test_cannot_delete_from_another_user(self):
        """
        Attempt to delete a schedule from another user

        Checks that:
            1. The status code is 403
        """
        sched = {
            "name": "My test Schedule",
            "in_calendar": False,
            "term": self.courses["CSI2120"].model.term_obj,
            "timetable_components": {
                str(self.courses["CSI2120"].model.id): {
                    "id": self.courses["CSI2120"].model.id,
                    "sections": {
                        "A": [
                            "A00-LEC-0",
                        ]
                    }
                },
            },
        }
        id = create_schedule(sched, create_test_user().uuid)['id']
        res = self.client.delete("/api/da/v1/schedules/{}/".format(id))
        self.assertEqual(res.status_code, 404) # 404 because as far as they know the schedule doesn't exist

    def test_out_of_calendar_patch(self):
        """
        Update a schedule out of the calendar using PATCH.

        Checks that:
            1. The status code is 200
            1. The schedule is now in the calendar
            1. The id is the same
        """
        sched_data = {
            "name": "My test Schedule",
            "in_calendar": True,
            "term": self.courses["CSI2120"].model.term_obj,
            "timetable_components": {
                str(self.courses["CSI2120"].model.id): {
                    "id": self.courses["CSI2120"].model.id,
                    "sections": {
                        "A": [
                            "A00-LEC-0",
                        ]
                    }
                },
            },
        }
        id = create_schedule(sched_data, self.user.uuid)['id']
        res = self.client.patch(
            "/api/da/v1/schedules/{}/".format(id),
            data={"in_calendar": False},
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()['data']
        self.assertFalse(data['in_calendar'])
        self.assertEqual(data['id'], id)

    def test_move_to_calendar_patch(self):
        """
        Update a schedule so that it's moved to the calendar using patch

        Checks that:
            1. The status code is 200
            1. The schedule is now in the calendar
            1. The id is the same
        """
        sched_data = {
            "name": "My test Schedule",
            "in_calendar": False,
            "term": self.courses["CSI2120"].model.term_obj,
            "timetable_components": {
                str(self.courses["CSI2120"].model.id): {
                    "id": self.courses["CSI2120"].model.id,
                    "sections": {
                        "A": [
                            "A00-LEC-0",
                        ]
                    }
                },
            },
        }
        id = create_schedule(sched_data, self.user.uuid)['id']
        res = self.client.patch(
            "/api/da/v1/schedules/{}/".format(id),
            data={"in_calendar": True},
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()['data']
        self.assertTrue(data['in_calendar'])
        self.assertEqual(data['id'], id)

    def test_move_to_calendar_move_existing_patch(self):
        """
        Update a schedule so that it's moved to the calendar and moves existing schedule out.

        Checks that:
            1. The status code is 200
            1. The old calendar schedule is now a draft
        """
        # Create the calender and populate with a term
        cal = Calendar.objects.create(user_id=self.user.id, is_primary=True)
        CalendarComponents.objects.create(
            calendar = cal,
            timetable = self.courses['CSI2120'].model,
            section_id = 'A',
            component_id = 'A00-LEC-0',
        )
        old_cal_sched = Schedule.objects.create(
            calendar=cal,
            term=self.courses['CSI2120'].model.term,
            year=self.courses['CSI2120'].model.year,
        )

        new_sched_data = {
            "name": "",
            "in_calendar": False,
            "term": self.courses["MAT3120"].model.term_obj,
            "timetable_components": {
                str(self.courses["MAT3120"].model.id): {
                    "id": self.courses["MAT3120"].model.id,
                    **self.courses["MAT3120"].search,
                    "sections": {
                        "A": [
                            "A00-LEC-0",
                        ],
                    },
                },
            },
        }
        new_cal_sched = create_schedule(new_sched_data, self.user.uuid)
        res = self.client.patch(
            "/api/da/v1/schedules/{}/".format(new_cal_sched['id']),
            data={"in_calendar": True},
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()['data']
        self.assertTrue(data['in_calendar'])
        self.assertEqual(data['id'], new_cal_sched['id'])

        old_cal_sched.refresh_from_db()
        self.assertFalse(old_cal_sched.calendar.is_primary)
        self.assertEqual(len(old_cal_sched.calendar.components.all()), 1)
        self.assertEqual(
            old_cal_sched.calendar.components.first().timetable.id,
            self.courses['CSI2120'].model.id
        )

    def test_patch_name(self):
        """
        Update a schedule name using PATCH.

        Checks that:
            1. The status code is 200
            1. The schedule name was updated
        """
        new_name = "my new schedule name"
        sched_data = {
            "name": "My test Schedule",
            "in_calendar": False,
            "term": self.courses["CSI2120"].model.term_obj,
            "timetable_components": {
                str(self.courses["CSI2120"].model.id): {
                    "id": self.courses["CSI2120"].model.id,
                    "sections": {
                        "A": [
                            "A00-LEC-0",
                        ]
                    }
                },
            },
        }
        id = create_schedule(sched_data, self.user.uuid)['id']
        res = self.client.patch(
            "/api/da/v1/schedules/{}/".format(id),
            data={"name": new_name},
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()['data']
        self.assertEqual(data['name'], new_name)

class CalendarShareViewSetTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.courses = {
            course: CourseData(course)
            for course in [
                "CSI2120",
                "MAT3120",
            ]
        }
        for c in cls.courses.values():
            c.upsert()

        cls.sched_data = {
            "name": "My test Schedule",
            "in_calendar": True,
            "term": cls.courses["CSI2120"].model.term_obj,
            "timetable_components": {
                str(cls.courses["CSI2120"].model.id): {
                    "id": cls.courses["CSI2120"].model.id,
                    "sections": {
                        "A": [
                            "A00-LEC-0",
                        ]
                    }
                },
            },
        }
        cls.main_user = create_test_user()
        cls.other_user = create_test_user()

    def setUp(self):
        self.client.cookies["access_token"] = build_jwt(
            sub = self.main_user.uuid,
            scopes = ['profile'],
            client_id = 'webapp',
        )

    def test_simple_create(self):
        """
        Create a schedule share instance.

        Checks that:
            1. The status code is 201
            1. The result is in the right format
        """
        res = self.client.post(
            "/api/da/v1/calendar-shares/",
            content_type="application/json",
            data={
                "email": self.other_user.emails.all().first().email_address,
            },
        )
        self.assertEqual(res.status_code, 201)
        data = res.json()["data"]
        self.assertEqual(
            data,
            {
                "user": UserSerializer(self.other_user).data,
            }
        )

    def test_cannot_create_if_email_doesnt_exist(self):
        """
        Fail to create a schedule share instance if there is no user
        matching the requested email.

        Checks that:
            1. The status code is 400
        """
        res = self.client.post(
            "/api/da/v1/calendar-shares/",
            content_type="application/json",
            data={
                "email": "no_a_real_email@test.com",
            },
        )
        self.assertEqual(res.status_code, 400)

    def test_cannot_create_two_shares_to_same_user(self):
        """
        Test that the user cannot share twice to the same user.

        Checks that:
            1. The status code is 400
        """
        CalendarShare.objects.create(
            user=self.other_user,
            calendar=Calendar.objects.create(user=self.main_user, is_primary=True)
        )
        res = self.client.post(
            "/api/da/v1/calendar-shares/",
            content_type="application/json",
            data={
                "email": self.other_user.emails.all().first().email_address,
            },
        )
        self.assertEqual(res.status_code, 400)

    def test_cannot_share_with_self(self):
        """
        Test that the user cannot share with themselves.

        Checks that:
            1. The status code is 400
        """
        res = self.client.post(
            "/api/da/v1/calendar-shares/",
            content_type="application/json",
            data={
                "email": self.main_user.emails.all().first().email_address,
            },
        )
        self.assertEqual(res.status_code, 400)

    def test_simple_delete(self):
        """
        Delete a CaldendarShare instance.

        Checks that:
            1. The status code is 204
        """
        CalendarShare.objects.create(
            user=self.other_user,
            calendar=Calendar.objects.create(user=self.main_user, is_primary=True)
        )
        res = self.client.delete(
            "/api/da/v1/calendar-shares/{}/".format(self.other_user.uuid),
        )
        self.assertEqual(res.status_code, 204)

    def test_simple_delete(self):
        """
        Delete a CaldendarShare when the person being shared to
        has had multiple calendars shared with them

        This ensures that the queryset is being properly filtered
        so that we cannot delete content from other users.

        Checks that:
            1. The status code is 204
        """
        CalendarShare.objects.create(
            user=self.other_user,
            calendar=Calendar.objects.create(user=self.main_user, is_primary=True)
        )
        CalendarShare.objects.create(
            user=self.other_user,
            calendar=Calendar.objects.create(user=create_test_user(), is_primary=True)
        )
        res = self.client.delete(
            "/api/da/v1/calendar-shares/{}/".format(self.other_user.uuid),
        )
        self.assertEqual(res.status_code, 204)

    def test_can_view_schedule(self):
        """
        Test that a user can view another user's schedule if they share

        Checks that:
            1. Before sharing if we query by user we get no schedules
            1. After sharing:
                1. The status code is 200
                1. We get one schedule for the same query
        """
        create_schedule(self.sched_data, self.other_user.uuid)
        res = self.client.get(
            "/api/da/v1/schedules/?user_uuid={}".format(self.other_user.uuid),
        )
        data = res.json()["data"]
        self.assertEqual(len(data), 0)
        CalendarShare.objects.create(
            user=self.main_user,
            calendar=Calendar.objects.get(user_id=self.other_user.id, is_primary=True)
        )
        res = self.client.get(
            "/api/da/v1/schedules/?user_uuid={}".format(self.other_user.uuid),
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(len(data), 1)

    def test_can_view_user_after_share(self):
        """
        Test that if user A shares a calendar with user B then user B can
        see user A.

        Checks that:
            1. Before sharing if we query users we get 1 user (ourself)
            1. After sharing:
                1. The status code is 200
                1. We get 2 users
        """
        create_schedule(self.sched_data, self.other_user.uuid)
        res = self.client.get("/api/da/v1/users/")
        data = res.json()["data"]
        self.assertEqual(len(data), 1)
        CalendarShare.objects.create(
            user=self.main_user,
            calendar=Calendar.objects.get(user_id=self.other_user.id, is_primary=True)
        )
        res = self.client.get("/api/da/v1/users/")
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(len(data), 2)

    def test_can_view_user_after_share(self):
        """
        Test that if user A shares a calendar with user B then user A can
        see user B.

        Checks that:
            1. Before sharing if we query users we get 1 user (ourself)
            1. After sharing:
                1. The status code is 200
                1. We get 2 users
        """
        create_schedule(self.sched_data, self.main_user.uuid)
        res = self.client.get("/api/da/v1/users/")
        data = res.json()["data"]
        self.assertEqual(len(data), 1)
        CalendarShare.objects.create(
            user=self.other_user,
            calendar=Calendar.objects.get(user_id=self.main_user.id, is_primary=True)
        )
        res = self.client.get("/api/da/v1/users/")
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(len(data), 2)

class ScheduleDownloadViewTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        """
        Setup the database and client that will be needed in this set of tests.

        This method populates the database with thre required courses for this test,
        since this endpoint does not modify any data in the database (it is read only)
        we can set everything up once at the start.
        """
        cls.courses = {
            course: CourseData(course)
            for course in [
                "CSI2120",
                "MAT3120",
            ]
        }
        for c in cls.courses.values():
            c.upsert()

    def test_single_component(self):
        """
        Basic sanity check that the endpoint works at it's basic functionality.
        """
        res = self.client.post(
            "/api/da/v1/schedules/download/",
            content_type="application/json",
            data=[
                {
                    **self.courses["CSI2120"].search,
                    "sections": {
                        "A": [
                            "A00-LEC-0",
                        ]
                    }
                },
            ]
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()["data"]), 1)

    def test_missing_component(self):
        """
        Make sure that a missing component gets identified.

        This test will check that:
            1. The status code is set to 206 Partial Content
            1. The data does not contain anything for the missing component
            1. The component is listed in the `failed_comps` array
            1. The format is correct in the `failed_comps` array
        """
        res = self.client.post(
            "/api/da/v1/schedules/download/",
            content_type="application/json",
            data=[
                {
                    **self.courses["CSI2120"].search,
                    "sections": {
                        "A": [
                            "A00-LEC-0",
                            "A99-LEC-0",
                        ]
                    }
                },
            ]
        )
        self.assertEqual(res.status_code, 206)
        self.assertEqual(len(res.json()["data"]), 1)
        self.assertEqual(len(res.json()["failed_comps"]), 1)
        self.assertDeepEqual(
            res.json()["failed_comps"][0],
            {
                "school": "uottawa",
                "year": 2020,
                "term": "winter",
                "subject_code": "CSI",
                "course_code": "2120",
                "section": "A",
                "component": "A99-LEC-0"
            }
        )

    def test_no_components_found(self):
        """
        Make sure that the response is correct if no components were found.

        This test will check that:
            1. The status code is set to 404 Not Found
            1. The data does not contain anything
            1. All components are listed in the `failed_comps` array
        """
        res = self.client.post(
            "/api/da/v1/schedules/download",
            content_type="application/json",
            data=[
                {
                    **self.courses["CSI2120"].search,
                    "sections": {
                        "A": [
                            "A99-LEC-0",
                        ]
                    }
                },
            ]
        )
        self.assertEqual(res.status_code, 404)
        self.assertEqual(len(res.json()["data"]), 0)
        self.assertEqual(len(res.json()["failed_comps"]), 1)

    def test_multiple_courses(self):
        """
        Check that with multiple courses with multiple components the endpoint
        still behaves properly.
        """
        res = self.client.post(
            "/api/da/v1/schedules/download/",
            content_type="application/json",
            data=[
                {
                    **self.courses["CSI2120"].search,
                    "sections": {
                        "A": [
                            "A00-LEC-0",
                            "A01-LAB",
                            "A06-TUT",
                        ]
                    }
                },
                {
                    **self.courses["MAT3120"].search,
                    "sections": {
                        "A": [
                            "A00-LEC-0",
                            "A00-LEC-1",
                        ]
                    }
                },
            ]
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()["data"]), 5)

    def test_missing_course(self):
        """
        Check that when a course is missing, all it's components are listed
        in the `failed_comps` array.
        """
        res = self.client.post(
            "/api/da/v1/schedules/download/",
            content_type="application/json",
            data=[
                {
                    **self.courses["CSI2120"].search,
                    "sections": {
                        "A": [
                            "A00-LEC-0",
                        ]
                    }
                },
                {
                    **CourseData("MAT3121").search,
                    "sections": {
                        "A": [
                            "A00-LEC-0",
                            "A00-LEC-1",
                        ]
                    }
                },
            ]
        )
        self.assertEqual(res.status_code, 206)
        self.assertEqual(len(res.json()["data"]), 1)
        self.assertEqual(len(res.json()["failed_comps"]), 2)

    def test_search_by_id(self):
        """
        Test that the endpoint works when querying by course id rather than by the unique identifier.
        """
        res = self.client.post(
            "/api/da/v1/schedules/download/",
            content_type="application/json",
            data=[
                {
                    "id": self.courses["CSI2120"].model.id,
                    "sections": {
                        "A": [
                            "A00-LEC-0",
                        ]
                    }
                },
            ]
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.json()["data"]), 1)

    def test_search_by_id_not_found(self):
        """
        Test that the endpoint works when querying by course id rather than by the unique identifier.
        """
        res = self.client.post(
            "/api/da/v1/schedules/download/",
            content_type="application/json",
            data=[
                {
                    "id": 1000000, # This just needs to be arbitrarily large so we never have an id in test data that matches
                    "sections": {
                        "A": [
                            "A00-LEC-0",
                        ]
                    }
                },
            ]
        )
        self.assertEqual(res.status_code, 404)
        self.assertEqual(len(res.json()["data"]), 0)
        self.assertEqual(len(res.json()["failed_comps"]), 1)
        self.assertEqual(
            res.json()["failed_comps"][0],
            {
                "id": 1000000,
                "section": "A",
                "component": "A00-LEC-0"
            }
        )


class AvailableTermsViewsetTest(TestCase):
    '''Test the AvailableTerms Viewset'''

    def setUp(self):
        self.term = {
            "term": "winter",
            "year": 2020,
        }
        AvailableTerms(**self.term).save()

    @mock.patch.dict(os.environ, {}, clear=True) # We don't want this to fail if we have test terms in dev
    def test_get(self):
        res = self.client.get('/api/da/v1/available-terms/')
        self.assertEqual(res.status_code, 200)
        data = res.json()['data']
        self.assertDeepEqual(data, [self.term])

class AvailableTermsBackendViewsetTest(TestCase):
    '''Test the AvailableTerms Viewset'''

    def to_term_dict(self, term):
        return {
                "term": term.split("-")[1],
                "year": int(term.split("-")[0]),
            }

    def to_term_dict_list(self, terms):
        return [
            self.to_term_dict(term)
            for term in terms
        ]

    def test_put_from_empty(self):
        terms = self.to_term_dict_list(["2020-winter"])
        res = self.client.put(
            '/api/da/v1/backend-available-terms/',
            content_type='application/json',
            data=terms
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertDeepEqual(data["old"], [])
        self.assertDeepEqual(data["new"], terms)

    def test_put_add_new(self):
        old_term = self.to_term_dict("2020-winter")
        AvailableTerms(**old_term).save()
        terms = self.to_term_dict_list(["2020-winter", "2020-fall"])
        res = self.client.put(
            '/api/da/v1/backend-available-terms/',
            content_type='application/json',
            data=terms
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertDeepEqual(data["old"], [old_term])
        self.assertDeepEqual(data["new"], terms)

    def test_put_remove_term(self):
        terms = self.to_term_dict_list(["2020-fall"])
        old_terms = self.to_term_dict_list(["2020-winter", "2020-fall"])
        for term in old_terms:
            AvailableTerms(**term).save()
        res = self.client.put(
            '/api/da/v1/backend-available-terms/',
            content_type='application/json',
            data=terms
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertDeepEqual(data["old"], old_terms)
        self.assertDeepEqual(data["new"], terms)

    def test_put_remove_all(self):
        old_terms = self.to_term_dict_list(["2020-winter", "2020-fall"])
        for term in old_terms:
            AvailableTerms(**term).save()
        terms = self.to_term_dict_list([])
        res = self.client.put(
            '/api/da/v1/backend-available-terms/',
            content_type='application/json',
            data=terms
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertDeepEqual(data["old"], old_terms)
        self.assertDeepEqual(data["new"], terms)

    def test_put_swap_terms(self):
        old_terms = self.to_term_dict_list(["2020-winter", "2020-fall"])
        for term in old_terms:
            AvailableTerms(**term).save()
        terms = self.to_term_dict_list(["2020-winter", "2021-fall"])
        res = self.client.put(
            '/api/da/v1/backend-available-terms/',
            content_type='application/json',
            data=terms
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertDeepEqual(data["old"], old_terms)
        self.assertDeepEqual(data["new"], terms)

class TimetableSummaryViewSetTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.courses = {
            course: CourseData(course)
            for course in [
                "CSI2120",
                "MAT3120",
                "MAT3121",
            ]
        }
        for c in cls.courses.values():
            c.upsert()

    def test_simple_code_query_format(self):
        """
        Test a simple search with only a course code

        This test can probably be removed once we normalize the database
        And no longer have to worry about doing manual json aggregation

        Checks that:
            1. The status code is 200
            1. The result contains only one element
            1. The response body matches the format of the serializer
        """
        res = self.client.get('/api/da/v1/timetables/summaries/?search=CSI2120')
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(len(data), 1)
        self.assertDeepEqual(
            TimetableSummarySerializer(self.courses['CSI2120'].model).data,
            data[0],
        )


    def test_code_search(self):
        """
        Test a simple search with only a course code

        Checks that:
            1. The status code is 200
            1. The result contains only one element
            1. The course and subject code match.
        """
        res = self.client.get('/api/da/v1/timetables/summaries/?search=CSI2120')
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["subject_code"], "CSI")
        self.assertEqual(data[0]["course_code"], "2120")

    def test_code_search_non_standard(self):
        """
        Test a search with a course code weirdly formated

        Checks that:
            1. The status code is 200
            1. The result contains only one element
            1. The course and subject code match.
        """
        res = self.client.get('/api/da/v1/timetables/summaries/?search=%20csi%202120%20') # This looks like '?search= csi 2120 '
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["subject_code"], "CSI")
        self.assertEqual(data[0]["course_code"], "2120")

    def test_no_result(self):
        """
        Test the behaviour when there's no sensible match.

        Expected behaviour is that:
            1. A 404 is returned
            1. No data is returned
        """
        res = self.client.get('/api/da/v1/timetables/summaries/?search=foobar')
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(len(data), 0)

    def test_title_search(self):
        """
        Test a simple search with a partial title

        Checks that:
            1. The status code is 200
            1. The result contains only one element
            1. The title contains the query text
        """
        query="paradigms"
        res = self.client.get('/api/da/v1/timetables/summaries/?search={}'.format(query))
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(len(data), 1)
        self.assertIn(query.lower(), data[0]["course_name"].lower())

    def test_title_search_multiple_results(self):
        """
        Test a search with multiple results

        Checks that:
            1. The status code is 200
            1. The result contains two elements
            1. The title contains the query text
        """
        query="analysis"
        res = self.client.get('/api/da/v1/timetables/summaries/?search={}'.format(query))
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(len(data), 2)
        for course in data:
            self.assertIn(query.lower(), course["course_name"].lower())

    def test_term_filter_found(self):
        """
        Test that if a term filter was provided only those terms are returned

        Checks that:
            1. The status code is 200
            1. The result contains one elements
        """
        res = self.client.get('/api/da/v1/timetables/summaries/?search=CSI2120&term_id=2020-winter')
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(len(data), 1)

    def test_term_filter_not_found(self):
        """
        Test that if a term filter was provided only those terms are returned

        Checks that:
            1. The status code is 200
            1. The result contains one elements
            1. The result contains one even though a match exists in another term
            1. The result is the course from the correct term
        """
        fall_course = CourseData('CSI2120', 'fall').upsert()
        res = self.client.get('/api/da/v1/timetables/summaries/?search=CSI2120&term_id=2020-fall')
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(len(data), 1)
        self.assertDeepEqual(
            TimetableSummarySerializer(fall_course).data,
            data[0],
        )

    def test_term_filter_multiple(self):
        """
        Test that we can provide multiple term_ids

        Checks that:
            1. The status code is 200
            1. The result contains 1 element
        """
        res = self.client.get('/api/da/v1/timetables/summaries/?search=CSI2120&term_id=2020-winter,2020-fall')
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(len(data), 1)

    def test_term_filter_bad_query_param(self):
        """
        Test that we can provide multiple term_ids

        Checks that:
            1. The status code is 400
        """
        res = self.client.get('/api/da/v1/timetables/summaries/?search=CSI2120&term_id=2020-winter,fake-param')
        self.assertEqual(res.status_code, 400)

    def test_does_not_return_stubs(self):
        """
        Test that if we have a timetable stub it's not returned

        Checks that:
            1. The status code is 200
            1. The result contains no elements
        """
        put_timetable_stub(self.courses['CSI2120'].search)
        res = self.client.get('/api/da/v1/timetables/summaries/?search=CSI2120')
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(len(data), 0)


class TestUsersForAuthService(TestCase):
    def setUp(self):
        self.client.cookies["access_token"] = build_jwt(
            scopes=['service'],
            client_id='auth',
        )
        self.test_user = {
            "providers": [
                {
                    "provider": "google",
                    "provider_uid": "111111111111111111111"
                }
            ],
            "emails": [
                {
                    "email_address": "test@example.com"
                }
            ],
            "given_name": "Guy",
            "family_name": "Some",
            "disp_name": "Some Guy"
        }

    def post_user(self, data):
        '''
        Send a request to create a user at the reate user endpoint.

        This will take care of setting the request parameters such
        as URL and headers.
        '''
        return self.client.post(
            '/api/da/v1/users/',
            data=data,
            content_type="application/json",
        )


    def test_create_user(self):
        """
        Test that we can create a user

        Checks that:
            1. The status code is 201
            1. The return value contains an id for the created user
            1. The return value contains a UUID for the created user
            1. The return value contains all the user's information
        """
        res = self.post_user(self.test_user)

        self.assertEqual(res.status_code, 201)
        data = res.json()["data"]
        self.assertTrue(isinstance(data.pop('uuid'), str))
        self.assertDeepEqual(data, self.test_user)

    def test_create_user_no_disp_name(self):
        """
        Test that we can create a user with no display name

        Checks that:
            1. The status code is 201
            1. The return value contains an id for the created user
            1. The return value contains all the user's information
        """
        post_data = deepcopy(self.test_user)
        post_data.pop("disp_name")
        res = self.post_user(post_data)

        self.assertEqual(res.status_code, 201)
        data = res.json()["data"]
        self.assertTrue(isinstance(data.pop('uuid'), str))
        self.assertDeepEqual(data, {"disp_name": None, **post_data})

    def test_create_user_no_email(self):
        """
        Test that we cannot create a user with no email

        Checks that:
            1. The status code is 400
        """
        post_data = deepcopy(self.test_user)
        post_data["emails"] = []
        res = self.post_user(post_data)

        self.assertEqual(res.status_code, 400)

    def test_create_user_same_SSO_id(self):
        """
        Test that we cannot create a user with the same SSO and SSO_uid
        as an existing user

        Checks that:
            1. The creating the first user is 201 status
            1. The creating the second user with same ID is 400
        """
        post_data = deepcopy(self.test_user)
        res = self.post_user(post_data)

        self.assertEqual(res.status_code, 201)

        post_data = deepcopy(self.test_user)
        # Change the email to make sure it doesn't blow up because of that
        post_data["emails"][0]["email_address"] = "second@test.com"
        res = self.client.post(
            '/api/da/v1/users/',
            data=post_data,
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 400)

    def test_create_user_same_email(self):
        """
        Test that we cannot create a user with the same email address
        as an existing user

        Checks that:
            1. The creating the first user is 201 status
            1. The creating the second user with same email is 400
        """
        post_data = deepcopy(self.test_user)
        res = self.post_user(post_data)

        self.assertEqual(res.status_code, 201)

        post_data = deepcopy(self.test_user)
        post_data["providers"][0]["provider_uid"] = "222222222222222222222"
        res = self.post_user(post_data)

        self.assertEqual(res.status_code, 400)

    def test_get_user(self):
        """
        Test that we can get users from the database

        Checks that:
            1. The status code is 200
            1. The result contains only one element
            1. The data format matches the specified one
        """
        create_test_user(deepcopy(self.test_user))
        res = self.client.get('/api/da/v1/users/')
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(len(data), 1)
        self.assertTrue(isinstance(data[0].pop('uuid'), str)) # Strip the UUID since it's auto generated so we don't know what it is
        self.assertDeepEqual(data[0], self.test_user)

    def test_get_user_by_email(self):
        """
        Test get user by email address

        Checks that:
            1. The status code is 200
            1. The result contains only one element
            1. The email of the returned element matches
        """
        create_test_user(deepcopy(self.test_user))
        second = deepcopy(self.test_user)
        second["emails"][0]["email_address"] = "second@test.com"
        second["providers"][0]["provider_uid"] = "222222222222222222222"
        create_test_user(second)

        res = self.client.get('/api/da/v1/users/?email=test%40example.com')
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["emails"][0]["email_address"], "test@example.com")

    def test_get_user_email_in_list(self):
        """
        Test get user in a list of emails

        Checks that:
            1. The status code is 200
            1. The result contains only one element
            1. The data format matches the specified one
        """
        create_test_user(deepcopy(self.test_user))
        second = deepcopy(self.test_user)
        second["emails"][0]["email_address"] = "second@test.com"
        second["providers"][0]["provider_uid"] = "222222222222222222222"
        create_test_user(second)

        res = self.client.get('/api/da/v1/users/?email=test%40example.com,nota%40match.com')
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["emails"][0]["email_address"], "test@example.com")

    def test_get_user_by_provider_uid(self):
        """
        Test get user by provider and provider_uid

        Checks that:
            1. The status code is 200
            1. The result contains only one element
            1. The provider and provider_uid of the returned element match
        """
        create_test_user(deepcopy(self.test_user))
        second = deepcopy(self.test_user)
        second["emails"][0]["email_address"] = "second@test.com"
        second["providers"][0]["provider_uid"] = "222222222222222222222"
        create_test_user(second)

        res = self.client.get('/api/da/v1/users/?provider=google&provider_uid=111111111111111111111')
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["providers"][0]["provider"], "google")
        self.assertEqual(data[0]["providers"][0]["provider_uid"], "111111111111111111111")

class TestUsersForWebapp(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.courses = {
            course: CourseData(course)
            for course in [
                "CSI2120",
                "MAT3120",
            ]
        }
        for c in cls.courses.values():
            c.upsert()

        cls.sched_data = {
            "name": "My test Schedule",
            "in_calendar": True,
            "term": cls.courses["CSI2120"].model.term_obj,
            "timetable_components": {
                str(cls.courses["CSI2120"].model.id): {
                    "id": cls.courses["CSI2120"].model.id,
                    "sections": {
                        "A": [
                            "A00-LEC-0",
                        ]
                    }
                },
            },
        }
    def setUp(self):
        user_data = {
            "providers": [
                {
                    "provider": "google",
                    "provider_uid": "111111111111111111111"
                }
            ],
            "emails": [
                {
                    "email_address": "test@example.com"
                }
            ],
            "given_name": "Guy",
            "family_name": "Some",
            "disp_name": "Some Guy"
        }
        self.main_user = create_test_user(user_data)

        other_user = UserSerializer(self.main_user).data
        other_user["providers"][0]["provider_uid"] = "222222222222222222222"
        other_user["emails"][0]["email_address"] = "second@test.com"
        self.other_user = create_test_user(other_user)

        self.client.cookies["access_token"] = build_jwt(
            sub = self.main_user.uuid,
            scopes = ['profile'],
            client_id = 'webapp',
        )

    def test_get_self_user(self):
        """
        Test that we can get the user in the JWT from the database

        Checks that:
            1. The status code is 200
            1. The data format matches the specified one
        """
        res = self.client.get('/api/da/v1/users/{}/'.format(self.main_user.uuid))
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertDeepEqual(data, UserSerializer(self.main_user).data)

    def test_cannot_get_other_user(self):
        """
        Test that we cannot get another user than the one in the JWT

        Checks that:
            1. The status code is 404
        """
        res = self.client.get('/api/da/v1/users/{}/'.format(self.other_user.uuid))
        self.assertEqual(res.status_code, 404)

    def test_get_invalid_uuid(self):
        """
        Test that getting an invalid uuid returns a 404

        Checks that:
            1. The status code is 404
        """
        res = self.client.get('/api/da/v1/users/{}/'.format('asdf'))
        self.assertEqual(res.status_code, 404)

    def test_cannot_list_all_users(self):
        """
        Test that if we try and list all users we get only ourself

        Checks that:
            1. The status code is 200
            1. The result contains only one item
        """
        res = self.client.get('/api/da/v1/users/')
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(len(data), 1)

    def test_cannot_create_users(self):
        """
        Test that we cannot create a new user

        Checks that:
            1. The status code is 403
        """
        new_user = UserSerializer(self.main_user).data
        new_user["providers"][0]["provider_uid"] = "333333333333333333333"
        new_user["emails"][0]["email_address"] = "third@test.com"
        res = self.client.post(
            '/api/da/v1/users/',
            data=new_user,
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 403)

    def test_patch_user(self):
        """
        Test that we can edit user profile info

        Checks that:
            1. The status code is 200
            1. The given name is updated
            1. The family name is updated
            1. The disp name is updated
        """
        given = "Patch"
        family = "Test"
        disp = "patch test user"
        partial_update = {
            "given_name": given,
            "family_name": family,
            "disp_name": disp,
        }
        res = self.client.patch(
            '/api/da/v1/users/{}/'.format(self.main_user.uuid),
            data=partial_update,
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(data["given_name"], given)
        self.assertEqual(data["family_name"], family)
        self.assertEqual(data["disp_name"], disp)

    def test_cannot_patch_email(self):
        """
        Test that we cannot edit email info

        Checks that:
            1. The status code is 400
        """
        partial_update = {
            "emails": [{
                "email_address": "third@test.com",
            }]
        }
        res = self.client.patch(
            '/api/da/v1/users/{}/'.format(self.main_user.uuid),
            data=partial_update,
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 400)

    def test_cannot_patch_providers(self):
        """
        Test that we cannot edit profile info

        Checks that:
            1. The status code is 400
        """
        partial_update = {
            "providers": [
                {
                    "provider": "google",
                    "provider_uid": "333333333333333333333",
                },
            ],
        }
        res = self.client.patch(
            '/api/da/v1/users/{}/'.format(self.main_user.uuid),
            data=partial_update,
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 400)

    def test_cannot_get_without_jwt(self):
        """
        Test that a 401 is returned if the user is not authenticated
        """
        res = Client().get(
            '/api/da/v1/users/',
        )
        self.assertEqual(res.status_code, 401)

    def test_delete_self(self):
        """
        Test that the user can delete themselves

        Checks that:
            1. The status code is 204
        """
        res = self.client.delete('/api/da/v1/users/{}/'.format(self.main_user.uuid))
        self.assertEqual(res.status_code, 204)

    def test_cannot_delete_other_user(self):
        """
        Test that the user cannot delete others

        Checks that:
            1. The status code is 404 since as far as they know there is no user there
        """
        res = self.client.delete('/api/da/v1/users/{}/'.format(self.other_user.uuid))
        self.assertEqual(res.status_code, 404)

    def test_filter_by_shared_by_me(self):
        """
        Test that we only get users that we have shared with.

        Checks that:
            1. The status code is 200
            1. We get only the user we shared with
        """
        create_schedule(self.sched_data, self.main_user.uuid)
        CalendarShare.objects.create(
            user=self.other_user,
            calendar=Calendar.objects.get(user_id=self.main_user.id, is_primary=True)
        )
        res = self.client.get("/api/da/v1/users/?shared_by_me=true")
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['uuid'], str(self.other_user.uuid))

    def test_filter_by_shared_with_me(self):
        """
        Test that we only get users that have shared with us.

        Checks that:
            1. The status code is 200
            1. We get only the user that has shared with us.
        """
        create_schedule(self.sched_data, self.other_user.uuid)
        CalendarShare.objects.create(
            user=self.main_user,
            calendar=Calendar.objects.get(user_id=self.other_user.id, is_primary=True)
        )
        res = self.client.get("/api/da/v1/users/?shared_with_me=true")
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['uuid'], str(self.other_user.uuid))



    ##################################################################
    # These methods will be added later but for now they are disabled
    ##################################################################

    def test_cannot_put_user(self):
        """
        Test that we cannot edit users

        Checks that:
            1. The status code is 405
        """
        new_user = UserSerializer(self.main_user).data
        new_user["providers"][0]["provider_uid"] = "333333333333333333333"
        new_user["emails"][0]["email_address"] = "third@test.com"
        res = self.client.put(
            '/api/da/v1/users/{}/'.format(self.main_user.uuid),
            data=new_user,
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 405)

class AccreditationUnitViewSetTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.au = AccreditationUnit(name="Hours CSI2")
        cls.au.save()

    def test_simple_create(self):
        """
        Test that we can create an AU

        Checks that:
            1. The status code is 201
            1. the response body matches the request plus the id
        """
        post_data = {
            "name": "Test AU",
        }
        res = self.client.post(
            '/api/da/v1/accreditation-units/',
            data=post_data,
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 201)
        data = res.json()['data']
        data.pop("id")
        self.assertDeepEqual(data, post_data)

    def test_simple_update(self):
        """
        Test that we can update the name of an AU

        Checks that:
            1. The status code is 200
            1. the response body matches the request
        """
        put_data = {
            "id": self.au.id,
            "name": "updated au name",
        }
        res = self.client.put(
            '/api/da/v1/accreditation-units/{}/'.format(self.au.id),
            data=put_data,
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 200)
        self.assertDeepEqual(
            res.json()['data'],
            put_data,
        )

    def test_list(self):
        """
        Test that we can list aus

        Checks that:
            1. The status code is 200
            1. the response is a list with one element
            1. the one element matches the AU in the db
        """
        res = self.client.get('/api/da/v1/accreditation-units/')
        self.assertEqual(res.status_code, 200)
        data = res.json()['data']
        self.assertEqual(len(data), 1)
        self.assertDeepEqual(
            AccreditationUnitSerializer(self.au).data,
            data[0],
        )

class CourseViewSetTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.course = Course(
            school="uOttawa",
            subject_code="CSI",
            course_code=2120,
            course_name="Programming Paradigms",
            description="Something about programming and paradigms",
        )
        cls.course.save()

    def test_simple_create(self):
        """
        Create a course

        Checks that:
            1. The status code is 201
            1. The result matches the output of the course serializer
        """
        post_data = {
            "school": "uOttawa",
            "subject_code": "MAT",
            "course_code": '3120',
            "course_name": "Real Analysis",
            "description": "A lot of stuff about proofs",
        }

        res = self.client.post(
            "/api/da/v1/courses/",
            data=post_data,
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 201)
        data = res.json()['data']
        data.pop('id')
        self.assertDeepEqual(post_data, data)
    
    def test_list(self):
        """
        Test that we can list courses

        Checks that:
            1. The status code is 200
            1. the response is a list with one element
            1. the one element matches the course in the db
        """
        res = self.client.get('/api/da/v1/courses/')
        self.assertEqual(res.status_code, 200)
        data = res.json()['data']
        self.assertEqual(len(data), 1)
        self.assertDeepEqual(
            CourseSerializer(self.course).data,
            data[0],
        )


class ActivityViewSetTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.au = AccreditationUnit(name="Hours CSI2")
        cls.au.save()
        cls.course = Course(
            school="uOttawa",
            subject_code="CSI",
            course_code=2120,
            course_name="Programming Paradigms",
            description="Something about programming and paradigms",
        )
        cls.course.save()
        cls.activity = Activity(course=cls.course)
        cls.activity.save()
        cls.aaa = ActivityAccreditationAssignment(
            quantity=5,
            aus=cls.au,
            activity=cls.activity,
        )
        cls.aaa.save()

    def test_simple_create(self):
        """
        Create an activity

        Checks that:
            1. The status code is 201
            1. The result has the correct course and supplied_aus objects
        """
        course = Course(
            school="uOttawa",
            subject_code="MAT",
            course_code=3120,
            course_name="Real Analysis",
            description="A lot of stuff about proofs",
        )
        course.save()

        post_data = {
            "course": course.id,
            "supplied_aus": {
                str(self.au.id): {
                    "id": self.au.id,
                    "quantity": 3,
                },
            },
        }

        res = self.client.post(
            "/api/da/v1/activities/",
            data=post_data,
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 201)
        data = res.json()['data']
        self.assertDeepEqual(
            CourseSerializer(course).data,
            data['course'],
        )
        post_data['supplied_aus'][str(self.au.id)]['name'] = self.au.name
        self.assertDeepEqual(
            post_data['supplied_aus'],
            data['supplied_aus'],
        )

    def test_update_course(self):
        """
        Update the course in an activity

        Checks that:
            1. The status code is 200
            1. The result has the correct course object
        """
        course = Course(
            school="uOttawa",
            subject_code="MAT",
            course_code=3120,
            course_name="Real Analysis",
            description="A lot of stuff about proofs",
        )
        course.save()

        put_data = {
            "course": course.id,
            "supplied_aus": {
                str(self.au.id): {
                    "id": self.au.id,
                    "quantity": 3,
                },
            },
        }

        res = self.client.put(
            "/api/da/v1/activities/{}/".format(self.activity.id),
            data=put_data,
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()['data']
        self.assertDeepEqual(
            CourseSerializer(course).data,
            data['course'],
        )

    def test_partial_update_course(self):
        """
        Update the course in an activity using patch

        Checks that:
            1. The status code is 200
            1. The result has the correct course object
        """
        course = Course(
            school="uOttawa",
            subject_code="MAT",
            course_code=3120,
            course_name="Real Analysis",
            description="A lot of stuff about proofs",
        )
        course.save()

        put_data = {
            "course": course.id,
        }

        res = self.client.patch(
            "/api/da/v1/activities/{}/".format(self.activity.id),
            data=put_data,
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()['data']
        self.assertDeepEqual(
            CourseSerializer(course).data,
            data['course'],
        )


    def test_update_supplied_aus(self):
        """
        Update the supplied_aus in an activity

        Checks that:
            1. The status code is 200
            1. The result has the correct supplied_aus object
        """
        au = AccreditationUnit(name="Hours MAT3")
        au.save()
        put_data = {
            "course": self.course.id,
            "supplied_aus": {
                str(au.id): {
                    "id": au.id,
                    "quantity": 5,
                },
            },
        }

        res = self.client.put(
            "/api/da/v1/activities/{}/".format(self.activity.id),
            data=put_data,
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()['data']

        put_data['supplied_aus'][str(au.id)]['name'] = au.name
        self.assertDeepEqual(
            put_data['supplied_aus'],
            data['supplied_aus'],
        )

    def test_partial_update_supplied_aus(self):
        """
        Update the supplied_aus in an activity using patch

        Checks that:
            1. The status code is 200
            1. The result has the correct supplied_aus object
        """
        au = AccreditationUnit(name="Hours MAT3")
        au.save()
        put_data = {
            "supplied_aus": {
                str(au.id): {
                    "id": au.id,
                    "quantity": 5,
                },
            },
        }

        res = self.client.patch(
            "/api/da/v1/activities/{}/".format(self.activity.id),
            data=put_data,
            content_type="application/json",
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()['data']

        put_data['supplied_aus'][str(au.id)]['name'] = au.name
        self.assertDeepEqual(
            put_data['supplied_aus'],
            data['supplied_aus'],
        )


    def test_simple_list(self):
        """
        Fetch the list of activities

        Checks that:
            1. The status code is 200
            1. The result is a list of activities with length 1 (our mock setup)
            1. The element in the list has a body matching the serializer output
        """
        res = self.client.get("/api/da/v1/activities/")
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(len(data), 1)
        self.assertDeepEqual(data[0], ActivitySerializer(self.activity).data)

    def test_simple_retrieve(self):
        """
        Fetch a specific activities

        Checks that:
            1. The status code is 200
            1. The element in the list has a body matching the serializer output
        """
        res = self.client.get("/api/da/v1/activities/{}/".format(self.activity.id))
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertDeepEqual(data, ActivitySerializer(self.activity).data)


class ActivitySummaryViewSetTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.au = AccreditationUnit(name="Hours CSI2")
        cls.au.save()
        cls.course = Course(
            school="uOttawa",
            subject_code="CSI",
            course_code=2120,
            course_name="Programming Paradigms",
            description="Something about programming and paradigms",
        )
        cls.course.save()
        cls.activity = Activity(course=cls.course)
        cls.activity.save()
        cls.aaa = ActivityAccreditationAssignment(
            quantity=5,
            aus=cls.au,
            activity=cls.activity,
        )
        cls.aaa.save()

    def test_simple_search_name(self):
        """
        Fetch search for a matching term in the title

        Checks that:
            1. The status code is 200
            1. The result is a list of activities with length 1 (our mock setup)
            1. The element in the list has a body matching the serializer output
        """
        res = self.client.get("/api/da/v1/activities/summaries/?search=paradigms")
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(len(data), 1)
        data[0].pop('rank') # we don't know the rank so we need to drop it
        self.assertDeepEqual(data[0], ActivitySummarySerializer(self.activity).data)

    def test_simple_search_description(self):
        """
        Fetch search for a matching term in the title

        Checks that:
            1. The status code is 200
            1. The result is a list of activities with length 1 (our mock setup)
            1. The element in the list has a body matching the serializer output
        """
        res = self.client.get("/api/da/v1/activities/summaries/?search=something")
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(len(data), 1)
        data[0].pop('rank') # we don't know the rank so we need to drop it
        self.assertDeepEqual(data[0], ActivitySummarySerializer(self.activity).data)


class AccreditationViewSetTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.accreditation = create_accreditation()

    def test_simple_create(self):
        """
        Create an accreditation

        Checks that:
            1. The status code is 201
            1. The result is the same as the post body plus the id
        """
        post_body = {
            "name": "My test Accreditation",
            "description": "I need some lorem ipsum to put here",
            "required_aus": {}
        }
        res = self.client.post(
            "/api/da/v1/accreditations/",
            content_type='application/json',
            data=post_body,
        )
        self.assertEqual(res.status_code, 201)
        data = res.json()['data']
        data.pop('id')
        self.assertDeepEqual(data, post_body)

    def test_update_put(self):
        """
        Update an existing accreditation

        Checks that:
            1. The status code is 200
            1. The response matches the output of the serializer
        """
        # Note that we don't save these changes to the database
        self.accreditation.name = "My test Accreditation"
        self.accreditation.description = "I need some lorem ipsum to put here"

        res = self.client.put(
            "/api/da/v1/accreditations/{}/".format(self.accreditation.id),
            content_type='application/json',
            data=AccreditationSerializer(self.accreditation).data,
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(
            res.json()['data'],
            AccreditationSerializer(self.accreditation).data,
        )

    def test_delete(self):
        """
        Test that we can delete an accreditation

        Check that:
            1. The status code is 204
            1. The entity no longer exists in the db
        """
        res = self.client.delete(
            "/api/da/v1/accreditations/{}/".format(self.accreditation.id),
        )
        self.assertEqual(res.status_code, 204)
        with self.assertRaises(Accreditation.DoesNotExist):
            self.accreditation.refresh_from_db()

    def test_simple_list(self):
        """
        Fetch the list of accreditations

        Checks that:
            1. The status code is 200
            1. The result is a list of activities with length 1 (our mock setup)
            1. The element in the list has a body matching the serializer output
        """
        res = self.client.get("/api/da/v1/accreditations/")
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(len(data), 1)
        self.assertDeepEqual(data[0], AccreditationSerializer(self.accreditation).data)

    def test_simple_retrieve(self):
        """
        Fetch a specific activities

        Checks that:
            1. The status code is 200
            1. The element in the list has a body matching the serializer output
        """
        res = self.client.get("/api/da/v1/accreditations/{}/".format(self.accreditation.id))
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertDeepEqual(data, AccreditationSerializer(self.accreditation).data)


class AccreditationSummaryViewSetTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.accreditation = create_accreditation()

    def test_simple_search_name(self):
        """
        Fetch search for a matching term in the title

        Checks that:
            1. The status code is 200
            1. The result is a list of accreditations with length 1 (our mock setup)
            1. The element in the list has a body matching the serializer output
        """
        res = self.client.get("/api/da/v1/accreditations/summaries/?search=CIPS")
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(len(data), 1)
        data[0].pop('rank') # we don't know the rank so we need to drop it
        self.assertDeepEqual(data[0], AccreditationSummarySerializer(self.accreditation).data)

    def test_simple_search_description(self):
        """
        Fetch search for a matching term in the title

        Checks that:
            1. The status code is 200
            1. The result is a list of activities with length 1 (our mock setup)
            1. The element in the list has a body matching the serializer output
        """
        res = self.client.get("/api/da/v1/accreditations/summaries/?search=computer")
        self.assertEqual(res.status_code, 200)
        data = res.json()["data"]
        self.assertEqual(len(data), 1)
        data[0].pop('rank') # we don't know the rank so we need to drop it
        self.assertDeepEqual(data[0], AccreditationSummarySerializer(self.accreditation).data)
