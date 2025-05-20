import { CoursesPage, Terms } from '../helpers/courses';
import { createSchedule } from '../helpers/endpoints/schedules';

describe('User and schedule functionality', () => {
  let coursesTab: CoursesPage;
  before(() => {
    coursesTab = new CoursesPage();
  });

  beforeEach(() => {
    cy.createAccount();
    cy.login();
  });

  it('should edit user details', () => {
    cy.visit('account/settings');
    cy.dataCy('clk:user-edit').click();
    cy.dataCy('txt:first-name').clear().type('Johnny');
    cy.dataCy('txt:last-name').clear().type('uSchedule');
    cy.dataCy('clk:save-user').click();
    cy.dismissToast();
    cy.dataCy('val:display-name').should('contain', 'Johnny uSchedule');
  });

  it('should save a schedule to calendar and delete', () => {
    const SCHEDULE_NAME = 'My test schedule';
    cy.visit('');
    const testYear = 2020;
    coursesTab.addNewCourse(testYear, Terms.winter, 'CSI', '2120');
    cy.get('#schedule-builder-tab-schedule').click();
    cy.dataCy('clk:save-schedule').click();
    cy.dataCy('txt:schedule-name').type(SCHEDULE_NAME);
    cy.dataCy('clk:save-calendar').click();
    cy.dismissToast();
    cy.get('@user_uuid').then((uuid) => {
      cy.visit(`/users/${uuid}/calendar`);
    });
    cy.dataCy('val:schedule-name').should('contain', SCHEDULE_NAME);
    cy.dataCy('clk:delete-schedule').click();
    cy.dataCy('clk:confirm').click();
    cy.dismissToast();
    cy.dataCy('val:no-calendars').should('be.visible');
  });

  it('should save a schedule as draft and delete', () => {
    const SCHEDULE_NAME = 'My test schedule';
    cy.visit('');
    const testYear = 2020;
    coursesTab.addNewCourse(testYear, Terms.winter, 'CSI', '2120');
    cy.get('#schedule-builder-tab-schedule').click();
    cy.dataCy('clk:save-schedule').click();
    cy.dataCy('txt:schedule-name').type(SCHEDULE_NAME);
    cy.dataCy('clk:save-draft').click();
    cy.dismissToast();
    cy.get('@user_uuid').then((uuid) => {
      cy.visit(`/users/${uuid}/drafts`);
    });
    cy.dataCy('val:schedule-name').should('contain', SCHEDULE_NAME);
    cy.dataCy('clk:delete-schedule').click();
    cy.dataCy('clk:confirm').click();
    cy.dismissToast();
    cy.dataCy('val:no-drafts').should('be.visible');
  });

  it('should move draft to calendar', () => {
    const SCHEDULE_NAME = 'My test schedule';
    createSchedule({ name: SCHEDULE_NAME, in_calendar: false });
    cy.get('@user_uuid').then((uuid) => {
      cy.visit(`/users/${uuid}/drafts`);
    });
    cy.dataCy('val:schedule-name').should('contain', SCHEDULE_NAME);
    cy.dataCy('clk:open-calendar-options').click();
    cy.dataCy('clk:move-to-calendar').click();
    cy.dismissToast();
    cy.dataCy('val:no-drafts').should('be.visible');
    cy.get('@user_uuid').then((uuid) => {
      cy.visit(`/users/${uuid}/calendar`);
    });
    cy.dataCy('val:schedule-name').should('contain', SCHEDULE_NAME);
    cy.dataCy('clk:delete-schedule').click();
    cy.dataCy('clk:confirm').click();
    cy.dismissToast();
  });

  it('should move calendar to draft', () => {
    const SCHEDULE_NAME = 'My test schedule';
    createSchedule({ name: SCHEDULE_NAME, in_calendar: true });
    cy.get('@user_uuid').then((uuid) => {
      cy.visit(`/users/${uuid}/calendar`);
    });
    cy.dataCy('val:schedule-name').should('contain', SCHEDULE_NAME);
    cy.dataCy('clk:move-to-drafts').click();
    cy.dismissToast();
    cy.dataCy('val:no-calendars').should('be.visible');
    cy.get('@user_uuid').then((uuid) => {
      cy.visit(`/users/${uuid}/drafts`);
    });
    cy.dataCy('val:schedule-name').should('contain', SCHEDULE_NAME);
    cy.dataCy('clk:delete-schedule').click();
    cy.dataCy('clk:confirm').click();
    cy.dismissToast();
  });
});
