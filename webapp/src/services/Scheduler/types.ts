import { Course } from '@models/Course';
import { CourseSection } from '@models/CourseSection';
import { CourseSectionComponent } from '@models/CourseSectionComponent';

/**
 * Enum representing the format of the schedule we want to download.
 */
export enum ScheduleDownloadFormats {
  ICAL = 'ical',
  CSV = 'csv',
  JSON = 'json',
}

/**
 * Enum listing relevant api endpoints consumed by this module
 */
export enum SchedulerEndpoints {
  SCHEDULE = '/schedules/{id}',
  SCHEDULES = '/schedules',

  SCHEDULES_GENERATE = '/schedules/generate',

  SCHEDULE_DOWNLOAD = '/schedules/{id}/download',
  SCHEDULE_POST_DOWNLOAD = '/schedules/download',

  COURSE = '/courses/{id}',
  COURSE_QUERY = '/courses/query',
  COURSES_SUMMARY = '/courses/summary',
}

export interface CourseLookupParams {
  school: string;
  year: number;
  season: string;
  subject_code: string;
  course_code: string;
}

export interface CourseSkeleton {
  id: Course['id'];
  sections: Record<CourseSection['id'], Array<CourseSectionComponent['id']>>;
}
