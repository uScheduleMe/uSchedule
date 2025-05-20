import { ZodSchema, z } from 'zod';

/*
 * Zod parsing for general json data
 */
export type Literal = boolean | number | string | null;
// Cannot use Record<string, Json> here, or typescript yells about a circular reference
export type Json = Json[] | Literal | { [key: string]: Json };
export const literal_schema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
export const json_schema: ZodSchema<Json> = z.lazy(() =>
  z.union([literal_schema, z.array(json_schema), z.record(json_schema)]),
);

/*
 * Zod parsing for an API Response Message
 */
export const response_message_schema = z.object({
  code: z.string().default('unknown'),
  message: z.string(),
  type: z.enum(['info', 'warning', 'error']),
  title: z.string(),
  vars: z.record(z.unknown()).optional(),
});

/*
 * Zod parsing for API Responses with Messages, which can be extended to override the data component with a specific type
 */
export const response_schema = z.object({
  messages: z.array(response_message_schema),
  data: z.unknown(),
});

export type ResponseSchema = z.infer<typeof response_schema>;
