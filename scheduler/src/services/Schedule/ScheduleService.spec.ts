import { expect } from 'chai';
import { SinonSandbox, createSandbox } from 'sinon';
import { DataProvider, Logger } from './types';
import ScheduleService from './ScheduleService';
import { CourseData } from '@services/DataAccess';
import { course_data_1 } from './fixtures/course_data_1';
import { CompressedSchedulesBundle } from '@route_handlers/schemas';
import ApiError from '@utils/errors/ApiError';
import { course_data_2 } from './fixtures/course_data_2';

function getTestArtifacts(course_data: CourseData = course_data_1) {
  const logger: Logger = {
    error: () => undefined,
    warn: () => undefined,
    info: () => undefined,
    debug: () => undefined,
  };
  const data_provider: DataProvider = { getCourse: async () => Promise.resolve(course_data) };
  const service = new ScheduleService(data_provider, logger);
  return { service, data_provider, logger };
}

describe('Validate ScheduleService', () => {
  let sandbox: SinonSandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('generateSchedules()', () => {
    it('should return the correct number of schedules', async () => {
      const { service } = getTestArtifacts();
      const {
        data: { schedules },
      } = await service.generateSchedules([{ id: course_data_1.id }]);
      expect(schedules).to.have.lengthOf(2);
    });

    it('should filter out schedules with the meta', async () => {
      const { service } = getTestArtifacts();
      await expect(
        service.generateSchedules([{ id: course_data_1.id, sections: [] }]),
      ).to.be.rejectedWith(ApiError, 'no possible schedules');
    });

    it('should return the correct number of components', async () => {
      const { service } = getTestArtifacts();
      const {
        data: { component_ids },
      } = await service.generateSchedules([{ id: course_data_1.id }]);
      expect(component_ids).to.have.lengthOf(6);
    });

    it('should return the components in the correct compressed format', async () => {
      const { service } = getTestArtifacts();
      const {
        data: { component_ids },
      } = await service.generateSchedules([{ id: course_data_1.id }]);
      const expected: CompressedSchedulesBundle['component_ids'] = [
        [1, 'A', 'A01-LAB'],
        [1, 'A', 'A02-LAB'],
        [1, 'A', 'A04-LAB'],
        [1, 'A', 'A06-TUT'],
        [1, 'A', 'A00-LEC-0'],
        [1, 'A', 'A00-LEC-1'],
      ];
      expect(component_ids).to.have.deep.members(expected);
    });

    it('should throw an error when there are no courses found', async () => {
      const { service, data_provider } = getTestArtifacts();
      sandbox.stub(data_provider, 'getCourse').returns(Promise.reject(new Error()));
      await expect(service.generateSchedules([{ id: course_data_1.id }])).to.be.rejectedWith(
        ApiError,
        'None of the course data',
      );
    });

    it('should throw an error when there are no schedule results', async () => {
      const { service, data_provider } = getTestArtifacts();
      sandbox.stub(data_provider, 'getCourse').returns(Promise.resolve(course_data_2));
      await expect(service.generateSchedules([{ id: course_data_1.id }])).to.be.rejectedWith(
        ApiError,
        'no possible schedules',
      );
    });

    it('should return a message if the limit was reached', async () => {
      const { service } = getTestArtifacts();
      const { messages } = await service.generateSchedules([{ id: course_data_1.id }], undefined, {
        limit: 1,
      });
      expect(messages).to.have.lengthOf(1);
    });
  });
});
