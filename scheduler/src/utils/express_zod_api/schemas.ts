import { z } from 'zod';

export const empty_input_schema = z.object({});
export const any_input_schema = z.object({}).passthrough();
