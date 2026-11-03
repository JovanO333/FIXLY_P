// Config alterna SOLO para las pruebas de aceptacion en Gherkin.
// Uso: npx cypress run --config-file cypress.cucumber.config.js
const { defineConfig } = require('cypress')
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor')
const { addCucumberPreprocessorPlugin } = require('@badeball/cypress-cucumber-preprocessor')
const { createEsbuildPlugin } = require('@badeball/cypress-cucumber-preprocessor/esbuild')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'https://www.saucedemo.com',
    specPattern: 'features/**/*.feature',
    supportFile: false,
    video: true,
    async setupNodeEvents(on, config) {
      await addCucumberPreprocessorPlugin(on, config)
      on('file:preprocessor', createBundler({ plugins: [createEsbuildPlugin(config)] }))
      return config
    }
  }
})
