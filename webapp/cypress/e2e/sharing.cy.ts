import { createSchedule } from '../helpers/endpoints/schedules';

describe('User and schedule functionality', () => {
  const OTHER_USER_EMAIL = 'otherUser@example.com';

  beforeEach(() => {
    cy.createAccount(OTHER_USER_EMAIL);

    cy.createAccount();
    cy.login();
  });

  it('should share to another user', () => {
    const SCHEDULE_NAME = 'My test schedule';
    createSchedule({ name: SCHEDULE_NAME, in_calendar: true });
    cy.get('@user_uuid').then((uuid) => {
      cy.visit(`/users/${uuid}/calendar`);
    });
    cy.dataCy('val:schedule-name').should('contain', SCHEDULE_NAME);
    cy.dataCy('clk:share-schedule').click();
    cy.dataCy('txt:share-with-email').type(OTHER_USER_EMAIL);
    cy.dataCy('clk:submit-share-form').click();

    // check that the other user can see the share
    cy.login(OTHER_USER_EMAIL);
    cy.visit('/account/shares');
    cy.dataCy('clk:view-calendar').click();
    cy.dataCy('val:schedule-name').should('contain', SCHEDULE_NAME);

    // get back to the previous user
    cy.login();
    cy.get('@user_uuid').then((uuid) => {
      cy.visit(`/users/${uuid}/calendar`);
    });
    cy.dataCy('clk:share-schedule').click();

    // Cleanup
    cy.dataCy('clk:remove-share').click();
    cy.get('.modal-header button.close').click();
    cy.dataCy('clk:delete-schedule').click();
    cy.dataCy('clk:confirm').click();
    cy.dismissToast();
  });
});
