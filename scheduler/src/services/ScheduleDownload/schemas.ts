import { z } from 'zod';

export const timetable_skeleton_schema = z.object({
  id: z.string(),
  sections: z.record(z.array(z.string())),
});

export type TimetableSkeleton = z.infer<typeof timetable_skeleton_schema>;
