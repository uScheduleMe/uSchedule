import { z } from 'zod';

export const season_schema = z.enum(['fall', 'winter', 'summer']);

export const term_schema = z.object({
  season: z.string(),
  year: z.coerce.number().int().nonnegative(),
});

export const course_timetable_component_schema = z.object({
  day: z.string(), // Use string because uOttawa can throw out random values
  description: z.string(),
  end_date: z.string(),
  end_time: z.string(),
  id: z.string(),
  instructor: z.string(),
  label: z.string(),
  room: z.string(),
  section_id: z.string(),
  session_type: z.string(),
  start_date: z.string(),
  start_time: z.string(),
  status: z.string(),
  timetable_id: z.string(),
  type: z.string(), // Use string because uOttawa can throw out random values
});

export const course_timetable_section_schema = z.object({
  components: z.record(course_timetable_component_schema),
  description: z.string(),
  id: z.string(),
  instructor: z.string(),
  label: z.string(),
  timetable_id: z.string(),
});

export const course_timetable_schema = z.object({
  course_code: z.string(),
  course_name: z.string(),
  id: z.string(),
  school: z.string(),
  sections: z.record(course_timetable_section_schema),
  subject_code: z.string(),
  term: term_schema,
});

export type CourseTimetableComponent = z.infer<typeof course_timetable_component_schema>;
export type CourseTimetableSection = z.infer<typeof course_timetable_section_schema>;
export type CourseTimetable = z.infer<typeof course_timetable_schema>;

export const timetable_summary_schema = course_timetable_schema.pick({
  course_code: true,
  course_name: true,
  id: true,
  school: true,
  subject_code: true,
  term: true,
});

export type TimetableSummary = z.infer<typeof timetable_summary_schema>;

export const timetable_query_schema = z.object({
  course_code: z.string().trim().min(1),
  school: z.string().trim().min(1),
  subject_code: z.string().trim().min(1),
  term: term_schema,
});

export type TimetableQuery = z.infer<typeof timetable_query_schema>;

export const timetable_summary_query_schema = z.object({
  search: z.string().trim().min(1),
  term: term_schema.optional(),
});

export type TimetableSummaryQuery = z.infer<typeof timetable_summary_query_schema>;
