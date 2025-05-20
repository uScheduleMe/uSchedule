import { ScheduleEntry } from '@modules/schedule_file_formatter/types';

export const test_schedule_entry: ScheduleEntry = {
  course_code: 'course_code',
  course_name: 'course_name',
  day_of_week: 'TU',
  description: 'description',
  end_date: '2020-12-31',
  end_time: '11:20',
  id: 'id',
  instructor: 'instructor',
  label: 'label',
  room: 'room',
  school: 'school',
  section_id: 'section_id',
  section_label: 'section_label',
  session_type: 'session_type',
  start_date: '2020-09-01',
  start_time: '10:00',
  status: 'status',
  subject_code: 'subject_code',
  term: { year: 2020, season: 'season' },
  type: 'type',
};

export const expected_csv_entries = [
  test_schedule_entry.term.year.toString(),
  test_schedule_entry.term.season,
  test_schedule_entry.subject_code,
  test_schedule_entry.course_code,
  test_schedule_entry.course_name,
  test_schedule_entry.section_label,
  test_schedule_entry.label,
  test_schedule_entry.type,
  test_schedule_entry.day_of_week,
  test_schedule_entry.start_time,
  test_schedule_entry.end_time,
  test_schedule_entry.start_date,
  test_schedule_entry.end_date,
  test_schedule_entry.room,
  test_schedule_entry.instructor,
  test_schedule_entry.session_type,
  test_schedule_entry.status,
];

export const expected_json_entries = {
  courses: [
    {
      school: test_schedule_entry.school,
      subject_code: test_schedule_entry.subject_code,
      course_code: test_schedule_entry.course_code,
      course_name: test_schedule_entry.course_name,
      sections: [
        {
          label: test_schedule_entry.section_label,
          year: test_schedule_entry.term.year,
          season: test_schedule_entry.term.season,
          components: [
            {
              label: test_schedule_entry.label,
              type: test_schedule_entry.type,
              day: test_schedule_entry.day_of_week,
              start_time: test_schedule_entry.start_time,
              end_time: test_schedule_entry.end_time,
              start_date: test_schedule_entry.start_date,
              end_date: test_schedule_entry.end_date,
              room: test_schedule_entry.room,
              instructor: test_schedule_entry.instructor,
              session_type: test_schedule_entry.session_type,
              status: test_schedule_entry.status,
            },
          ],
        },
      ],
    },
  ],
};
