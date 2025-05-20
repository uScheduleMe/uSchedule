import { z } from 'zod';

export const term_skeleton_schema = z.object({
  season: z.string(),
  year: z.number(),
});

export const course_skeleton_schema = z.object({
  id: z.number(),
  sections: z.record(z.array(z.string())),
});

export const course_full_skeleton_schema = course_skeleton_schema.extend({
  school: z.string(),
  term: z.string(),
  season: z.string().optional(),
  year: z.number(),
  subject_code: z.string(),
  course_code: z.string(),
});

export const save_schedule_skeleton_schema = z.object({
  name: z.string(),
  in_calendar: z.boolean(),
  term: term_skeleton_schema,
  timetable_components: z.record(course_skeleton_schema),
});

export const schedule_skeleton_schema = save_schedule_skeleton_schema.extend({
  id: z.number(),
  timetable_components: z.record(course_full_skeleton_schema),
});

/**
 * A schema in the structure that is returned from the DA
 */
export type TermSkeleton = z.infer<typeof term_skeleton_schema>;

/**
 * A schema in the structure that is returned from the DA
 */
export type CourseSkeleton = z.infer<typeof course_skeleton_schema>;

/**
 * A schema in the structure that is returned from the DA
 */
export type CourseFullSkeleton = z.infer<typeof course_full_skeleton_schema>;

/**
 * A schema in the structure that is sent to the DA
 */
export type SaveScheduleSkeleton = z.infer<typeof save_schedule_skeleton_schema>;

/**
 * A schema in the structure that is returned from the DA
 */
export type ScheduleSkeleton = z.infer<typeof schedule_skeleton_schema>;

export const course_section_component_schema = z.object({
  day: z.string(), // Use string because uOttawa can throw out random values
  description: z.string(),
  end_date: z.string(),
  end_time: z.string(),
  id: z.string(),
  instructor: z.string(),
  label: z.string(),
  room: z.string(),
  start_date: z.string(),
  start_time: z.string(),
  status: z.string(),
  session_type: z.string(),
  type: z.string(), // Use string because uOttawa can throw out random types
});

export const course_section_schema = z.object({
  components: z.record(course_section_component_schema),
  description: z.string(),
  id: z.string(),
  instructor: z.string(),
  label: z.string(),
});

export const season_schema = z.enum(['fall', 'winter', 'summer']);

export const course_schema = z.object({
  course_code: z.string(),
  course_name: z.string(),
  id: z.number(),
  school: z.string(),
  sections: z.record(course_section_schema),
  subject_code: z.string(),
  term: season_schema,
  season: season_schema.optional(),
  year: z.number(),
});

/**
 * A schema in the structure that is returned from the DA
 */
export type CourseSectionComponentData = z.infer<typeof course_section_component_schema>;

/**
 * A schema in the structure that is returned from the DA
 */
export type CourseSectionData = z.infer<typeof course_section_schema>;

/**
 * A schema in the structure that is returned from the DA
 */
export type CourseData = z.infer<typeof course_schema>;

export const course_summary_schema = z.object({
  course_code: z.string(),
  course_name: z.string(),
  id: z.number(),
  school: z.string(),
  subject_code: z.string(),
  term: term_skeleton_schema,
});

/**
 * A schema in the structure that is returned from the DA
 */
export type CourseSummary = z.infer<typeof course_summary_schema>;

export const flattened_schedule_item_schema = z.object({
  course_code: z.string(),
  course_name: z.string(),
  day: z.string(),
  description: z.string(),
  end_date: z.string(),
  end_time: z.string(),
  id: z.string(),
  instructor: z.string(),
  label: z.string(),
  room: z.string(),
  school: z.string(),
  section_id: z.string(),
  section_label: z.string(),
  session_type: z.string(),
  start_date: z.string(),
  start_time: z.string(),
  status: z.string(),
  subject_code: z.string(),
  term: z.string(),
  season: z.string().optional(),
  type: z.string(),
  year: z.number(),
});

/**
 * A schema in the structure that is returned from the DA
 */
export type FlattenedScheduleItem = z.infer<typeof flattened_schedule_item_schema>;

export const identity_provider_schema = z.object({
  provider: z.string(),
  provider_uid: z.string(),
});

export const email_address_schema = z.object({
  email_address: z.string(),
});

export const user_account_schema = z.object({
  uuid: z.string().uuid(),
  given_name: z.string(),
  family_name: z.string(),
  disp_name: z.string(),
  providers: identity_provider_schema.array(),
  emails: email_address_schema.array(),
});

/**
 * A schema in the structure that is returned from the DA
 */
export type UserAccount = z.infer<typeof user_account_schema>;
