import { TermSeasons } from '@models/Term';
import { z } from 'zod';

export const availableTermsSchema = z.object({
  messages: z.array(z.any()),
  data: z.array(
    z.object({
      year: z.number(),
      term: z.nativeEnum(TermSeasons),
    }),
  ),
});
