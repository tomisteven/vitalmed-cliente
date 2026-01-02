import { ENV } from "../utils/constants";

export class EstudiosApi {
    url = ENV.URL + "/api/";

    /**
     * Obtener todos los estudios
     * @param {boolean} soloActivos - Si true, solo retorna estudios activos
     */
    async getEstudios(soloActivos = false) {
        try {
            const queryParams = soloActivos ? "?activo=true" : "";
            const response = await fetch(this.url + "estudios" + queryParams, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "vitalmed0258525",
                },
            });

            const result = await response.json();
            if (response.status !== 200) {
                throw new Error(result.message || "Error al obtener estudios");
            }
            return result;
        } catch (error) {
            console.error("Error en getEstudios:", error);
            throw error;
        }
    }

    /**
     * Crear un nuevo estudio
     * @param {Object} data - Datos del estudio
     * @param {string} data.tipo - Tipo/nombre del estudio
     * @param {number} data.precio - Precio del estudio
     * @param {string} data.aclaraciones - Aclaraciones adicionales
     * @param {boolean} data.activo - Si el estudio está activo
     */
    async crearEstudio(data) {
        try {
            const response = await fetch(this.url + "estudios", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "vitalmed0258525",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (response.status !== 200 && response.status !== 201) {
                throw new Error(result.message || "Error al crear estudio");
            }
            return result;
        } catch (error) {
            console.error("Error en crearEstudio:", error);
            throw error;
        }
    }

    /**
     * Actualizar un estudio existente
     * @param {string} estudioId - ID del estudio
     * @param {Object} data - Datos a actualizar
     */
    async actualizarEstudio(estudioId, data) {
        try {
            const response = await fetch(this.url + `estudios/${estudioId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "vitalmed0258525",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (response.status !== 200) {
                throw new Error(result.message || "Error al actualizar estudio");
            }
            return result;
        } catch (error) {
            console.error("Error en actualizarEstudio:", error);
            throw error;
        }
    }

    /**
     * Eliminar un estudio
     * @param {string} estudioId - ID del estudio
     */
    async eliminarEstudio(estudioId) {
        try {
            const response = await fetch(this.url + `estudios/${estudioId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "vitalmed0258525",
                },
            });

            const result = await response.json();
            if (response.status !== 200) {
                throw new Error(result.message || "Error al eliminar estudio");
            }
            return result;
        } catch (error) {
            console.error("Error en eliminarEstudio:", error);
            throw error;
        }
    }
}
