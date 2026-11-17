import React from "react";
import ReactDOM from "react-dom/client";
import 'sweetalert2/src/sweetalert2.scss'

import App from "./App";
import reportWebVitals from "./reportWebVitals";

const limpiarDatosSensibles = () => {
  try {
    const userLog = JSON.parse(localStorage.getItem("userLog") || "null");
    if (userLog?.usuario?.password) {
      delete userLog.usuario.password;
      localStorage.setItem("userLog", JSON.stringify(userLog));
    }
  } catch (error) {
    // Sin acceso a localStorage.
  }

  ["doctores", "secretarias"].forEach((clave) => {
    try {
      const datos = JSON.parse(sessionStorage.getItem(clave) || "null");
      if (!Array.isArray(datos)) return;

      const limpios = datos.map((item) => {
        if (!item || typeof item !== "object") return item;
        const { password, ...resto } = item;
        return resto;
      });

      sessionStorage.setItem(clave, JSON.stringify(limpios));
    } catch (error) {
      // Caché inválida o sin acceso a sessionStorage.
    }
  });
};

limpiarDatosSensibles();

// La app usa HashRouter: permite entrar directo a rutas como /servicios o /admin/galeria
const path = window.location.pathname;
const rutasDirectas = [
  "/ejemplo-portada",
  "/servicios",
  "/estudios",
  "/cursos",
  "/reservar-sin-registro",
];
const esRutaDirecta = path.startsWith("/admin") || rutasDirectas.includes(path);

if (esRutaDirecta && !window.location.hash) {
  window.location.replace(`/#${path}${window.location.search}`);
} else {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<App />);
  reportWebVitals();
}

