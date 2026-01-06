import React, { useState, useEffect } from "react";
import { TurnosApi } from "../../api/Turnos";
import { EstudiosApi } from "../../api/Estudios";
import { formatearFechaHora } from "../../utils/dateHelpers";
import toast from "react-hot-toast";
import { FaPrint, FaCheck, FaCalendarAlt, FaUserMd, FaTimes } from "react-icons/fa";
import "./TarjetaTurno.css";

const turnosApi = new TurnosApi();
const estudiosApi = new EstudiosApi();

export default function TarjetaTurno({ turno, onReservado }) {
    const [showModal, setShowModal] = useState(false);
    const [motivoConsulta, setMotivoConsulta] = useState("");
    const [estudioId, setEstudioId] = useState("");
    const [estudios, setEstudios] = useState([]);
    const [loadingEstudios, setLoadingEstudios] = useState(false);
    const [loading, setLoading] = useState(false);
    const [reservaExitosa, setReservaExitosa] = useState(null);

    const cargarEstudios = async () => {
        setLoadingEstudios(true);
        try {
            const response = await estudiosApi.getEstudios(true);
            const listaEstudios = Array.isArray(response)
                ? response
                : response.estudios || [];
            setEstudios(listaEstudios.filter(e => e.activo));
        } catch (error) {
            console.error("Error al cargar estudios:", error);
            toast.error("Error al cargar los estudios disponibles");
        } finally {
            setLoadingEstudios(false);
        }
    };

    const handleReservar = () => {
        const idEstudio = turno.estudio?._id || (typeof turno.estudioId === "string" ? turno.estudioId : turno.estudioId?._id);
        if (idEstudio) {
            setEstudioId(idEstudio);
        }
        setShowModal(true);
        if (!idEstudio) {
            cargarEstudios();
        }
    };

    const handleCancelar = () => {
        const wasSuccessful = !!reservaExitosa;
        setShowModal(false);
        setMotivoConsulta("");
        setEstudioId("");
        setReservaExitosa(null);

        if (wasSuccessful && onReservado) {
            onReservado();
        }
    };

    const handleConfirmar = async () => {
        if (!motivoConsulta.trim()) {
            toast.error("Debe ingresar el motivo de consulta");
            return;
        }

        if (!estudioId) {
            toast.error("Debe seleccionar un estudio");
            return;
        }

        setLoading(true);

        try {
            const user = JSON.parse(localStorage.getItem("userLog"));

            if (!user.usuario || !user.usuario._id) {
                toast.error("Debe iniciar sesión para reservar un turno");
                setLoading(false);
                return;
            }

            const response = await turnosApi.reservarTurno(
                turno._id,
                user.usuario._id,
                motivoConsulta,
                estudioId
            );

            if (response) {
                toast.success("✓ Turno reservado exitosamente. Se envió un email de confirmación.");
                setReservaExitosa({
                    ...turno,
                    motivoConsulta,
                    paciente: user.usuario
                });
                setMotivoConsulta("");
                setEstudioId("");
            }
        } catch (error) {
            console.error("Error al reservar turno:", error);
            toast.error(error.message || "Error al reservar el turno");
        } finally {
            setLoading(false);
        }
    };

    const imprimirComprobante = (turnoReserva) => {
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
                        <span class="detail-value">${formatearFechaHora(turnoReserva.fecha)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Doctor:</span>
                        <span class="detail-value">${turnoReserva.doctor?.nombre || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Especialidad:</span>
                        <span class="detail-value">${turnoReserva.especialidad || turnoReserva.doctor?.especialidad || 'N/A'}</span>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Datos del Paciente</div>
                    <div class="detail-row">
                        <span class="detail-label">Nombre:</span>
                        <span class="detail-value">${turnoReserva.paciente?.nombre || 'Paciente'}</span>
                    </div>
                    ${turnoReserva.motivoConsulta ? `
                    <div class="detail-row">
                        <span class="detail-label">Motivo:</span>
                        <span class="detail-value">${turnoReserva.motivoConsulta}</span>
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

    // Encontrar el nombre del estudio asignado al turno
    const getEstudioInfo = () => {
        if (turno.estudio) {
            return turno.estudio.tipo || turno.estudio;
        }
        if (turno.estudioId && turno.estudioId.tipo) {
            return turno.estudioId.tipo;
        }
        return null;
    };

    const estudioAsignado = getEstudioInfo();

    return (
        <>
            <div className="tarjeta-turno">
                <div className="tarjeta-header">
                    <div className="fecha-hora">
                        {formatearFechaHora(turno.fecha)}
                    </div>
                </div>

                <div className="tarjeta-body">
                    <div className="info-item">
                        <span className="info-label">Médico:</span>
                        <span className="info-value">
                            {turno.doctor?.nombre || "No especificado"}
                        </span>
                    </div>

                    <div className="info-item">
                        <span className="info-label">Especialidad:</span>
                        <span className="info-value especialidad">
                            {turno.especialidad || "No especificada"}
                        </span>
                    </div>

                    {estudioAsignado && (
                        <div className="info-item">
                            <span className="info-label">Estudio:</span>
                            <span className="info-value estudio">
                                {estudioAsignado}
                            </span>
                        </div>
                    )}

                    {turno.estudio?.precio > 0 && (
                        <div className="info-item">
                            <span className="info-label">Precio:</span>
                            <span className="info-value precio">
                                REF: {turno.estudio.precio}
                            </span>
                        </div>
                    )}
                </div>

                <div className="tarjeta-footer">
                    <button onClick={handleReservar} className="btn-reservar">
                        Reservar Turno
                    </button>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCancelar}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="header-title-container">
                                {reservaExitosa && <FaCheck className="success-icon-modal" />}
                                <h4>{reservaExitosa ? "¡Reserva Confirmada!" : "Reservar Turno"}</h4>
                            </div>
                            <button className="modal-close" onClick={handleCancelar}>
                                <FaTimes />
                            </button>
                        </div>

                        {reservaExitosa ? (
                            <div className="modal-body confirmation-view">
                                <div className="confirmation-success-msg">
                                    <p>Su turno ha sido reservado exitosamente.</p>
                                </div>

                                <div className="confirmation-details-box">
                                    <div className="conf-row">
                                        <FaCalendarAlt />
                                        <div className="conf-data">
                                            <span className="conf-label">Fecha y hora</span>
                                            <span className="conf-value">{formatearFechaHora(reservaExitosa.fecha)}</span>
                                        </div>
                                    </div>
                                    <div className="conf-row">
                                        <FaUserMd />
                                        <div className="conf-data">
                                            <span className="conf-label">Médico</span>
                                            <span className="conf-value">{reservaExitosa.doctor?.nombre}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="confirmation-note-box">
                                    <p>📋 Puede imprimir este comprobante ahora o verlo más tarde en la sección "Mis Turnos".</p>
                                </div>

                                <div className="confirmation-actions-modal">
                                    <button
                                        className="btn-print-receipt"
                                        onClick={() => imprimirComprobante(reservaExitosa)}
                                    >
                                        <FaPrint /> Imprimir Comprobante
                                    </button>
                                    <button className="btn-close-conf" onClick={handleCancelar}>
                                        Entendido
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="modal-body">
                                    <p className="modal-info">
                                        <strong>Fecha:</strong> {formatearFechaHora(turno.fecha)}
                                    </p>
                                    <p className="modal-info">
                                        <strong>Médico:</strong> {turno.doctor?.nombre}
                                    </p>

                                    {estudioAsignado && (
                                        <p className="modal-info">
                                            <strong>Estudio:</strong> {estudioAsignado}
                                        </p>
                                    )}

                                    {!estudioAsignado && (
                                        <div className="form-group">
                                            <label htmlFor="estudioId">
                                                Estudio a realizar <span className="required">*</span>
                                            </label>
                                            <select
                                                id="estudioId"
                                                value={estudioId}
                                                onChange={(e) => setEstudioId(e.target.value)}
                                                disabled={loading || loadingEstudios}
                                                className="select-estudio"
                                            >
                                                <option value="">
                                                    {loadingEstudios ? "Cargando estudios..." : "-- Seleccione un estudio --"}
                                                </option>
                                                {estudios.map((estudio) => (
                                                    <option key={estudio._id} value={estudio._id}>
                                                        {estudio.tipo} {estudio.precio ? `- $${estudio.precio}` : ""}
                                                    </option>
                                                ))}
                                            </select>
                                            {estudios.length === 0 && !loadingEstudios && (
                                                <small className="help-text error-text">
                                                    No hay estudios disponibles
                                                </small>
                                            )}
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label htmlFor="motivoConsulta">
                                            Motivo de consulta <span className="required">*</span>
                                        </label>
                                        <textarea
                                            id="motivoConsulta"
                                            value={motivoConsulta}
                                            onChange={(e) => setMotivoConsulta(e.target.value)}
                                            placeholder="Describa brevemente el motivo de su consulta..."
                                            rows="4"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        onClick={handleCancelar}
                                        className="btn-cancelar-modal"
                                        disabled={loading}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleConfirmar}
                                        className="btn-confirmar-modal"
                                        disabled={loading}
                                    >
                                        {loading ? "Reservando..." : "Confirmar Reserva"}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
