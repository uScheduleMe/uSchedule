describe('login process', () => {
  it('should login programmatically', () => {
    cy.createAccount();
    cy.login();
    cy.visit('');
    cy.dataCy('clk:nav-user-icon');
  });

  it('should not be logged in', () => {
    cy.visit('');
    cy.dataCy('clk:nav-sign-in');
  });
});
