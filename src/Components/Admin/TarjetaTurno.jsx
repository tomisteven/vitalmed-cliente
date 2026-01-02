import React, { useState, useEffect } from "react";
import { TurnosApi } from "../../api/Turnos";
import { EstudiosApi } from "../../api/Estudios";
import { formatearFechaHora } from "../../utils/dateHelpers";
import toast from "react-hot-toast";
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
        setShowModal(true);
        cargarEstudios();
    };

    const handleCancelar = () => {
        setShowModal(false);
        setMotivoConsulta("");
        setEstudioId("");
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
                setShowModal(false);
                setMotivoConsulta("");
                setEstudioId("");

                if (onReservado) {
                    onReservado();
                }
            }
        } catch (error) {
            console.error("Error al reservar turno:", error);
            toast.error(error.message || "Error al reservar el turno");
        } finally {
            setLoading(false);
        }
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
                                ${turno.estudio.precio}
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
                            <h4>Reservar Turno</h4>
                            <button className="modal-close" onClick={handleCancelar}>
                                ×
                            </button>
                        </div>

                        <div className="modal-body">
                            <p className="modal-info">
                                <strong>Fecha:</strong> {formatearFechaHora(turno.fecha)}
                            </p>
                            <p className="modal-info">
                                <strong>Médico:</strong> {turno.doctor?.nombre}
                            </p>

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
                    </div>
                </div>
            )}
        </>
    );
}
