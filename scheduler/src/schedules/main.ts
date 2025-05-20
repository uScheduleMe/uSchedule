import DataAccess, { ScheduleSkeleton } from '@services/DataAccess';
import { SCHED_2000, SCHED_2003 } from '@utils/scheduler_messages';
import StatusCodes from '@utils/StatusCodes';
import { MetaResult, createResult } from '@utils/api_responses';
import { ExtendedSchedule, Schedule } from './schemas';
import Generator from './Generator';
import Courses from '@courses';
import { isTruthy } from '@utils/helpers';
import { ScheduleGenerateFilters, SchedulesByUserQueryData } from '@route_handlers/schemas';
import FetchHttpError from '@utils/errors/FetchHttpError';
import ModuleError from '@utils/errors/ModuleError';
import { getLogger } from '@utils/logger';

export * from './download';

const logger = getLogger(__filename);

const FILTERS: Readonly<ScheduleGenerateFilters> = {
  allow_time_conflicts: 'ALL',
  allow_closed_components: true,
  breaks: [],
  // Make these explicit, so if the default values change, this is not affected
  minimize_before_time: undefined,
  minimize_after_time: undefined,
};

const SECONDS_FOR_1000_HRS = 36000;

const SECONDS_FOR_1400_HRS = 50400;

const SCHEDULE_STUB: Readonly<Schedule> = {
  start_time: SECONDS_FOR_1000_HRS,
  end_time: SECONDS_FOR_1400_HRS,
  num_courses: 0,
  num_courses_attempted: 0,
  num_before_start_filter: 0,
  num_after_end_filter: 0,
  num_lec_time_conflicts: 0,
  components: [],
  conflicts: {},
};

/**
 * Get a set of schedules for a particular user by query params.
 * @param query the query params (must include the user_uuid)
 * @param access_token the user's access token
 */
export async function getSchedulesByUserUuid(
  query: SchedulesByUserQueryData,
  access_token: string,
): Promise<MetaResult<ExtendedSchedule[]>> {
  const result = createResult<ExtendedSchedule[]>([]);

  try {
    const schedule_skeletons = await DataAccess.getSchedules(query, access_token);

    const promises = schedule_skeletons.map(async (skeleton) =>
      expandScheduleSkeleton(skeleton).catch(() => {
        logger.warn(
          `A schedule (id: ${skeleton.id}) from a requested set of schedules was not able to be expanded.`,
        );
        result.messages.push({ ...SCHED_2000, vars: { ...skeleton.term } });
        return null;
      }),
    );

    const schedule_responses = await Promise.all(promises);

    for (const schedule_response of schedule_responses.filter(isTruthy)) {
      result.messages.push(...schedule_response.messages);
      result.data.push(schedule_response.data);
    }
  } catch (e) {
    // If the DA returns NotFound, we want to return an empty list without an error
    if (e instanceof FetchHttpError && e.status_code === StatusCodes.NOT_FOUND) {
      return result;
    }
    throw e;
  }

  return result;
}

/**
 * Hydrates a schedule skeleton.
 * This process involves replacing course ids with course data and filling in the schedule meta data.
 * @param schedule_skeleton the schedule meta data
 * @returns a full schedule object
 */
export async function expandScheduleSkeleton(
  schedule_skeleton: ScheduleSkeleton,
): Promise<MetaResult<ExtendedSchedule>> {
  const { timetable_components, ...skeleton_meta } = schedule_skeleton;
  const result = createResult<ExtendedSchedule>({
    ...SCHEDULE_STUB,
    ...skeleton_meta,
  });

  const course_ids = Object.keys(timetable_components);

  // If there are no courses in the schedule, nothing to do
  if (!course_ids.length) {
    return result;
  }

  // Get the associated course data from the DA, convert to Course objects, and prune extra sections/components
  const res = await Courses.getCourses(course_ids);
  result.messages.push(...res.messages);
  const courses = res.data.map((c) => c.filterContent(timetable_components[c.id]));

  // If there are no courses in the schedule after getting the data, return the stub and a message
  if (!courses.length) {
    result.messages = [{ ...SCHED_2003, vars: { ...skeleton_meta.term } }];
    return result;
  }

  // Run the courses through the schedule generator to get the standard output format
  const schedules = new Generator(courses, FILTERS).getFormattedSchedules();

  if (schedules.schedule_sets.length && schedules.schedule_sets[0].length) {
    result.data = {
      ...schedules.schedule_sets[0][0],
      ...skeleton_meta,
    };
    return result;
  }

  // This SHOULD be impossible, but handle the case where the schedule generator returns no results.
  throw new ModuleError({ ...SCHED_2000, vars: { ...skeleton_meta.term } });
}
