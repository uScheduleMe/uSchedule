import DataAccess, { FlattenedScheduleItem } from '@services/DataAccess';
import moment from 'moment';
import { ScheduleDownloadBodyData, ScheduleDownloadQueryData } from '@route_handlers/schemas';
import { ExportCourse, ScheduleFileMeta } from './types';

/**
 * The format to use when parsing date strings with moment
 */
const DATE_INPUT_FORMAT = 'YYYY-MM-DD';

/**
 * The format to use when converting a date to the iCal date format using moment
 */
const ICAL_DATE_ONLY_FORMAT = 'YYYYMMDD';

/**
 * The format to use when converting a date/time to the iCal date format using moment
 */
const ICAL_DATETIME_FORMAT = 'YYYYMMDDTHHmmss';

/**
 * Creates an JSON file from the component list
 * @param components a list of course components used to generate the JSON file
 * @returns a string containing the JSON file contents
 */
function generateFileJson(components: FlattenedScheduleItem[]): string {
  const courses = new Map<string, ExportCourse>();
  const section_indices = new Map<string, number>();

  for (const data of components) {
    const course_key = `${data.school}${data.subject_code}${data.course_code}`;
    const section_key = `${course_key}${data.year}${data.season ?? data.term}${data.section_label}`;

    // Create the component in the output format
    const component = {
      label: data.label,
      type: data.type,
      day: data.day,
      start_time: data.start_time,
      end_time: data.end_time,
      start_date: data.start_date,
      end_date: data.end_date,
      room: data.room,
      instructor: data.instructor,
      session_type: data.session_type,
      status: data.status,
    };

    // If the course hasn't been created, create it
    let course = courses.get(course_key);
    if (!course) {
      course = {
        school: data.school,
        subject_code: data.subject_code,
        course_code: data.course_code,
        course_name: data.course_name,
        sections: [],
      };
      courses.set(course_key, course);
    }

    // If the section exists already, add the component, otherwise create a new section with the component
    const section_index = section_indices.get(section_key);
    // Explicitly check for not undefined since this var is a number and 0 is falsy
    if (section_index !== undefined) {
      course.sections[section_index].components.push(component);
    } else {
      section_indices.set(section_key, course.sections.length);
      course.sections.push({
        label: data.section_label,
        year: data.year,
        season: data.season ?? data.term,
        components: [component],
      });
    }
  }

  return JSON.stringify({ courses: Array.from(courses.values()) });
}

/**
 * Generate a file header map containing Content-Type and Content-Disposition entries
 * @param file_name the name of the file
 * @param file_extension the file extension part of the name, including a '.' (ex: '.json')
 * @param content_type the content type of the file (ex: 'application/json')
 * @param charset (optional) the charset of the file [default: 'utf-8']
 * @returns the headers map for the given inputs
 */
function generateFileHeaders(
  file_name: string,
  file_extension: string,
  content_type: string,
  charset: string = 'utf-8',
): Record<string, string> {
  return {
    'Content-Disposition': `attachment; filename=${file_name}${file_extension}`,
    'Content-Type': `${content_type}; charset=${charset}`,
  };
}

/**
 * A utility function that generates the schedule file and meta data with the given data
 * @param schedule_items an array of flattened schedule items
 * @param data the meta data used for formatting the response
 * @returns the file contents and some meta data
 */
function generateFile(
  schedule_items: FlattenedScheduleItem[],
  data: ScheduleDownloadBodyData | ScheduleDownloadQueryData,
): ScheduleFileMeta {
  let title = 'uSchedule.me';
  let file_name = 'uSchedule';

  if (data.year && data.season) {
    file_name += `_${data.year}-${data.season}`;
    title += ` ${data.year} ${data.season}`;
  }

  switch (data.format) {
    case 'csv':
      return {
        headers: generateFileHeaders(file_name, '.csv', 'text/csv'),
        body: generateFileCsv(schedule_items),
      };
    case 'json':
      return {
        headers: generateFileHeaders(file_name, '.json', 'application/json'),
        body: generateFileJson(schedule_items),
      };
    case undefined:
    case 'ical':
      return {
        headers: generateFileHeaders(file_name, '.ics', 'text/calendar'),
        body: generateFileIcal(schedule_items, title),
      };
  }
}

/**
 * Generates a unique id for a course component to be used within an ical file / feed
 * @param c the component details
 * @returns a string containing the id
 */
function getIcalUid(c: FlattenedScheduleItem): string {
  return `${c.school}-${c.year}-${c.season ?? c.term}.${c.subject_code}-${c.course_code}.${
    c.id
  }@uschedule.me`;
}

/**
 * Creates an iCal file from the component list
 * @param components a list of course components used to generate the iCal file
 * @param calendar_title the calender title, used for the iCal X-WR-CALNAME field
 * @returns a string containing the iCal file contents
 */
