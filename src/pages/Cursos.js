import React from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaGraduationCap } from "react-icons/fa";
import "./Cursos.css";

export default function Cursos() {
    const navigate = useNavigate();

    return (
        <div className="cursos-container">
            <div className="cursos-content">
                <button className="btn-back" onClick={() => navigate("/")}>
                    <FaArrowLeft /> Volver
                </button>

                <div className="cursos-card">
                    <div className="cursos-icon">
                        <FaGraduationCap />
                    </div>
                    <h1 className="cursos-title">Cursos VIP</h1>
                    <div className="coming-soon">
                        <h2>Próximamente</h2>
                        <p>Estamos trabajando en contenido educativo de alta calidad para ti</p>
                    </div>

                    <div className="cursos-description">
                        <p>
                            Muy pronto podrás acceder a nuestros cursos especializados en ultrasonografía
                            y otras áreas de la medicina moderna.
                        </p>
                    </div>
                </div>
            </div>

            <footer className="cursos-footer">
                <p>Copyright © 2025 - Dra. Jeremmy Gutierrez</p>
            </footer>
        </div>
    );
}
