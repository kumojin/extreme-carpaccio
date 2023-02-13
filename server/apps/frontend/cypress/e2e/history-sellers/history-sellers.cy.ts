/// <reference types="cypress" />
import { Given, When, And, Then } from 'cypress-cucumber-preprocessor/steps';
import '@testing-library/cypress/add-commands';

let number = 100;
Given(/^I'm on the website$/, () => {
  cy.visit('http://localhost:5173/');
});

When('There are 100 iterations', () => {
  cy.intercept('GET', 'http://localhost:5173/sellers/history?chunk=10', {
    statusCode: 200,
    body: {
      lastIteration: 100,
      history: {
        Lukasz: [0, 2, 5, 8, 10, 11, 15, 17, 24, 43],

        Xavier: [0, 2, 2, 2, 2, 9, 12, 13, 32, 78],
        Camelia: [0, 2, 2, 2, 2, 9, 12, 13, 65, 198],
      },
    },
  });
});

When('There are 200 iterations', () => {
  cy.intercept('GET', 'http://localhost:5173/sellers/history?chunk=10', {
    statusCode: 200,
    body: {
      lastIteration: 100,
      history: {
        Lukasz: [
          0, 2, 5, 8, 10, 11, 15, 17, 24, 43, 54, 59, 70, 78, 67, 82, 83, 92,
          96, 120,
        ],

        Xavier: [
          0, 2, 2, 2, 2, 9, 12, 13, 32, 78, 89, 90, 98, 107, 112, 113, 122, 126,
          130,
        ],
        Camelia: [
          0, 2, 2, 2, 2, 9, 12, 13, 65, 198, 259, 270, 278, 279, 282, 283, 283,
          283, 10,
        ],
      },
    },
  });
  number = 200;
});

When('the chart is visible {string}', (name) => {
  cy.get('canvas')
    .should('be.visible')
    .and((chart) => {
      expect(chart.height()).to.be.greaterThan(200);
    });

  cy.wait(4000);
  cy.eyesOpen({
    appName: 'Extreme carpaccio',
    testName: `chart-history${number}`,
  });
  cy.get('canvas').eyesCheckWindow({
    name: `chart-history${number}`,
    tag: `chart-history${number}`,
    fully: true,
  });
  cy.eyesClose();
  //cy.viewport(2000, 2000).get('canvas').screenshot(name);
});
