import { z } from 'zod';

export const theme_option_schema = z.enum(['light', 'dark', 'auto']);
