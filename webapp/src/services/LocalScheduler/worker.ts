import * as Comlink from 'comlink';
import {
  ScheduleGenerator,
  schedule_generate_filters_schema,
} from '@src/modules/schedule_generator';
import { SchedulerWorker } from './types';
import { deserializeCourse } from './deserializeCourses';
import { serializeSchedules } from './serializeSchedules';

const fallbackLimit = 1000;

const obj: SchedulerWorker = {
  generateSchedules: (courses, filters?, config = { limit: fallbackLimit }) => {
    const generator = new ScheduleGenerator(
      courses.map(({ course, meta }) => deserializeCourse(course, meta)),
      config,
      schedule_generate_filters_schema.parse(filters),
    );

    const data = serializeSchedules(generator.generateSchedules());

    return { data, limit_was_reached: generator.limitWasReached() };
  },
};

Comlink.expose(obj);
