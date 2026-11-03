// Pruebas dirigidas a detectar defectos conocidos del SUT con usuarios "problematicos".
// Cada prueba afirma el comportamiento CORRECTO esperado; si falla, se reporta el bug (BG-xx).
const login = (user) => {
  cy.visit('/')
  cy.get('[data-test="username"]').type(user)
  cy.get('[data-test="password"]').type('secret_sauce')
  cy.get('[data-test="login-button"]').click()
}

describe('ST-11..ST-14 Busqueda de defectos con problem_user', () => {
  beforeEach(() => login('problem_user'))

  it('ST-11 cada producto muestra una imagen distinta', () => {
    cy.get('.inventory_item_img img').then($imgs => {
      const srcs = [...$imgs].map(i => i.getAttribute('src'))
      expect(new Set(srcs).size, 'imagenes distintas').to.equal(srcs.length)
    })
  })

  it('ST-12 todos los productos se pueden agregar al carrito', () => {
    cy.get('[data-test^="add-to-cart"]').each($btn => cy.wrap($btn).click())
    cy.get('[data-test^="remove"]').should('have.length', 6)
    cy.get('.shopping_cart_badge').should('have.text', '6')
  })

  it('ST-13 el checkout conserva el apellido digitado', () => {
    cy.get('[data-test="add-to-cart-sauce-labs-backpack"]').click()
    cy.get('.shopping_cart_link').click()
    cy.get('[data-test="checkout"]').click()
    cy.get('[data-test="firstName"]').type('Jovan')
    cy.get('[data-test="lastName"]').type('Oquendo').should('have.value', 'Oquendo')
  })

  it('ST-14 ordenar por precio descendente ordena correctamente', () => {
    cy.get('[data-test="product-sort-container"]').select('hilo')
    cy.get('.inventory_item_price').then($p => {
      const precios = [...$p].map(e => parseFloat(e.innerText.replace('$', '')))
      expect(precios).to.deep.equal([...precios].sort((a, b) => b - a))
    })
  })
})
