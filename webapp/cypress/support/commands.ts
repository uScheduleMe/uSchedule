/* eslint-disable @typescript-eslint/no-namespace */

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

const setServiceToken = () => {
  cy.request('/api/v3/ci/token/service')
    .its('body')
    .then((body) => {
      cy.setCookie('access_token', body.jwt);
    });
};

const login = (email: string = 'test@example.com'): Cypress.Chainable<string> => {
  setServiceToken();
  return cy
    .request(`${Cypress.env('private_api')}/da/v1/users/?email=${email}`)
    .its('body')
    .then((body) => {
      expect(body.data.length).to.equal(1);
      cy.request(`/api/v3/ci/token/user?sub=${body.data[0].uuid}&scopes=profile`)
        .its('body')
        .then((body) => {
          cy.setCookie('access_token', body.jwt);
          cy.setCookie('csrf', body.csrf);
        })
        .then(() => body.data[0].uuid);
    })
    .as('user_uuid');
};

const createAccount = (email: string = 'test@example.com', provider: string = 'google'): void => {
  const INDEX_OF_RADIX = 2;
  const NUMBER_OF_DIGITS_NEEDED = 21;
  setServiceToken();
  cy.request(`${Cypress.env('private_api')}/da/v1/users/?email=${email}`)
    .its('body')
    .then((body) => {
      if (body.data.length === 0) {
        cy.request('POST', `${Cypress.env('private_api')}/da/v1/users/`, {
          providers: [
            {
              provider,
              provider_uid: String(
                Math.random()
                  .toString()
                  .slice(INDEX_OF_RADIX, INDEX_OF_RADIX + NUMBER_OF_DIGITS_NEEDED),
              ),
            },
          ],
          disp_name: 'John Smith',
          given_name: 'John',
          family_name: 'Smith',
          emails: [{ email_address: email }],
        });
      }
    });
};

const dismissToast = (): void => {
  cy.get('.Toastify button.Toastify__close-button').click();
};

const dataCy = (
  selector: string,
  options?: Partial<Cypress.Loggable & Cypress.Timeoutable & Cypress.Withinable & Cypress.Shadow>,
): Cypress.Chainable<JQuery<HTMLElement>> =>
  cy.get(`[data-cy=${selector}]`.replace(':', '\\:'), options);

declare namespace Cypress {
  interface Chainable {
    login: typeof login;
    createAccount: typeof createAccount;
    dismissToast: typeof dismissToast;
    dataCy: typeof dataCy;
  }
}

Cypress.Commands.add('login', login);
Cypress.Commands.add('createAccount', createAccount);
Cypress.Commands.add('dismissToast', dismissToast);
Cypress.Commands.add('dataCy', dataCy);
