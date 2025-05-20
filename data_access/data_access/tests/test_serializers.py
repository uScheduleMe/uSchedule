from django.core.exceptions import ValidationError

from ..serializers import (
    AccreditationSerializer,
    AccreditationSummarySerializer,
    AccreditationUnitSerializer,
    ActivityAccreditationAssignmentSerializer,
    ActivitySerializer,
    ActivitySummarySerializer,
    AvailableTermsSerializer,
    CourseSerializer,
    ScheduleDownloadSerializer,
    ScheduleSerializer,
    TimetableSerializer,
    TimetableSummarySerializer,
    UserSerializer,
)
from ..models import (
    AccreditationUnit,
    Activity,
    ActivityAccreditationAssignment,
    AvailableTerms,
    Calendar,
    CalendarComponents,
    Course,
    Schedule,
    Terms,
    Timetable,
)
from copy import deepcopy
from .helpers import (
    CourseData,
    create_accreditation,
    create_test_user,
    TestCase,
)
import logging

logging.disable(logging.CRITICAL)

class ScheduleSerializerTest(TestCase):
    '''Test the Schedule Serializer'''

    def setUp(self):
        self.course = CourseData("CSI2120")

        self.single_comp_schedule_LEC = {
            "school": "uottawa",
            "year": 2020,
            "term": "winter",
            "course_code": "2120",
            "subject_code": "CSI",
            "course_name": "Programming Paradigms",
            "instructor": "Jochen Lang",
            "id": "A00-LEC-1",
            "section_id": "A",
            "section_label": "A",
            "description": "",
            "day": "TU",
            "room": "100 Louis Pasteur (CRX) C140",
            "type": "LEC",
            "label": "A00-LEC",
            "status": "OPEN",
            "end_date": "2020-04-04",
            "end_time": "17:20",
            "start_date": "2020-01-06",
            "start_time": "16:00",
            "session_type": "FULLSESS"
        }

        self.single_comp_schedule_TUT = {
            "school": "uottawa",
            "year": 2020,
            "term": "winter",
            "course_code": "2120",
            "subject_code": "CSI",
            "course_name": "Programming Paradigms",
            "instructor": "Jochen Lang",
            "id": "A06-TUT-0",
            "section_id": "A",
            "section_label": "A",
            "day": "TH",
            "room": "100 Louis Pasteur (CRX) C240",
            "type": "TUT",
            "label": "A06-TUT",
            "status": "OPEN",
            "end_date": "2020-04-04",
            "end_time": "17:20",
            "instructor": "Jochen Lang",
            "start_date": "2020-01-06",
            "start_time": "16:00",
            "description": "",
            "session_type": "FULLSESS"
        }

        self.serialization_context_LEC = {
            'section_id': 'A',
            'component_id': 'A00-LEC-1',
        }

        self.serialization_context_TUT = {
            'section_id': 'A',
            'component_id': 'A06-TUT',
        }


    def test_correct_format_LEC(self):
        """
        Test that the data format for a lecture component is correct.

        This is important because lectures can have multiple components in the output data.
        """
        ser = ScheduleDownloadSerializer(Timetable(**self.course.norm), context = self.serialization_context_LEC)
        # Two objects should be the same
        self.assertDeepEqual(dict(ser.data), self.single_comp_schedule_LEC)

    def test_correct_format_TUT(self):
        """
        Test that the data format for a tutorial component is correct.

        This should be the same for LABs and DGDs as well just had to test with one of them.
        """
        ser = ScheduleDownloadSerializer(Timetable(**self.course.norm), context = self.serialization_context_TUT)
        # Two objects should be the same
        self.assertDeepEqual(dict(ser.data), self.single_comp_schedule_TUT)

class ScheduleSerializerTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.user = create_test_user()
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
        self.cal = Calendar.objects.create(user_id=self.user.id)

    def create_calendar_component(self, course, section_id, comp_id):
        CalendarComponents.objects.create(
            calendar = self.cal,
            timetable = self.courses[course].model,
            section_id = section_id,
            component_id = comp_id,
        )

    def test_retrieve_simple(self):
        self.create_calendar_component('CSI2120', 'A', 'A00-LEC-0')
        schedule_data = {
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
                        ],
                    },
                },
            },
        }
        sched = Schedule.objects.create(
            calendar=self.cal,
            term=Terms.WINTER,
            year=2020
        )
        ser = ScheduleSerializer(sched)
        data = {**ser.data}
        data.pop('id')
        self.assertDeepEqual(data, schedule_data)

    def test_retrieve_multi_course(self):
        self.create_calendar_component('CSI2120', 'A', 'A00-LEC-0')
        self.create_calendar_component('CSI2120', 'A', 'A01-LAB')
        self.create_calendar_component('CSI2120', 'A', 'A06-TUT')
        self.create_calendar_component('MAT3120', 'A', 'A00-LEC-0')
        self.create_calendar_component('MAT3120', 'A', 'A00-LEC-1')

        schedule_data = {
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
        sched = Schedule.objects.create(
            calendar=self.cal,
            term=Terms.WINTER,
            year=2020
        )
        ser = ScheduleSerializer(sched)
        data = {**ser.data}
        data.pop('id')
        self.assertDeepEqual(data, schedule_data)

    def test_retrieve_calendar_with_multi_term(self):
        self.create_calendar_component('CSI2120', 'A', 'A00-LEC-0')
        self.create_calendar_component('CSI2120', 'A', 'A01-LAB')
        self.create_calendar_component('CSI2120', 'A', 'A06-TUT')
        self.create_calendar_component('CSI2101', 'A', 'A00-LEC-0')
        self.create_calendar_component('CSI2101', 'A', 'A00-LEC-1')

        schedule_data = {
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
            },
        }
        sched = Schedule.objects.create(
            calendar=self.cal,
            term=Terms.WINTER,
            year=2020
        )
        ser = ScheduleSerializer(sched)
        data = {**ser.data}
        data.pop('id')
        self.assertDeepEqual(data, schedule_data)

    def test_validate_timetable_components_valid(self):
        data = {
            str(self.courses["CSI2120"].model.id): {
                "id": self.courses["CSI2120"].model.id,
                "sections": {
                    "A": [
                        "A00-LEC-0",
                    ],
                },
            },
        }
        self.assertDeepEqual(ScheduleSerializer.validate_timetable_components(None, data), data)

    def test_validate_timetable_components_ids_dont_match(self):
        data = {
            str(self.courses["CSI2120"].model.id): {
                "id": 1234,
                "sections": {
                    "A": [
                        "A00-LEC-0",
                    ],
                },
            },
        }
        with self.assertRaises(ValidationError):
            ScheduleSerializer.validate_timetable_components(None, data)

    def test_validate_timetable_components_schema_violation(self):
        # Missing `id`
        data = {
            str(self.courses["CSI2120"].model.id): {
                "sections": {
                    "A": [
                        "A00-LEC-0",
                    ],
                },
            },
        }
        with self.assertRaises(ValidationError):
            ScheduleSerializer.validate_timetable_components(None, data)

    def test_validate_timetable_components_id_doesnt_exist(self):
        data = {
            "123": {
                "id": 123,
                "sections": {
                    "A": [
                        "A00-LEC-0",
                    ],
                },
            },
        }
        with self.assertRaises(ValidationError):
            ScheduleSerializer.validate_timetable_components(None, data)

class TimetableSerializerTest(TestCase):

    def setUp(self):
        self.courses = {
            course: CourseData(course)
            for course in [
                "CSI2120",
                "PHY1122",
            ]
        }

    def test_normal_course(self):
        """
        Test a simple timetable serialization.
        """
        course = self.courses["CSI2120"]
        ser = TimetableSerializer(Timetable(**course.norm))
        self.assertDeepEqual(dict(ser.data), course.ser)

    def test_course_with_multiple_labs(self):
        """
        Ensure format is correct even with multiple lab components where we drop some of them.

        This tests labs but the same should be true for DGD and TUT.
        """
        course = self.courses["PHY1122"]
        ser = TimetableSerializer(Timetable(**course.norm))
        self.assertDeepEqual(dict(ser.data), course.ser)

    def test_flatten_components_simple(self):
        """
        Test just the flattening function with a normal course.
        """
        course = self.courses["CSI2120"]
        flat = TimetableSerializer(Timetable(**course.norm))._TimetableSerializer__flatten_components(course.norm["sections"]["A"]["components"])
        self.assertDeepEqual(flat, course.ser["sections"]["A"]["components"])

    def test_flatten_components_multiple_labs(self):
        """
        Test just the flattening function with multiple labs.

        This tests labs but the same should be true for DGD and TUT.
        """
        course = self.courses["PHY1122"]
        flat = TimetableSerializer(Timetable(**course.norm))._TimetableSerializer__flatten_components(course.norm["sections"]["A"]["components"])
        self.assertDeepEqual(flat, course.ser["sections"]["A"]["components"])

class TimetableSummarySerializerTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.course = CourseData('CSI2120').upsert()

    def test_simple_serialization(self):
        expected = {
            "id": self.course.id,
            "school": self.course.school,
            "subject_code": self.course.subject_code,
            "course_code": self.course.course_code,
            "course_name": self.course.course_name,
            "term": self.course.term_obj,
        }
        self.assertDeepEqual(
            TimetableSummarySerializer(self.course).data,
            expected,
        )


