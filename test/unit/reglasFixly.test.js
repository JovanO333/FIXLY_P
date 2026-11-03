const r = require('../../src/reglasFixly');

describe('HU-1 validarPassword (UT-01..UT-04)', () => {
  test('UT-01 acepta contraseña que cumple la politica', () => {
    expect(r.validarPassword('Fixly#2026').valida).toBe(true);
  });
  test('UT-02 rechaza contraseña debil "1234" con todos los errores', () => {
    const res = r.validarPassword('1234');
    expect(res.valida).toBe(false);
    expect(res.errores).toHaveLength(3); // longitud, mayuscula y especial (tiene numero)
  });
  test('UT-03 rechaza contraseña sin caracter especial', () => {
    expect(r.validarPassword('Fixly2026').errores).toContain('Debe tener un caracter especial');
  });
  test('UT-04 rechaza valores no texto', () => {
    expect(r.validarPassword(null).valida).toBe(false);
  });
});

describe('HU-1/HU-2 validarEmail (UT-05..UT-06)', () => {
  test('UT-05 acepta correo valido', () => {
    expect(r.validarEmail('jovan.oquendo865@pascualbravo.edu.co')).toBe(true);
  });
  test('UT-06 rechaza "usuario@.com" y vacio', () => {
    expect(r.validarEmail('usuario@.com')).toBe(false);
    expect(r.validarEmail('')).toBe(false);
  });
});

describe('HU-2 bloqueo y enlace de recuperacion (UT-07..UT-10)', () => {
  test('UT-07 no bloquea tras 2 intentos fallidos', () => {
    let c = { intentosFallidos: 0 };
    c = r.registrarIntentoFallido(r.registrarIntentoFallido(c));
    expect(c.bloqueada).toBe(false);
  });
  test('UT-08 bloquea al tercer intento fallido', () => {
    let c = { intentosFallidos: 0 };
    for (let i = 0; i < 3; i++) c = r.registrarIntentoFallido(c);
    expect(c.bloqueada).toBe(true);
  });
  test('UT-09 enlace vigente a los 14 min y vencido a los 16 min', () => {
    const t0 = new Date('2026-11-02T10:00:00Z');
    expect(r.enlaceRecuperacionVigente(t0, new Date('2026-11-02T10:14:00Z'))).toBe(true);
    expect(r.enlaceRecuperacionVigente(t0, new Date('2026-11-02T10:16:00Z'))).toBe(false);
  });
  test('UT-10 login exitoso reinicia el contador si no esta bloqueada', () => {
    expect(r.registrarLoginExitoso({ intentosFallidos: 2, bloqueada: false }).intentosFallidos).toBe(0);
  });
});

describe('HU-5 filtros y comparacion (UT-11..UT-14)', () => {
  const tecnicos = [
    { nombre: 'A', calificacion: 4.8, tiempoRespuestaMin: 30, precio: 90000, distanciaKm: 2, aniosExperiencia: 5 },
    { nombre: 'B', calificacion: 3.2, tiempoRespuestaMin: 10, precio: 50000, distanciaKm: 5, aniosExperiencia: 2 },
    { nombre: 'C', calificacion: 4.0, tiempoRespuestaMin: 20, precio: 70000, distanciaKm: 1, aniosExperiencia: 8 }
  ];
  test('UT-11 filtra por calificacion minima 4.0', () => {
    expect(r.filtrarPorCalificacionMinima(tecnicos, 4.0).map(t => t.nombre)).toEqual(['A', 'C']);
  });
  test('UT-12 rechaza calificacion minima no permitida (3.7)', () => {
    expect(() => r.filtrarPorCalificacionMinima(tecnicos, 3.7)).toThrow();
  });
  test('UT-13 ordena por menor tiempo de respuesta', () => {
    expect(r.ordenarPorTiempoRespuesta(tecnicos).map(t => t.nombre)).toEqual(['B', 'C', 'A']);
  });
  test('UT-14 compara hasta 3 y rechaza 4', () => {
    expect(r.compararTecnicos(tecnicos)).toHaveLength(3);
    expect(() => r.compararTecnicos([...tecnicos, tecnicos[0]])).toThrow('Maximo 3');
  });
});

