/**
 * Formatea una fecha ISO a formato legible en español
 * @param {string} isoDate - Fecha en formato ISO
 * @returns {string} Fecha formateada (ej: "Lunes 1 de Diciembre, 09:00 hs")
 */
export const formatearFechaHora = (isoDate) => {
    if (!isoDate) return "";

    const fecha = new Date(isoDate);

    const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const diaSemana = diasSemana[fecha.getDay()];
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const hora = fecha.getHours().toString().padStart(2, "0");
    const minutos = fecha.getMinutes().toString().padStart(2, "0");

    return `${diaSemana} ${dia} de ${mes}, ${hora}:${minutos} hs`;
};

/**
 * Formatea solo la fecha sin hora
 * @param {string} isoDate - Fecha en formato ISO
 * @returns {string} Fecha formateada (ej: "01/12/2023")
 */
export const formatearFecha = (isoDate) => {
    if (!isoDate) return "";

    const fecha = new Date(isoDate);
    const dia = fecha.getDate().toString().padStart(2, "0");
    const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
    const anio = fecha.getFullYear();

    return `${dia}/${mes}/${anio}`;
};

/**
 * Formatea solo la hora
 * @param {string} isoDate - Fecha en formato ISO
 * @returns {string} Hora formateada (ej: "09:00")
 */
export const formatearHora = (isoDate) => {
    if (!isoDate) return "";

    const fecha = new Date(isoDate);
    const hora = fecha.getHours().toString().padStart(2, "0");
    const minutos = fecha.getMinutes().toString().padStart(2, "0");

    return `${hora}:${minutos}`;
};

/**
 * Genera un array de horarios en formato ISO
 * @param {string} fecha - Fecha en formato YYYY-MM-DD
 * @param {string} horaInicio - Hora inicio en formato HH:MM
 * @param {string} horaFin - Hora fin en formato HH:MM
 * @param {number} intervalo - Intervalo en minutos
 * @returns {Array<string>} Array de fechas en formato ISO
 */
export const generarHorarios = (fecha, horaInicio, horaFin, intervalo) => {
    const horarios = [];

    // Crear fecha base
    const [anio, mes, dia] = fecha.split("-");
    const [horaInicioH, horaInicioM] = horaInicio.split(":");
    const [horaFinH, horaFinM] = horaFin.split(":");

    // Crear objetos Date
    const inicio = new Date(anio, mes - 1, dia, horaInicioH, horaInicioM);
    const fin = new Date(anio, mes - 1, dia, horaFinH, horaFinM);

    // Generar horarios
    let actual = new Date(inicio);

    while (actual < fin) {
        horarios.push(actual.toISOString());
        actual = new Date(actual.getTime() + intervalo * 60000); // Sumar minutos
    }

    return horarios;
};

/**
 * Valida que una fecha sea futura
 * @param {string} fecha - Fecha a validar
 * @returns {boolean} True si es futura
 */
export const esFechaFutura = (fecha) => {
    const fechaSeleccionada = new Date(fecha);
    const ahora = new Date();

    return fechaSeleccionada > ahora;
};

/**
 * Convierte fecha a formato YYYY-MM-DD para inputs
 * @param {Date} fecha - Objeto Date
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
export const fechaParaInput = (fecha = new Date()) => {
    const anio = fecha.getFullYear();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
    const dia = fecha.getDate().toString().padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
};

/**
 * Obtiene la fecha de hoy en formato YYYY-MM-DD
 * @returns {string} Fecha de hoy
 */
export const obtenerFechaHoy = () => {
    return fechaParaInput(new Date());
};
/**
 * Obtiene la próxima hora en punto (HH:00) basada en la hora actual.
 * Si son las 16:15, retorna "17:00".
 * @returns {string} Próxima hora formateada
 */
export const obtenerProximaHoraCercana = () => {
    const ahora = new Date();
    const hora = ahora.getHours();
    const minutos = ahora.getMinutes();

    // Si ya pasaron algunos minutos de la hora, sugerir la siguiente hora
    const proximaHora = minutos > 0 ? hora + 1 : hora;

    // Formatear a HH:00 (asegurando que no pase de 23)
    const horaFormateada = (proximaHora % 24).toString().padStart(2, "0");
    return `${horaFormateada}:00`;
};
