import { ScheduleEntry } from '../types';
import { ScheduleFormatter } from '../interfaces/ScheduleFormatter';

interface CsvRow {
  year: string;
  season: string;
  subject_code: string;
  course_code: string;
  course_name: string;
  section: string;
  id: string;
  type: string;
  day: string;
  start_time: string;
  end_time: string;
  start_date: string;
  end_date: string;
  location: string;
  professor: string;
  session_type: string;
  status: string;
}

export class CsvScheduleFormatter implements ScheduleFormatter {
  private static readonly separator = ',';

  private static readonly titles = Object.values({
    year: 'Year',
    season: 'Season',
    subject_code: 'Subject Code',
    course_code: 'Course Code',
    course_name: 'Course Name',
    section: 'Section',
    id: 'ID',
    type: 'Type',
    day: 'Day',
    start_time: 'Start Time',
    end_time: 'End Time',
    start_date: 'Start Date',
    end_date: 'End Date',
    location: 'Location',
    professor: 'Professor',
    session_type: 'Session Type',
    status: 'Status',
  } satisfies CsvRow).join(CsvScheduleFormatter.separator);

  private static convertToRow(c: ScheduleEntry) {
    return Object.values({
      year: c.term.year.toString(),
      season: c.term.season,
      subject_code: c.subject_code,
      course_code: c.course_code,
      course_name: c.course_name,
      section: c.section_label,
      id: c.label,
      type: c.type,
      day: c.day_of_week,
      start_time: c.start_time,
      end_time: c.end_time,
      start_date: c.start_date,
      end_date: c.end_date,
      location: c.room,
      professor: c.instructor,
      session_type: c.session_type,
      status: c.status,
    } satisfies CsvRow)
      .map(CsvScheduleFormatter.handleEscape)
      .join(CsvScheduleFormatter.separator);
  }

  private static handleEscape(value: string) {
    return value.includes(CsvScheduleFormatter.separator)
      ? `"${value.replace(/"/g, '""')}"`
      : value;
  }

  format(entries: readonly Readonly<ScheduleEntry>[]) {
    return [
      CsvScheduleFormatter.titles,
      ...entries.map(CsvScheduleFormatter.convertToRow),
      '', // Add a new line to the end of the file
    ].join('\n');
  }
}
