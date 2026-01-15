import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaGraduationCap } from "react-icons/fa";
import "./Cursos.css";
import SEO from "../Components/SEO";

export default function Cursos() {
    const navigate = useNavigate();

    return (
        <div className="cursos-container">
            <SEO
                title="Cursos VIP | Educación Médica"
                description="Próximamente: Cursos especializados en ultrasonografía y medicina moderna. Contenido educativo de alta calidad por la Dra. Jeremmy Gutierrez."
                keywords="cursos medicina valencia, educación médica continua, especialización ultrasonografía, cursos vip doctoraecos"
            />

            <main className="cursos-content">
                <header>
                    <button className="btn-back" onClick={() => navigate("/")} aria-label="Volver al inicio">
                        <FaArrowLeft /> Volver
                    </button>
                </header>

                <article className="cursos-card">
                    <div className="cursos-icon" aria-hidden="true">
                        <FaGraduationCap />
                    </div>
                    <h1 className="cursos-title">Cursos VIP en Ultrasonografía</h1>

                    <section className="coming-soon">
                        <h2>Próximamente</h2>
                        <p>Estamos trabajando en contenido educativo de alta calidad para ti en Valencia, Venezuela.</p>
                    </section>

                    <section className="cursos-description">
                        <p>
                            Muy pronto podrás acceder a nuestros cursos especializados en ultrasonografía
                            y otras áreas de la medicina moderna, con certidumbre clínica y aval nacional e internacional.
                        </p>
                    </section>
                </article>
            </main>

            <footer className="cursos-footer">
                <p>Copyright © 2025 - Dra. Jeremmy Gutierrez - Valencia, Venezuela</p>
            </footer>
        </div>
    );
}
