import { ENV } from "../utils/constants";

const TOKEN = "vitalmed0258525";

const leerJson = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      "El servidor no tiene disponible el módulo de configuración. Actualizá y desplegá la última versión del backend."
    );
  }
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Error en la solicitud");
  }
  return result;
};

export class ConfiguracionApi {
  url = ENV.URL + "/api/";

  async getEmail() {
    try {
      const response = await fetch(this.url + "configuracion/email", {
        headers: {
          "Content-Type": "application/json",
          Authorization: TOKEN,
        },
      });
      return await leerJson(response);
    } catch (error) {
      console.error("Error en getEmail:", error);
      throw error;
    }
  }

  async guardarEmail(data) {
    try {
      const response = await fetch(this.url + "configuracion/email", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: TOKEN,
        },
        body: JSON.stringify(data),
      });
      return await leerJson(response);
    } catch (error) {
      console.error("Error en guardarEmail:", error);
      throw error;
    }
  }

  async probarEmail(destinatario) {
    try {
      const response = await fetch(this.url + "configuracion/email/probar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: TOKEN,
        },
        body: JSON.stringify({ destinatario }),
      });
      return await leerJson(response);
    } catch (error) {
      console.error("Error en probarEmail:", error);
      throw error;
    }
  }
}
