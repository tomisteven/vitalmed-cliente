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
import { FaPrint, FaCheck, FaCalendarAlt, FaUserMd, FaTimes } from "react-icons/fa";
import "./MisTurnos.css";

const turnosApi = new TurnosApi();

export default function MisTurnos({ pacienteId }) {
    const [turnos, setTurnos] = useState({ proximos: [], pasados: [] });
    const [loading, setLoading] = useState(true);
    const [tabActiva, setTabActiva] = useState("proximos");
    const [comprobanteSeleccionado, setComprobanteSeleccionado] = useState(null);

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

    const imprimirComprobante = (turno) => {
        const contenido = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Comprobante de Turno</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: Arial, sans-serif; 
                        padding: 40px; 
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                    }
                    .header { 
                        text-align: center; 
                        border-bottom: 3px solid #653057; 
                        padding-bottom: 20px; 
                        margin-bottom: 30px;
                    }
                    .header h1 { 
                        color: #653057; 
                        font-size: 28px;
                        margin-bottom: 5px;
                    }
                    .header p {
                        color: #666;
                        font-size: 14px;
                    }
                    .success-badge {
                        background: #28a745;
                        color: white;
                        padding: 10px 20px;
                        border-radius: 25px;
                        display: inline-block;
                        margin-bottom: 25px;
                        font-weight: bold;
                    }
                    .section { 
                        margin-bottom: 25px;
                    }
                    .section-title { 
                        font-size: 14px; 
                        color: #888; 
                        text-transform: uppercase;
                        margin-bottom: 10px;
                        letter-spacing: 1px;
                    }
                    .detail-row { 
                        display: flex; 
                        justify-content: space-between; 
                        padding: 12px 0; 
                        border-bottom: 1px solid #eee;
                    }
                    .detail-label { 
                        color: #666; 
                        font-weight: 500;
                    }
                    .detail-value { 
                        color: #333; 
                        font-weight: 600;
                        text-align: right;
                    }
                    .highlight {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        padding: 20px;
                        border-radius: 10px;
                        border-left: 4px solid #653057;
                        margin-bottom: 25px;
                    }
                    .footer { 
                        margin-top: 40px; 
                        padding-top: 20px; 
                        border-top: 2px solid #eee;
                        text-align: center;
                        color: #888;
                        font-size: 12px;
                    }
                    .note {
                        background: #fff3cd;
                        padding: 15px;
                        border-radius: 8px;
                        margin-top: 20px;
                        font-size: 13px;
                        color: #856404;
                    }
                    @media print {
                        body { padding: 20px; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Comprobante de Turno</h1>
                    <p>DoctoraEcos - Centro de Ultrasonografía</p>
                </div>
                
                <div style="text-align: center;">
                    <span class="success-badge">✓ Reserva Confirmada</span>
                </div>

                <div class="highlight">
                    <div class="section-title">Información del Turno</div>
                    <div class="detail-row">
                        <span class="detail-label">Fecha y Hora:</span>
                        <span class="detail-value">${formatearFechaHora(turno.fecha)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Doctor:</span>
                        <span class="detail-value">${turno.doctor?.nombre || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Especialidad:</span>
                        <span class="detail-value">${turno.especialidad || turno.doctor?.especialidad || 'N/A'}</span>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Datos del Paciente</div>
                    <div class="detail-row">
                        <span class="detail-label">Nombre:</span>
                        <span class="detail-value">${turno.paciente?.nombre || 'Paciente'}</span>
                    </div>
                    ${turno.motivoConsulta ? `
                    <div class="detail-row">
                        <span class="detail-label">Motivo:</span>
                        <span class="detail-value">${turno.motivoConsulta}</span>
                    </div>
                    ` : ''}
                </div>

                <div class="note">
                    <strong>📋 Importante:</strong><br/>
                    • Presentar este comprobante el día de la cita.<br/>
                    • Llegar 15 minutos antes de la hora programada.<br/>
                    • Para cancelar o modificar, comunicarse con la clínica.
                </div>

                <div class="footer">
                    <p>Documento generado el ${new Date().toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}</p>
                    <p style="margin-top: 10px;">DoctoraEcos © ${new Date().getFullYear()}</p>
                </div>
            </body>
            </html>
        `;

        const ventana = window.open('', '_blank');
        ventana.document.write(contenido);
        ventana.document.close();
        ventana.focus();

        // Esperar a que cargue y luego imprimir
        setTimeout(() => {
            ventana.print();
        }, 250);
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
                        className="btn-ver-comprobante"
                        onClick={() => setComprobanteSeleccionado(turno)}
                    >
                        <FaPrint /> Comprobante
                    </button>
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

            {/* Modal de Comprobante */}
            {comprobanteSeleccionado && (
                <div className="comprobante-modal-overlay" onClick={() => setComprobanteSeleccionado(null)}>
                    <div className="comprobante-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="comprobante-modal-header">
                            <div className="header-title">
                                <FaCheck className="success-icon" />
                                <h4>Comprobante de Reserva</h4>
                            </div>
                            <button className="close-modal" onClick={() => setComprobanteSeleccionado(null)}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="comprobante-modal-body">
                            <div className="confirmation-details">
                                <div className="detail-row">
                                    <span className="detail-label">Fecha y hora:</span>
                                    <span className="detail-value">{formatearFechaHora(comprobanteSeleccionado.fecha)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Doctor:</span>
                                    <span className="detail-value">
                                        {comprobanteSeleccionado.doctor?.nombre}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Especialidad:</span>
                                    <span className="detail-value">
                                        {comprobanteSeleccionado.especialidad || comprobanteSeleccionado.doctor?.especialidad}
                                    </span>
                                </div>
                                {comprobanteSeleccionado.motivoConsulta && (
                                    <div className="detail-row">
                                        <span className="detail-label">Motivo:</span>
                                        <span className="detail-value">{comprobanteSeleccionado.motivoConsulta}</span>
                                    </div>
                                )}
                            </div>

                            <div className="confirmation-note">
                                <p>📋 Puede imprimir este comprobante o tomar una captura de pantalla.</p>
                                <p>📞 Para modificaciones, comuníquese con la clínica.</p>
                            </div>
                        </div>

                        <div className="comprobante-modal-footer">
                            <button
                                className="btn-modal-imprimir"
                                onClick={() => imprimirComprobante(comprobanteSeleccionado)}
                            >
                                <FaPrint /> Imprimir / PDF
                            </button>
                            <button
                                className="btn-modal-cerrar"
                                onClick={() => setComprobanteSeleccionado(null)}
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
