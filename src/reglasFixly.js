// Reglas de negocio de Fixly implementadas como funciones puras para pruebas unitarias.
// Cada funcion referencia la historia de usuario (HU) y el criterio de aceptacion que valida.

const CALIFICACIONES_PERMITIDAS = [3.0, 3.5, 4.0, 4.5];
const MAX_INTENTOS_FALLIDOS = 3;
const MINUTOS_VIGENCIA_ENLACE = 15;
const MAX_COMPARACION = 3;

const TARIFAS_BASE = {
  plomeria: 60000,
  electricidad: 70000,
  cerrajeria: 50000,
  gas: 80000,
  electrodomesticos: 65000
};

// HU-1: "Cumplir con la normativa de seguridad para contraseñas"
// Regla: minimo 8 caracteres, 1 mayuscula, 1 numero y 1 caracter especial.
function validarPassword(password) {
  if (typeof password !== 'string') return { valida: false, errores: ['Debe ser texto'] };
  const errores = [];
  if (password.length < 8) errores.push('Minimo 8 caracteres');
  if (!/[A-Z]/.test(password)) errores.push('Debe tener una mayuscula');
  if (!/[0-9]/.test(password)) errores.push('Debe tener un numero');
  if (!/[^A-Za-z0-9]/.test(password)) errores.push('Debe tener un caracter especial');
  return { valida: errores.length === 0, errores };
}

