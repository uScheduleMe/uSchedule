import { expect } from 'chai';
import { test_schedule_entry } from './formatters/__test__/test_schedule_entry';
import { ScheduleFileFormatter } from './ScheduleFileFormatter';
import { FILE_FORMAT, FileFormat } from './types';

const formats = Object.values(FILE_FORMAT);

describe('ScheduleFileFormatter', () => {
  const formatter = new ScheduleFileFormatter();

  for (const format of formats) {
    describe(format, () => {
      it('should set the attachment property in the "Content-Disposition" header', () => {
        const actual = formatter.generateFile([test_schedule_entry], format).headers[
          'Content-Disposition'
        ];
        expect(actual).to.includes('attachment;');
      });

      it('should not set the term in the "Content-Disposition" header "filename" when the entries include more than one term', () => {
        const actual = formatter.generateFile(
          [test_schedule_entry, { ...test_schedule_entry, term: { year: 2021, season: 'fall' } }],
          format,
        ).headers['Content-Disposition'];
        expect(actual).to.match(/uSchedule\./);
      });

      it('should set the term in the "Content-Disposition" header "filename" when the entries are for the same term', () => {
        const actual = formatter.generateFile([test_schedule_entry], format).headers[
          'Content-Disposition'
        ];
        expect(actual).to.match(/uSchedule_2020-season/);
      });

      it('should set the charset in the "Content-Type" header to "utf-8"', () => {
        const actual = formatter.generateFile([test_schedule_entry], format).headers[
          'Content-Type'
        ];
        expect(actual).to.includes('charset=utf-8');
      });
    });
  }

  describe('csv', () => {
    let format: FileFormat;

    beforeEach(() => {
      format = FILE_FORMAT.CSV;
    });

    it('should produce a csv file', () => {
      const actual = formatter.generateFile([test_schedule_entry], format).body;
      expect(actual).to.match(/^Year,Season,.*\n2020,season/);
    });

    it('should set the file extension in the "Content-Disposition" header to ".csv"', () => {
      const actual = formatter.generateFile([test_schedule_entry], format).headers[
        'Content-Disposition'
      ];
      expect(actual).to.match(/\.csv$/);
    });

    it('should set the content type in the "Content-Type" header to "text/csv"', () => {
      const actual = formatter.generateFile([test_schedule_entry], format).headers['Content-Type'];
      expect(actual).to.includes('text/csv;');
    });
  });

  describe('ical', () => {
    let format: FileFormat;

    beforeEach(() => {
      format = FILE_FORMAT.ICAL;
    });

    it('should produce an ical file', () => {
      const actual = formatter.generateFile([test_schedule_entry], format).body;
      expect(actual).to.match(/^BEGIN:VCALENDAR/);
    });

    it('should set the file extension in the "Content-Disposition" header to ".ics"', () => {
      const actual = formatter.generateFile([test_schedule_entry], format).headers[
        'Content-Disposition'
      ];
      expect(actual).to.match(/\.ics$/);
    });

    it('should set the content type in the "Content-Type" header to "text/calendar"', () => {
      const actual = formatter.generateFile([test_schedule_entry], format).headers['Content-Type'];
      expect(actual).to.includes('text/calendar;');
    });
  });

  describe('json', () => {
    let format: FileFormat;

    beforeEach(() => {
      format = FILE_FORMAT.JSON;
    });

    it('should produce valid JSON', () => {
      const actual = formatter.generateFile([test_schedule_entry], format).body;
      expect(() => JSON.parse(actual)).to.not.throw();
    });

    it('should set the file extension in the "Content-Disposition" header to ".json"', () => {
      const actual = formatter.generateFile([test_schedule_entry], format).headers[
        'Content-Disposition'
      ];
      expect(actual).to.match(/\.json$/);
    });

    it('should set the content type in the "Content-Type" header to "application/json"', () => {
      const actual = formatter.generateFile([test_schedule_entry], format).headers['Content-Type'];
      expect(actual).to.includes('application/json;');
    });
  });
});
