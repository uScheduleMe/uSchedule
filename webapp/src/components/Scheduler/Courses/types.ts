import { Course } from '@models/Course';
import { CourseMapping } from '@stores/ScheduleBuilderStore';
import { Term } from '@models/Term';

export interface TermProps {
  courses: CourseMapping;
  term: Term;
}

export interface CoursesProps {
  moveToSchedulesTab: () => void;
  setCourseIsLoading: (newState: boolean) => void;
  courseIsLoading: boolean;
  showSimplePopover: (text: string, target: EventTarget | React.RefObject<HTMLElement>) => void;
}

export interface CourseDisplayProps {
  course: Course;
  term: string;
  removingCourse: () => void;
}

export interface CourseLookupProps {
  setCourseIsLoading: (newState: boolean) => void;
  courseIsLoading: boolean;
  showSimplePopover: (text: string, target: EventTarget | React.RefObject<HTMLElement>) => void;
}

export type AddCourseEventTypes =
  | React.MouseEvent<HTMLElement, MouseEvent>
  | React.KeyboardEvent<HTMLInputElement>;
