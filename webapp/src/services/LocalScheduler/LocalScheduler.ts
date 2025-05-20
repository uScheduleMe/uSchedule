import * as Comlink from 'comlink';
import { LocalSchedulerWorker, SchedulerWorker } from './types';
import { Course } from '@models/Course';
import { Term } from '@models/Term';
import { deserializeSchedules } from './deserializeSchedules';
import { TermScheduleSetData } from '@models/TermScheduleSetData';
import { CourseSchedule } from '@models/CourseSchedule';
import { FilterPayload } from '@models/ScheduleFilterData';
import { createWorker } from './createWorker';

export class LocalSchedulerService {
  static generatorWorkerFactory(): LocalSchedulerWorker {
    const worker = createWorker();
    return Comlink.wrap<SchedulerWorker>(worker);
  }

  constructor(private worker: LocalSchedulerWorker) {}

  public async generateSchedules(
    courses: readonly Course[],
    filters: Partial<FilterPayload>,
    term: Term,
  ): Promise<TermScheduleSetData<CourseSchedule>> {
    const serializedCourseData = courses.map((course) => ({
      course: course.toJSON(),
      meta: course.getCourseMeta(),
    }));
    const serializedSchedules = await this.worker.generateSchedules(serializedCourseData, filters);
    return deserializeSchedules(serializedSchedules, term, courses);
  }
}
