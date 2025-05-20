import { Course, Schedule, ScheduleGenerateFilters } from '@modules/schedule_generator';
import { CourseTimetable } from '@services/Timetable';

export interface DataProvider {
  getTimetableById: (id: string) => Promise<CourseTimetable | null>;
}

export interface ScheduleGenerator {
  limit: number;

  generateSchedules: (
    courses: readonly Course[],
    filters?: Readonly<ScheduleGenerateFilters>,
  ) => IterableIterator<Schedule>;
}
