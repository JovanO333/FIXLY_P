   const { defineConfig } = require('cypress')

   module.exports = defineConfig({
     e2e: {
       baseUrl: 'https://www.saucedemo.com',
       specPattern: 'cypress/e2e/**/*.cy.js',
       supportFile: false,
       video: true,
       screenshotOnRunFailure: true,
       defaultCommandTimeout: 8000
     }
   })