import React from "react";
import { FaTimes, FaCalendarAlt, FaClock, FaUserMd, FaUser, FaStethoscope, FaIdCard, FaPhone, FaCheckCircle, FaTimesCircle, FaHourglassHalf } from "react-icons/fa";
import "./TurnoDetalleModal.css";

const ESTADO_CONFIG = {
    disponible: { label: "Disponible", icon: <FaHourglassHalf />, clase: "estado-disponible" },
    reservado: { label: "Reservado", icon: <FaCheckCircle />, clase: "estado-reservado" },
    cancelado: { label: "Cancelado", icon: <FaTimesCircle />, clase: "estado-cancelado" },
    finalizado: { label: "Finalizado", icon: <FaCheckCircle />, clase: "estado-finalizado" },
};

export default function TurnoDetalleModal({ turno, onClose }) {
    if (!turno) return null;

    const estado = ESTADO_CONFIG[turno.estado] || { label: turno.estado, icon: null, clase: "" };

    const pacienteNombre =
        turno.paciente?.nombre ||
        turno.pacienteNoRegistrado?.nombre ||
        "Sin paciente";

    const pacienteDni =
        turno.paciente?.dni ||
        turno.pacienteNoRegistrado?.dni ||
        null;

    const pacienteTelefono =
        turno.paciente?.telefono ||
        turno.pacienteNoRegistrado?.telefono ||
        null;

    const esPacienteRegistrado = !!turno.paciente;

    const fechaObj = turno.fecha ? new Date(turno.fecha) : null;
    const fechaStr = fechaObj
        ? fechaObj.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
        : "Sin fecha";
    const horaStr = fechaObj
        ? fechaObj.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })
        : "Sin hora";

    return (
        <div className="tdm-overlay" onClick={onClose}>
            <div className="tdm-modal" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="tdm-header">
                    <div className="tdm-header-left">
                        <FaCalendarAlt className="tdm-header-icon" />
                        <div>
                            <h2 className="tdm-title">Detalle del Turno</h2>
                            <p className="tdm-subtitle">Información completa</p>
                        </div>
                    </div>
                    <button className="tdm-close" onClick={onClose}>
                        <FaTimes />
                    </button>
                </div>

                {/* Estado badge */}
                <div className="tdm-estado-bar">
                    <span className={`tdm-estado-badge ${estado.clase}`}>
                        {estado.icon} {estado.label}
                    </span>
                </div>

                {/* Cuerpo */}
                <div className="tdm-body">

                    {/* Fecha y Hora */}
                    <div className="tdm-section">
                        <h3 className="tdm-section-title">📅 Fecha y Hora</h3>
                        <div className="tdm-row">
                            <div className="tdm-field">
                                <FaCalendarAlt className="tdm-field-icon" />
                                <div>
                                    <span className="tdm-field-label">Fecha</span>
                                    <span className="tdm-field-value" style={{ textTransform: "capitalize" }}>{fechaStr}</span>
                                </div>
                            </div>
                            <div className="tdm-field">
                                <FaClock className="tdm-field-icon" />
                                <div>
                                    <span className="tdm-field-label">Hora</span>
                                    <span className="tdm-field-value">{horaStr}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="tdm-divider" />

                    {/* Paciente */}
                    <div className="tdm-section">
                        <h3 className="tdm-section-title">👤 Paciente</h3>
                        <div className="tdm-tag-row">
                            <span className={`tdm-tag ${esPacienteRegistrado ? "tag-registrado" : "tag-invitado"}`}>
                                {esPacienteRegistrado ? "✅ Registrado" : "👤 No registrado"}
                            </span>
                        </div>
                        <div className="tdm-row">
                            <div className="tdm-field">
                                <FaUser className="tdm-field-icon" />
                                <div>
                                    <span className="tdm-field-label">Nombre</span>
                                    <span className="tdm-field-value">{pacienteNombre}</span>
                                </div>
                            </div>
                            {pacienteDni && (
                                <div className="tdm-field">
                                    <FaIdCard className="tdm-field-icon" />
                                    <div>
                                        <span className="tdm-field-label">DNI</span>
                                        <span className="tdm-field-value">{pacienteDni}</span>
                                    </div>
                                </div>
                            )}
                            {pacienteTelefono && (
                                <div className="tdm-field">
                                    <FaPhone className="tdm-field-icon" />
                                    <div>
                                        <span className="tdm-field-label">Teléfono</span>
                                        <span className="tdm-field-value">{pacienteTelefono}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="tdm-divider" />

                    {/* Doctor */}
                    <div className="tdm-section">
                        <h3 className="tdm-section-title">👨‍⚕️ Doctor</h3>
                        <div className="tdm-row">
                            <div className="tdm-field">
                                <FaUserMd className="tdm-field-icon" />
                                <div>
                                    <span className="tdm-field-label">Nombre</span>
                                    <span className="tdm-field-value">{turno.doctor?.nombre || "Sin doctor"}</span>
                                </div>
                            </div>
                            {turno.doctor?.especialidad && (
                                <div className="tdm-field">
                                    <FaStethoscope className="tdm-field-icon" />
                                    <div>
                                        <span className="tdm-field-label">Especialidad</span>
                                        <span className="tdm-field-value">{turno.doctor.especialidad}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="tdm-divider" />

                    {/* Estudio */}
                    <div className="tdm-section">
                        <h3 className="tdm-section-title">🔬 Estudio</h3>
                        <div className="tdm-row">
                            <div className="tdm-field">
                                <FaStethoscope className="tdm-field-icon" />
                                <div>
                                    <span className="tdm-field-label">Tipo</span>
                                    <span className="tdm-field-value">{turno.estudio?.tipo || "Sin estudio"}</span>
                                </div>
                            </div>
                            {turno.estudio?.precio != null && (
                                <div className="tdm-field">
                                    <span className="tdm-field-icon">💲</span>
                                    <div>
                                        <span className="tdm-field-label">Precio</span>
                                        <span className="tdm-field-value">${turno.estudio.precio}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Observaciones si existen */}
                    {turno.observaciones && (
                        <>
                            <div className="tdm-divider" />
                            <div className="tdm-section">
                                <h3 className="tdm-section-title">📝 Observaciones</h3>
                                <p className="tdm-observaciones">{turno.observaciones}</p>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="tdm-footer">
                    <button className="tdm-btn-cerrar" onClick={onClose}>Cerrar</button>
                </div>

            </div>
        </div>
    );
}