describe('HU-8 calificacion (UT-15)', () => {
  test.each([[1, true], [5, true], [0, false], [6, false], [3.5, false]])(
    'UT-15 validarCalificacion(%p) = %p', (v, esperado) => {
      expect(r.validarCalificacion(v)).toBe(esperado);
    });
});

describe('HU-9 precio y cupones (UT-16..UT-19)', () => {
  test('UT-16 precio estimado plomeria 2 horas', () => {
    expect(r.calcularPrecioEstimado('plomeria', 2)).toBe(120000);
  });
  test('UT-17 rechaza servicio no soportado y horas <= 0', () => {
    expect(() => r.calcularPrecioEstimado('pintura', 1)).toThrow();
    expect(() => r.calcularPrecioEstimado('gas', 0)).toThrow();
  });
  test('UT-18 cupon vigente del 10% descuenta correctamente', () => {
    const res = r.aplicarCupon(100000, { porcentaje: 10, venceEn: '2026-12-31' }, new Date('2026-11-02'));
    expect(res).toEqual({ total: 90000, descuento: 10000 });
  });
  test('UT-19 cupon vencido lanza error', () => {
    expect(() => r.aplicarCupon(100000, { porcentaje: 10, venceEn: '2026-01-01' }, new Date('2026-11-02')))
      .toThrow('Cupon vencido');
  });
});

describe('HU-3/4/6/7/8 reglas adicionales (UT-20..UT-28)', () => {
  const lista = [
    { nombre: 'A', distanciaKm: 8, calificacion: 4.9, disponible: true, precio: 80000 },
    { nombre: 'B', distanciaKm: 1, calificacion: 4.6, disponible: true, precio: 60000 },
    { nombre: 'C', distanciaKm: 2, calificacion: 3.0, disponible: false, precio: 40000 }
  ];
  test('UT-20 ordena por distancia ascendente (HU-4)', () => {
    expect(r.ordenarPorDistancia(lista).map(t => t.nombre)).toEqual(['B', 'C', 'A']);
  });
  test('UT-21 existen al menos 10 categorias y se valida una inexistente (HU-4)', () => {
    expect(r.CATEGORIAS.length).toBeGreaterThanOrEqual(10);
    expect(r.categoriaValida('plomeria')).toBe(true);
    expect(r.categoriaValida('astrologia')).toBe(false);
  });
  test('UT-22 acepta hasta 5 fotos y rechaza 6 (HU-3)', () => {
    expect(r.validarFotosPerfil([1, 2, 3, 4, 5])).toBe(true);
    expect(r.validarFotosPerfil([1, 2, 3, 4, 5, 6])).toBe(false);
  });
  test('UT-23 tecnico sin verificar no puede ofrecer servicios (HU-3)', () => {
    expect(r.tecnicoPuedeOfrecerServicios({ verificado: false })).toBe(false);
    expect(r.tecnicoPuedeOfrecerServicios({ verificado: true })).toBe(true);
  });
  test('UT-24 mejor match elige el tecnico cercano, bien calificado y disponible (HU-6)', () => {
    expect(r.mejorTecnico(lista).nombre).toBe('B');
    expect(r.mejorTecnico([])).toBeNull();
  });
  test('UT-25 permite 5 busquedas guardadas y rechaza la sexta (HU-6)', () => {
    let b = [];
    for (let i = 0; i < 5; i++) b = r.guardarBusqueda(b, { q: i });
    expect(b).toHaveLength(5);
    expect(() => r.guardarBusqueda(b, { q: 6 })).toThrow('Maximo 5');
  });
  test('UT-26 recorre los estados del servicio en orden (HU-7)', () => {
    expect(r.siguienteEstado('solicitado')).toBe('en camino');
    expect(r.siguienteEstado('en camino')).toBe('en curso');
    expect(r.siguienteEstado('en curso')).toBe('finalizado');
  });
  test('UT-27 rechaza estado desconocido o avanzar desde finalizado (HU-7)', () => {
    expect(() => r.siguienteEstado('cancelado')).toThrow();
    expect(() => r.siguienteEstado('finalizado')).toThrow();
  });
  test('UT-28 solo permite iniciar el servicio a menos de 100 m del cliente (HU-8)', () => {
    expect(r.puedeIniciarServicio(50)).toBe(true);
    expect(r.puedeIniciarServicio(500)).toBe(false);
  });
});
