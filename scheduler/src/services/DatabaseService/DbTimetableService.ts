import { timetable } from '@src/drizzle/schema';
import { DatabaseService } from './DatabaseService';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { columnToString, takeFirst } from './drizzle-helpers/utils';
import { TimetableRowSelect, TimetableUniqueProperties } from './types';

export class DbTimetableService extends DatabaseService {
  static readonly summary_result_limit = 100;

  private static readonly timetable_summary_columns = {
    id: columnToString(timetable.id),
    course_name: timetable.course_name,
    subject_code: timetable.subject_code,
    course_code: timetable.course_code,
    year: timetable.year,
    season: timetable.season,
    school: timetable.school,
  };

  private static readonly std_timetable_columns = {
    ...DbTimetableService.timetable_summary_columns,
    sections: timetable.sections,
  };

  async getTimetableById(id: string): Promise<TimetableRowSelect | undefined> {
    const query = this.db
      .select(DbTimetableService.std_timetable_columns)
      .from(timetable)
      .where(eq(timetable.id, Number(id)))
      .limit(1);

    const result = takeFirst(await query);
    this.logQuery('timetable', id, result);
    return result;
  }

  async getTimetablesById(ids: string[]): Promise<TimetableRowSelect[]> {
    const query = this.db
      .select(DbTimetableService.std_timetable_columns)
      .from(timetable)
      .where(inArray(timetable.id, ids.map(Number)));

    const result = await query;
    this.logQuery('timetable', JSON.stringify(ids), result);
    return result;
  }

  async getTimetableByUniqueProperties(
    properties: Readonly<TimetableUniqueProperties>,
  ): Promise<TimetableRowSelect | undefined> {
    const query = this.db
      .select(DbTimetableService.std_timetable_columns)
      .from(timetable)
      .where(
        and(
          eq(timetable.year, properties.year),
          eq(timetable.season, properties.season.toLowerCase()),
          eq(timetable.subject_code, properties.subject_code.toUpperCase()),
          eq(timetable.course_code, properties.course_code.toUpperCase()),
          eq(timetable.school, properties.school),
        ),
      )
      .limit(1);

    const result = takeFirst(await query);
    this.logQuery('timetable', JSON.stringify(properties), result);
    return result;
  }

  async getTimetableSummaries(
    params: Readonly<Partial<TimetableUniqueProperties & { search: string }>>,
    limit: number = DbTimetableService.summary_result_limit,
  ) {
    const query = this.db
      .select(DbTimetableService.timetable_summary_columns)
      .from(timetable)
      .where(
        and(
          params.year ? eq(timetable.year, params.year) : undefined,
          params.season ? eq(timetable.season, params.season) : undefined,
          params.course_code
            ? eq(timetable.course_code, params.course_code.toUpperCase())
            : undefined,
          params.subject_code
            ? eq(timetable.subject_code, params.subject_code.toUpperCase())
            : undefined,
          params.school ? eq(timetable.school, params.school) : undefined,
          params.search
            ? sql`to_tsvector(${timetable.course_name}) @@ plainto_tsquery(${params.search})`
            : undefined,
        ),
      )
      .orderBy(
        ...[
          params.search &&
            desc(
              sql`ts_rank(to_tsvector(${timetable.course_name}), plainto_tsquery(${params.search}))`,
            ),
          params.subject_code && desc(timetable.subject_code),
          params.course_code && desc(timetable.course_code),
          params.year && desc(timetable.year),
          params.season && desc(timetable.season),
        ].filter(Boolean),
      )
      .limit(limit);

    const result = await query;
    this.logQuery('timetable', JSON.stringify({ params, limit }), result);
    return result;
  }
}
