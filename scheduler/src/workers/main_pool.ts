import { isMainThread, parentPort } from 'worker_threads';
import { WorkerInput } from '@utils/worker_pool';
import { getErrorResponseData } from '@utils/api_responses';
import Courses from '@courses';
import { Generator } from '@schedules';
import { ScheduleGenerateBodyData, ScheduleGenerateV2BodyData } from '@route_handlers/schemas';
import { ScheduleService } from '@services/Schedule';
import DataAccess from '@services/DataAccess';

/**
 * Define a map of jobs that can be run on the main worker pool.
 * These functions should return a ResponseData<T> to be consistent with the error response.
 */
export const main_pool_executors = {
  scheduleGenerator: async (input: ScheduleGenerateBodyData) => {
    const { data } = await Courses.getCourses(input.courses);
    return new Generator(data, input.filters).getResult();
  },
  scheduleGeneratorV2: async (input: ScheduleGenerateV2BodyData) => {
    const schedule_svc = new ScheduleService(DataAccess);
    return await schedule_svc.generateSchedules(input.courses, input.filters);
  },
} as const;

if (!isMainThread) {
  /**
   * Listen for jobs, generate the results and return them via a response message.
   */
  parentPort?.on('message', async ({ type, input }: WorkerInput<typeof main_pool_executors>) => {
    try {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
      parentPort?.postMessage(await main_pool_executors[type](input as any));
    } catch (e) {
      parentPort?.postMessage(getErrorResponseData(e));
    }
  });
}
