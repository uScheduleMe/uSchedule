import { course_skeleton_schema } from '@services/DataAccess';
import moment from 'moment';
import { z } from 'zod';
import { schedule_generate_filters_schema as schedule_generate_v2_filters_schema } from '@modules/schedule_generator';

export const time24HrToUnixTime = (time: string): number =>
  moment(`1970-01-01 ${time}:00 +00:00`, 'YYYY-MM-DD hh:mm:ss Z').unix();

export const time_24_hour_schema = z
  .string()
  .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
  .transform(time24HrToUnixTime);

export const boolean_string_schema = z.enum(['true', 'false']);

export const course_query_data_schema = z.object({
  school: z.string(),
  subject_code: z.string(),
  course_code: z.string(),
  season: z.string(),
  year: z.string(),
});

export type CourseQueryData = z.infer<typeof course_query_data_schema>;

export const download_formats_schema = z.enum(['ical', 'json', 'csv']);

export type ScheduleDownloadFormat = z.infer<typeof download_formats_schema>;

export const schedule_download_query_data_schema = z.object({
  format: download_formats_schema.optional(),
  season: z.string().optional(),
  year: z.string().optional(),
});

export const schedule_download_body_data_schema = schedule_download_query_data_schema.extend({
  year: z.number().optional(),
  courses: z.array(course_skeleton_schema).nonempty(),
});

export type ScheduleDownloadQueryData = z.infer<typeof schedule_download_query_data_schema>;
export type ScheduleDownloadBodyData = z.infer<typeof schedule_download_body_data_schema>;

export const schedules_query_data_schema = z
  .object({
    user_uuid: z.string().uuid(),
    in_calendar: boolean_string_schema,
  })
  .partial();

export type SchedulesQueryData = z.infer<typeof schedules_query_data_schema>;

export const schedules_by_user_query_data_schema = schedules_query_data_schema.extend({
  user_uuid: schedules_query_data_schema.shape.user_uuid.unwrap(),
});

export type SchedulesByUserQueryData = z.infer<typeof schedules_by_user_query_data_schema>;

export const time_conflicts_options_schema = z.enum(['ALL', 'NON_LEC', 'NONE']);

export const schedule_break_schema = z.object({
  start: time_24_hour_schema,
  end: time_24_hour_schema,
  size: time_24_hour_schema,
});

export const schedule_generate_filters_schema = z.object({
  minimize_before_time: time_24_hour_schema.optional(),
  minimize_after_time: time_24_hour_schema.optional(),
  breaks: z.array(schedule_break_schema).default([]),
  allow_time_conflicts: time_conflicts_options_schema.default('NONE'),
  allow_closed_components: z.boolean().default(true),
});

export const schedule_generate_course_meta_schema = z.object({
  id: z.number(),
  is_mandatory: z.boolean().optional(),
  sections: z.array(z.string()).optional(),
});

export const schedule_generate_body_data_schema = z.object({
  filters: schedule_generate_filters_schema.optional(),
  courses: z.array(schedule_generate_course_meta_schema).nonempty(),
});

export type TimeConflictsOptions = z.infer<typeof time_conflicts_options_schema>;
export type ScheduleBreak = z.infer<typeof schedule_break_schema>;

export type ScheduleGenerateFilters = z.infer<typeof schedule_generate_filters_schema>;
export type ScheduleGenerateCourseMeta = z.infer<typeof schedule_generate_course_meta_schema>;

export type ScheduleGenerateBodyData = z.infer<typeof schedule_generate_body_data_schema>;

export const schedule_generate_v2_body_data_schema = z.object({
  filters: schedule_generate_v2_filters_schema.optional(),
  courses: z.array(schedule_generate_course_meta_schema).nonempty(),
});

export type ScheduleGenerateV2BodyData = z.infer<typeof schedule_generate_v2_body_data_schema>;

export const course_summary_query_data_schema = z.object({
  search: z.string(),
  term_id: z.string().optional(),
});

export type CourseSummaryQueryData = z.infer<typeof course_summary_query_data_schema>;

export const url_param_id_schema = z.object({ id: z.string() });

export const compressed_schedule_schema = z.number().array().array();

/**
 * The first (outer) dimension is the list of schedule components.
 * The second (inner) dimension is to group alternate components together as one schedule component.
 * The number is the position of the component id info in the component_ids list
 */
export type CompressedSchedule = z.infer<typeof compressed_schedule_schema>;

export const compressed_component_guid_schema = z.tuple([z.number(), z.string(), z.string()]);

export type CompressedComponentGuid = [course_id: number, section_id: string, component_id: string];

export const compressed_schedules_bundle_schema = z.object({
  component_ids: compressed_component_guid_schema.array(),
  schedules: compressed_schedule_schema.array(),
});

export type CompressedSchedulesBundle = z.infer<typeof compressed_schedules_bundle_schema>;

export const ci_token_user_query_data_schema = z.object({
  sub: z.string().uuid(),
  scopes: z.string(),
});

export const available_terms_input_schema = z.object({
  available: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
});
