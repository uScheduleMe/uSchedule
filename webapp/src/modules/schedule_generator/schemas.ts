import { z } from 'zod';
import { time24HrToTimestamp } from './utils';

export const GENERATOR_LIMIT_FALLBACK = 1000;
export const schedule_generator_config_schema = z.object({
  limit: z.number().int().min(1).default(GENERATOR_LIMIT_FALLBACK),
});
export type ScheduleGeneratorConfig = z.input<typeof schedule_generator_config_schema>;

export const time_24h_timestamp_schema = z
  .string()
  .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
  .transform(time24HrToTimestamp);

export const schedule_break_schema = z.object({
  start: time_24h_timestamp_schema,
  end: time_24h_timestamp_schema,
  size: time_24h_timestamp_schema,
});

export const time_conflicts_options_schema = z.enum(['ALL', 'NON_LEC', 'NONE']);

export const schedule_generate_filters_schema = z.object({
  minimize_before_time: time_24h_timestamp_schema.optional(),
  minimize_after_time: time_24h_timestamp_schema.optional(),
  breaks: z.array(schedule_break_schema).default([]),
  allow_time_conflicts: time_conflicts_options_schema.default('NONE'),
  allow_closed_components: z.boolean().default(true),
});

export type ScheduleGenerateFilters = z.infer<typeof schedule_generate_filters_schema>;
export type ScheduleGenerateFiltersPreParsed = z.input<typeof schedule_generate_filters_schema>;

export const course_skeleton_schema = z.object({
  id: z.number(),
  sections: z.record(z.array(z.string())),
});

export type CourseSkeleton = z.infer<typeof course_skeleton_schema>;
