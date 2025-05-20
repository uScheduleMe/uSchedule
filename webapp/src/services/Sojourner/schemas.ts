import { z } from 'zod';

const base_universal_search_result_schema = z.object({
  id: z.number(),
  name: z.string(),
});

export const activity_universal_search_result_schema = base_universal_search_result_schema.extend({
  type: z.literal('activity'),
  subtype: z.enum(['course']),
});

export const accreditation_universal_search_result_schema =
  base_universal_search_result_schema.extend({
    type: z.literal('accreditation'),
  });

export const universal_search_result_schema = z.union([
  activity_universal_search_result_schema,
  accreditation_universal_search_result_schema,
]);

export type UniversalSearchResult = z.infer<typeof universal_search_result_schema>;
