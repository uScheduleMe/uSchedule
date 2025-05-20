import {
  Course,
  CourseData,
  CourseSection,
  CourseSectionComponent,
  CourseSectionComponentData,
  CourseSectionData,
} from '../models';

/*
 * Create Course 2
 */

export const course_2_data: CourseData = {
  id: 2,
  school: 'uottawa',
  term: {
    year: 2020,
    season: 'winter',
  },
};

/**
 * A course with 1 section, which contains 2 lectures and 2 labs
 */
export const course_2 = new Course(course_2_data);

/*
 * Create Course Section A
 */

export const course_1_b_data: CourseSectionData = {
  id: 'B',
};

export const course_2_b = new CourseSection(course_2, course_1_b_data);
course_2.addSection(course_2_b);

/*
 * Create Course Lecture 0
 */

export const course_2_b_lec0_data: CourseSectionComponentData = {
  id: 'LEC-B00-0',
  type: 'LEC',
  is_closed: false,
  day: 'MO',
  start_date: '2020-01-06',
  end_date: '2020-04-04',
  start_time: '08:30',
  end_time: '09:50',
};

export const course_2_b_lec0 = new CourseSectionComponent(course_2_b, course_2_b_lec0_data);
course_2_b.addComponent(course_2_b_lec0);

/*
 * Create Course Lecture 1
 */

export const course_2_b_lec1_data: CourseSectionComponentData = {
  id: 'LEC-B00-1',
  type: 'LEC',
  is_closed: false,
  day: 'WE',
  start_date: '2020-01-06',
  end_date: '2020-04-04',
  start_time: '13:00',
  end_time: '14:20',
};

export const course_2_b_lec1 = new CourseSectionComponent(course_2_b, course_2_b_lec1_data);
course_2_b.addComponent(course_2_b_lec1);

/*
 * Create Course Lab Component 1
 * Overlapping with Lab B02
 */

export const course_2_b_lab1_data: CourseSectionComponentData = {
  id: 'LAB-B01',
  type: 'LAB',
  is_closed: true,
  day: 'FR',
  start_date: '2020-01-06',
  end_date: '2020-04-04',
  start_time: '16:00',
  end_time: '17:20',
};

export const course_2_b_lab1 = new CourseSectionComponent(course_2_b, course_2_b_lab1_data);
course_2_b.addComponent(course_2_b_lab1);

/*
 * Create Course Lab Component 2
 * Overlapping with Lab B01
 */

export const course_2_b_lab2_data: CourseSectionComponentData = {
  ...course_2_b_lab1_data,
  id: 'LAB-B02',
};

export const course_2_b_lab2 = new CourseSectionComponent(course_2_b, course_2_b_lab2_data);
course_2_b.addComponent(course_2_b_lab2);
