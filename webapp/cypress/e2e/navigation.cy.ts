describe('Header bar navigation', () => {
  beforeEach(() => {
    cy.createAccount();
    cy.login();
  });

  it('should navigate to calendar', () => {
    cy.visit('');
    cy.dataCy('clk:nav-user-icon').click();
    cy.dataCy('clk:calendar-nav').click();
    cy.get('@user_uuid').then((uuid) => {
      cy.url().should('eq', `${Cypress.config().baseUrl}/users/${uuid}/calendar`);
    });
  });

  it('should navigate to drafts', () => {
    cy.visit('');
    cy.dataCy('clk:nav-user-icon').click();
    cy.dataCy('clk:drafts-nav').click();
    cy.get('@user_uuid').then((uuid) => {
      cy.url().should('eq', `${Cypress.config().baseUrl}/users/${uuid}/drafts`);
    });
  });

  it('should navigate to settings', () => {
    cy.visit('');
    cy.dataCy('clk:nav-user-icon').click();
    cy.dataCy('clk:settings-nav').click();
    cy.url().should('eq', `${Cypress.config().baseUrl}/account/settings`);
  });

  it('should navigate to shared with me', () => {
    cy.visit('');
    cy.dataCy('clk:nav-user-icon').click();
    cy.dataCy('clk:shares-nav').click();
    cy.url().should('eq', `${Cypress.config().baseUrl}/account/shares`);
  });
});
