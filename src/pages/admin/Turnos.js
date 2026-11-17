import React, { useState } from "react";
import ListaTurnosAdmin from "../../Components/Admin/ListaTurnosAdmin";
import CalendarioTurnos from "../../Components/Admin/CalendarioTurnos";
import "./Turnos.css";

export default function Turnos() {
    const [tabActiva, setTabActiva] = useState("ver");

    return (
        <div className="turnos-page">
            <div className="page-header">
                <h2 style={{ color: "#ffffff" }}>Turnos</h2>
                <p style={{ color: "#ffffff" }} className="page-description">
                    Consulte las reservas y visualice la agenda de la especialista
                </p>
            </div>

            {/* Tabs */}
            <div className="tabs-container">
                <button
                    className={`tab ${tabActiva === "ver" ? "tab-active" : ""}`}
                    onClick={() => setTabActiva("ver")}
                >
                    Ver Turnos
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
                {tabActiva === "ver" && <ListaTurnosAdmin />}
                {tabActiva === "calendario" && <CalendarioTurnos />}
            </div>
        </div>
    );
}
