import { ENV } from "../utils/constants";

export class TurnosApi {
  url = ENV.URL + "/api/";

  /**
   * Crear disponibilidad de turnos para un médico
   * @param {string} doctorId - ID del doctor
   * @param {Array<string>} horarios - Array de fechas en formato ISO
   * @param {Array<string>} estudiosIds - Array opcional de IDs de estudios disponibles
   */
  async crearDisponibilidad(doctorId, horarios, estudiosIds = []) {
    try {
      const body = { doctorId, horarios };
      if (estudiosIds && estudiosIds.length > 0) {
        body.estudiosIds = estudiosIds;
      }

      const response = await fetch(this.url + "turnos/disponibilidad", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "vitalmed0258525",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(result.message || "Error al crear disponibilidad");
      }
      return result;
    } catch (error) {
      console.error("Error en crearDisponibilidad:", error);
      throw error;
    }
  }

  /**
   * Buscar turnos con filtros opcionales
   * @param {Object} filtros - Objeto con filtros opcionales
   * @param {string} filtros.estado - Estado del turno
   * @param {string} filtros.doctorId - ID del doctor
   * @param {string} filtros.especialidad - Especialidad médica
   * @param {string} filtros.fecha - Fecha en formato YYYY-MM-DD
   */
  async buscarTurnos(filtros = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (filtros.estado) queryParams.append("estado", filtros.estado);
      if (filtros.doctorId) queryParams.append("doctorId", filtros.doctorId);
      if (filtros.especialidad) queryParams.append("especialidad", filtros.especialidad);
      if (filtros.fecha) queryParams.append("fecha", filtros.fecha);

      const queryString = queryParams.toString();
      const url = this.url + "turnos" + (queryString ? `?${queryString}` : "");

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "vitalmed0258525",
        },
      });

      const result = await response.json();
      if (response.status !== 200) {
        throw new Error(result.message || "Error al buscar turnos");
      }
      return result;
    } catch (error) {
      console.error("Error en buscarTurnos:", error);
      throw error;
    }
  }

  /**
   * Reservar un turno disponible
   * @param {string} turnoId - ID del turno
   * @param {string} pacienteId - ID del paciente
   * @param {string} motivoConsulta - Motivo de la consulta
   * @param {string} estudioId - ID del estudio seleccionado
   */
  async reservarTurno(turnoId, pacienteId, motivoConsulta, estudioId = null) {
    try {
      const body = { pacienteId, motivoConsulta };
      if (estudioId) {
        body.estudioId = estudioId;
      }

      const response = await fetch(this.url + `turnos/reservar/${turnoId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "vitalmed0258525",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(result.message || "Error al reservar turno");
      }
      return result;
    } catch (error) {
      console.error("Error en reservarTurno:", error);
      throw error;
    }
  }

  /**
   * Obtener todos los turnos de un paciente
   * @param {string} pacienteId - ID del paciente
   */
  async obtenerMisTurnos(pacienteId) {
    try {
      const response = await fetch(this.url + `turnos/mis-turnos/${pacienteId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "vitalmed0258525",
        },
      });

      const result = await response.json();
      if (response.status !== 200) {
        throw new Error(result.message || "Error al obtener turnos");
      }
      return result;
    } catch (error) {
      console.error("Error en obtenerMisTurnos:", error);
      throw error;
    }
  }

  /**
   * Cancelar un turno (vuelve a estado disponible)
   * @param {string} turnoId - ID del turno
   * @param {string} motivo - Motivo de cancelación
   */
  async cancelarTurno(turnoId, motivo) {
    try {
      const response = await fetch(this.url + `turnos/cancelar/${turnoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "vitalmed0258525",
        },
        body: JSON.stringify({ motivo }),
      });

      const result = await response.json();
      if (response.status !== 200) {
        throw new Error(result.message || "Error al cancelar turno");
      }
      return result;
    } catch (error) {
      console.error("Error en cancelarTurno:", error);
      throw error;
    }
  }
}
