import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaInstagram, FaWhatsapp, FaMapMarkerAlt, FaComment, FaFileAlt, FaClipboardList, FaSearchPlus, FaCalendarPlus } from "react-icons/fa";
import "./LandingPage.css";
import jer from "../assets/vitalmed/jer.png";
import logo from "../assets/vitalmed/LogoJGIcon.png";
import iconcita from "../assets/vitalmed/iconocitas.png";
import iconestudio from "../assets/vitalmed/iconoestudios.png";
import iconcurso from "../assets/vitalmed/iconocursos.png";

export default function LandingPage() {
    const navigate = useNavigate();

    const handleInformes = () => {
        navigate("/admin/auth");
    };

    const handleCursos = () => {
        navigate("/cursos");
    };

    const handleEstudios = () => {
        navigate("/estudios");
    };

    const handleAgendarSinRegistro = () => {
        navigate("/reservar-sin-registro");
    };

    return (
        <div className="landing-container">

            {/* Main Content */}
            <div className="landing-content">
                {/* Social Media Sidebar */}
                <div className="social-sidebar">
                    <p className="social-sidebar-text">Estoy solo agregá mi Link - agendá tu cita</p>
                    <a
                        href="https://www.instagram.com/doctoraecos?igsh=MXVnbGZzaXg3YzJxdQ=="
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-icon instagram"
                        aria-label="Instagram"
                    >
                        <FaInstagram />
                    </a>
                    <a
                        href="https://wa.me/qr/NGJUQHKJKLDWC1"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-icon whatsapp"
                        aria-label="WhatsApp"
                    >
                        <FaWhatsapp />
                    </a>
                    <a
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-icon threads"
                        aria-label="Threads"
                    >
                        <FaComment />
                    </a>
                    <a
                        href="#"
                        className="social-icon location"
                        aria-label="Ubicación"
                    >
                        <FaMapMarkerAlt />
                    </a>
                </div>
                {/* Header with Logo and Title */}
                <div className="landing-header">
                    <div className="logo-container">
                        <img src={logo} alt="Logo" className="logo-icon" />
                        <div className="header-text">
                            <h1 className="doctor-name">Dra. Jeremmy Gutierrez A.</h1>
                            <p className="specialty">Ultrasonografía</p>
                        </div>
                    </div>

                    {/* Informes Button (Top Right) */}
                    <button className="btn-informes" onClick={handleInformes}>
                        <span>informes</span>
                        <FaUser className="btn-icon" />
                    </button>
                </div>

                {/* Welcome Section */}
                <div className="welcome-section">
                    <div className="welcome-text">
                        <h2 className="welcome-title">
                            Bienvenidos a<br />
                            <span className="brand-name">DoctoraEcos</span>
                        </h2>
                        <p className="welcome-description">
                            Soy Médico especialista en Ultrasonografía Diagnóstica e Intervencionista.
                            Egresada de la Universidad de Carabobo con especializaciones realizadas Grupo Yoma, Imagen corporal Valencia, La Universidad de La Plata Argentina, Universidad Católica Argentina. Actualizaciones avaladas por SERTRADE España.
                            Pionera uso de Ecografía Musculoesquelética, Dermocutanea y Dermofotestica en Venezuela. Speaker Nacional e Internacional en Ecografía.
                            Profesor de la Universidad de Carabobo, mas de 18 años de trayectoria en el área de Ultrasonido.
                            A tu alcance para brindarte un diagnostico, con certidumbre clínica que me permita encaminar las acciones pertinentes a tu salud, sin vicios ni errores de información.
                        </p>
                    </div>

                    {/* Doctor Image */}
                    <div className="doctor-image-container">
                        <img src={jer} alt="Dra. Jeremmy Gutierrez" className="doctor-image" />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons">
                    <button className="btn-action btn-agenda" onClick={handleInformes}>
                        <span>agenda cita</span>
                        <img src={iconcita} alt="" />
                    </button>
                    <button className="btn-action btn-estudios" onClick={handleEstudios}>
                        <span>estudios</span>
                        <img src={iconestudio} alt="" />
                    </button>
                    <button className="btn-action btn-cursos" onClick={handleCursos}>
                        <span>cursos VIP</span>
                        <img src={iconcurso} alt="" />
                    </button>
                    <button className="btn-action btn-agendar-sin-registro" onClick={handleAgendarSinRegistro}>
                        <span>agendar sin registro</span>
                        <FaCalendarPlus className="btn-icon-large" />
                    </button>
                </div>
            </div>

            {/* Mobile Social Icons - Outside the card */}
            <div className="mobile-social-bar">
                <a
                    href="https://www.instagram.com/doctoraecos?igsh=MXVnbGZzaXg3YzJxdQ=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mobile-social-icon instagram"
                    aria-label="Instagram"
                >
                    <FaInstagram />
                </a>
                <a
                    href="https://wa.me/qr/NGJUQHKJKLDWC1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mobile-social-icon whatsapp"
                    aria-label="WhatsApp"
                >
                    <FaWhatsapp />
                </a>
                <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mobile-social-icon threads"
                    aria-label="Threads"
                >
                    <FaComment />
                </a>
                <a
                    href="#"
                    className="mobile-social-icon location"
                    aria-label="Ubicación"
                >
                    <FaMapMarkerAlt />
                </a>
            </div>


        </div>
    );
}

