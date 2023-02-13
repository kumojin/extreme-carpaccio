import { defineConfig } from 'cypress';
const eyesPlugin = require('@applitools/eyes-cypress');

export default eyesPlugin(
  defineConfig({
    e2e: {
      setupNodeEvents(on, config) {
        const cucumber = require('cypress-cucumber-preprocessor').default;
        const browserify = require('@cypress/browserify-preprocessor');

        const options = {
          ...browserify.defaultOptions,
          typescript: require.resolve('typescript'),
        };
        on('file:preprocessor', cucumber(options));
      },
      baseUrl: 'http://localhost:3000',
      excludeSpecPattern: ['*.js', '*.md'],
      specPattern: 'cypress/e2e/**/*.feature',
      viewportHeight: 800,
    },
    component: {
      devServer: {
        framework: 'react',
        bundler: 'vite',
      },
    },
  })
);
