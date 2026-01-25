import React, { useState, useEffect, useMemo } from "react";
import { PacienteApi } from "../../api/Paciente";
import { TurnosApi } from "../../api/Turnos";
import { EstudiosApi } from "../../api/Estudios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import "./ModalAsignarTurno.css";

const pacienteApi = new PacienteApi();
const turnosApi = new TurnosApi();
const estudiosApi = new EstudiosApi();

export default function ModalAsignarTurno({ turno, onClose, onAsignado }) {
    const [pacientes, setPacientes] = useState([]);
    const [estudios, setEstudios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingPacientes, setLoadingPacientes] = useState(true);
    const [loadingEstudios, setLoadingEstudios] = useState(true);
    const [busqueda, setBusqueda] = useState("");
    const [formData, setFormData] = useState({
        pacienteId: "",
        estudioId: "",
        motivoConsulta: "",
    });

    useEffect(() => {
        cargarPacientes();
        cargarEstudios();
    }, []);

    const cargarPacientes = async () => {
        setLoadingPacientes(true);
        try {
            let response = await pacienteApi.getPacientesShort();

            if (!response || (Array.isArray(response) && response.length === 0) ||
                (response.pacientes && response.pacientes.length === 0)) {
                response = await pacienteApi.getPacientes();
            }

            let listaPacientes = [];
            if (Array.isArray(response)) {
                listaPacientes = response;
            } else if (response && response.pacientes && Array.isArray(response.pacientes)) {
                listaPacientes = response.pacientes;
            }

            if (listaPacientes.length > 0) {
                const pacientesOrdenados = listaPacientes.sort((a, b) => {
                    const nombreA = a.nombre?.toLowerCase() || "";
                    const nombreB = b.nombre?.toLowerCase() || "";
                    return nombreA.localeCompare(nombreB);
                });
                setPacientes(pacientesOrdenados);
            } else {
                toast.error("No hay pacientes registrados en el sistema");
                setPacientes([]);
            }
        } catch (error) {
            console.error("Error al cargar pacientes:", error);
            toast.error("Error al cargar la lista de pacientes");
            setPacientes([]);
        } finally {
            setLoadingPacientes(false);
        }
    };

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
            setEstudios([]);
        } finally {
            setLoadingEstudios(false);
        }
    };

    const pacientesFiltrados = useMemo(() => {
        if (!busqueda.trim()) {
            return pacientes;
        }
        const busquedaLower = busqueda.toLowerCase();
        return pacientes.filter((paciente) => {
            const nombre = paciente.nombre?.toLowerCase() || "";
            const dni = paciente.dni?.toString() || "";
            const email = paciente.email?.toLowerCase() || "";
            return (
                nombre.includes(busquedaLower) ||
                dni.includes(busquedaLower) ||
                email.includes(busquedaLower)
            );
        });
    }, [pacientes, busqueda]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.pacienteId) {
            toast.error("Debe seleccionar un paciente");
            return;
        }

        if (!formData.estudioId) {
            toast.error("Debe seleccionar un estudio");
            return;
        }

        // Verificar si el estudio tiene aclaraciones
        if (estudioSeleccionado && estudioSeleccionado.aclaraciones) {
            const result = await Swal.fire({
                title: "⚠️ Aclaraciones del Estudio",
                html: `
                    <div style="text-align: left; padding: 10px;">
                        <p style="margin-bottom: 10px;"><strong>Estudio:</strong> ${estudioSeleccionado.tipo}</p>
                        <div style="background: #fff8e1; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
                            <p style="margin: 0; color: #5d4037;"><strong>Aclaraciones importantes:</strong></p>
                            <p style="margin: 10px 0 0 0; color: #666;">${estudioSeleccionado.aclaraciones}</p>
                        </div>
                        <p style="margin-top: 15px; color: #888; font-size: 0.9rem;">¿Desea continuar con la asignación del turno?</p>
                    </div>
                `,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#28a745",
                cancelButtonColor: "#6c757d",
                confirmButtonText: "Sí, asignar turno",
                cancelButtonText: "Cancelar",
            });

            if (!result.isConfirmed) {
                return;
            }
        }

        setLoading(true);

        try {
            const response = await turnosApi.reservarTurno(
                turno._id,
                formData.pacienteId,
                formData.motivoConsulta,
                formData.estudioId
            );

            if (response) {
                toast.success("✓ Turno asignado exitosamente al paciente");
                onAsignado();
                onClose();
            }
        } catch (error) {
            console.error("Error al asignar turno:", error);
            toast.error(error.message || "Error al asignar el turno");
        } finally {
            setLoading(false);
        }
    };

    const pacienteSeleccionado = pacientes.find((p) => p._id === formData.pacienteId);
    const estudioSeleccionado = estudios.find((e) => e._id === formData.estudioId);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content-asignar" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h4>Asignar Turno a Paciente</h4>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="turno-info-box">
                        <h5>Información del Turno</h5>
                        <p>
                            <strong>Fecha y Hora:</strong>{" "}
                            {new Date(turno.fecha).toLocaleString("es-AR", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </p>
                        <p><strong>Doctor:</strong> {turno.doctor?.nombre || "No especificado"}</p>
                        <p><strong>Especialidad:</strong> {turno.especialidad || "No especificada"}</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="busqueda">Buscar Paciente</label>
                            <input
                                type="text"
                                id="busqueda"
                                placeholder="Buscar por nombre, DNI o email..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                disabled={loading || loadingPacientes}
                                className="input-busqueda"
                            />
                            <small className="help-text">
                                {loadingPacientes
                                    ? "Cargando pacientes..."
                                    : `${pacientesFiltrados.length} de ${pacientes.length} pacientes`}
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="pacienteId">
                                Seleccionar Paciente <span className="required">*</span>
                            </label>
                            <select
                                id="pacienteId"
                                name="pacienteId"
                                value={formData.pacienteId}
                                onChange={handleChange}
                                required
                                disabled={loading || loadingPacientes}
                                size="6"
                                className="select-pacientes"
                            >
                                <option value="">-- Seleccione un paciente --</option>
                                {pacientesFiltrados.map((paciente) => (
                                    <option key={paciente._id} value={paciente._id}>
                                        {paciente.nombre} {paciente.dni ? `- DNI: ${paciente.dni}` : ""}
                                    </option>
                                ))}
                            </select>
                            {pacientesFiltrados.length === 0 && !loadingPacientes && (
                                <small className="help-text error-text">
                                    No se encontraron pacientes con ese criterio de búsqueda
                                </small>
                            )}
                        </div>

                        {pacienteSeleccionado && (
                            <div className="paciente-info-box">
                                <p><strong>Email:</strong> {pacienteSeleccionado.email || "No especificado"}</p>
                                <p><strong>Teléfono:</strong> {pacienteSeleccionado.telefono || "No especificado"}</p>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="estudioId">
                                Estudio a Realizar <span className="required">*</span>
                            </label>
                            <select
                                id="estudioId"
                                name="estudioId"
                                value={formData.estudioId}
                                onChange={handleChange}
                                required
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
                                <small className="help-text error-text">No hay estudios disponibles</small>
                            )}
                        </div>

                        {estudioSeleccionado && estudioSeleccionado.aclaraciones && (
                            <div className="estudio-info-box">
                                <p><strong>Aclaraciones:</strong> {estudioSeleccionado.aclaraciones}</p>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="motivoConsulta">
                                Motivo de Consulta <span className="required">*</span>
                            </label>
                            <textarea
                                id="motivoConsulta"
                                name="motivoConsulta"
                                value={formData.motivoConsulta}
                                onChange={handleChange}
                                placeholder="Describa el motivo de la consulta..."
                                rows="4"
                                disabled={loading}
                            />
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn-cancelar-modal"
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn-asignar-modal"
                                disabled={loading || loadingPacientes || loadingEstudios}
                            >
                                {loading ? "Asignando..." : "Asignar Turno"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
