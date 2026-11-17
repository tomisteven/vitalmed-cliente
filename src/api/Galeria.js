import { ENV } from "../utils/constants";

const TOKEN = "vitalmed0258525";

const leerJson = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      "El servidor no tiene disponible el módulo de galería. Actualizá y desplegá la última versión del backend."
    );
  }
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Error en la solicitud");
  }
  return result;
};

export class GaleriaApi {
  url = ENV.URL + "/api/";

  async getGaleria(categoria = "", incluirInactivos = false) {
    try {
      const params = new URLSearchParams();
      if (categoria) params.append("categoria", categoria);
      if (incluirInactivos) params.append("activo", "todos");
      const query = params.toString();
      const response = await fetch(
        `${this.url}galeria${query ? `?${query}` : ""}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: TOKEN,
          },
        }
      );
      return await leerJson(response);
    } catch (error) {
      console.error("Error en getGaleria:", error);
      throw error;
    }
  }

  async crearItem(data) {
    try {
      const response = await fetch(this.url + "galeria", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: TOKEN,
        },
        body: JSON.stringify(data),
      });
      return await leerJson(response);
    } catch (error) {
      console.error("Error en crearItem:", error);
      throw error;
    }
  }

  async actualizarItem(id, data) {
    try {
      const response = await fetch(this.url + `galeria/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: TOKEN,
        },
        body: JSON.stringify(data),
      });
      return await leerJson(response);
    } catch (error) {
      console.error("Error en actualizarItem:", error);
      throw error;
    }
  }

  async eliminarItem(id) {
    try {
      const response = await fetch(this.url + `galeria/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: TOKEN,
        },
      });
      return await leerJson(response);
    } catch (error) {
      console.error("Error en eliminarItem:", error);
      throw error;
    }
  }

  async subirImagenes(files) {
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append("imagenes", file));

      const response = await fetch(this.url + "galeria/subir", {
        method: "POST",
        headers: {
          Authorization: TOKEN,
        },
        body: formData,
      });
      return await leerJson(response);
    } catch (error) {
      console.error("Error en subirImagenes:", error);
      throw error;
    }
  }
}
