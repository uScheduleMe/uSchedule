import { z } from 'zod';

export const userProfileSchema = z.object({
  uuid: z.string().uuid(),
  providers: z
    .array(
      z.object({
        provider: z.string(),
      }),
    )
    .optional(),
  emails: z.array(
    z.object({
      email_address: z.string(),
    }),
  ),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  disp_name: z.string().nullable().optional(),
});

export const userProfileResponseSchema = z.object({
  messages: z.array(z.any()).optional(),
  data: userProfileSchema,
});

export const userProfileListResponseSchema = z.object({
  messages: z.array(z.any()).optional(),
  data: z.array(userProfileSchema),
});
