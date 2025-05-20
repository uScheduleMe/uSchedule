import { expect } from 'chai';
import { ScheduleDownloadService } from './ScheduleDownloadService';
import { MockTimetableDataProvider } from './__test__/MockTimetableDataProvider';
import { iti_1121_fall_2020_timetable } from './__test__/iti_1121_fall_2020_timetable';
import { FILE_FORMAT } from '@modules/schedule_file_formatter';
import { TimetableSkeleton } from './schemas';
import { SinonSandbox, createSandbox } from 'sinon';
import { Formatter } from './types';
import { iti_1121_fall_2020_entries } from './__test__/iti_1121_fall_2020_entries';
import { iti_1121_fall_2020_meta } from './__test__/iti_1121_fall_2020_meta';
import { iti_1121_fall_2020_skeleton } from './__test__/iti_1121_fall_2020_skeleton';

const skeletons: TimetableSkeleton = {
  id: iti_1121_fall_2020_timetable.id,
  sections: Object.entries(iti_1121_fall_2020_timetable.sections)
    .map(([id, s]) => [id, Object.values(s.components).map((c) => c.id)] as const)
    .reduce<Record<string, string[]>>((obj, [id, c]) => {
      obj[id] = c;
      return obj;
    }, {}),
};

describe('ScheduleDownloadService', () => {
  let sandbox: SinonSandbox;
  let formatter: Formatter;
  let service: ScheduleDownloadService;
  let data_provider: MockTimetableDataProvider;

  before(() => {
    sandbox = createSandbox();
  });

  beforeEach(() => {
    formatter = { generateFile: sandbox.stub() };
    data_provider = new MockTimetableDataProvider();
    service = new ScheduleDownloadService(data_provider, formatter);
  });

  describe('getFileMeta', () => {
    it('should call the formatter with the given format option', async () => {
      await service.getFileMeta(FILE_FORMAT.CSV, [skeletons]);
      expect(formatter.generateFile).to.have.been.calledWithMatch({}, FILE_FORMAT.CSV);
    });

    it('should return no schedule entries when the timetable is not found', async () => {
      data_provider.timetable = null;
      await service.getFileMeta(FILE_FORMAT.CSV, [skeletons]);
      expect(formatter.generateFile).to.have.been.calledWith([]);
    });

    it('should convert the skeleton to schedule entries', async () => {
      data_provider.timetables = [iti_1121_fall_2020_timetable];
      await service.getFileMeta(FILE_FORMAT.CSV, [skeletons]);
      expect(formatter.generateFile).to.have.been.calledWith(iti_1121_fall_2020_entries);
    });

    it('should reject when the timetable query produces an error', async () => {
      data_provider.error = new Error();
      const actual = service.getFileMeta(FILE_FORMAT.CSV, [skeletons]);
      await expect(actual).to.be.rejected;
    });
  });

  describe('getFileMetaByComponentsMeta', () => {
    it('should call the formatter with the given format option', async () => {
      await service.getFileMetaByComponentsMeta([], FILE_FORMAT.CSV);
      expect(formatter.generateFile).to.have.been.calledWithMatch({}, FILE_FORMAT.CSV);
    });

    it('should convert the components to skeletons', async () => {
      const spy = sandbox.spy(service, 'getFileMeta');
      await service.getFileMetaByComponentsMeta(iti_1121_fall_2020_meta, FILE_FORMAT.CSV);
      expect(spy).to.have.been.calledWithMatch('', [iti_1121_fall_2020_skeleton]);
    });
  });
});
