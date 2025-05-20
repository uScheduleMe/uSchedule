import { expect } from 'chai';
import { SinonSandbox, createSandbox } from 'sinon';
import CourseService from './CourseService';
import { DataProvider, Logger } from './types';
import { course_data_1 } from './fixtures/course_data_1';
import { CourseData } from '@services/DataAccess';
import { ScheduleGenerateCourseMeta } from '@route_handlers/schemas';

function getTestArtifacts(course_data: CourseData = course_data_1) {
  const logger: Logger = {
    error: () => undefined,
    warn: () => undefined,
    info: () => undefined,
    debug: () => undefined,
  };
  const data_provider: DataProvider = { getCourse: async () => Promise.resolve(course_data) };
  const service = new CourseService(data_provider, logger);
  return { service, data_provider, logger };
}

describe('Validate CourseService', () => {
  let sandbox: SinonSandbox;

  before(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getCourse()', () => {
    it('should return a course with the correct course data', async () => {
      const { service } = getTestArtifacts();
      const course = await service.getCourse(course_data_1.id);

      expect(course.id).to.equal(course_data_1.id);

      for (const section_data of Object.values(course_data_1.sections)) {
        const section = course.sections.get(section_data.id);
        expect(section).not.to.be.undefined;
        expect(section?.course).to.equal(course);
        expect(section?.id).to.equal(section_data.id);

        for (const component_data of Object.values(section_data.components)) {
          const component = section?.components.get(component_data.id);
          expect(component).not.to.be.undefined;
          expect(component?.course).to.equal(course);
          expect(component?.section).to.equal(section);
          expect(component?.id).to.equal(component_data.id);
        }
      }
    });

    it('should properly handle an input id as a string', async () => {
      const { service, data_provider } = getTestArtifacts();
      const spy = sandbox.spy(data_provider, 'getCourse');
      await service.getCourse(course_data_1.id.toString());
      expect(spy.getCall(0).args[0]).to.equal(course_data_1.id);
    });

    it('should return a course with no sections when the sections meta is an empty list', async () => {
      const { service } = getTestArtifacts();
      const meta: ScheduleGenerateCourseMeta = { id: course_data_1.id, sections: [] };
      const course = await service.getCourse(meta);
      const sections = [...course.sections.values()];
      expect(sections).to.have.lengthOf(0);
    });

    it('should return a course only the sections included in the course meta', async () => {
      const { service } = getTestArtifacts();
      const meta: ScheduleGenerateCourseMeta = { id: course_data_1.id, sections: ['A'] };
      const course = await service.getCourse(meta);
      const sections = [...course.sections.values()];
      expect(sections).to.have.lengthOf(1);
      expect(sections[0].id).to.equal('A');
    });
  });

  describe('getCourses()', () => {
    it('should return a course with the correct course data', async () => {
      const { service } = getTestArtifacts();
      const { data: courses } = await service.getCourses([course_data_1.id]);
      const course = courses[0];

      expect(course.id).to.equal(course_data_1.id);

      for (const section_data of Object.values(course_data_1.sections)) {
        const section = course.sections.get(section_data.id);
        expect(section).not.to.be.undefined;
        expect(section?.course).to.equal(course);
        expect(section?.id).to.equal(section_data.id);

        for (const component_data of Object.values(section_data.components)) {
          const component = section?.components.get(component_data.id);
          expect(component).not.to.be.undefined;
          expect(component?.course).to.equal(course);
          expect(component?.section).to.equal(section);
          expect(component?.id).to.equal(component_data.id);
        }
      }
    });

    it('should return a course with no sections when the sections meta is an empty list', async () => {
      const { service } = getTestArtifacts();
      const meta: ScheduleGenerateCourseMeta = { id: course_data_1.id, sections: [] };
      const { data: courses } = await service.getCourses([meta]);
      const course = courses[0];
      const sections = [...course.sections.values()];
      expect(sections).to.have.lengthOf(0);
    });

    it('should return a course only the sections included in the course meta', async () => {
      const { service } = getTestArtifacts();
      const meta: ScheduleGenerateCourseMeta = { id: course_data_1.id, sections: ['A'] };
      const { data: courses } = await service.getCourses([meta]);
      const course = courses[0];
      const sections = [...course.sections.values()];
      expect(sections).to.have.lengthOf(1);
      expect(sections[0].id).to.equal('A');
    });

    it('should safely handle a rejected promise', async () => {
      const { service, data_provider } = getTestArtifacts();
      data_provider.getCourse = async () => Promise.reject(new Error());
      const meta: ScheduleGenerateCourseMeta = { id: course_data_1.id, sections: ['A'] };
      const { data: courses, messages } = await service.getCourses([meta]);
      expect(courses).to.have.lengthOf(0);
      expect(messages).to.have.lengthOf(1);
    });
  });
});
