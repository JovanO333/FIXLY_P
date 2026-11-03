# language: es
Característica: Aceptación - Inicio de sesión y compra en SauceDemo
  Como cliente de la tienda
  Quiero iniciar sesión y comprar un producto
  Para completar mi pedido correctamente

  Antecedentes:
    Dado que el usuario abre la página de login

  @AT-01
  Escenario: Login exitoso con usuario válido
    Cuando ingresa el usuario "standard_user" y la clave "secret_sauce"
    Entonces ve el catálogo de productos

  @AT-02
  Escenario: Login rechazado con clave incorrecta
    Cuando ingresa el usuario "standard_user" y la clave "clave_mala"
    Entonces ve el mensaje de error "Username and password do not match"

  @AT-03
  Escenario: Compra completa de un producto
    Cuando ingresa el usuario "standard_user" y la clave "secret_sauce"
    Y agrega al carrito el producto "sauce-labs-backpack"
    Y completa el checkout con nombre "Jovan", apellido "Oquendo" y código postal "050001"
    Entonces ve el mensaje de confirmación "Thank you for your order"
