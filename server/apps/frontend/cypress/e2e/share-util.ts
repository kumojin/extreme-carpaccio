import { Given } from '@badeball/cypress-cucumber-preprocessor';

export const baseUrl = 'http://localhost:3000/';

Given(/^I'm on the website$/, () => {
  cy.get('html').invoke('css', 'height', 'initial');
  cy.get('body').invoke('css', 'height', 'initial');
  cy.visit(baseUrl);
});
