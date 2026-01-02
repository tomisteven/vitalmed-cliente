/**
 * Obtiene el color asociado a un estado de turno
 * @param {string} estado - Estado del turno
 * @returns {string} Clase CSS o color
 */
export const getEstadoColor = (estado) => {
    const colores = {
        disponible: "#28a745", // Verde
        reservado: "#007bff",  // Azul
        cancelado: "#6c757d",  // Gris
        finalizado: "#6c757d", // Gris
    };

    return colores[estado] || "#6c757d";
};

/**
 * Obtiene el label traducido de un estado
 * @param {string} estado - Estado del turno
 * @returns {string} Label en español
 */
export const getEstadoLabel = (estado) => {
    const labels = {
        disponible: "Disponible",
        reservado: "Reservado",
        cancelado: "Cancelado",
        finalizado: "Finalizado",
    };

    return labels[estado] || estado;
};

/**
 * Separa turnos en próximos y pasados
 * @param {Array} turnos - Array de turnos
 * @returns {Object} Objeto con arrays de próximos y pasados
 */
export const separarTurnosPorFecha = (turnos) => {
    const ahora = new Date();

    const proximos = turnos.filter(turno => {
        const fechaTurno = new Date(turno.fecha);
        return fechaTurno >= ahora && turno.estado === "reservado";
    });

    const pasados = turnos.filter(turno => {
        const fechaTurno = new Date(turno.fecha);
        return fechaTurno < ahora || turno.estado === "finalizado" || turno.estado === "cancelado";
    });

    return { proximos, pasados };
};

/**
 * Obtiene la clase CSS para el badge de estado
 * @param {string} estado - Estado del turno
 * @returns {string} Clase CSS
 */
export const getEstadoBadgeClass = (estado) => {
    const clases = {
        disponible: "badge-success",
        reservado: "badge-primary",
        cancelado: "badge-secondary",
        finalizado: "badge-secondary",
    };

    return clases[estado] || "badge-secondary";
};

/**
 * Ordena turnos por fecha (más próximos primero)
 * @param {Array} turnos - Array de turnos
 * @returns {Array} Turnos ordenados
 */
export const ordenarTurnosPorFecha = (turnos) => {
    return [...turnos].sort((a, b) => {
        return new Date(a.fecha) - new Date(b.fecha);
    });
};
