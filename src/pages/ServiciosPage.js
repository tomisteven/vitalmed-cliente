import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaCalendarCheck } from "react-icons/fa";
import GaleriaServicios from "../Components/Galeria/GaleriaServicios";
import SEO from "../Components/SEO";
import logo from "../assets/vitalmed/LogoJGIcon.png";
import "./ServiciosPage.css";

export default function ServiciosPage() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("userLog") || "null");

  const agendar = () => {
    if (!usuario) navigate("/reservar-sin-registro");
    else if (usuario.rol === "paciente") navigate("/admin/reservar-turno");
    else navigate("/admin/turnos");
  };

  return (
    <div className="servicios-page">
      <SEO
        title="Galería de servicios y estudios"
        description="Conocé las instalaciones del consultorio, los estudios médicos que realizamos y las indicaciones básicas. Dra. Jeremmy Gutierrez en Valencia."
        keywords="galería consultorio Valencia, estudios ecografía, instalaciones consultorio, DoctoraEcos, Dra Jeremmy Gutierrez"
      />

      <header className="servicios-topbar">
        <button
          type="button"
          className="servicios-brand"
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="DoctoraEcos" />
          <span>
            <strong>DoctoraEcos</strong>
            <small>Ultrasonografía diagnóstica</small>
          </span>
        </button>
        <button
          type="button"
          className="servicios-back"
          onClick={() => navigate("/")}
        >
          <FaArrowLeft /> Volver al inicio
        </button>
      </header>

      <main>
        <section className="servicios-hero">
          <span className="servicios-hero-glow a" />
          <span className="servicios-hero-glow b" />
          <div className="servicios-hero-inner">
            <span className="servicios-kicker">Galería</span>
            <h1>Servicios, estudios y consultorio</h1>
            <p>
              Conocé nuestros espacios y los estudios que realizamos. Cada
              estudio incluye su objetivo, indicaciones básicas y la opción de
              agendar directamente.
            </p>
            <button
              type="button"
              className="servicios-cta"
              onClick={agendar}
            >
              <FaCalendarCheck /> Agendar cita
            </button>
          </div>
        </section>

        <GaleriaServicios showHeader={false} />
      </main>

      <footer className="servicios-footer">
        <span>
          © {new Date().getFullYear()} DoctoraEcos · Dra. Jeremmy Gutierrez
        </span>
        <button type="button" onClick={() => navigate("/")}>
          Volver al inicio
        </button>
      </footer>
    </div>
  );
}
