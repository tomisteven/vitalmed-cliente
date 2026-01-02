import React from "react";
import MisTurnos from "../../Components/Admin/MisTurnos";
import "./MisTurnosPage.css";

export default function MisTurnosPage() {
    // Obtener el usuario logueado
    const user = JSON.parse(localStorage.getItem("userLog"));
    const pacienteId = user?.usuario._id;

    if (!pacienteId) {
        return (
            <div className="mis-turnos-page">
                <div className="error-message">
                    <p>Debe iniciar sesión para ver sus turnos.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mis-turnos-page">
            <div className="page-header">
                <h2>Mis Turnos</h2>
                <p className="page-description">
                    Visualice y gestione sus turnos médicos
                </p>
            </div>

            <MisTurnos pacienteId={pacienteId} />
        </div>
    );
}
