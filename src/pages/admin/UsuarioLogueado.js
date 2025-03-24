import React from "react";
import { FaUserCircle } from "react-icons/fa";
import "./UsuarioLogueado.css";

export default function UsuarioLogueado() {
  const usuario$ = JSON.parse(localStorage.getItem("userLog"));

  const { nombre, email, password, usuario } = usuario$.usuario;
  console.log(usuario);

  if (!usuario) {
    return <div className="usuario-container">Cargando usuario...</div>;
  }
  return (
    <div className="usuario-container">
      <FaUserCircle className="usuario-icono" />
      <div className="usuario-info">
        <h2>Nombre: {nombre}</h2>
        <p>Usuario: {usuario}</p>
        <p>Email: {email ? email : "No especifica"}</p>
        <strong>Contraseña: {password}</strong>
        <button
          className="btn-logout-user"
          onClick={() => {
            localStorage.removeItem("userLog");
            window.location.reload();
          }}
        >
          Cerrar Sesión
        </button>
      </div>
      {/* logout */}
    </div>
  );
}
