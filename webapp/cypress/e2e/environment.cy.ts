describe('Environment setup', () => {
  it('should have the correct value for the document data-env attribute', () => {
    cy.visit('');
    cy.get('html').should('have.attr', 'data-env', 'env');
  });
});
