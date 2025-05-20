import { z } from 'zod';
import { responseSchema } from '@services/constants';
import { userProfileSchema } from '@services/User/constants';

export const calendarShareResponseSchema = responseSchema.extend({
  data: z.object({
    user: userProfileSchema,
  }),
});
