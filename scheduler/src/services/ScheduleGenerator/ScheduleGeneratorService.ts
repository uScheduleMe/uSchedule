import {
  Course,
  CourseData,
  CourseMeta,
  CourseSection,
  CourseSectionComponent,
  Schedule,
  ScheduleGenerateFilters,
  Term,
} from '@modules/schedule_generator';
import { Logger, getLogger } from '@utils/logger';
import { DataProvider, ScheduleGenerator } from './types';
import {
  CompressedComponentGuid,
  CompressedSchedule,
  CompressedSchedulesBundle,
  ScheduleGenerateTimetableMeta,
  day_of_week_schema,
} from './schemas';
import { CourseTimetable } from '@services/Timetable';

interface GenerateSchedulesOutput extends CompressedSchedulesBundle {
  limit_was_reached: boolean;
  num_courses: number;
  term: Term | undefined;
}

export class ScheduleGeneratorService {
  constructor(
    private readonly data_provider: DataProvider,
    private readonly generator: ScheduleGenerator,
    private readonly logger: Logger = getLogger(__filename),
  ) {}

  /**
   * Constructs a Course object for the ScheduleGenerator using the provided course data
   * @param timetable course data from the DataAccess service
   * @param meta course meta data
   * @returns a Course object for the ScheduleGenerator
   */
  private static dataToCourse(
    timetable: Readonly<CourseTimetable>,
    meta?: Readonly<CourseMeta>,
  ): Course {
    // TODO: Clean up the season and id types
    const course = new Course(
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      {
        ...timetable,
        id: Number(timetable.id),
      } as CourseData,
      [],
      meta,
    );

    let sections = Object.values(timetable.sections);
    if (meta?.sections_to_include) {
      const ids = new Set(meta.sections_to_include);
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

  async generateSchedules(
    timetable_meta: readonly Readonly<ScheduleGenerateTimetableMeta>[],
    filters?: Readonly<ScheduleGenerateFilters>,
  ): Promise<GenerateSchedulesOutput> {
    const courses = await this.getCourses(timetable_meta);

    if (!courses.length) {
      const empty_data = {
        component_ids: [],
        schedules: [],
        num_courses: courses.length,
        limit_was_reached: false,
        term: undefined,
      };
      this.logStats(timetable_meta, [], empty_data, this.generator.limit, filters);
      return empty_data;
    }

    const schedules = this.generator.generateSchedules(courses, filters);
    const bundle = this.compressSchedules(schedules);

    this.logStats(timetable_meta, courses, bundle, this.generator.limit, filters);

    return {
      ...bundle,
      num_courses: courses.length,
      term: courses[0].term,
      limit_was_reached: bundle.schedules.length === this.generator.limit,
    };
  }

  private async getCourses(
    timetable_meta: readonly Readonly<ScheduleGenerateTimetableMeta>[],
  ): Promise<Course[]> {
    const course_promises = timetable_meta.map(async (meta) => {
      const timetable = await this.data_provider.getTimetableById(meta.id);
      return timetable ? ScheduleGeneratorService.dataToCourse(timetable, meta) : null;
    });

    const courses = (await Promise.allSettled(course_promises))
      .map((x) => (x.status === 'rejected' ? null : x.value))
      .filter(Boolean);

    return courses;
  }

  private logStats(
    course_meta: Readonly<ScheduleGenerateTimetableMeta[]>,
    courses: Readonly<Course[]>,
    data: Readonly<CompressedSchedulesBundle>,
    limit: number,
    filters?: Readonly<ScheduleGenerateFilters>,
  ) {
    const log_stats_data = {
      filters,
      num_courses: course_meta.length,
      num_courses_optional: Array.from(course_meta).reduce(
        (total, c) => (!c.is_mandatory ? total + 1 : total),
        0,
      ),
      term: courses.length ? `${courses[0].term.season} ${courses[0].term.year}` : 'N/A',
      courses: courses.map((c) => ({
        id: c.id,
        sections: Array.from(c.sections.values(), (s) => ({
          id: s.id,
          components: Array.from(s.components.values(), (com) => ({ id: com.id })),
        })),
      })),
      num_schedules: data.schedules.length,
      limit,
      did_reach_limit: limit === data.schedules.length,
    };

    this.logger.info(`Schedule Generator Request Stats: ${JSON.stringify(log_stats_data)}`);
  }

  /**
   * Compress schedules into the API output format
   * @param schedules_iterator an iterator for a set of schedule objects
   * @returns the schedules in the compressed format
   */
  private compressSchedules(
    schedules_iterator: IterableIterator<Schedule>,
  ): CompressedSchedulesBundle {
    const component_ids: CompressedComponentGuid[] = [];
    const components_pos_map: Map<string, number> = new Map();

    const getComponentPosition = (com: CourseSectionComponent): number => {
      let position = components_pos_map.get(com.guid);
      if (position === undefined) {
        position = component_ids.length;
        component_ids.push([com.course.id, com.section.id, com.id]);
        components_pos_map.set(com.guid, position);
      }
      return position;
    };

    const schedules: CompressedSchedule[] = Array.from(schedules_iterator, (s) =>
      s.components.map((sc) => sc.components.map(getComponentPosition)),
    );

    return { component_ids, schedules };
  }
}
