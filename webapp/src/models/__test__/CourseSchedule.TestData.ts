/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Course } from '@models/Course';
import { CourseSchedule } from '@models/CourseSchedule';
import { CourseScheduleExtended } from '@models/CourseScheduleExtended';
import { CourseSectionComponent } from '@models/CourseSectionComponent';
import { TermSeasons } from '@models/Term';
import { ScheduleSchemaExtended } from '@services/Scheduler/schemas';
import { WINTER } from './Course.TestData';

const scheduleSet: ScheduleSchemaExtended[] = [
  {
    id: 1,
    in_calendar: true,
    term: { year: 2020, season: TermSeasons.Winter },
    name: 'schedule with name',
    start_time: 30600,
    end_time: 62400,
    num_courses: 2,
    num_courses_attempted: 2,
    num_before_start_filter: 0,
    num_after_end_filter: 0,
    num_lec_time_conflicts: 0,
    components: [
      {
        course_id: 753,
        section_id: 'A',
        component_id: 'A01-LAB',
        guid: '2020winter753AA01-LAB',
      },
      {
        course_id: 753,
        section_id: 'A',
        component_id: 'A06-TUT',
        guid: '2020winter753AA06-TUT',
      },
      {
        course_id: 753,
        section_id: 'A',
        component_id: 'A00-LEC-0',
        guid: '2020winter753AA00-LEC-0',
      },
      {
        course_id: 753,
        section_id: 'A',
        component_id: 'A00-LEC-1',
        guid: '2020winter753AA00-LEC-1',
      },
      {
        course_id: 1562,
        section_id: 'E',
        component_id: 'E02-LAB',
        guid: '2020winter1562EE02-LAB',
      },
      {
        course_id: 1562,
        section_id: 'E',
        component_id: 'E00-LEC-0',
        guid: '2020winter1562EE00-LEC-0',
      },
      {
        course_id: 1562,
        section_id: 'E',
        component_id: 'E00-LEC-1',
        guid: '2020winter1562EE00-LEC-1',
      },
    ],
  },
  {
    id: 1,
    in_calendar: true,
    term: { year: 2020, season: TermSeasons.Winter },
    name: 'schedule with name',
    start_time: 30600,
    end_time: 62400,
    num_courses: 2,
    num_courses_attempted: 2,
    num_before_start_filter: 0,
    num_after_end_filter: 0,
    num_lec_time_conflicts: 0,
    components: [
      {
        course_id: 753,
        section_id: 'A',
        component_id: 'A02-LAB',
        guid: '2020winter753AA02-LAB',
      },
      {
        course_id: 753,
        section_id: 'A',
        component_id: 'A06-TUT',
        guid: '2020winter753AA06-TUT',
      },
      {
        course_id: 753,
        section_id: 'A',
        component_id: 'A00-LEC-0',
        guid: '2020winter753AA00-LEC-0',
      },
      {
        course_id: 753,
        section_id: 'A',
        component_id: 'A00-LEC-1',
        guid: '2020winter753AA00-LEC-1',
      },
      {
        course_id: 1562,
        section_id: 'E',
        component_id: 'E02-LAB',
        guid: '2020winter1562EE02-LAB',
      },
      {
        course_id: 1562,
        section_id: 'E',
        component_id: 'E00-LEC-0',
        guid: '2020winter1562EE00-LEC-0',
      },
      {
        course_id: 1562,
        section_id: 'E',
        component_id: 'E00-LEC-1',
        guid: '2020winter1562EE00-LEC-1',
      },
    ],
  },
  {
    id: 1,
    in_calendar: true,
    term: { year: 2020, season: TermSeasons.Winter },
    name: 'schedule with name',
    start_time: 30600,
    end_time: 62400,
    num_courses: 2,
    num_courses_attempted: 2,
    num_before_start_filter: 0,
    num_after_end_filter: 0,
    num_lec_time_conflicts: 0,
    components: [
      {
        course_id: 753,
        section_id: 'A',
        component_id: 'A03-LAB',
        guid: '2020winter753AA03-LAB',
      },
      {
        course_id: 753,
        section_id: 'A',
        component_id: 'A06-TUT',
        guid: '2020winter753AA06-TUT',
      },
      {
        course_id: 753,
        section_id: 'A',
        component_id: 'A00-LEC-0',
        guid: '2020winter753AA00-LEC-0',
      },
      {
        course_id: 753,
        section_id: 'A',
        component_id: 'A00-LEC-1',
        guid: '2020winter753AA00-LEC-1',
      },
      {
        course_id: 1562,
        section_id: 'E',
        component_id: 'E02-LAB',
        guid: '2020winter1562EE02-LAB',
      },
      {
        course_id: 1562,
        section_id: 'E',
        component_id: 'E00-LEC-0',
        guid: '2020winter1562EE00-LEC-0',
      },
      {
        course_id: 1562,
        section_id: 'E',
        component_id: 'E00-LEC-1',
        guid: '2020winter1562EE00-LEC-1',
      },
    ],
  },
];

