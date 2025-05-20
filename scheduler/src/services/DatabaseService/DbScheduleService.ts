import { calendar, calendar_components, schedule, user } from '@src/drizzle/schema';
import { DatabaseService } from './DatabaseService';
import { and, eq } from 'drizzle-orm';
import { columnToString } from './drizzle-helpers/utils';

export class DbScheduleService extends DatabaseService {
  async getScheduleComponents(schedule_id: string, user_uuid: string) {
    const query = this.db
      .select({
        id: columnToString(schedule.id),
        name: schedule.name,
        year: schedule.year,
        season: schedule.season,
        timetable_id: columnToString(calendar_components.timetable_id),
        section_id: calendar_components.section_id,
        component_id: calendar_components.component_id,
      })
      .from(schedule)
      .innerJoin(calendar_components, eq(schedule.calendar_id, calendar.id))
      .innerJoin(user, eq(user.id, calendar.user_id))
      .where(and(eq(schedule.id, BigInt(schedule_id)), eq(user.uuid, user_uuid)));

    const result = await query;
    this.logQuery('calendar_components', JSON.stringify({ id: schedule_id }), result);
    return result;
  }
}
