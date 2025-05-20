import { z } from 'zod';
import { environmentSchema } from './constants';

/**
 * Schema of the environment variables object. The contents can be a string or undefined.
 */
export type EnvironmentSchema = z.infer<typeof environmentSchema>;
