/// <reference types="cypress" />
import { Given, When, And, Then } from 'cypress-cucumber-preprocessor/steps';
import '@testing-library/cypress/add-commands';

Given(/^I'm a Seller$/, () => {
  cy.intercept(
    'POST',
    'http://localhost:5173/seller',

    (req) => {
      if (req.body.includes('Xavier') || req.body.includes('newPassword')) {
        req.reply({ statusCode: 201, body: {} });
      } else {
        req.reply({ statusCode: 404, body: {} });
      }
    }
  );
  cy.visit('http://localhost:5173/');
});
When('I write the field {string} {string} with {string}', (_, label, value) => {
  cy.get(`[aria-label="your ${label}"]`).type(value);
});

And('I write the field {string} {string} with {string}', (_, label, value) => {
  cy.get(`[aria-label="your ${label}"]`).type(value);
});

And('I click on the button {string}', (label) => {
  cy.contains(label).click();
});

Then('I see on the tab {string} with {string}', (name, cash) => {
  cy.get('.table-responsive').contains(name);
  cy.get('.table-responsive').contains(cash);
});

Then('I see an error message: {string}', (message) => {
  cy.get('.alert').contains(message);
});

Then("I don't see on the tab {string} with {string}", (name, cash) => {
  cy.get('.table-responsive').contains(name).should('not.exist');
  cy.get('.table-responsive').contains(cash).should('not.exist');
});

Then('I observe the reset of input', () => {
  cy.get(`[aria-label="your username"]`).should('have.value', '');
  cy.get(`[aria-label="your password"]`).should('have.value', '');
  cy.get(`[aria-label="your url"]`).should('have.value', '');
});

And("I don't see an error message: {string}", (message) => {
  cy.get('.alert').should('not.exist');
});

Then(
  'I observe the field {string} {string} with {string}',
  (_, label, value) => {
    cy.get(`[aria-label="your ${label}"]`).should('have.value', value);
  }
);
