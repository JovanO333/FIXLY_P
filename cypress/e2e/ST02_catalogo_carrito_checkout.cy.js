// Pruebas de Sistema (E2E) - Catalogo, filtros, carrito y compra
// (analogos a HU-5 filtros, HU-7 solicitud y HU-9 pago)
const login = (user = 'standard_user') => {
  cy.visit('/')
  cy.get('[data-test="username"]').type(user)
  cy.get('[data-test="password"]').type('secret_sauce')
  cy.get('[data-test="login-button"]').click()
}

describe('ST-05..ST-10 Catalogo, carrito y checkout', () => {
  beforeEach(() => login())

  it('ST-05 ordena productos por precio de menor a mayor', () => {
    cy.get('[data-test="product-sort-container"]').select('lohi')
    cy.get('.inventory_item_price').then($p => {
      const precios = [...$p].map(e => parseFloat(e.innerText.replace('$', '')))
      const ordenados = [...precios].sort((a, b) => a - b)
      expect(precios).to.deep.equal(ordenados)
    })
  })

  it('ST-06 agrega un producto y el contador del carrito marca 1', () => {
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click()
    cy.get('.shopping_cart_badge').should('have.text', '1')
  })

  it('ST-07 quita un producto del carrito', () => {
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click()
    cy.get('[data-test="remove-sauce-labs-backpack"]').click()
    cy.get('.shopping_cart_badge').should('not.exist')
  })

  it('ST-08 checkout exige apellido (campo obligatorio)', () => {
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click()
    cy.get('.shopping_cart_link').click()
    cy.get('[data-test="checkout"]').click()
    cy.get('[data-test="firstName"]').type('Jovan')
    cy.get('[data-test="postalCode"]').type('050001')
    cy.get('[data-test="continue"]').click()
    cy.get('[data-test="error"]').should('contain.text', 'Last Name is required')
  })

  it('ST-09 compra completa termina con mensaje de exito', () => {
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click()
    cy.get('.shopping_cart_link').click()
    cy.get('[data-test="checkout"]').click()
    cy.get('[data-test="firstName"]').type('Jovan')
    cy.get('[data-test="lastName"]').type('Oquendo')
    cy.get('[data-test="postalCode"]').type('050001')
    cy.get('[data-test="continue"]').click()
    cy.url().should('include', '/checkout-step-two.html')
    cy.get('[data-test="finish"]').click()
    cy.get('[data-test="complete-header"]').should('contain.text', 'Thank you for your order')
  })

  it('ST-10 cerrar sesion regresa al login', () => {
    cy.get('#react-burger-menu-btn').click()
    cy.get('[data-test="logout-sidebar-link"]').click()
    cy.url().should('eq', Cypress.config('baseUrl') + '/')
  })
})
