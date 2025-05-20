import Course from './models/Course';
import DataAccess from '@services/DataAccess';
import { MetaResult, createResult } from '@utils/api_responses';
import { SCHED_3000 } from '@utils/scheduler_messages';
import { isTruthy } from '@utils/helpers';
import { ScheduleGenerateCourseMeta } from '@route_handlers/schemas';
import { getLogger } from '@utils/logger';

const logger = getLogger(__filename);

/**
 * Retrieves a single course by its id
 * @param data the id of the course to retrieve or a ScheduleGenerateCourseMeta object
 * @returns the Course object
 */
export async function getCourse(
  data: ScheduleGenerateCourseMeta | number | string,
): Promise<Course> {
  const meta = getMeta(data);
  const course = await DataAccess.getCourse(meta.id);
  return new Course(course, meta);
}

/**
 * Retrieves a set of courses by their ids, with duplicates removed.
 * This always returns a list, even if none of the courses are found.
 * Missing courses are annotated in the messages part of the response.
 * @param data a list of course ids or ScheduleGenerateCourseMeta objects for the courses to retrieve
 * @returns the list of courses (or an empty list of none are found)
 */
export async function getCourses(
  data: (ScheduleGenerateCourseMeta | number | string)[],
): Promise<MetaResult<Course[]>> {
  const result = createResult<Course[]>([]);

  const meta_map = data.reduce((map, d) => {
    const meta = getMeta(d);
    return map.set(meta.id, meta);
  }, new Map<Course['id'], ScheduleGenerateCourseMeta>());

  const promises = Array.from(meta_map.values(), async (meta) =>
    DataAccess.getCourse(meta.id).catch(() => {
      logger.warn(`A course (id: ${meta.id}) from a requested set of courses was not returned.`);
      result.messages.push({ ...SCHED_3000, vars: { id: meta.id } });
      return null;
    }),
  );

  result.data = (await Promise.all(promises))
    .filter(isTruthy)
    .map((c) => new Course(c, meta_map.get(c.id)));

  return result;
}

/**
 * A helper to convert ids into a course meta object
 * @param data the course id as a string, number or a ScheduleGenerateCourseMeta object
 * @returns a ScheduleGenerateCourseMeta object
 */
function getMeta(data: ScheduleGenerateCourseMeta | number | string): ScheduleGenerateCourseMeta {
  switch (typeof data) {
    case 'string':
      return { id: Number.parseInt(data) };
    case 'number':
      return { id: data };
    default:
      return data;
  }
}
