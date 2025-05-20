import { CourseSectionComponent } from '@models/CourseSectionComponent';
import { CourseSchedule } from '@models/CourseSchedule';
import { TermScheduleSetData } from '@models/TermScheduleSetData';
import { ModalProps } from 'react-bootstrap/Modal';
import { Term } from '@models/Term';
import { TermData } from '@stores/ScheduleBuilderStore';

export interface TermScheduleProps {
  termData: TermData;
  enableRemoteSchedulerAlert: () => void;
}

export interface EmptyTermScheduleProps {
  term: Term;
}

export interface HeaderProps {
  termScheduleSetData: TermScheduleSetData;
  scheduleIdx: number;
  updateScheduleIdx: (value: number) => void;
}

export interface GridProps {
  schedule: CourseSchedule;
  enableAlternates?: boolean;
  enableConflicts?: boolean;
}

export interface CalendarItemProps {
  component: CourseSectionComponent;
  formatTimeAsMilitary: boolean;
  gridStartTime: number;
  schedule: CourseSchedule;
  popoverRef: React.RefObject<HTMLElement>;
  enableAlternates?: boolean;
  enableConflicts?: boolean;
}

export interface CalendarItemMeta {
  className: string;
  style: {
    height: string;
    top: string;
  };
  title: string;
}

export interface PopoverContentProps {
  c: CourseSectionComponent;
  formatTimeAsMilitary: boolean;
  conflicts: CourseSectionComponent[];
  alternates: CourseSectionComponent[];
  handleComponentChange: (newComponent: CourseSectionComponent) => () => void;
}

export interface GridlineMeta {
  currentTime: number;
  className: string;
  style: { height: string };
}

export interface TimeLabelMeta {
  currentTime: number;
  style: { height: string };
}

/**
 * A list of days of the week
 *
 * @export
 * @enum {number}
 */
export enum DaysOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

export interface SaveScheduleModalProps extends ModalProps {
  onSave: (name: string, toCalendar: boolean) => Promise<boolean>;
  term?: Term;
}
