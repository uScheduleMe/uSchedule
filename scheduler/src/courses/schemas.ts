import { z } from 'zod';

export const course_component_conflict_data_schema = z.object({
  course_id: z.number(),
  section_id: z.string(),
  component_id: z.string(),
  guid: z.string(),
});

export type CourseComponentConflictData = z.infer<typeof course_component_conflict_data_schema>;

export const plain_course_section_component_schema = z.object({
  course_id: z.number(),
  section_id: z.string(),
  id: z.string(),
  guid: z.string(),
  label: z.string(),
  status: z.string(),
  type: z.string(),
  day: z.string(),
  start_timestamp: z.number(),
  start_time: z.string(),
  start_time_12hr: z.string(),
  end_timestamp: z.number(),
  end_time: z.string(),
  end_time_12hr: z.string(),
  start_date: z.string(),
  end_date: z.string(),
  room: z.string(),
  instructor: z.string(),
  session_type: z.string(),
  description: z.string(),
});

export type PlainCourseSectionComponent = z.infer<typeof plain_course_section_component_schema>;

export const plain_course_section_schema = z.object({
  course_id: z.number(),
  id: z.string(),
  label: z.string(),
  instructor: z.string(),
  description: z.string(),
  num_components: z.number(),
  components: z.record(plain_course_section_component_schema),
});

export type PlainCourseSection = z.infer<typeof plain_course_section_schema>;

export const plain_course_schema = z.object({
  id: z.number(),
  school: z.string(),
  year: z.number(),
  season: z.string(),
  term: z.string(),
  subject_code: z.string(),
  course_code: z.string(),
  course_name: z.string(),
  sections: z.record(plain_course_section_schema),
});

export type PlainCourse = z.infer<typeof plain_course_schema>;
