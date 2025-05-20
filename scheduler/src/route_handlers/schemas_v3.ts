import { FILE_FORMAT } from '@modules/schedule_file_formatter';
import { timetable_skeleton_schema } from '@services/ScheduleDownload';
import { z } from 'zod';

export const url_param_id_schema = z.object({ id: z.string() });

export const download_formats_schema = z.nativeEnum(FILE_FORMAT).default(FILE_FORMAT.ICAL);

export const schedule_download_by_id_input_schema = z.object({
  format: download_formats_schema,
});

export const schedule_download_by_skeleton_input_schema =
  schedule_download_by_id_input_schema.extend({
    timetable_skeletons: z.array(timetable_skeleton_schema).nonempty(),
  });