const scheduleSet2: ScheduleSchemaExtended = {
  id: 2,
  name: '',
  in_calendar: false,
  term: { year: 2021, season: TermSeasons.Fall },
  start_time: 30600,
  end_time: 67800,
  num_courses: 2,
  num_courses_attempted: 2,
  num_before_start_filter: 0,
  num_after_end_filter: 0,
  num_lec_time_conflicts: 0,
  components: [
    {
      course_id: 753,
      section_id: 'A',
      component_id: 'A01-LAB',
      guid: '2021winter753AA01-LAB',
    },
    {
      course_id: 753,
      section_id: 'A',
      component_id: 'A06-TUT',
      guid: '2021winter753AA06-TUT',
    },
    {
      course_id: 753,
      section_id: 'A',
      component_id: 'A00-LEC-0',
      guid: '2021winter753AA00-LEC-0',
    },
    {
      course_id: 753,
      section_id: 'A',
      component_id: 'A00-LEC-1',
      guid: '2021winter753AA00-LEC-1',
    },
    {
      course_id: 2931,
      section_id: 'A',
      component_id: 'A01-LAB',
      guid: '2021winter2931AA01-LAB',
    },
    {
      course_id: 2931,
      section_id: 'A',
      component_id: 'A04-TUT',
      guid: '2021winter2931AA04-TUT',
    },
    {
      course_id: 2931,
      section_id: 'A',
      component_id: 'A00-LEC-0',
      guid: '2021winter2931AA00-LEC-0',
    },
    {
      course_id: 2931,
      section_id: 'A',
      component_id: 'A00-LEC-1',
      guid: '2021winter2931AA00-LEC-1',
    },
  ],
};

const view_ids = new Map<Course['id'], number>();
view_ids.set(753, 1);
view_ids.set(1562, 2);

const courseIdToCourse: Record<Course['id'], Course> = {
  753: WINTER.CSI_2120,
  1562: WINTER.ITI_1120,
};

const schedule = scheduleSet[0];
const updatedComponents = new Map<CourseSectionComponent['guid'], CourseSectionComponent>();
for (const component of schedule.components) {
  const updatedComponent = courseIdToCourse[component.course_id].getComponent(
    component.section_id,
    component.component_id,
  );
  if (updatedComponent) {
    updatedComponents.set(updatedComponent.guid, updatedComponent);
  }
}

export const SCHEDULE = new CourseSchedule(updatedComponents, view_ids);
export const SCHEDULE_EXT = new CourseScheduleExtended(updatedComponents, view_ids, schedule);

// ************************
// Schedule with Conflicts
// ************************

const view_ids2 = new Map<Course['id'], number>();
view_ids2.set(753, 1);
view_ids2.set(2931, 2);

const courseIdToCourse2: Record<Course['id'], Course> = {
  753: WINTER.CSI_2120,
  2931: WINTER.CSI_3131,
};

const schedule2 = scheduleSet2;
const updatedComponents2 = new Map<CourseSectionComponent['guid'], CourseSectionComponent>();
for (const component of schedule2.components) {
  const updatedComponent = courseIdToCourse2[component.course_id].getComponent(
    component.section_id,
    component.component_id,
  );
  if (updatedComponent) {
    updatedComponents2.set(updatedComponent.guid, updatedComponent);
  }
}

export const SCHEDULE_CONFLICTS = new CourseSchedule(updatedComponents2, view_ids2);
export const SCHEDULE_CONFLICTS_EXT = new CourseScheduleExtended(
  updatedComponents2,
  view_ids2,
  schedule2,
);
