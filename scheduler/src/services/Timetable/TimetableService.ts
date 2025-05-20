import { TimetableRowSelect } from '@services/DatabaseService';
import {
  CourseTimetable,
  CourseTimetableSection,
  TimetableQuery,
  TimetableSummary,
} from './schemas';
import { Logger, getLogger } from '@utils/logger';
import { DataProvider, Term } from './types';

export class TimetableService {
  static readonly full_course_code_pattern =
    /(^|\s+)(?<subject_code>[A-Za-z]{3,4})\s*(?<course_code>[0-9]{4,5})/;

  constructor(
    private readonly data_provider: DataProvider,
    private readonly logger: Logger = getLogger(__filename),
  ) {}

  /**
   * Query for timetable summaries by a string and a term.
   *
   * If the search string matches a pattern for a string containing a subject and course code
   * (i.e. 'ITI 1120'), then the database is queried for the matched values. If the search string
   * does not match the pattern, then the query is performed using a text search against the
   * course_name field.
   * @param search the search term to use for the full text search or subject/course code search
   * @param term an optional term to filter the results by
   * @returns A list of summaries of the timetable records
   */
  async searchForSummaries(search: string, term?: Term): Promise<TimetableSummary[]> {
    const course_match = TimetableService.full_course_code_pattern.exec(search);
    let summaries;

    if (course_match?.groups) {
      const { subject_code, course_code } = course_match.groups;
      const query = { ...term, subject_code, course_code };
      summaries = this.data_provider.getTimetableSummaries(query);
    } else {
      summaries = this.data_provider.getTimetableSummaries({ search, ...term });
    }

    return (await summaries).map(({ year, season, ...s }) => ({
      ...s,
      term: { year, season },
    }));
  }

  async getTimetableById(id: string): Promise<CourseTimetable | null> {
    const timetable_row = await this.data_provider.getTimetableById(id);
    return timetable_row ? this.reformatTimetable(timetable_row) : null;
  }

  async getTimetablesById(ids: string[]): Promise<CourseTimetable[]> {
    const timetable_rows = await this.data_provider.getTimetablesById(ids);
    return timetable_rows.map((t) => this.reformatTimetable(t));
  }

  async getTimetableByQuery({ term, ...query }: TimetableQuery): Promise<CourseTimetable | null> {
    const timetable_row = await this.data_provider.getTimetableByUniqueProperties({
      ...query,
      ...term,
    });
    return timetable_row ? this.reformatTimetable(timetable_row) : null;
  }

  reformatTimetable(timetable_row: Readonly<TimetableRowSelect>): CourseTimetable {
    const { year, season, ...row_no_term } = timetable_row;
    const term = { year, season };

    const log_info = {
      id: timetable_row.id,
      term,
      code: `${timetable_row.subject_code} ${timetable_row.course_code}`,
      name: timetable_row.course_name,
    };
    this.logger.debug(`Reformatting timetable for: ${JSON.stringify(log_info)}`);

    const sections: CourseTimetable['sections'] = {};

    for (const section of Object.values(timetable_row.sections)) {
      const new_section: CourseTimetableSection = {
        ...section,
        timetable_id: timetable_row.id,
        components: {},
      };

      for (const [component_type, component_slots_by_id] of Object.entries(section.components)) {
        for (const [component_id, component_slots] of Object.entries(component_slots_by_id)) {
          for (const slot of component_slots) {
            if (component_type !== 'LEC') {
              // Flatten non-lec component slots into a single component
              const id = `${component_id}-${component_type}`;

              new_section.components[id] = {
                ...slot,
                ...this.getStartAndEndDates(component_slots),
                id,
                section_id: section.id,
                timetable_id: timetable_row.id,
              };
              break;
            }

            new_section.components[slot.id] = {
              ...slot,
              section_id: section.id,
              timetable_id: timetable_row.id,
            };
          }
        }
      }

      sections[section.id] = new_section;
    }

    return { ...row_no_term, term, sections };
  }

  /**
   * @param items Start and end date pairs
   * @returns The earliest start date and latest end date in the items
   */
  private getStartAndEndDates(
    items: readonly Readonly<{ start_date: string; end_date: string }>[],
  ) {
    let best_start_stamp = Number.POSITIVE_INFINITY;
    let best_end_stamp = Number.NEGATIVE_INFINITY;
    const best_dates = { start_date: '', end_date: '' };

    for (const { start_date, end_date } of items) {
      const start_stamp = Date.parse(start_date);
      if (start_stamp < best_start_stamp) {
        best_start_stamp = start_stamp;
        best_dates.start_date = start_date;
      }

      const end_stamp = Date.parse(end_date);
      if (end_stamp > best_end_stamp) {
        best_end_stamp = end_stamp;
        best_dates.end_date = end_date;
      }
    }

    return best_dates;
  }
}
