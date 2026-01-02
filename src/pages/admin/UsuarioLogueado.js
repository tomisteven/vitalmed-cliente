import React from "react";
import { FaUserCircle, FaEnvelope, FaIdCard, FaUserTag, FaSignOutAlt } from "react-icons/fa";
import "./UsuarioLogueado.css";
import { LoaderIcon } from "react-hot-toast";

export default function UsuarioLogueado() {
  const usuario$ = JSON.parse(localStorage.getItem("userLog"));

  if (!usuario$ || !usuario$.usuario) {
    return (
      <div className="container-pacientes-loader">
        <LoaderIcon
          style={{
            width: "40px",
            height: "40px",
            color: "#667eea",
            marginTop: "50px",
          }}
        />
      </div>
    );
  }

  const { usuario: userProfile, rol: userRole } = usuario$;
  const { nombre, email, usuario, dni, telefono, edad } = userProfile || {};
  const rol = userRole || userProfile?.rol;

  console.log("Perfil del usuario:", userProfile);
  console.log("Rol del usuario:", rol);

  const handleLogout = () => {
    if (window.confirm("¿Está seguro que desea cerrar sesión?")) {
      localStorage.removeItem("userLog");
      window.location.href = "/";
    }
  };

  return (
    <div className="perfil-page">
      <div className="perfil-container">
        {/* Header con gradiente */}
        <div className="perfil-header">
          <div className="perfil-avatar">
            <FaUserCircle />
          </div>
          <h1 className="perfil-nombre">{nombre}</h1>
          <span className="perfil-rol">{rol}</span>
        </div>

        {/* Información del usuario */}
        <div className="perfil-body">
          <h2 className="seccion-titulo">Información Personal</h2>

          <div className="info-grid">
            <div className="info-item">


              <div className="info-content">
                <span className="info-label">Usuario</span>
                <span className="info-value">{usuario}</span>
              </div>
            </div>

            {email && (
              <div className="info-item">
                <div className="info-icon">
                  <FaEnvelope />
                </div>
                <div className="info-content">
                  <span className="info-label">Email</span>
                  <span className="info-value">{email}</span>
                </div>
              </div>
            )}

            {dni && (
              <div className="info-item">
                <div className="info-icon">
                  <FaIdCard />
                </div>
                <div className="info-content">
                  <span className="info-label">DNI</span>
                  <span className="info-value">{dni}</span>
                </div>
              </div>
            )}

            {telefono && (
              <div className="info-item">
                <div className="info-icon">
                  📱
                </div>
                <div className="info-content">
                  <span className="info-label">Teléfono</span>
                  <span className="info-value">{telefono}</span>
                </div>
              </div>
            )}

            {edad && (
              <div className="info-item">
                <div className="info-icon">
                  🎂
                </div>
                <div className="info-content">
                  <span className="info-label">Edad</span>
                  <span className="info-value">{edad} años</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer con botón de logout */}
        <div className="perfil-footer">
          <button className="btn-logout" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
}
