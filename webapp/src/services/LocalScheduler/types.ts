import {
  ScheduleGenerateFiltersPreParsed,
  ScheduleGeneratorConfig,
} from '@modules/schedule_generator';
import { CompressedSchedulesBundle } from './schemas';
import { Course, CourseMeta } from '@models/Course';
import * as Comlink from 'comlink';

export type CourseJson = ReturnType<Course['toJSON']>;

export interface GeneratorResultBundle {
  data: CompressedSchedulesBundle;
  limit_was_reached: boolean;
}

export interface SchedulerWorker {
  generateSchedules: (
    courses: { course: CourseJson; meta: CourseMeta }[],
    filters?: ScheduleGenerateFiltersPreParsed,
    config?: ScheduleGeneratorConfig,
  ) => GeneratorResultBundle;
}

export type LocalSchedulerWorker = Comlink.Remote<SchedulerWorker>;
