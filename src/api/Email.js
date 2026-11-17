import { ENV } from "../utils/constants";

const TOKEN = "vitalmed0258525";

const leerJson = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new Error(
      "El servidor no tiene disponible el módulo de correo. Actualizá y desplegá la última versión del backend."
    );
  }
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || "Error al enviar el correo");
  }
  return result;
};

export class EmailApi {
  url = ENV.URL + "/api/";

  async estadoCorreo() {
    try {
      const response = await fetch(this.url + "email/estado", {
        headers: {
          "Content-Type": "application/json",
          Authorization: TOKEN,
        },
      });
      return await leerJson(response);
    } catch (error) {
      console.error("Error en estadoCorreo:", error);
      throw error;
    }
  }

  async enviarInforme({
    pacienteId,
    turnoId = null,
    asunto = "",
    mensaje = "",
    archivos = [],
    email = "",
  }) {
    try {
      const response = await fetch(this.url + "email/enviar-informe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: TOKEN,
        },
        body: JSON.stringify({
          pacienteId,
          turnoId,
          asunto,
          mensaje,
          archivos,
          email,
        }),
      });
      return await leerJson(response);
    } catch (error) {
      console.error("Error en enviarInforme:", error);
      throw error;
    }
  }
}
