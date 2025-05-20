import { z } from 'zod';

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

export const day_of_week_schema = z.preprocess(
  (val: unknown) => (typeof val === 'string' ? val.toUpperCase() : undefined),
  z.enum(['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']),
);
