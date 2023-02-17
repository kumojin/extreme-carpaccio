import { Given } from '@badeball/cypress-cucumber-preprocessor';

Given(/^I'm on the website$/, () => {
  cy.get('html').invoke('css', 'height', 'initial');
  cy.get('body').invoke('css', 'height', 'initial');
  cy.visit('http://localhost:3000/');
});
