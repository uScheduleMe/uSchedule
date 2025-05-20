import { CourseScheduleExtended } from '@models/CourseScheduleExtended';
import { TermScheduleSetData } from '@models/TermScheduleSetData';

export interface SchedulesProps {
  termScheduleSets: TermScheduleSetData<CourseScheduleExtended>[];
}

export interface DraftTermSchedulesProps {
  termScheduleSetData: TermScheduleSetData<CourseScheduleExtended>;
  calendarSchedule?: CourseScheduleExtended;
  removeDraft: (schedule: CourseScheduleExtended) => void;
  moveToCalendar: (schedule: CourseScheduleExtended) => void;
}

export interface HeaderProps {
  termScheduleSetData: TermScheduleSetData<CourseScheduleExtended>;
  scheduleIdx: number;
  updateScheduleIdx: (value: number) => void;
  calendarSchedule?: CourseScheduleExtended;
  showCalendar: boolean;
  setShowCalendar: (value: boolean) => void;
  removeDraft: (schedule: CourseScheduleExtended) => void;
  moveToCalendar: (schedule: CourseScheduleExtended) => void;
}
