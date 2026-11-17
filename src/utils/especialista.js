/**
 * Configuración de la especialista única del consultorio.
 * El sistema funciona con una sola profesional: Dra. Jeremmy Gutierrez.
 */
export const ESPECIALISTA_UNICO = {
  nombre: "Dra. Jeremmy Gutierrez",
};

const normalizar = (texto = "") =>
  String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

/**
 * Resuelve el registro de la especialista única dentro de una lista de doctores.
 * Primero busca por nombre (Jeremmy/Jeremy), luego por apellido (Gutierrez)
 * y como último recurso usa el primer doctor disponible.
 * @param {Array} doctores - Lista de doctores
 * @returns {Object|null} Doctor de la especialista única
 */
export const resolverEspecialistaUnico = (doctores = []) => {
  if (!Array.isArray(doctores) || doctores.length === 0) return null;

  const porNombre =
    doctores.find((doctor) => normalizar(doctor?.nombre).includes("jeremmy")) ||
    doctores.find((doctor) => normalizar(doctor?.nombre).includes("jeremy"));

  if (porNombre) return porNombre;

  const porApellido = doctores.find((doctor) =>
    normalizar(doctor?.nombre).includes("gutierrez")
  );

  if (porApellido) return porApellido;

  // Solo si existe un único doctor en el sistema se usa como especialista.
  return doctores.length === 1 ? doctores[0] : null;
};

/**
 * Devuelve el nombre visible de la especialista.
 * @param {Object|null} especialista - Registro resuelto
 * @returns {string} Nombre para mostrar
 */
export const nombreEspecialista = (especialista) =>
  especialista?.nombre || ESPECIALISTA_UNICO.nombre;
