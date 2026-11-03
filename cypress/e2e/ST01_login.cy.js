// Pruebas de Sistema (E2E) - Autenticacion (analogo a HU-2 Inicio de sesion)
describe('ST-01..ST-04 Login en SauceDemo', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('ST-01 login exitoso con standard_user', () => {
    cy.get('[data-test="username"]').type('standard_user')
    cy.get('[data-test="password"]').type('secret_sauce')
    cy.get('[data-test="login-button"]').click()
    cy.url().should('include', '/inventory.html')
    cy.get('.inventory_list').should('be.visible')
  })

  it('ST-02 login con clave incorrecta muestra error', () => {
    cy.get('[data-test="username"]').type('standard_user')
    cy.get('[data-test="password"]').type('clave_mala')
    cy.get('[data-test="login-button"]').click()
    cy.get('[data-test="error"]').should('contain.text', 'Username and password do not match')
  })

  it('ST-03 login con campos vacios exige usuario', () => {
    cy.get('[data-test="login-button"]').click()
    cy.get('[data-test="error"]').should('contain.text', 'Username is required')
  })

  it('ST-04 usuario bloqueado (locked_out_user) no puede ingresar', () => {
    cy.get('[data-test="username"]').type('locked_out_user')
    cy.get('[data-test="password"]').type('secret_sauce')
    cy.get('[data-test="login-button"]').click()
    cy.get('[data-test="error"]').should('contain.text', 'locked out')
  })
})
