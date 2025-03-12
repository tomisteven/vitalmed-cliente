import React from "react";
import { FaUserCircle } from "react-icons/fa";
import "./UsuarioLogueado.css";

export default function UsuarioLogueado() {
  const usuario = JSON.parse(localStorage.getItem("userLog"));

  const { nombre, email, password} = usuario.usuario;
  console.log(usuario);

  if (!usuario) {
    return <div className="usuario-container">Cargando usuario...</div>;
  }

  return (
    <div className="usuario-container">
      <FaUserCircle className="usuario-icono" />
      <div className="usuario-info">
        <h2>Nombre: {nombre}</h2>
        <p>Email: {email}</p>
        <strong>Contraseña: {password}</strong>
      </div>

    </div>
  );
}
