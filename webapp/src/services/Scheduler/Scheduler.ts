import {
  courseResponseSchema,
  scheduleResponseSchema,
  extendedScheduleSetResponseSchema,
  ScheduleComponentSkeleton,
  ScheduleSchemaExtended,
  generatorResponseSchemaV2,
} from './schemas';
import { AxiosInstance } from 'axios';
import { FilterPayload } from '@models/ScheduleFilterData';
import { saveAs } from 'file-saver';
import { CourseLookupParams, ScheduleDownloadFormats, SchedulerEndpoints } from './types';
import { Course } from '@models/Course';
import { CourseSchedule } from '@models/CourseSchedule';
import { CourseSectionComponent } from '@models/CourseSectionComponent';
import { ApiVersion } from '@services/types';
import { CourseSkeleton } from '@services/Scheduler/types';
import { TermScheduleSetData } from '@models/TermScheduleSetData';
import { Term } from '@models/Term';
import { axiosApi } from '@services/constants';
import { expandEndpoint, legacyExpandEndpoint } from '@services/utils';
import { notNullUndefined } from '@utils/helpers';
import { CourseScheduleExtended } from '@models/CourseScheduleExtended';
import { toast } from 'react-toastify';
import { deserializeSchedules } from './deserializeSchedules';

export class SchedulerService {
  constructor(private axios: AxiosInstance = axiosApi) {}

  /** @deprecated use expandEndpoint from ../utils for new routes with the v3 pattern */
  private expandPath(
    endpoint: SchedulerEndpoints,
    ep_params: Record<string, string | number> = {},
    apiVersion: ApiVersion = ApiVersion.V1,
  ): string {
    return legacyExpandEndpoint('scheduler', endpoint, apiVersion, ep_params);
  }

  public async getSchedule(id: string): Promise<CourseScheduleExtended> {
    const response = await this.axios.get(this.expandPath(SchedulerEndpoints.SCHEDULE, { id }));
    const { data } = scheduleResponseSchema.parse(response.data);
    return (await this.buildFullSchedule([data]))[0];
  }

  public async getCalendar(user_uuid: string): Promise<CourseScheduleExtended[]> {
    const response = await this.axios.get(this.expandPath(SchedulerEndpoints.SCHEDULES), {
      params: { user_uuid, in_calendar: true },
    });
    const { data } = extendedScheduleSetResponseSchema.parse(response.data);
    return await this.buildFullSchedule(data);
  }

  public async getDrafts(user_uuid: string): Promise<CourseScheduleExtended[]> {
    const response = await this.axios.get(this.expandPath(SchedulerEndpoints.SCHEDULES), {
      params: { user_uuid, in_calendar: false },
    });
    const { data } = extendedScheduleSetResponseSchema.parse(response.data);
    return await this.buildFullSchedule(data);
  }

  private async buildFullSchedule(
    schedules: ScheduleSchemaExtended[],
  ): Promise<CourseScheduleExtended[]> {
    // Get a list of unique course ids, then start a query to the API for those courses
    const coursePromises = Array.from(
      schedules
        .flatMap((s) => s.components)
        .reduce((ids, c) => ids.add(c.course_id), new Set<Course['id']>())
        .values(),
      (id) => this.getCourse(id),
    );

    // First we build a course list and course map with the courses from all schedules
    // Sort the courses by the subject_code and course_code combination for consistency in viewing colours
    const courseList: Course[] = (await Promise.all(coursePromises)).sort(
      Course.compareBySubjectAndCode,
    );

    const courseIdToCourse = courseList.reduce(
      (map, course) => map.set(course.id, course),
      new Map<Course['id'], Course>(),
    );

    // Helper function to enrich components with the full details
    const getFullComponent = (component: ScheduleComponentSkeleton) =>
      courseIdToCourse
        .get(component.course_id)
        ?.getComponent(component.section_id, component.component_id);

    // Then for each schedule we enrich them with the full details
    return schedules.map((schedule) => {
      const componentsMap = schedule.components
        .map(getFullComponent)
        .filter(notNullUndefined)
        .reduce(
          (map, component) => map.set(component.guid, component),
          new Map<CourseSectionComponent['guid'], CourseSectionComponent>(),
        );

      const courseIdsInSchedule = new Set(schedule.components.map((c) => c.course_id));
      const view_ids = courseList
        .filter((c) => courseIdsInSchedule.has(c.id)) // We want only the courses that are in this schedule
        .reduce((map, course, i) => map.set(course.id, i + 1), new Map<Course['id'], number>());

      return new CourseScheduleExtended(componentsMap, view_ids, schedule);
    });
  }