function generateFileIcal(components: FlattenedScheduleItem[], calendar_title: string): string {
  const timezone = 'America/Toronto';

  let output = 'BEGIN:VCALENDAR\n';
  output += 'METHOD:PUBLISH\n'; // 'METHOD:REQUEST' Required by Outlook? 'METHOD:PUBLISH' Required by Apple Calendar
  output += 'VERSION:2.0\n';
  output += 'PRODID:-//uSchedule.me//NONSGML V1.0//EN\n';
  output += 'X-APPLE-CALENDAR-COLOR:#9C1515\n';
  output += `X-WR-CALNAME:${calendar_title}\n`;
  output += `X-WR-TIMEZONE:${timezone}\n`;
  output += 'CALSCALE:GREGORIAN\n';

  // Required for date formatting
  const day_nums: Record<string, number> = {
    SU: 0,
    MO: 1,
    TU: 2,
    WE: 3,
    TH: 4,
    FR: 5,
    SA: 6,
  };

  const now = moment();

  for (const c of components) {
    // Format and organize the event details
    const name = `${c.subject_code} ${c.course_code} (${c.label})`;
    const start_date = moment(c.start_date, DATE_INPUT_FORMAT);
    const start_date_day = start_date.format('dd').toUpperCase();

    // Adjust the start date of the component to be the first actual occurrence of the component
    //   since the start date is the term start date, not the component start date
    // If the start date is the component's first occurrence, no adjustment is needed
    const base_day_num = 7;
    if (day_nums[c.day] < day_nums[start_date_day]) {
      start_date.day(base_day_num + day_nums[c.day]);
    } else if (day_nums[c.day] > day_nums[start_date_day]) {
      start_date.day(day_nums[c.day]);
    }

    const start_time = `${c.start_time.replace(/:/g, '')}00`;
    const end_time = `${c.end_time.replace(/:/g, '')}00`;
    const start = `${start_date.format(ICAL_DATE_ONLY_FORMAT)}T${start_time}`;
    const end = `${start_date.format(ICAL_DATE_ONLY_FORMAT)}T${end_time}`;
    const end_date = c.end_date.replace(/-/g, '');
    // The new lines in the description text should be included as part of the content, not the file
    const description = `${c.course_name}\\n\\nProf: ${c.instructor}`;

    // Add the event to the output
    output += 'BEGIN:VEVENT\n';
    output += `UID:${getIcalUid(c)}\n`; // Required by Outlook
    output += `DTSTAMP:${now.format(ICAL_DATETIME_FORMAT)}\n`; // Required by Outlook
    output += `DTSTART;TZID=${timezone}:${start}\n`;
    output += `DTEND;TZID=${timezone}:${end}\n`;
    output += `RRULE:FREQ=WEEKLY;UNTIL=${end_date}T${end_time}\n`;
    output += `LOCATION:${c.room}\n`;
    output += `SUMMARY:${name}\n`;
    output += `DESCRIPTION:${description}\n`;
    output += 'END:VEVENT\n';
  }

  output += 'END:VCALENDAR\n';

  return output;
}

/**
 * Creates an csv file from the component list
 * @param components a list of course components used to generate the csv file
 * @returns a string containing the csv file contents
 */
function generateFileCsv(components: FlattenedScheduleItem[]): string {
  let output =
    'Year,Season,Subject Code,Course Code,Course Name,Section,ID,Type,Day' +
    ',Start Time,End Time,Start Date,End Date,Location,Professor,Session Type,Status\n';
  for (const c of components) {
    output +=
      `${c.year},${c.season ?? c.term},${c.subject_code},${c.course_code},"${c.course_name}",${
        c.section_label
      },${c.label},${c.type},${c.day}` +
      `,${c.start_time},${c.end_time},${c.start_date},${c.end_date},"${c.room}",${c.instructor},${c.session_type},${c.status}\n`;
  }
  return output;
}

/**
 * Generates the schedule file to be downloaded by a client when given the saved schedule id
 * @param id the id of the schedule
 * @param data the course data used for fetching the schedules and the meta data used for formatting the response
 * @param access_token the user's access token
 * @returns the file contents and some meta data
 */
export async function downloadSchedule(
  id: number | string,
  data: ScheduleDownloadQueryData,
  access_token: string,
): Promise<ScheduleFileMeta> {
  const schedule_items = await DataAccess.getFlattenedSchedule(id, access_token);
  return generateFile(schedule_items, data);
}

/**
 * Generates the schedule file to be downloaded by a client when given the query data
 * @param data the course data used for fetching the schedules and the meta data used for formatting the response
 * @returns the file contents and some meta data
 */
export async function downloadScheduleByQuery(
  data: ScheduleDownloadBodyData,
): Promise<ScheduleFileMeta> {
  const schedule_items = await DataAccess.getFlattenedScheduleByQuery(data.courses);
  return generateFile(schedule_items, data);
}
