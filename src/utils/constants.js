const PRODUCTION_URL = "https://api.doctoraecos.com";
const LOCAL_URL = "http://localhost:8082";

const esEntornoLocal =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

// Permite forzar una URL con REACT_APP_API_URL; si no, usa localhost en desarrollo
// y la URL de producción cuando el cliente está desplegado.
const apiUrl =
  process.env.REACT_APP_API_URL ||
  (esEntornoLocal ? LOCAL_URL : PRODUCTION_URL);

export const ENV = {
  URL: apiUrl,
  URL_CLIENT: apiUrl,
};