class UserSerializerTest(TestCase):

    def setUp(self):
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

    def test_no_email_is_invalid(self):
        """
        A user who's email is blank should be considered invalid
        """
        data = deepcopy(self.test_user)
        data["emails"] = []
        ser = UserSerializer(data=data)
        self.assertFalse(ser.is_valid())

    ######################################################################################
    # Update on these fields will be added in the future in the meantime they should fail
    ######################################################################################

    def test_cannot_update_email(self):
        """
        Updates on email field should cause validation error
        """
        data = deepcopy(self.test_user)
        ser = UserSerializer(data=data)
        ser.is_valid(raise_exception=True)
        user = ser.save()

        update_data = deepcopy(self.test_user)
        update_data['emails'][0]['email_address'] = 'new@example.com'
        update_ser = UserSerializer(user, data=update_data)
        self.assertFalse(update_ser.is_valid())

    def test_cannot_update_providers(self):
        """
        Updates on providers field should cause validation error
        """
        data = deepcopy(self.test_user)
        ser = UserSerializer(data=data)
        ser.is_valid(raise_exception=True)
        user = ser.save()

        update_data = deepcopy(self.test_user)
        update_data['providers'][0]['provider_uid'] = "222222222222222222222"
        update_ser = UserSerializer(user, data=update_data)
        self.assertFalse(update_ser.is_valid())

class AvailableTermsSerializerTest(TestCase):
    def test_bad_key(self):
        ser = AvailableTermsSerializer(data={
            "term": "not_a_real_term",
            "year": 2020,
        })
        self.assertFalse(ser.is_valid())

    def test_wrong_type(self):
        ser = AvailableTermsSerializer(data={
            "term": "winter",
            "year": "foo",
        })
        self.assertFalse(ser.is_valid())

    def test_allow_existing_data(self):
        AvailableTerms(year=2020, term=Terms.WINTER)
        ser = AvailableTermsSerializer(data={
            "term": "winter",
            "year": 2020,
        })
        self.assertTrue(ser.is_valid())

class CourseSerializerTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.course = Course(
            id=1,
            school="uOttawa",
            subject_code="CSI",
            course_code="2120",
            course_name="Programming Paradigms",
            description="Something about programming and paradigms",
        )

    def test_simple_deserialize(self):
        expected = {
            "id": 1,
            "school": "uOttawa",
            "subject_code": "CSI",
            "course_code": "2120",
            "course_name": "Programming Paradigms",
            "description": "Something about programming and paradigms",
        }
        self.assertDeepEqual(
            CourseSerializer(self.course).data,
            expected,
        )

class AccreditationUnitSerializerTest(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.au = AccreditationUnit(
            id=1,
            name="Hours CSI2",
        )

    def test_simple_serialization(self):
        expected = {
            "id": 1,
            "name": "Hours CSI2",
        }
        self.assertDeepEqual(
            AccreditationUnitSerializer(self.au).data,
            expected,
        )

class ActivitySerializerTest(TestCase):

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


    def test_simple_AAA_serializer(self):
        expected = {
            "id": self.aaa.aus.id,
            "name": "Hours CSI2",
            "quantity": 5,
        }
        self.assertDeepEqual(
            ActivityAccreditationAssignmentSerializer(self.aaa).data,
            expected,
        )

    def test_serialize_activity(self):
        expected = {
            "id": self.activity.id,
            "name": "CSI 2120: Programming Paradigms",
            "type": "course",
            "supplied_aus": {
                str(self.aaa.aus.id): ActivityAccreditationAssignmentSerializer(self.aaa).data,
            },
            "course": CourseSerializer(self.course).data,
        }
        self.assertDeepEqual(
            ActivitySerializer(self.activity).data,
            expected,
        )


class ActivitySummarySerializerTest(TestCase):

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

    def test_serialize_activity(self):
        rank = 0.6
        expected = {
            "id": self.activity.id,
            "name": "CSI 2120: Programming Paradigms",
            "type": "course",
            "rank": rank,
        }
        self.activity.rank = rank
        self.assertDeepEqual(
            ActivitySummarySerializer(self.activity).data,
            expected,
        )


class AccreditationSerializerTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.accreditation = create_accreditation()


    def test_simple_serializer(self):
        '''
        Simple check to ensure the serializer works properly
        '''
        expected = {
            "id": self.accreditation.id,
            "name": self.accreditation.name,
            "description": self.accreditation.description,
            "required_aus": self.accreditation.required_aus,
        }
        self.assertDeepEqual(
            AccreditationSerializer(self.accreditation).data,
            expected,
        )
class AccreditationSummarySerializerTest(TestCase):

    @classmethod
    def setUpTestData(cls):
        cls.accreditation = create_accreditation()

    def test_serialize_accreditation(self):
        rank = 0.6
        expected = {
            "id": self.accreditation.id,
            "name": "CIPS CS Program Accreditation",
            "rank": rank,
        }
        self.accreditation.rank = rank
        self.assertDeepEqual(
            AccreditationSummarySerializer(self.accreditation).data,
            expected,
        )

