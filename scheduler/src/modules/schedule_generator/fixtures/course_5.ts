import {
  Course,
  CourseData,
  CourseSection,
  CourseSectionComponent,
  CourseSectionComponentData,
  CourseSectionData,
} from '../models';

/*
 * Create Course 5
 */

export const course_5_data: CourseData = {
  id: 5,
  school: 'uottawa',
  term: {
    year: 2020,
    season: 'winter',
  },
};

/**
 * A course with 3 sections, one with an early class, one with a late class, and one with neither
 */
export const course_5 = new Course(course_5_data);

/* ##############################
 * Create Course Section A
 * ############################## */

export const course_5_a_data: CourseSectionData = { id: 'A' };

export const course_5_a = new CourseSection(course_5, course_5_a_data);
course_5.addSection(course_5_a);

/*
 * Create Course Lecture 0
 */

export const course_5_a_lec0_data: CourseSectionComponentData = {
  id: 'LEC-A00-0',
  type: 'LEC',
  is_closed: false,
  day: 'TU',
  start_date: '2020-01-06',
  end_date: '2020-04-04',
  start_time: '08:30',
  end_time: '09:50',
};

export const course_5_a_lec0 = new CourseSectionComponent(course_5_a, course_5_a_lec0_data);
course_5_a.addComponent(course_5_a_lec0);

/*
 * Create Course Lecture 1
 */

export const course_5_a_lec1_data: CourseSectionComponentData = {
  ...course_5_a_lec0_data,
  id: 'LEC-A00-1',
  day: 'TH',
  start_time: '13:00',
  end_time: '14:20',
};

export const course_5_a_lec1 = new CourseSectionComponent(course_5_a, course_5_a_lec1_data);
course_5_a.addComponent(course_5_a_lec1);

/* ##############################
 * Create Course Section B
 * ############################## */

export const course_5_b_data: CourseSectionData = { id: 'B' };

export const course_5_b = new CourseSection(course_5, course_5_b_data);
course_5.addSection(course_5_b);

/*
 * Create Course Lecture 0
 */

export const course_5_b_lec0_data: CourseSectionComponentData = {
  id: 'LEC-B00-0',
  type: 'LEC',
  is_closed: false,
  day: 'TU',
  start_date: '2020-01-06',
  end_date: '2020-04-04',
  start_time: '14:30',
  end_time: '15:50',
};

export const course_5_b_lec0 = new CourseSectionComponent(course_5_b, course_5_b_lec0_data);
course_5_b.addComponent(course_5_b_lec0);

/*
 * Create Course Lecture 1
 */

export const course_5_b_lec1_data: CourseSectionComponentData = {
  ...course_5_b_lec0_data,
  id: 'LEC-B00-1',
  day: 'TH',
  start_time: '19:00',
  end_time: '20:20',
};

export const course_5_b_lec1 = new CourseSectionComponent(course_5_b, course_5_b_lec1_data);
course_5_b.addComponent(course_5_b_lec1);

/* ##############################
 * Create Course Section C
 * ############################## */

export const course_5_c_data: CourseSectionData = { id: 'C' };

export const course_5_c = new CourseSection(course_5, course_5_c_data);
course_5.addSection(course_5_c);

/*
 * Create Course Lecture 0
 */

export const course_5_c_lec0_data: CourseSectionComponentData = {
  id: 'LEC-C00-0',
  type: 'LEC',
  is_closed: false,
  day: 'TU',
  start_date: '2020-01-06',
  end_date: '2020-04-04',
  start_time: '11:30',
  end_time: '12:50',
};

export const course_5_c_lec0 = new CourseSectionComponent(course_5_c, course_5_c_lec0_data);
course_5_c.addComponent(course_5_c_lec0);

/*
 * Create Course Lecture 1
 */

export const course_5_c_lec1_data: CourseSectionComponentData = {
  ...course_5_c_lec0_data,
  id: 'LEC-C00-1',
  day: 'TH',
  start_time: '16:00',
  end_time: '17:20',
};

export const course_5_c_lec1 = new CourseSectionComponent(course_5_c, course_5_c_lec1_data);
course_5_c.addComponent(course_5_c_lec1);
