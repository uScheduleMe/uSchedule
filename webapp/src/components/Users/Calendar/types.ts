import { CourseScheduleExtended } from '@models/CourseScheduleExtended';

export interface CalendarScheduleProps {
  userOwnsSchedule: boolean;
  schedule: CourseScheduleExtended;
  removeSchedule: (schedule: CourseScheduleExtended) => void;
}

export interface HeaderProps {
  userOwnsSchedule: boolean;
  schedule: CourseScheduleExtended;
  removeSchedule: (schedule: CourseScheduleExtended) => void;
}
