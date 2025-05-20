import { expect } from 'chai';
import { TimetableService } from './TimetableService';
import { MockTimetableDataProvider } from './__test__/MockTimetableDataProvider';
import { iti_1121_fall_2020_source } from './__test__/iti_1121_fall_2020_source';
import { iti_1121_fall_2020_transformed } from './__test__/iti_1121_fall_2020_transformed';
import {
  iti_1121_fall_2020_summary_source,
  iti_1121_fall_2020_summary_transformed,
} from './__test__/iti_1121_fall_2020_summary';
import { SinonSandbox, createSandbox } from 'sinon';

describe('TimetableService', () => {
  let sandbox: SinonSandbox;
  let service: TimetableService;
  let data_provider: MockTimetableDataProvider;

  before(() => {
    sandbox = createSandbox();
  });

  beforeEach(() => {
    data_provider = new MockTimetableDataProvider();
    service = new TimetableService(data_provider);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('full_course_code_pattern', () => {
    it('should return the values in the correct capture groups when given a matched value', () => {
      // Arrange
      const test = 'ITI1121';
      // Act
      const groups = TimetableService.full_course_code_pattern.exec(test)?.groups;
      // Assert
      const expected = { subject_code: 'ITI', course_code: '1121' };
      expect(groups).to.deep.equal(expected);
    });

    it('should return the correct values when given an input with a space between groups', () => {
      // Arrange
      const test = 'ITI 1121';
      // Act
      const groups = TimetableService.full_course_code_pattern.exec(test)?.groups;
      // Assert
      const expected = { subject_code: 'ITI', course_code: '1121' };
      expect(groups).to.deep.equal(expected);
    });

    it('should return the correct values when given an input with other text around the match', () => {
      // Arrange
      const test = 'a course called ITI 1121 at uOttawa';
      // Act
      const groups = TimetableService.full_course_code_pattern.exec(test)?.groups;
      // Assert
      const expected = { subject_code: 'ITI', course_code: '1121' };
      expect(groups).to.deep.equal(expected);
    });

    it('should not match the course when given an input where the text before the course code has more than 4 characters', () => {
      // Arrange
      const test = 'a course called 1121 at uOttawa';
      // Act
      const match = TimetableService.full_course_code_pattern.exec(test);
      // Assert
      expect(match).to.be.null;
    });

    it('should not match the course when given an input that has no subject and course code in it', () => {
      // Arrange
      const test = 'Into to Computing II';
      // Act
      const match = TimetableService.full_course_code_pattern.exec(test);
      // Assert
      expect(match).to.be.null;
    });
  });

  describe('getTimetableById', () => {
    it('should the correctly transform the timetable from the data provider', async () => {
      // Arrange
      data_provider.timetable = iti_1121_fall_2020_source;
      // Act
      const timetable = await service.getTimetableById('1');
      // Assert
      expect(timetable).to.deep.equal(iti_1121_fall_2020_transformed);
    });

    it('should return null if there are no result from the data provider', async () => {
      // Arrange
      data_provider.timetable = undefined;
      // Act
      const timetable = await service.getTimetableById('1');
      // Assert
      expect(timetable).to.be.null;
    });
  });

  describe('getTimetableByQuery', () => {
    const timetable_query = {
      term: { year: 1, season: 'season' },
      subject_code: 'subject_code',
      course_code: 'course_code',
      school: 'school',
    };

    it('should the correctly transform the timetable from the data provider', async () => {
      // Arrange
      data_provider.timetable = iti_1121_fall_2020_source;
      // Act
      const timetable = await service.getTimetableByQuery(timetable_query);
      // Assert
      expect(timetable).to.deep.equal(iti_1121_fall_2020_transformed);
    });

    it('should return null if there are no result from the data provider', async () => {
      // Arrange
      data_provider.timetable = undefined;
      // Act
      const timetable = await service.getTimetableByQuery(timetable_query);
      // Assert
      expect(timetable).to.be.null;
    });
  });

  describe('searchForSummaries', () => {
    const summary_query = {
      term: { year: 1, season: 'season' },
      search: 'search',
    };

    it('should the correctly transform the summary from the data provider', async () => {
      // Arrange
      data_provider.timetable_summaries = [iti_1121_fall_2020_summary_source];
      // Act
      const timetable = await service.searchForSummaries(summary_query.search, summary_query.term);
      // Assert
      expect(timetable).to.deep.equal([iti_1121_fall_2020_summary_transformed]);
    });

    it('should return an empty list if there are no result from the data provider', async () => {
      // Arrange
      data_provider.timetable_summaries = [];
      // Act
      const timetable = await service.searchForSummaries(summary_query.search, summary_query.term);
      // Assert
      expect(timetable).to.deep.equal([]);
    });

    it('should make the query with the full search string if there is no course/subject code embedded', async () => {
      // Arrange
      const spy = sandbox.spy(data_provider, 'getTimetableSummaries');
      // Act
      await service.searchForSummaries('Give me a course');
      // Assert
      expect(spy.called).to.be.true;
    });

    it('should make the query with the course/subject code if they are embedded in the search term', async () => {
      // Arrange
      const spy = sandbox.spy(data_provider, 'getTimetableSummaries');
      // Act
      await service.searchForSummaries('Give me ITI 1121');
      // Assert
      expect(spy.called).to.be.true;
    });
  });
});
