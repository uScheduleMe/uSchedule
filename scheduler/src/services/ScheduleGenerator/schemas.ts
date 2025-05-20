import { z } from 'zod';

export const day_of_week_schema = z.preprocess(
  (val: unknown) => (typeof val === 'string' ? val.toUpperCase() : undefined),
  z.enum(['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']),
);

export const schedule_generate_timetable_meta_schema = z.object({
  id: z.string(),
  is_mandatory: z.boolean().optional(),
  sections: z.array(z.string()).optional(),
});

export type ScheduleGenerateTimetableMeta = z.infer<typeof schedule_generate_timetable_meta_schema>;

export const compressed_schedule_schema = z.number().array().array();

export const schedule_generate_course_meta_schema = z.object({
  id: z.string(),
  is_mandatory: z.boolean().optional(),
  sections_to_include: z.array(z.string()).optional(),
});

export type ScheduleGenerateCourseMeta = z.infer<typeof schedule_generate_course_meta_schema>;

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
