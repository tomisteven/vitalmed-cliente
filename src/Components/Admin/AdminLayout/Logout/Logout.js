import React from "react";
import { FiLogOut } from "react-icons/fi";
import "./Logout.css";

export function Logout() {
  const cerrarSesion = () => {
    if (!window.confirm("¿Querés cerrar sesión?")) return;
    localStorage.removeItem("userLog");
    window.location.href = "/";
  };

  return (
    <button type="button" className="sidebar-logout" onClick={cerrarSesion}>
      <FiLogOut />
      <span>Cerrar sesión</span>
    </button>
  );
}
