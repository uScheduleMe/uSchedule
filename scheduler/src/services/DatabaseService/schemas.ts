import { z } from 'zod';

export const db_credential_schema = z.object({
  password: z.string(),
  username: z.string(),
});

export const user_schema = z.object({
  emails: z.array(z.object({ email_address: z.string().email() })),
  family_name: z.string(),
  given_name: z.string(),
  providers: z.array(z.object({ provider: z.string() })),
  uuid: z.string().uuid(),
});

export type User = z.infer<typeof user_schema>;

export const users_filter_params_schema = z.object({
  shared_with: z.string().uuid().optional(),
});

export type UsersFilterParams = z.infer<typeof users_filter_params_schema>;

export const timetable_component_schema = z.object({
  day: z.string(),
  description: z.string(),
  end_date: z.string(),
  end_time: z.string(),
  id: z.string(),
  instructor: z.string(),
  label: z.string(),
  room: z.string(),
  session_type: z.string(),
  start_date: z.string(),
  start_time: z.string(),
  status: z.string(),
  type: z.string(),
});

export const timetable_component_by_type_schema = z.record(timetable_component_schema.array());

export const timetable_section_by_id_schema = z.object({
  components: z.record(timetable_component_by_type_schema),
  description: z.string(),
  id: z.string(),
  instructor: z.string(),
  label: z.string(),
});

export const timetable_sections_schema = z.record(timetable_section_by_id_schema);

export type TimetableSections = z.infer<typeof timetable_sections_schema>;

export const term_schema = z.object({
  id: z.string(),
  season: z.string(),
  year: z.number(),
});

export type Term = z.infer<typeof term_schema>;
