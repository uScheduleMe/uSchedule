import {
  Course,
  CourseMeta,
  CourseSection,
  CourseSectionComponent,
} from '@modules/schedule_generator/models';
import { CourseData } from '@services/DataAccess';
import { ScheduleGenerateCourseMeta } from '@route_handlers/schemas';
import { isTruthy } from '@utils/helpers';
import { MetaResult, createResult } from '@utils/api_responses';
import { SCHED_3000 } from '@utils/scheduler_messages';
import { getLogger } from '@utils/logger';
import { DataProvider, Logger } from './types';
import { day_of_week_schema } from './schemas';

export default class CourseService {
  constructor(
    private readonly provider: DataProvider,
    private readonly logger: Logger = getLogger(__filename),
  ) {}

  /**
   * Constructs a Course object for the ScheduleGenerator using the provided course data
   * @param course_data course data from the DataAccess service
   * @param meta course meta data
   * @returns a Course object for the ScheduleGenerator
   */
  private static dataToCourse(course_data: CourseData, meta?: ScheduleGenerateCourseMeta): Course {
    const course_meta: CourseMeta = { ...meta, sections_to_include: meta?.sections };

    const course = new Course(
      {
        ...course_data,
        term: {
          year: course_data.year,
          season: course_data.season ?? course_data.term,
        },
      },
      [],
      course_meta,
    );

    let sections = Object.values(course_data.sections);
    if (course_meta.sections_to_include) {
      const ids = new Set(course_meta.sections_to_include);
      sections = sections.filter((s) => ids.has(s.id));
    }

    for (const section_data of sections) {
      const section = new CourseSection(course, section_data);

      for (const component_data of Object.values(section_data.components)) {
        try {
          // Throw out this component if parsing the day fails
          const day = day_of_week_schema.parse(component_data.day);

          const component = new CourseSectionComponent(section, {
            ...component_data,
            day,
            is_closed: component_data.status.toLowerCase() === 'closed',
          });
          section.addComponent(component);
        } catch (e) {}
      }

      course.addSection(section);
    }

    return course;
  }

  /**
   * A helper to convert ids into a course meta object
   * @param data the course id as a string, number or a ScheduleGenerateCourseMeta object
   * @returns a ScheduleGenerateCourseMeta object
   */
  private static getMeta(
    data: ScheduleGenerateCourseMeta | number | string,
  ): ScheduleGenerateCourseMeta {
    switch (typeof data) {
      case 'string':
        return { id: Number.parseInt(data) };
      case 'number':
        return { id: data };
      default:
        return data;
    }
  }

  /**
   * Retrieves a single course by its id or meta object containing the id
   * @param data the id or a ScheduleGenerateCourseMeta object of the course to retrieve
   * @returns the Course object
   */
  async getCourse(data: ScheduleGenerateCourseMeta | number | string): Promise<Course> {
    const meta = CourseService.getMeta(data);
    const course_data = await this.provider.getCourse(meta.id);
    return CourseService.dataToCourse(course_data, meta);
  }

  /**
   * Retrieves a set of courses by their ids, with duplicates removed.
   * This always returns a list, even if none of the courses are found.
   * Missing courses are annotated in the messages part of the response.
   * @param courses_data a list of course ids or ScheduleGenerateCourseMeta objects for the courses to retrieve
   * @returns the list of courses (or an empty list if none are found)
   */
  async getCourses(
    courses_data: (ScheduleGenerateCourseMeta | number | string)[],
  ): Promise<MetaResult<Course[]>> {
    const result = createResult<Course[]>([]);

    const promises = courses_data.map(async (course_data) => {
      const meta = CourseService.getMeta(course_data);
      return this.provider
        .getCourse(meta.id)
        .then((data) => CourseService.dataToCourse(data, meta))
        .catch(() => {
          this.logger.warn(
            `A course (id: ${meta.id}) from a requested set of courses was not returned.`,
          );
          result.messages.push({ ...SCHED_3000, vars: { id: meta.id } });
          return null;
        });
    });

    result.data = (await Promise.all(promises)).filter(isTruthy);

    return result;
  }
}
