import { Course, CourseSection, CourseSectionComponent } from '../models';
import {
  course_1_a_data,
  course_1_a_lab1_data,
  course_1_a_lab2_data,
  course_1_a_lec0_data,
  course_1_data,
} from './course_1';

/*
 * Create Course 1
 */

/**
 * A course with 1 section, which contains 1 lecture and 2 labs
 */
export const course_1_optional = new Course(course_1_data, undefined, { is_mandatory: false });

/*
 * Create Course Section A
 */

export const course_1_optional_a = new CourseSection(course_1_optional, course_1_a_data);
course_1_optional.addSection(course_1_optional_a);

/*
 * Create Course Lecture 0
 */

export const course_1_optional_a_lec0 = new CourseSectionComponent(
  course_1_optional_a,
  course_1_a_lec0_data,
);
course_1_optional_a.addComponent(course_1_optional_a_lec0);

/*
 * Create Course Lab Component 1
 * Overlapping with Lab A02
 */

export const course_1_optional_a_lab1 = new CourseSectionComponent(
  course_1_optional_a,
  course_1_a_lab1_data,
);
course_1_optional_a.addComponent(course_1_optional_a_lab1);

/*
 * Create Course Lab Component 2
 * Overlapping with Lab A01
 */

export const course_1_optional_a_lab2 = new CourseSectionComponent(
  course_1_optional_a,
  course_1_a_lab2_data,
);
course_1_optional_a.addComponent(course_1_optional_a_lab2);
