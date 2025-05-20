import { ApiVersion, Endpoint } from './';
import fetch_json from '@services/fetch_json';
import {
  CourseData,
  CourseSkeleton,
  CourseSummary,
  FlattenedScheduleItem,
  SaveScheduleSkeleton,
  ScheduleSkeleton,
  course_schema,
  course_summary_schema,
  flattened_schedule_item_schema,
  schedule_skeleton_schema,
} from './schemas';
import {
  CourseQueryData,
  CourseSummaryQueryData,
  SchedulesQueryData,
} from '@route_handlers/schemas';
import { expandEndpoint, parseData } from '@services/utils';

/**
 * The root of the DA api URI
 */
const API_ROOT = 'http://data-access:8000';

/**
 * Expands into a full URL to a resource
 * @param endpoint The endpoint string to use
 * @param ep_params Any parameters required for the selected endpoint
 * @param api_version Which version to use on the resource server
 * @returns A full URL to a resource
 */
export function expandPath(
  endpoint: Endpoint,
  ep_params: Record<string, number | string> = {},
  api_version: ApiVersion = ApiVersion.V1,
): string {
  return expandEndpoint(API_ROOT, endpoint, api_version, ep_params);
}

/**
 * Get a schedule with a specific ID
 * @throws ZodError if the return data does not match the schema
 * @param id the id of the schedule
 * @param access_token the user's access token
 */
export async function getSchedule(id: string, access_token: string): Promise<ScheduleSkeleton> {
  const res = await fetch_json.get(expandPath(Endpoint.SCHEDULE, { id }), {
    access_token,
  });
  return parseData(schedule_skeleton_schema, res);
}

/**
 * Update a schedule with a specific ID
 * @throws ZodError if the return data does not match the schema
 * @param id the id of the schedule
 * @param access_token the user's access token
 * @param schedule_skeleton the partial skeleton with the parts that need to be updated
 */
export async function patchSchedule(
  id: string,
  access_token: string,
  schedule_skeleton: Partial<ScheduleSkeleton>,
): Promise<ScheduleSkeleton> {
  const res = await fetch_json.patch(expandPath(Endpoint.SCHEDULE, { id }), {
    access_token,
    body: schedule_skeleton,
  });
  return parseData(schedule_skeleton_schema, res);
}

/**
 * Save a schedule for the provided skeleton
 * @throws ZodError if the return data does not match the schema
 * @param access_token the user's access token
 * @param schedule_skeleton the partial skeleton with the parts that need to be updated
 */
export async function postSchedule(
  access_token: string,
  schedule_skeleton: SaveScheduleSkeleton,
): Promise<ScheduleSkeleton> {
  const res = await fetch_json.post(expandPath(Endpoint.SCHEDULES), {
    access_token,
    body: schedule_skeleton,
  });
  return parseData(schedule_skeleton_schema, res);
}

/**
 * Delete a schedule with a specific ID
 * @param id the id of the schedule
 * @param access_token the user's access token
 */
export async function deleteSchedule(id: string, access_token: string): Promise<void> {
  await fetch_json.delete(expandPath(Endpoint.SCHEDULE, { id }), {
    access_token,
  });
}

/**
 * Get a set of schedules by query params
 * @throws ZodError if the return data does not match the schema
 * @param query the query params
 * @param access_token the user's access token
 */
export async function getSchedules(
  query: SchedulesQueryData,
  access_token: string,
): Promise<ScheduleSkeleton[]> {
  const res = await fetch_json.get(expandPath(Endpoint.SCHEDULES), {
    access_token,
    query,
  });
  return parseData(schedule_skeleton_schema.array(), res);
}

/**
 * Get a course with a specific ID
 * @throws ZodError if the return data does not match the schema
 * @param id the id of the course
 */
export async function getCourse(id: number | string): Promise<CourseData> {
  const res = await fetch_json.get(expandPath(Endpoint.TIMETABLE, { id }));
  return parseData(course_schema, res);
}

/**
 * Get a course with the data that makes up its primary key
 * @throws ZodError if the return data does not match the schema
 * @param query the data used for querying for the course
 */
export async function getCourseByQuery(query: CourseQueryData): Promise<CourseData[]> {
  const res = await fetch_json.get(expandPath(Endpoint.TIMETABLES), {
    // TODO: Remove the term field once the DA is updated to accept season instead
    query: { ...query, term: query.season },
  });
  return parseData(course_schema.array(), res);
}

/**
 * Get course summaries by query params, including searching with search=
 * @throws ZodError if the return data does not match the schema
 * @param query the query params
 */
export async function getCourseSummaries(query: CourseSummaryQueryData): Promise<CourseSummary[]> {
  const res = await fetch_json.get(expandPath(Endpoint.TIMETABLES_SUMMARIES), {
    query,
  });
  return parseData(course_summary_schema.array(), res);
}

/**
 * Get a list of schedule components in the flattened format
 * @throws ZodError if the return data does not match the schema
 * @param id the id of the saved schedule
 * @param access_token the user's access token
 */
export async function getFlattenedSchedule(
  id: number | string,
  access_token: string,
): Promise<FlattenedScheduleItem[]> {
  const res = await fetch_json.get(expandPath(Endpoint.SCHEDULE_DOWNLOAD, { id }), {
    access_token,
  });
  return parseData(flattened_schedule_item_schema.array(), res);
}

/**
 * Get a list of schedule components in the flattened format
 * @throws ZodError if the return data does not match the schema
 * @param body the course skeleton list that represents the schedule
 */
export async function getFlattenedScheduleByQuery(
  body: CourseSkeleton[],
): Promise<FlattenedScheduleItem[]> {
  const res = await fetch_json.post(expandPath(Endpoint.SCHEDULES_DOWNLOAD), {
    body,
  });
  return parseData(flattened_schedule_item_schema.array(), res);
}
