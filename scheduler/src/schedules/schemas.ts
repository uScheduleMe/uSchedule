import { z } from 'zod';
import { term_skeleton_schema } from '@services/DataAccess';
import { course_component_conflict_data_schema, plain_course_schema } from '@courses';

export const schedule_component_schema = z.object({
  course_id: z.number(),
  section_id: z.string(),
  component_id: z.string(),
  guid: z.string(),
});

export type ScheduleComponent = z.infer<typeof schedule_component_schema>;

export const schedule_schema = z.object({
  start_time: z.number(),
  end_time: z.number(),
  num_courses: z.number(),
  num_courses_attempted: z.number(),
  num_before_start_filter: z.number(),
  num_after_end_filter: z.number(),
  num_lec_time_conflicts: z.number(),
  components: z.array(schedule_component_schema),
  conflicts: z.record(z.array(course_component_conflict_data_schema)),
});

export type Schedule = z.infer<typeof schedule_schema>;

export const extended_schedule_schema = schedule_schema.extend({
  name: z.string(),
  id: z.number(),
  in_calendar: z.boolean(),
  term: term_skeleton_schema,
});

export type ExtendedSchedule = z.infer<typeof extended_schedule_schema>;

export const schedule_set_schema = z.array(schedule_schema);

export type ScheduleSet = z.infer<typeof schedule_set_schema>;

export const formatted_schedules_schema = z.object({
  num_schedules: z.number().optional(),
  num_schedule_sets: z.number().optional(),
  limit: z.number().optional(),
  did_reach_limit: z.boolean().optional(),
  schedule_sets: z.array(schedule_set_schema),
  courses: z.record(plain_course_schema),
});

export type FormattedSchedules = z.infer<typeof formatted_schedules_schema>;
