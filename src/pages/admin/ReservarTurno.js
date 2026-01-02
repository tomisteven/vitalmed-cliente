import React from "react";
import BuscadorTurnos from "../../Components/Admin/BuscadorTurnos";
import "./ReservarTurno.css";

export default function ReservarTurno() {
    return (
        <div className="reservar-turno-page">
            <div className="page-header">
                <h2>Reservar Turno</h2>
                <p className="page-description">
                    Busque y reserve turnos disponibles con nuestros profesionales
                </p>
            </div>

            <BuscadorTurnos />
        </div>
    );
}
