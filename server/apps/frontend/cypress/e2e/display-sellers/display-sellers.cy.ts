/// <reference types="cypress" />
import { Given, When, And, Then } from 'cypress-cucumber-preprocessor/steps';
import '@testing-library/cypress/add-commands';

const checkTableSellers = (table) => {
  cy.get('.sellers tbody tr').each(($el, index) => {
    cy.get('[aria-label="the name of seller"]')
      .eq(index)
      .should('have.text', table.rawTable[index + 1][0]);
    cy.get('[aria-label="the cash of seller"]')
      .eq(index)
      .contains(table.rawTable[index + 1][1]);
    if (table.rawTable[index + 1][2] == 'false') {
      cy.get('[aria-label="the statut of seller"]').eq(index).find('svg');
    } else {
      cy.get('[aria-label="the statut of seller"]')
        .eq(index)
        .find('svg')
        .should('not.exist');
    }
  });
  cy.get('.sellers tr').should('have.length', table.rawTable.length);
};

Given(/^I'm on the website$/, () => {
  cy.visit('http://localhost:3000/');
});

When('There are 3 sellers', () => {
  cy.intercept('GET', 'http://localhost:3000/sellers', {
    statusCode: 200,
    body: [
      { cash: 60, name: 'Lukasz', online: true },
      { cash: 12000.21, name: 'Santane', online: false },
      { cash: 0.3, name: 'Faustine', online: true },
    ],
  });
});

Then('I see sellers:', (table) => {
  checkTableSellers(table);
});

And('I see sellers:', (table) => {
  checkTableSellers(table);
});

And('there is a updating of sellers', () => {
  cy.intercept('GET', 'http://localhost:3000/sellers', {
    statusCode: 200,
    body: [
      { cash: 10000023210, name: 'Lukasz', online: true },
      { cash: 12000.21, name: 'Santane', online: true },
      { cash: 0.4, name: 'Faustine', online: false },
    ],
  });
  cy.wait(1000);
});
