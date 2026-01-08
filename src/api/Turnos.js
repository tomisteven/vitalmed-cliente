import { ENV } from "../utils/constants";

export class TurnosApi {
  url = ENV.URL + "/api/";

  /**
   * Crear disponibilidad de turnos para un médico
   * @param {string} doctorId - ID del doctor
   * @param {Array<string>} horarios - Array de fechas en formato ISO
   * @param {string} estudioId - ID del estudio (opcional, un solo estudio por llamada)
   */
  async crearDisponibilidad(doctorId, horarios, estudioId = null) {
    try {
      const body = { doctorId, horarios };
      if (estudioId) {
        body.estudioId = estudioId;
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

  /**
   * Eliminar un turno permanentemente
   * @param {string} turnoId - ID del turno a eliminar
   */
  async eliminarTurno(turnoId) {
    try {
      const response = await fetch(this.url + `turnos/${turnoId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "vitalmed0258525",
        },
      });

      const result = await response.json();
      if (response.status !== 200) {
        throw new Error(result.message || "Error al eliminar turno");
      }
      return result;
    } catch (error) {
      console.error("Error en eliminarTurno:", error);
      throw error;
    }
  }

  /**
   * Reservar turno como invitado (sin registro)
   * @param {string} turnoId - ID del turno
   * @param {Object} datos - Datos del invitado
   * @param {string} datos.dni - DNI del invitado
   * @param {string} datos.nombre - Nombre completo del invitado
   * @param {string} datos.telefono - Teléfono del invitado
   * @param {string} datos.motivoConsulta - Motivo de la consulta (opcional)
   * @param {string} datos.estudioId - ID del estudio seleccionado (opcional)
   */
  async reservarTurnoInvitado(turnoId, datos) {
    try {
      const response = await fetch(this.url + `turnos/reservar-invitado/${turnoId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "vitalmed0258525",
        },
        body: JSON.stringify(datos),
      });

      const result = await response.json();
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(result.message || "Error al reservar turno");
      }
      return result;
    } catch (error) {
      console.error("Error en reservarTurnoInvitado:", error);
      throw error;
    }
  }

  /**
   * Subir archivo adjunto a un turno
   * @param {string} turnoId - ID del turno
   * @param {File} archivo - Archivo a subir
   * @param {string} nombreArchivo - Nombre descriptivo del archivo
   */
  async subirArchivoTurno(turnoId, archivo, nombreArchivo = "") {
    try {
      const formData = new FormData();
      formData.append("archivo", archivo);
      if (nombreArchivo) {
        formData.append("nombreArchivo", nombreArchivo);
      }

      const response = await fetch(this.url + `turnos/${turnoId}/archivo`, {
        method: "POST",
        headers: {
          Authorization: "vitalmed0258525",
        },
        body: formData,
      });

      const result = await response.json();
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(result.message || "Error al subir archivo");
      }
      return result;
    } catch (error) {
      console.error("Error en subirArchivoTurno:", error);
      throw error;
    }
  }

  /**
   * Eliminar archivos adjuntos de un turno
   * @param {string} turnoId - ID del turno
   * @param {string} archivoId - ID del archivo a eliminar
   */
  async eliminarArchivoTurno(turnoId, archivoId) {
    try {
      const response = await fetch(this.url + `turnos/${turnoId}/archivo/${archivoId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "vitalmed0258525",
        },
      });

      const result = await response.json();
      if (response.status !== 200) {
        throw new Error(result.message || "Error al eliminar archivo");
      }
      return result;
    } catch (error) {
      console.error("Error en eliminarArchivoTurno:", error);
      throw error;
    }
  }

  /**
   * Eliminar múltiples turnos permanentemente
   * @param {Array<string>} ids - Array de IDs de turnos a eliminar
   */
  async eliminarTurnosMasivo(ids) {
    try {
      const response = await fetch(this.url + "turnos-masivo", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "vitalmed0258525",
        },
        body: JSON.stringify({ ids }),
      });

      const result = await response.json();
      if (response.status !== 200) {
        throw new Error(result.message || "Error al eliminar turnos masivamente");
      }
      return result;
    } catch (error) {
      console.error("Error en eliminarTurnosMasivo:", error);
      throw error;
    }
  }

  /**
   * Limpiar/Vaciar múltiples turnos (vuelven a estado disponible)
   * @param {Array<string>} ids - Array de IDs de turnos a limpiar
   */
  async limpiarTurnosMasivo(ids) {
    try {
      const response = await fetch(this.url + "turnos-masivo/limpiar", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "vitalmed0258525",
        },
        body: JSON.stringify({ ids }),
      });

      const result = await response.json();
      if (response.status !== 200) {
        throw new Error(result.message || "Error al limpiar turnos masivamente");
      }
      return result;
    } catch (error) {
      console.error("Error en limpiarTurnosMasivo:", error);
      throw error;
    }
  }
}
