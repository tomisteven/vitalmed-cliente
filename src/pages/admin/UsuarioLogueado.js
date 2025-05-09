import React from "react";
import { FaUserCircle } from "react-icons/fa";
import "./UsuarioLogueado.css";
import { LoaderIcon } from "react-hot-toast";

export default function UsuarioLogueado() {
  const usuario$ = JSON.parse(localStorage.getItem("userLog"));

  const { nombre, email, password, usuario, rol } = usuario$.usuario;
  console.log(usuario$);

  if (!usuario$) {
    return (
      <div className="container-pacientes-loader">
        <LoaderIcon
          style={{
            width: "30px",
            height: "30px",
            color: "#ff7e67",
            marginTop: "50px",
          }}
        />
      </div>
    );
  }
  return (
    <div className="usuario-container">
      <FaUserCircle className="usuario-icono" />
      <div className="usuario-info">
        <h1>ROL: {rol} </h1>
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
