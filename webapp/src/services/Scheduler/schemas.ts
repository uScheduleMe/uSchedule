import { z } from 'zod';
import { TermSeasons } from '@models/Term';
import { responseSchema } from '@services/constants';

export const scheduleSkeletonSchema = z.object({
  name: z.string().optional(),
  in_calendar: z.boolean(),
  term: z.object({
    season: z.string(),
    year: z.number(),
  }),
  timetable_components: z.record(
    z.object({
      id: z.number(),
      school: z.string(),
      season: z.string(),
      year: z.number(),
      subject_code: z.string(),
      course_code: z.string(),
      sections: z.record(z.array(z.string())),
    }),
  ),
});

export const scheduleSkeletonResponseSchema = responseSchema.extend({
  data: scheduleSkeletonSchema,
});

export const day_of_week_schema = z.preprocess(
  (val: unknown) => (typeof val === 'string' ? val.toUpperCase() : undefined),
  z.enum(['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']),
);

export const component_type_schema = z.preprocess(
  (val: unknown) => (typeof val === 'string' ? val.toUpperCase() : undefined),
  z.enum(['LEC', 'LAB', 'TUT', 'DGD']),
);

export const component_status_schema = z.preprocess(
  (val: unknown) => (typeof val === 'string' && val ? val.toUpperCase() : undefined),
  z.enum(['OPEN', 'CLOSED']).default('OPEN'),
);

export const courseComponentSchema = z.object({
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

export const courseSectionSchema = z.object({
  id: z.string(),
  label: z.string(),
  instructor: z.string(),
  description: z.string(),
  num_components: z.number(),
  components: z.record(courseComponentSchema),
});

export const season_schema = z.enum(['fall', 'winter', 'summer']);

export const courseSchema = z.object({
  id: z.number(),
  school: z.string(),
  year: z.number(),
  term: season_schema,
  subject_code: z.string(),
  course_code: z.string(),
  course_name: z.string(),
  sections: z.record(courseSectionSchema),
});

export const scheduleComponentSchema = z.object({
  component_id: z.string(),
  course_id: z.number(),
  section_id: z.string(),
  guid: z.string(),
});

export const scheduleSchema = z.object({
  start_time: z.number(),
  end_time: z.number(),
  num_courses: z.number(),
  num_courses_attempted: z.number(),
  num_before_start_filter: z.number(),
  num_after_end_filter: z.number(),
  num_lec_time_conflicts: z.number(),
  components: z.array(scheduleComponentSchema),
});

export const termSkeletonSchema = z.object({
  season: z.nativeEnum(TermSeasons),
  year: z.number(),
});

export const extendedScheduleSchema = scheduleSchema.extend({
  term: termSkeletonSchema,
  name: z.string(),
  id: z.number(),
  in_calendar: z.boolean(),
});

export const scheduleSetSchema = z.array(scheduleSchema);

export const generatorResponseSchema = responseSchema.extend({
  data: z.object({ schedule_sets: z.array(scheduleSetSchema) }),
});

export const scheduleResponseSchema = responseSchema.extend({
  data: extendedScheduleSchema,
});

export const extendedScheduleSetResponseSchema = responseSchema.extend({
  data: z.array(extendedScheduleSchema),
});

export const courseResponseSchema = responseSchema.extend({
  data: courseSchema,
});

export type TermSkeleton = typeof termSkeletonSchema._type;

export type ScheduleSkeletonSchema = typeof scheduleSkeletonSchema._type;

export type ScheduleSchema = typeof scheduleSchema._type;

export type ScheduleSchemaExtended = typeof extendedScheduleSchema._type;

export type ScheduleComponentSkeleton = typeof scheduleComponentSchema._type;

export type CourseSchema = typeof courseSchema._type;

export type CourseSectionSchema = typeof courseSectionSchema._type;

export type CourseSectionComponentSchema = typeof courseComponentSchema._type;

export const generatorResponseSchemaV2 = responseSchema.extend({
  data: z.object({
    component_ids: z.tuple([z.number(), z.string(), z.string()]).array(),
    schedules: z.number().array().array().array(),
  }),
});

export type CompressedSchedulesBundle = z.infer<typeof generatorResponseSchemaV2>['data'];
