import React, { useState } from "react";
import CrearDisponibilidadForm from "../../Components/Admin/CrearDisponibilidadForm";
import ListaTurnosAdmin from "../../Components/Admin/ListaTurnosAdmin";
import GestionEstudios from "../../Components/Admin/GestionEstudios";
import CalendarioTurnos from "../../Components/Admin/CalendarioTurnos";

// En tu componente o página:

import "./Turnos.css";

export default function Turnos() {
    const [tabActiva, setTabActiva] = useState("crear");

    return (
        <div className="turnos-page">
            <div className="page-header">
                <h2 style={{ color: "#ffffff" }}>Gestión de Turnos</h2>
                <p style={{ color: "#ffffff" }} className="page-description">
                    Administre la disponibilidad de turnos y visualice todas las reservas
                </p>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
                <button
                    className={`tab ${tabActiva === "crear" ? "tab-active" : ""}`}
                    onClick={() => setTabActiva("crear")}
                >
                    Crear Disponibilidad
                </button>
                <button
                    className={`tab ${tabActiva === "ver" ? "tab-active" : ""}`}
                    onClick={() => setTabActiva("ver")}
                >
                    Ver Turnos
                </button>
                <button
                    className={`tab ${tabActiva === "estudios" ? "tab-active" : ""}`}
                    onClick={() => setTabActiva("estudios")}
                >
                    Estudios
                </button>
                <button
                    className={`tab ${tabActiva === "calendario" ? "tab-active" : ""}`}
                    onClick={() => setTabActiva("calendario")}
                >
                    Calendario
                </button>
            </div>

            {/* Contenido */}
            <div className="tab-content">
                {tabActiva === "crear" && <CrearDisponibilidadForm />}
                {tabActiva === "ver" && <ListaTurnosAdmin />}
                {tabActiva === "estudios" && <GestionEstudios />}
                {tabActiva === "calendario" && <CalendarioTurnos />}
            </div>
        </div>
    );
}

