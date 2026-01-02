import React, { useState, useEffect } from "react";
import { TurnosApi } from "../../api/Turnos";
import { formatearFechaHora } from "../../utils/dateHelpers";
import {
    separarTurnosPorFecha,
    getEstadoColor,
    getEstadoLabel,
    ordenarTurnosPorFecha,
} from "../../utils/turnoHelpers";
import toast from "react-hot-toast";
import "./MisTurnos.css";

const turnosApi = new TurnosApi();

export default function MisTurnos({ pacienteId }) {
    const [turnos, setTurnos] = useState({ proximos: [], pasados: [] });
    const [loading, setLoading] = useState(true);
    const [tabActiva, setTabActiva] = useState("proximos");

    useEffect(() => {
        if (pacienteId) {
            cargarTurnos();
        }
    }, [pacienteId]);

    const cargarTurnos = async () => {
        setLoading(true);
        try {
            const response = await turnosApi.obtenerMisTurnos(pacienteId);

            if (response) {
                const turnosArray = Array.isArray(response) ? response : [];
                const { proximos, pasados } = separarTurnosPorFecha(turnosArray);

                setTurnos({
                    proximos: ordenarTurnosPorFecha(proximos),
                    pasados: ordenarTurnosPorFecha(pasados),
                });
            }
        } catch (error) {
            console.error("Error al cargar turnos:", error);
            toast.error("Error al cargar sus turnos");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelar = async (turnoId) => {
        const confirmar = window.confirm(
            "¿Está seguro que desea cancelar este turno?"
        );

        if (!confirmar) return;

        try {
            const response = await turnosApi.cancelarTurno(
                turnoId,
                "Cancelado por el paciente"
            );

            if (response) {
                toast.success("Turno cancelado exitosamente");
                cargarTurnos(); // Recargar turnos
            }
        } catch (error) {
            console.error("Error al cancelar turno:", error);
            toast.error(error.message || "Error al cancelar el turno");
        }
    };

    const renderTurno = (turno) => (
        <div key={turno._id} className="turno-card">
            <div className="turno-card-header">
                <div className="turno-fecha">{formatearFechaHora(turno.fecha)}</div>
                <span
                    className="turno-badge"
                    style={{ backgroundColor: getEstadoColor(turno.estado) }}
                >
                    {getEstadoLabel(turno.estado)}
                </span>
            </div>

            <div className="turno-card-body">
                <div className="turno-info-row">
                    <span className="turno-label">Médico:</span>
                    <span className="turno-value">
                        {turno.doctor?.nombre || "No especificado"}
                    </span>
                </div>

                <div className="turno-info-row">
                    <span className="turno-label">Especialidad:</span>
                    <span className="turno-value">
                        {turno.especialidad || "No especificada"}
                    </span>
                </div>

                {turno.motivoConsulta && (
                    <div className="turno-info-row turno-motivo">
                        <span className="turno-label">Motivo:</span>
                        <span className="turno-value">{turno.motivoConsulta}</span>
                    </div>
                )}
            </div>

            {turno.estado === "reservado" && tabActiva === "proximos" && (
                <div className="turno-card-footer">
                    <button
                        onClick={() => handleCancelar(turno._id)}
                        className="btn-cancelar-turno"
                    >
                        Cancelar Turno
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="mis-turnos">
            <h3>Mis Turnos</h3>

            {/* Tabs */}
            <div className="tabs-container">
                <button
                    className={`tab ${tabActiva === "proximos" ? "tab-active" : ""}`}
                    onClick={() => setTabActiva("proximos")}
                >
                    Próximos Turnos
                    {turnos.proximos.length > 0 && (
                        <span className="tab-badge">{turnos.proximos.length}</span>
                    )}
                </button>
                <button
                    className={`tab ${tabActiva === "pasados" ? "tab-active" : ""}`}
                    onClick={() => setTabActiva("pasados")}
                >
                    Historial
                    {turnos.pasados.length > 0 && (
                        <span className="tab-badge">{turnos.pasados.length}</span>
                    )}
                </button>
            </div>

            {/* Contenido */}
            <div className="tab-content">
                {loading ? (
                    <div className="loading-message">Cargando turnos...</div>
                ) : tabActiva === "proximos" ? (
                    turnos.proximos.length === 0 ? (
                        <div className="empty-message">
                            <p>No tiene turnos próximos.</p>
                            <p className="empty-hint">
                                Puede buscar y reservar turnos disponibles.
                            </p>
                        </div>
                    ) : (
                        <div className="turnos-list">
                            {turnos.proximos.map(renderTurno)}
                        </div>
                    )
                ) : turnos.pasados.length === 0 ? (
                    <div className="empty-message">
                        <p>No tiene turnos en el historial.</p>
                    </div>
                ) : (
                    <div className="turnos-list">
                        {turnos.pasados.map(renderTurno)}
                    </div>
                )}
            </div>
        </div>
    );
}
