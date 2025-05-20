import {
  CompressedComponentGuid,
  CompressedSchedule,
  CompressedSchedulesBundle,
  ScheduleGenerateCourseMeta,
} from '@route_handlers/schemas';
import {
  Course,
  CourseSectionComponent,
  Schedule,
  ScheduleGenerateFilters,
  ScheduleGenerator,
  ScheduleGeneratorConfig,
} from '@modules/schedule_generator';
import { MetaResult, createResult } from '@utils/api_responses';
import ApiError from '@utils/errors/ApiError';
import { SCHED_2001, SCHED_2002, SCHED_2003 } from '@utils/scheduler_messages';
import StatusCodes from '@utils/StatusCodes';
import { CourseService } from '@services/Course';
import { getLogger } from '@utils/logger';
import { DataProvider, Logger } from './types';

const DEFAULT_CONFIG: Readonly<ScheduleGeneratorConfig> = {
  limit: process.env.GENERATOR_V2_LIMIT ? parseInt(process.env.GENERATOR_V2_LIMIT) : undefined,
};

export default class ScheduleService {
  private readonly course_service: CourseService;

  constructor(
    private readonly provider: DataProvider,
    private readonly logger: Logger = getLogger(__filename),
  ) {
    this.course_service = new CourseService(this.provider);
  }

  async generateSchedules(
    course_meta: ScheduleGenerateCourseMeta[],
    filters?: ScheduleGenerateFilters,
    config: Readonly<ScheduleGeneratorConfig> = DEFAULT_CONFIG,
  ): Promise<MetaResult<CompressedSchedulesBundle>> {
    const { data: courses, messages: courses_messages } =
      await this.course_service.getCourses(course_meta);

    if (!courses.length) {
      const empty_data = { component_ids: [], schedules: [] };
      this.logStats(course_meta, courses, empty_data, config, filters);
      throw new ApiError(SCHED_2003, StatusCodes.NOT_FOUND);
    }

    const generator = new ScheduleGenerator(courses, config, filters);
    const data = this.compressSchedules(generator.generateSchedules());
    const result = createResult<CompressedSchedulesBundle>(data);

    this.logStats(course_meta, courses, data, config, filters);

    result.messages.push(...courses_messages);

    if (!data.schedules.length) {
      const term = courses[0].term;
      throw new ApiError(
        {
          ...SCHED_2001,
          message: `There are no possible schedules for the requested courses during the ${term.year} ${term.season} term. Please adjust the filters and/or course list and try again.`,
          vars: { term },
        },
        StatusCodes.NOT_FOUND,
      );
    }

    if (generator.limitWasReached()) {
      result.messages.push(SCHED_2002);
    }

    return result;
  }

  private logStats(
    course_meta: Readonly<ScheduleGenerateCourseMeta[]>,
    courses: Readonly<Course[]>,
    data: Readonly<CompressedSchedulesBundle>,
    config: Readonly<ScheduleGeneratorConfig>,
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
      limit: config.limit,
      did_reach_limit: config.limit === data.schedules.length,
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
