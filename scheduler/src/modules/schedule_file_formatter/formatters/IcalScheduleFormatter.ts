import { ScheduleEntry, Term } from '../types';
import { ScheduleFormatter } from '../interfaces/ScheduleFormatter';
import moment from 'moment';

type DayNum =
  (typeof IcalScheduleFormatter)['day_nums'][keyof (typeof IcalScheduleFormatter)['day_nums']];

export class IcalScheduleFormatter implements ScheduleFormatter {
  static readonly DATE_INPUT_FORMAT = 'YYYY-MM-DD';
  static readonly ICAL_DATE_ONLY_FORMAT = 'YYYYMMDD';
  static readonly ICAL_DATETIME_FORMAT = 'YYYYMMDDTHHmmss';
  static readonly TIMEZONE = 'America/Toronto';

  private static readonly day_nums = {
    SU: 0,
    MO: 1,
    TU: 2,
    WE: 3,
    TH: 4,
    FR: 5,
    SA: 6,
  } as const;

  format(entries: readonly Readonly<ScheduleEntry>[], term?: Readonly<Term>) {
    const output = ['BEGIN:VCALENDAR', this.getHeader(term)];

    const now = moment().format(IcalScheduleFormatter.ICAL_DATETIME_FORMAT);

    for (const entry of entries) {
      const day_num = this.getDayNum(entry.day_of_week);

      if (day_num !== undefined) {
        output.push(this.formatEvent(entry, now, day_num));
      }
    }

    output.push('END:VCALENDAR', '');

    return output.join('\n');
  }

  private getDayNum(day: string): DayNum | undefined {
    const day_nums_lookup: Record<string, DayNum | undefined> = IcalScheduleFormatter.day_nums;
    return day_nums_lookup[day.toUpperCase()];
  }

  private getHeader(term?: Term) {
    return [
      'METHOD:PUBLISH', // 'METHOD:REQUEST' Required by Outlook? 'METHOD:PUBLISH' Required by Apple Calendar
      'VERSION:2.0',
      'PRODID:-//uSchedule.me//NONSGML V1.0//EN',
      'X-APPLE-CALENDAR-COLOR:#9C1515',
      `X-WR-CALNAME:${this.getTitle(term)}`,
      `X-WR-TIMEZONE:${IcalScheduleFormatter.TIMEZONE}`,
      'CALSCALE:GREGORIAN',
      '', // Add a new line to the end
    ].join('\n');
  }

  private formatEvent(entry: Readonly<ScheduleEntry>, dt_stamp: string, day_num: DayNum) {
    const name = `${entry.subject_code} ${entry.course_code} (${entry.label})`;

    const start_date = moment(entry.start_date, IcalScheduleFormatter.DATE_INPUT_FORMAT);
    const repeat_end_date = entry.end_date.replace(/-/g, '');

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- moment returns a proper value with the `dd` format
    const start_date_day_num = this.getDayNum(start_date.format('dd')) as DayNum;

    // Adjust the start date of the component to be the first actual occurrence of the component
    //   since the start date is the term start date, not the component start date
    // If the start date is the component's first occurrence, no adjustment is needed
    const base_day_num = 7;

    if (day_num < start_date_day_num) {
      start_date.day(base_day_num + day_num);
    } else if (day_num > start_date_day_num) {
      start_date.day(day_num);
    }

    const start_time = `${entry.start_time.replace(/:/g, '')}00`;
    const end_time = `${entry.end_time.replace(/:/g, '')}00`;

    const start_only_date = start_date.format(IcalScheduleFormatter.ICAL_DATE_ONLY_FORMAT);
    const first_occurrence_dt_start = `${start_only_date}T${start_time}`;
    const first_occurrence_dt_end = `${start_only_date}T${end_time}`;

    // The new lines are double escaped (\\n) so that they end up in the value of description
    const description = `${entry.course_name}\\n\\nProf: ${entry.instructor}`;

    return [
      'BEGIN:VEVENT',
      `UID:${this.getIcalUid(entry)}`, // Required by Outlook
      `DTSTAMP:${dt_stamp}`, // Required by Outlook
      `DTSTART;TZID=${IcalScheduleFormatter.TIMEZONE}:${first_occurrence_dt_start}`,
      `DTEND;TZID=${IcalScheduleFormatter.TIMEZONE}:${first_occurrence_dt_end}`,
      `RRULE:FREQ=WEEKLY;UNTIL=${repeat_end_date}T${end_time}`,
      `LOCATION:${entry.room}`,
      `SUMMARY:${name}`,
      `DESCRIPTION:${description}`,
      'END:VEVENT',
      '', // Add a new line to the end
    ].join('\n');
  }

  private getTitle(term?: Term) {
    let title = 'uSchedule.me';

    if (term) {
      title += ` ${term.year} ${term.season}`;
    }

    return title;
  }

  /**
   * Generates a unique id for a course component to be used within an ical file / feed
   * @param entry the component details
   * @returns a string containing the id
   */
  private getIcalUid(entry: ScheduleEntry): string {
    return [
      entry.school,
      entry.term.year,
      `${entry.term.season}.${entry.subject_code}`,
      `${entry.course_code}.${entry.id}@uschedule.me`,
    ].join('-');
  }
}
