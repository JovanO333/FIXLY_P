// Conecta el texto Gherkin (Dado - Cuando - Entonces) con comandos de Cypress.
const { Given, When, Then } = require('@badeball/cypress-cucumber-preprocessor')

Given('que el usuario abre la página de login', () => {
  cy.visit('/')
})

When('ingresa el usuario {string} y la clave {string}', (usuario, clave) => {
  cy.get('[data-test="username"]').type(usuario)
  cy.get('[data-test="password"]').type(clave)
  cy.get('[data-test="login-button"]').click()
})

When('agrega al carrito el producto {string}', (slug) => {
  cy.get(`[data-test="add-to-cart-${slug}"]`).click()
})

When('completa el checkout con nombre {string}, apellido {string} y código postal {string}', (n, a, cp) => {
  cy.get('.shopping_cart_link').click()
  cy.get('[data-test="checkout"]').click()
  cy.get('[data-test="firstName"]').type(n)
  cy.get('[data-test="lastName"]').type(a)
  cy.get('[data-test="postalCode"]').type(cp)
  cy.get('[data-test="continue"]').click()
  cy.get('[data-test="finish"]').click()
})

Then('ve el catálogo de productos', () => {
  cy.url().should('include', '/inventory.html')
  cy.get('.inventory_list').should('be.visible')
})

Then('ve el mensaje de error {string}', (texto) => {
  cy.get('[data-test="error"]').should('contain.text', texto)
})

Then('ve el mensaje de confirmación {string}', (texto) => {
  cy.get('[data-test="complete-header"]').should('contain.text', texto)
})