  public async generateSchedules(
    courses: readonly Course[],
    filters: Partial<FilterPayload>,
    term: Term,
  ): Promise<TermScheduleSetData> {
    const response = await this.axios.post(expandEndpoint(SchedulerEndpoints.SCHEDULES_GENERATE), {
      courses: courses.map((course) => course.getCourseMeta()),
      filters,
    });
    let limit_was_reached = false;

    const { data: serializedSchedules, messages } = generatorResponseSchemaV2.parse(response.data);

    if (messages?.length) {
      messages.forEach((m) => {
        if (m.code === 'sched.2002') {
          limit_was_reached = true;
        } else {
          toast[m.type](m.message);
        }
      });
    }

    return deserializeSchedules(serializedSchedules, term, courses, limit_was_reached);
  }

  private getFileName(headers: unknown, format: ScheduleDownloadFormats, term: Term): string {
    const headersCast = headers as Record<string, string>;
    if (headersCast && typeof headersCast['content-disposition'] === 'string') {
      const matches = headersCast['content-disposition'].match(/^.*filename=([^;]+)$/);
      if (matches) {
        return matches[1];
      }
    }
    const filename = `uSchedule_${term.year}-${term.season}`;
    switch (format) {
      case ScheduleDownloadFormats.ICAL:
        return `${filename}.ics`;
      case ScheduleDownloadFormats.CSV:
      case ScheduleDownloadFormats.JSON:
        return `${filename}.${format}`;
      default:
        const _never: never = format;
        return _never;
    }
  }

  public async downloadSchedule(
    schedule: CourseSchedule,
    format: ScheduleDownloadFormats,
    term: Term,
  ): Promise<void> {
    const response = await this.axios.post(
      this.expandPath(SchedulerEndpoints.SCHEDULE_POST_DOWNLOAD),
      {
        year: term.year,
        season: term.season,
        format,
        courses: schedule.getCourseSkeletons(),
      },
    );

    const blob = new Blob(
      [format === ScheduleDownloadFormats.JSON ? JSON.stringify(response.data) : response.data],
      { type: response.headers['content-type'] },
    );
    saveAs(blob, this.getFileName(response.headers, format, term));
  }

  public async getCourse(id: Course['id']): Promise<Course> {
    const response = await this.axios.get(this.expandPath(SchedulerEndpoints.COURSE, { id }));
    const { data } = courseResponseSchema.parse(response.data);
    return new Course(data);
  }

  public async lookUpCourse(params: CourseLookupParams): Promise<Course> {
    const response = await this.axios.get(this.expandPath(SchedulerEndpoints.COURSE_QUERY), {
      params,
    });
    const { data } = courseResponseSchema.parse(response.data);
    return new Course(data);
  }

  public async saveSchedule(
    course_skeletons: CourseSkeleton[],
    term: Term,
    in_calendar: boolean = false,
    name: string = '',
  ): Promise<CourseScheduleExtended> {
    const timetable_components: Record<string, CourseSkeleton> = {};
    course_skeletons.forEach((c) => (timetable_components[c.id] = c));
    const response = await this.axios.post(this.expandPath(SchedulerEndpoints.SCHEDULES), {
      name,
      term: term.getSkeleton(),
      in_calendar,
      timetable_components,
    });
    const { data } = scheduleResponseSchema.parse(response.data);
    return (await this.buildFullSchedule([data]))[0];
  }

  public async moveScheduleToCalendar(id: number): Promise<void> {
    await this.axios.patch(this.expandPath(SchedulerEndpoints.SCHEDULE, { id }), {
      in_calendar: true,
    });
  }

  public async moveScheduleToDrafts(id: number): Promise<void> {
    await this.axios.patch(this.expandPath(SchedulerEndpoints.SCHEDULE, { id }), {
      in_calendar: false,
    });
  }

  public async deleteSchedule(id: number): Promise<void> {
    await this.axios.delete(this.expandPath(SchedulerEndpoints.SCHEDULE, { id }));
  }

  public async renameSchedule(id: number, name: string): Promise<void> {
    await this.axios.patch(this.expandPath(SchedulerEndpoints.SCHEDULE, { id }), {
      name,
    });
  }
}
