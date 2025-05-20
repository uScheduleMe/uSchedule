import { FileFormat, ScheduleEntry, ScheduleFileMeta } from '@modules/schedule_file_formatter';
import { CourseTimetable } from '@services/Timetable';
import { Logger, getLogger } from '@utils/logger';
import { ComponentMeta, DataProvider, Formatter } from './types';
import { TimetableSkeleton } from './schemas';
import { partitionBy } from '@modules/utilities/partitionBy';

export class ScheduleDownloadService {
  constructor(
    private readonly provider: DataProvider,
    private readonly formatter: Formatter,
    private readonly logger: Logger = getLogger(__filename),
  ) {}

  async getFileMeta(
    format: FileFormat,
    timetable_skeletons: TimetableSkeleton[],
  ): Promise<ScheduleFileMeta> {
    this.logger.debug(
      `Getting file meta by skeletons '${JSON.stringify({ format, timetable_skeletons })}'`,
    );

    const entries = (
      await this.provider.getTimetablesById(timetable_skeletons.map(({ id }) => id))
    ).flatMap((timetable) => {
      const skeleton = timetable_skeletons.find(({ id }) => id === timetable.id);
      return skeleton ? this.toEntries(timetable, skeleton) : [];
    });

    return this.formatter.generateFile(entries, format);
  }

  async getFileMetaByComponentsMeta(components: ComponentMeta[], format: FileFormat) {
    this.logger.debug(`Getting file meta by components meta '${JSON.stringify({ format })}'`);
    const skeletons = this.toSkeletons(components);
    return await this.getFileMeta(format, skeletons);
  }

  private toEntries(timetable: CourseTimetable, skeleton: TimetableSkeleton): ScheduleEntry[] {
    this.logger.debug(
      `Converting timetable to schedule entries: '${JSON.stringify({
        id: timetable.id,
        term: timetable.term,
        code: `${timetable.subject_code} ${timetable.course_code}`,
        name: timetable.course_name,
      })}'`,
    );
    const entries: ScheduleEntry[] = [];

    const getSkeletonSections = (id: string): string[] | undefined => skeleton.sections[id];

    for (const section of Object.values(timetable.sections)) {
      const skeleton_sections = getSkeletonSections(section.id);
      if (!skeleton_sections?.length) {
        continue;
      }

      for (const component of Object.values(section.components)) {
        if (!skeleton_sections.includes(component.id)) {
          continue;
        }

        entries.push({
          course_code: timetable.course_code,
          course_name: timetable.course_name,
          day_of_week: component.day,
          description: component.description,
          end_date: component.end_date,
          end_time: component.end_time,
          id: this.ensureNumPartOfId(component.id),
          instructor: component.instructor,
          label: component.label,
          room: component.room,
          school: timetable.school,
          section_id: section.id,
          section_label: section.label,
          session_type: component.session_type,
          start_date: component.start_date,
          start_time: component.start_time,
          status: component.status,
          subject_code: timetable.subject_code,
          term: timetable.term,
          type: component.type,
        });
      }
    }

    return entries;
  }

  private ensureNumPartOfId(id: string) {
    const [sec_id, type, num] = id.split('-');
    return `${sec_id}-${type}-${num || 0}`;
  }

  private toSkeletons(components_meta: ComponentMeta[]): TimetableSkeleton[] {
    const skeletons = Object.entries(partitionBy(components_meta, (x) => x.timetable_id)).map(
      ([id, meta]) => ({
        id,
        sections: partitionBy(
          meta,
          (x) => x.section_id,
          (x) => x.component_id,
        ),
      }),
    );

    this.logger.debug(`Converting component meta to skeleton '${JSON.stringify({ skeletons })}'`);
    return skeletons;
  }
}
