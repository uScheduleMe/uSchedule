import { z } from 'zod';

export const day_of_week_schema = z.preprocess(
  (val: unknown) => (typeof val === 'string' ? val.toUpperCase() : undefined),
  z.enum(['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']),
);
