import {
  Course,
  CourseData,
  CourseSection,
  CourseSectionComponent,
  CourseSectionComponentData,
  CourseSectionData,
} from '../models';

/*
 * Create Course 1
 */

export const course_1_data: CourseData = {
  id: 1,
  school: 'uottawa',
  term: {
    year: 2020,
    season: 'winter',
  },
};

/**
 * A course with 1 section, which contains 1 lecture and 2 labs
 */
export const course_1 = new Course(course_1_data);

/*
 * Create Course Section A
 */

export const course_1_a_data: CourseSectionData = {
  id: 'A',
};

export const course_1_a = new CourseSection(course_1, course_1_a_data);
course_1.addSection(course_1_a);

/*
 * Create Course Lecture 0
 */

export const course_1_a_lec0_data: CourseSectionComponentData = {
  id: 'LEC-A00-0',
  type: 'LEC',
  is_closed: false,
  day: 'MO',
  start_date: '2020-01-06',
  end_date: '2020-04-04',
  start_time: '08:30',
  end_time: '09:50',
};

export const course_1_a_lec0 = new CourseSectionComponent(course_1_a, course_1_a_lec0_data);
course_1_a.addComponent(course_1_a_lec0);

/*
 * Create Course Lab Component 1
 * Overlapping with Lab A02
 */

export const course_1_a_lab1_data: CourseSectionComponentData = {
  id: 'LAB-A01',
  type: 'LAB',
  is_closed: false,
  day: 'WE',
  start_date: '2020-01-06',
  end_date: '2020-04-04',
  start_time: '19:00',
  end_time: '21:50',
};

export const course_1_a_lab1 = new CourseSectionComponent(course_1_a, course_1_a_lab1_data);
course_1_a.addComponent(course_1_a_lab1);

/*
 * Create Course Lab Component 2
 * Overlapping with Lab A01
 */

export const course_1_a_lab2_data: CourseSectionComponentData = {
  ...course_1_a_lab1_data,
  id: 'LAB-A02',
};

export const course_1_a_lab2 = new CourseSectionComponent(course_1_a, course_1_a_lab2_data);
course_1_a.addComponent(course_1_a_lab2);
