import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaInstagram, FaWhatsapp, FaMapMarkerAlt, FaComment, FaFileAlt, FaClipboardList, FaSearchPlus, FaCalendarPlus } from "react-icons/fa";
import "./LandingPage.css";
import jer from "../assets/vitalmed/jer.png";
import logo from "../assets/vitalmed/LogoJGIcon.png";
import iconcita from "../assets/vitalmed/iconocitas.png";
import iconestudio from "../assets/vitalmed/iconoestudios.png";
import iconcurso from "../assets/vitalmed/iconocursos.png";
import SEO from "../Components/SEO";

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

    const medicalSchema = {
        "@context": "https://schema.org",
        "@type": "MedicalOrganization",
        "name": "Dra. Jeremmy Gutierrez - DoctoraEcos",
        "url": "https://doctoraecos.com/",
        "logo": "https://doctoraecos.com/logo.png",
        "image": "https://doctoraecos.com/assets/vitalmed/jer.png",
        "description": "Médico especialista en Ultrasonografía Diagnóstica e Intervencionista en Valencia, Venezuela.",
        "medicalSpecialty": "Radiology",
        "address": {
            "@type": "PostalAddress",
            "streetAddress": "Final de la Avenida Carabobo, Centro Policlinico Valencia (Clínica la Viña) Torre C piso 1 consultorio 102",
            "addressLocality": "Valencia",
            "addressRegion": "Carabobo",
            "addressCountry": "VE",
            "postalCode": "2001"
        },
        "telephone": "+584244664961",
        "priceRange": "$$"
    };

    return (
        <div className="landing-container">
            <SEO
                title="Especialista en Ecografías en Valencia"
                description="Dra. Jeremmy Gutierrez. Médico especialista en Ultrasonografía Diagnóstica e Intervencionista en Valencia, Venezuela. Ecografía Musculoesquelética y Dermocutánea."
                keywords="ecografías valencia, ultrasonido venezuela, especialista en ecografía, dra jeremmy gutierrez, la viña valencia"
                schema={medicalSchema}
            />

            {/* Main Content */}
            <main className="landing-content">
                {/* Social Media Sidebar */}
                <aside className="social-sidebar">
                    <p className="social-sidebar-text">Agendá tu cita directamente</p>
                    <a
                        href="https://www.instagram.com/doctoraecos/?hl=es"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-icon instagram"
                        aria-label="Instagram de la Dra. Jeremmy Gutierrez"
                    >
                        <FaInstagram />
                    </a>
                    <a
                        href="https://api.whatsapp.com/send?phone=584244664961&text=Hola%2C+soy+la+Asistente+de+la+Dra+Jeremmy+G+en+que+podemos+ayudarte"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-icon whatsapp"
                        aria-label="Contactar por WhatsApp"
                    >
                        <FaWhatsapp />
                    </a>
                    <a
                        href="https://threads.net/@doctoraecos"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-icon threads"
                        aria-label="Threads de la Dra. Jeremmy Gutierrez"
                    >
                        <FaComment />
                    </a>
                    <a
                        href="https://maps.app.goo.gl/6FtTK7Bwu9TYon369"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="social-icon location"
                        aria-label="Ubicación del consultorio en Valencia"
                    >
                        <FaMapMarkerAlt />
                    </a>
                </aside>
                {/* Header with Logo and Title */}
                <header className="landing-header">
                    <div className="logo-container">
                        <img src={logo} alt="Logo de DoctoraEcos - Dra. Jeremmy Gutierrez" className="logo-icon" />
                        <div className="header-text">
                            <h1 className="doctor-name">Dra. Jeremmy Gutierrez A.</h1>
                            <p className="specialty">Especialista en Ultrasonografía Diagnóstica</p>
                        </div>
                    </div>

                    {/* Informes Button (Top Right) */}
                    <button className="btn-informes" onClick={handleInformes} aria-label="Acceder a informes de pacientes">
                        <span>informes</span>
                        <FaUser className="btn-icon" />
                    </button>
                </header>

                {/* Welcome Section */}
                <section className="welcome-section">
                    <div className="welcome-text">
                        <h2 className="welcome-title">
                            Bienvenidos a<br />
                            <span className="brand-name">DoctoraEcos</span>
                        </h2>
                        <article className="welcome-description">
                            <p>
                                Soy Médico especialista en <strong>Ultrasonografía Diagnóstica e Intervencionista</strong>.
                                Egresada de la Universidad de Carabobo con especializaciones realizadas en Grupo Yoma, Imagen corporal Valencia, La Universidad de La Plata Argentina y Universidad Católica Argentina.
                            </p>
                            <p>
                                Pionera en el uso de <strong>Ecografía Musculoesquelética, Dermocutánea y Dermofotónica</strong> en Venezuela. Speaker Nacional e Internacional en Ecografía y Profesora de la Universidad de Carabobo con más de 18 años de trayectoria.
                            </p>
                            <p>
                                Mi objetivo es brindarte un diagnóstico con certidumbre clínica, permitiendo encaminar las acciones pertinentes para tu salud en Valencia, Carabobo.
                            </p>
                        </article>
                    </div>

                    {/* Doctor Image */}
                    <div className="doctor-image-container">
                        <img src={jer} alt="Dra. Jeremmy Gutierrez - Especialista en Ecografías" className="doctor-image" />
                    </div>
                </section>

                {/* Action Buttons */}
                <section className="action-buttons">
                    <button className="btn-action btn-estudios" onClick={handleEstudios}>
                        <span>estudios médicos</span>
                        <img src={iconestudio} alt="Icono estudios médicos" />
                    </button>
                    <button className="btn-action btn-cursos" onClick={handleCursos}>
                        <span>cursos VIP</span>
                        <img src={iconcurso} alt="Icono cursos médicos" />
                    </button>

                    <nav className="mobile-booking-section registered">
                        <p className="mobile-section-text">¿Ya eres paciente? Ingresa y reserva tu turno</p>
                        <button className="btn-action btn-agenda" onClick={handleInformes}>
                            <span>agenda cita</span>
                            <img src={iconcita} alt="Icono agendar cita" />
                        </button>
                    </nav>

                    <nav className="mobile-booking-section guest">
                        <p className="mobile-section-text">¿Nuevo paciente? Agenda tu turno sin registro</p>
                        <button className="btn-action btn-agendar-sin-registro" onClick={handleAgendarSinRegistro}>
                            <span>agendar sin registro</span>
                            <FaCalendarPlus className="btn-icon-large" />
                        </button>
                    </nav>
                </section>
            </main>

            {/* Mobile Social Icons - Outside the card */}
            <footer className="mobile-social-bar">
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
                    href="https://threads.net/@doctoraecos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mobile-social-icon threads"
                    aria-label="Threads"
                >
                    <FaComment />
                </a>
                <a
                    href="https://maps.app.goo.gl/6FtTK7Bwu9TYon369"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mobile-social-icon location"
                    aria-label="Ubicación en Valencia"
                >
                    <FaMapMarkerAlt />
                </a>
            </footer>

            {/* Contact Info for Local SEO */}
            <div style={{ display: 'none' }}>
                <p>Ubicación: Centro Policlínico Valencia (Clínica la Viña) Torre C piso 1 consultorio 102.</p>
                <p>Valencia, Carabobo, Venezuela.</p>
                <p>Avenida Carabobo, Urb La Viña.</p>
            </div>
        </div>
    );
}