// HU-1 / HU-2: formato de correo
function validarEmail(email) {
  if (typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(email.trim());
}

// HU-2: "Tras 3 intentos fallidos, la cuenta se bloquea temporalmente"
function registrarIntentoFallido(cuenta) {
  const intentos = (cuenta.intentosFallidos || 0) + 1;
  return { ...cuenta, intentosFallidos: intentos, bloqueada: intentos >= MAX_INTENTOS_FALLIDOS };
}

function registrarLoginExitoso(cuenta) {
  if (cuenta.bloqueada) return { ...cuenta };
  return { ...cuenta, intentosFallidos: 0 };
}

// HU-2: "El enlace de recuperacion de contraseña expira en 15 minutos"
function enlaceRecuperacionVigente(creadoEn, ahora = new Date()) {
  const minutos = (new Date(ahora) - new Date(creadoEn)) / 60000;
  return minutos >= 0 && minutos <= MINUTOS_VIGENCIA_ENLACE;
}

// HU-5: "El filtro de calificacion permite elegir entre 3.0, 3.5, 4.0 y 4.5 estrellas"
function filtrarPorCalificacionMinima(tecnicos, minima) {
  if (!CALIFICACIONES_PERMITIDAS.includes(minima)) {
    throw new Error('Calificacion minima no permitida');
  }
  return tecnicos.filter(t => t.calificacion >= minima);
}

// HU-5: "Ordenar por tiempo promedio de respuesta"
function ordenarPorTiempoRespuesta(tecnicos) {
  return [...tecnicos].sort((a, b) => a.tiempoRespuestaMin - b.tiempoRespuestaMin);
}

// HU-5: "comparar hasta 3 tecnicos lado a lado"
function compararTecnicos(tecnicos) {
  if (tecnicos.length > MAX_COMPARACION) {
    throw new Error('Maximo 3 tecnicos para comparar');
  }
  return tecnicos.map(({ nombre, calificacion, precio, distanciaKm, aniosExperiencia }) =>
    ({ nombre, calificacion, precio, distanciaKm, aniosExperiencia }));
}

// HU-8: "La calificacion es en escala de 1 a 5 estrellas"
function validarCalificacion(valor) {
  return Number.isInteger(valor) && valor >= 1 && valor <= 5;
}

// HU-9: "El precio estimado se basa en el tipo de servicio"
function calcularPrecioEstimado(tipoServicio, horas = 1) {
  const base = TARIFAS_BASE[tipoServicio];
  if (base === undefined) throw new Error('Tipo de servicio no soportado');
  if (!(horas > 0)) throw new Error('Las horas deben ser mayores a cero');
  return base * horas;
}

// HU-9: "El codigo de cupon debe ser valido y vigente ... mostrando el descuento"
function aplicarCupon(total, cupon, hoy = new Date()) {
  if (!cupon) return { total, descuento: 0 };
  const vigente = new Date(hoy) <= new Date(cupon.venceEn);
  if (!vigente) throw new Error('Cupon vencido');
  if (!(cupon.porcentaje > 0 && cupon.porcentaje <= 100)) throw new Error('Cupon invalido');
  const descuento = Math.round(total * cupon.porcentaje) / 100;
  return { total: total - descuento, descuento };
}


// ---- HU-3, HU-4, HU-6, HU-7, HU-8 (reglas adicionales para cubrir las 9 historias) ----
const CATEGORIAS = ['plomeria','electricidad','cerrajeria','gas','electrodomesticos','carpinteria',
  'pintura','aire acondicionado','redes','jardineria'];
const MAX_FOTOS = 5;
const MAX_BUSQUEDAS_GUARDADAS = 5;
const ESTADOS = ['solicitado','en camino','en curso','finalizado'];

// HU-4: "El menu muestra al menos 10 categorias predefinidas"
function categoriaValida(c) { return CATEGORIAS.includes(c); }

// HU-4: "Los resultados se muestran ... ordenados por distancia"
function ordenarPorDistancia(tecnicos) {
  return [...tecnicos].sort((a, b) => a.distanciaKm - b.distanciaKm);
}

// HU-3: "El tecnico puede agregar ... fotos de trabajos (hasta 5)"
function validarFotosPerfil(fotos) { return Array.isArray(fotos) && fotos.length <= MAX_FOTOS; }

// HU-3: "El tecnico no puede ofrecer servicios hasta ser verificado por un administrador"
function tecnicoPuedeOfrecerServicios(tecnico) { return tecnico.verificado === true; }

// HU-6: "El algoritmo de mejor match pondera distancia, calificacion, disponibilidad y precio"
function puntajeMejorMatch(t, pesos = { distancia: 0.3, calificacion: 0.3, disponibilidad: 0.2, precio: 0.2 }) {
  const dist = 1 - Math.min(t.distanciaKm, 20) / 20;
  const cal = t.calificacion / 5;
  const disp = t.disponible ? 1 : 0;
  const prec = 1 - Math.min(t.precio, 200000) / 200000;
  return dist * pesos.distancia + cal * pesos.calificacion + disp * pesos.disponibilidad + prec * pesos.precio;
}
function mejorTecnico(tecnicos) {
  if (!tecnicos.length) return null;
  return tecnicos.reduce((mejor, t) => (puntajeMejorMatch(t) > puntajeMejorMatch(mejor) ? t : mejor));
}

// HU-6: "Se pueden guardar hasta 5 busquedas activas"
function guardarBusqueda(busquedas, nueva) {
  if (busquedas.length >= MAX_BUSQUEDAS_GUARDADAS) throw new Error('Maximo 5 busquedas guardadas');
  return [...busquedas, nueva];
}

// HU-7: estados solicitado -> en camino -> en curso -> finalizado
function siguienteEstado(actual) {
  const i = ESTADOS.indexOf(actual);
  if (i === -1) throw new Error('Estado desconocido');
  if (i === ESTADOS.length - 1) throw new Error('El servicio ya esta finalizado');
  return ESTADOS[i + 1];
}

// HU-8: "El inicio del servicio solo esta disponible al llegar al cliente" (<= 100 m)
function puedeIniciarServicio(distanciaAlClienteMetros) { return distanciaAlClienteMetros <= 100; }

module.exports = {
  categoriaValida, ordenarPorDistancia, validarFotosPerfil, tecnicoPuedeOfrecerServicios,
  puntajeMejorMatch, mejorTecnico, guardarBusqueda, siguienteEstado, puedeIniciarServicio, CATEGORIAS,
  validarPassword, validarEmail, registrarIntentoFallido, registrarLoginExitoso,
  enlaceRecuperacionVigente, filtrarPorCalificacionMinima, ordenarPorTiempoRespuesta,
  compararTecnicos, validarCalificacion, calcularPrecioEstimado, aplicarCupon,
  CALIFICACIONES_PERMITIDAS, MAX_INTENTOS_FALLIDOS
};
