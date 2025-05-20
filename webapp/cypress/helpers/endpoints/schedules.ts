import axios from 'axios';
import { CourseSchema, ScheduleSkeletonSchema } from '../../../src/services/Scheduler/schemas';
import { CourseLookupParams } from '@services/Scheduler/types';

type TimetableComponentsMap = ScheduleSkeletonSchema['timetable_components'];

export const createSchedule = (
  extraProps: Partial<ScheduleSkeletonSchema> = {},
  fixture: string = 'simple-CSI2120',
): Cypress.Chainable<void> => {
  return cy.fixture(`schedules/${fixture}`).then((sched: ScheduleSkeletonSchema) => {
    cy.getCookie('csrf').then(async (cookie) => {
      const timetable_components = recreateComponentsWithDbIds(sched.timetable_components);

      const body = { ...sched, timetable_components, ...extraProps };

      cy.request({
        method: 'POST',
        url: '/api/scheduler/v1/schedules/',
        body,
        headers: { 'X-CSRF-TOKEN': cookie?.value },
      });
    });
  });
};

async function recreateComponentsWithDbIds(
  timetable_components: TimetableComponentsMap,
): Promise<TimetableComponentsMap> {
  const result: TimetableComponentsMap = {};

  await Promise.all(
    Object.values(timetable_components).map(async (comp) => {
      const id = await lookUpCourseId(comp);
      result[id] = { ...comp, id };
    }),
  );

  return result;
}

async function lookUpCourseId(params: CourseLookupParams): Promise<CourseSchema['id']> {
  const response = await axios.get<{ data: CourseSchema }>('/api/scheduler/v1/courses/query/', {
    params,
    withCredentials: true,
    xsrfCookieName: 'csrf',
    xsrfHeaderName: 'X-CSRF-TOKEN',
  });

  return response.data.data.id;
}
