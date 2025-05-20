import { CsvScheduleFormatter } from './formatters/CsvScheduleFormatter';
import { IcalScheduleFormatter } from './formatters/IcalScheduleFormatter';
import { JsonScheduleFormatter } from './formatters/JsonScheduleFormatter';
import { ScheduleFormatter } from './interfaces/ScheduleFormatter';
import { FILE_FORMAT, FileFormat, ScheduleEntry, ScheduleFileMeta, Term } from './types';

export class ScheduleFileFormatter {
  private static readonly formatters: Record<FileFormat, ScheduleFormatter> = {
    [FILE_FORMAT.CSV]: new CsvScheduleFormatter(),
    [FILE_FORMAT.ICAL]: new IcalScheduleFormatter(),
    [FILE_FORMAT.JSON]: new JsonScheduleFormatter(),
  };

  private static readonly mime_types: Record<FileFormat, string> = {
    [FILE_FORMAT.CSV]: 'text/csv',
    [FILE_FORMAT.ICAL]: 'text/calendar',
    [FILE_FORMAT.JSON]: 'application/json',
  };

  private static readonly file_extensions: Record<FileFormat, string> = {
    [FILE_FORMAT.CSV]: '.csv',
    [FILE_FORMAT.ICAL]: '.ics',
    [FILE_FORMAT.JSON]: '.json',
  };

  /**
   * A utility function that generates the schedule file and meta data with the given data
   * @param entries an array of schedule items to format as requested
   * @param format the file format type
   * @returns the file contents and some meta data
   */
  generateFile(entries: readonly Readonly<ScheduleEntry>[], format: FileFormat): ScheduleFileMeta {
    let file_name = 'uSchedule';
    const term = this.extractTerm(entries);

    if (term) {
      file_name += `_${term.year}-${term.season}`;
    }

    const content_type = ScheduleFileFormatter.mime_types[format];
    const file_extension = ScheduleFileFormatter.file_extensions[format];

    const headers = {
      'Content-Disposition': `attachment; filename=${file_name}${file_extension}`,
      'Content-Type': `${content_type}; charset=utf-8`,
    };

    const body = ScheduleFileFormatter.formatters[format].format(entries, term);

    return { headers, body };
  }

  private extractTerm(entries: readonly Readonly<ScheduleEntry>[]): Term | undefined {
    if (!entries.length) {
      return undefined;
    }

    const [first_term, ...others] = entries.map((x) => x.term);

    const all_terms_are_the_same = others.every(
      (t) => t.year === first_term.year && t.season === first_term.season,
    );

    return all_terms_are_the_same ? first_term : undefined;
  }
}
