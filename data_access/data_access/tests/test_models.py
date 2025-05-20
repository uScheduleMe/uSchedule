from data_access.models import Terms, Timetable
from .helpers import TestCase

class TimetablesTest(TestCase):
    def test_uppercase_subject_code(self):
        tt = Timetable(
            sections={},
            school='uottawa',
            year=2020,
            term=Terms.WINTER,
            subject_code='csi',
            course_code=2120,
            course_name='Programming Paradigms'
        )
        tt.save()
        tt.refresh_from_db()
        self.assertEqual(tt.subject_code, 'CSI')
