import { z } from 'zod';

export const environmentSchema = z.record(z.string().optional());
