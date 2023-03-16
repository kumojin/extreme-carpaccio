import { baseUrl } from './../share-util';
/// <reference types="cypress" />
import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import '@testing-library/cypress/add-commands';

Given(/^I'm a Seller$/, () => {
  cy.intercept(
    'POST',
    `${baseUrl}/seller`,

    (req) => {
      if (req.body.includes('Xavier') || req.body.includes('newPassword')) {
        req.reply({ statusCode: 201, body: {} });
      } else if (req.body.includes('Sandrine')) {
        req.reply({ statusCode: 500 });
      } else {
        req.reply({ statusCode: 404, body: {} });
      }
    }
  );
  cy.visit(baseUrl);
});
When('I write the field {string} {string} with {string}', (_, label, value) => {
  cy.get(`[aria-label="your ${label}"]`).type(value);
});

Then('I click on the button {string}', (label) => {
  cy.contains(label).click();
});

Then('I see on the tab {string} with {string}', (name, cash) => {
  cy.get('.table-responsive').contains(name);
  cy.get('.table-responsive').contains(cash);
});

Then('I see an error message: {string}', (message) => {
  cy.get('.alert').contains(message);
});

Then('I see an error message for the input: {string}', (label) => {
  cy.get('input:invalid').should('have.length', 1);
  cy.get(`#${label}`).then((input) => {
    expect(input[0].validationMessage).to.eq('Please fill out this field.');
  });
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

Then("I don't see an error message: {string}", (message) => {
  cy.get('.alert').should('not.exist');
});

Then(
  'I observe the field {string} {string} with {string}',
  (_, label, value) => {
    cy.get(`[aria-label="your ${label}"]`).should('have.value', value);
  }
);
