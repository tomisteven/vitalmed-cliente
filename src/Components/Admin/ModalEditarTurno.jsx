import React, { useState, useEffect, useMemo } from "react";
import { TurnosApi } from "../../api/Turnos";
import { PacienteApi } from "../../api/Paciente";
import { EstudiosApi } from "../../api/Estudios";
import toast from "react-hot-toast";
import { FaTimes, FaEdit, FaSave, FaUserMd, FaCalendarAlt, FaUser, FaFlask } from "react-icons/fa";
import "./ModalEditarTurno.css";

const turnosApi = new TurnosApi();
const pacienteApi = new PacienteApi();
const estudiosApi = new EstudiosApi();

/**
 * Modal para editar un turno ya agendado (reservado o disponible).
 * Props:
 *   - turno: objeto del turno a editar
 *   - doctores: array de doctores disponibles
 *   - onClose: función para cerrar el modal
 *   - onEditado: función que se llama cuando el turno fue editado exitosamente
 */
export default function ModalEditarTurno({ turno, doctores = [], onClose, onEditado }) {
    const [loading, setLoading] = useState(false);
    const [loadingEstudios, setLoadingEstudios] = useState(true);
    const [loadingPacientes, setLoadingPacientes] = useState(true);
    const [estudios, setEstudios] = useState([]);
    const [pacientes, setPacientes] = useState([]);
    const [busquedaPaciente, setBusquedaPaciente] = useState("");
    const [busquedaEstudio, setBusquedaEstudio] = useState("");

    // Detectar si el turno tiene paciente registrado o invitado
    const tipoInicial = turno.paciente ? "registrado" : turno.pacienteNoRegistrado ? "invitado" : "registrado";
    const [tipoPaciente, setTipoPaciente] = useState(tipoInicial);

    // Formatear fecha para input datetime-local (YYYY-MM-DDTHH:mm)
    const formatFechaInput = (fecha) => {
        if (!fecha) return "";
        const d = new Date(fecha);
        const pad = (n) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const [formData, setFormData] = useState({
        fecha: formatFechaInput(turno.fecha),
        doctorId: turno.doctor?._id || turno.doctor || "",
        estudioId: turno.estudio?._id || turno.estudio || "",
        estado: turno.estado || "disponible",
        motivoConsulta: turno.motivoConsulta || "",
        comentarios: turno.comentarios || "",
        // Paciente registrado
        pacienteId: turno.paciente?._id || turno.paciente || "",
        // Paciente no registrado (invitado)
        invNombre: turno.pacienteNoRegistrado?.nombre || "",
        invDni: turno.pacienteNoRegistrado?.dni || "",
        invTelefono: turno.pacienteNoRegistrado?.telefono || "",
    });

    useEffect(() => {
        cargarEstudios();
        if (tipoPaciente === "registrado") {
            cargarPacientes();
        }
    }, []);

    // Cargar pacientes cuando se cambia al modo registrado
    useEffect(() => {
        if (tipoPaciente === "registrado" && pacientes.length === 0) {
            cargarPacientes();
        }
    }, [tipoPaciente]);

    const cargarEstudios = async () => {
        setLoadingEstudios(true);
        try {
            const response = await estudiosApi.getEstudios(true);
            const lista = Array.isArray(response) ? response : (response?.estudios || []);
            setEstudios(lista.filter(e => e.activo !== false));
        } catch (error) {
            console.error("Error al cargar estudios:", error);
            toast.error("Error al cargar los estudios");
        } finally {
            setLoadingEstudios(false);
        }
    };

    const cargarPacientes = async () => {
        setLoadingPacientes(true);
        try {
            let response = await pacienteApi.getPacientesShort();
            if (!response || (Array.isArray(response) && response.length === 0)) {
                response = await pacienteApi.getPacientes();
            }
            let lista = [];
            if (Array.isArray(response)) lista = response;
            else if (response?.pacientes) lista = response.pacientes;
            setPacientes(lista.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || "")));
        } catch (error) {
            console.error("Error al cargar pacientes:", error);
            toast.error("Error al cargar la lista de pacientes");
        } finally {
            setLoadingPacientes(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const pacientesFiltrados = useMemo(() => {
        if (!busquedaPaciente.trim()) return pacientes;
        const q = busquedaPaciente.toLowerCase();
        return pacientes.filter(p =>
            (p.nombre || "").toLowerCase().includes(q) ||
            (p.dni || "").toString().includes(q) ||
            (p.email || "").toLowerCase().includes(q)
        );
    }, [pacientes, busquedaPaciente]);

    const estudiosFiltrados = useMemo(() => {
        if (!busquedaEstudio.trim()) return estudios;
        const q = busquedaEstudio.toLowerCase();
        return estudios.filter(e => (e.tipo || "").toLowerCase().includes(q));
    }, [estudios, busquedaEstudio]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones según tipo de paciente
        if (tipoPaciente === "registrado" && !formData.pacienteId) {
            toast.error("Debe seleccionar un paciente registrado");
            return;
        }
        if (tipoPaciente === "invitado") {
            if (!formData.invNombre.trim() || !formData.invDni.trim() || !formData.invTelefono.trim()) {
                toast.error("Debe completar nombre, DNI y teléfono del paciente invitado");
                return;
            }
        }

        setLoading(true);
        try {
            // Construir el payload según tipo de paciente
            const payload = {
                fecha: formData.fecha ? new Date(formData.fecha).toISOString() : undefined,
                doctor: formData.doctorId || undefined,
                estudio: formData.estudioId || undefined,
                estado: formData.estado,
                motivoConsulta: formData.motivoConsulta || undefined,
                comentarios: formData.comentarios || undefined,
            };

            if (tipoPaciente === "registrado") {
                payload.paciente = formData.pacienteId || null;
                payload.pacienteNoRegistrado = null;
            } else if (tipoPaciente === "invitado") {
                payload.pacienteNoRegistrado = {
                    nombre: formData.invNombre.trim(),
                    dni: formData.invDni.trim(),
                    telefono: formData.invTelefono.trim(),
                };
                payload.paciente = null;
            } else {
                // Sin paciente (turno disponible)
                payload.paciente = null;
                payload.pacienteNoRegistrado = null;
            }

            const response = await turnosApi.actualizarTurno(turno._id, payload);

            if (response) {
                toast.success("✓ Turno actualizado exitosamente");
                onEditado && onEditado();
                onClose();
            }
        } catch (error) {
            console.error("Error al actualizar turno:", error);
            toast.error(error.message || "Error al actualizar el turno");
        } finally {
            setLoading(false);
        }
    };

    const pacienteActual = pacientes.find(p => p._id === formData.pacienteId);
    const estudioActual = estudios.find(e => e._id === formData.estudioId);

    return (
        <div className="met-overlay" onClick={onClose}>
            <div className="met-modal" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="met-header">
                    <div className="met-header-title">
                        <FaEdit className="met-header-icon" />
                        <div>
                            <h3>Editar Turno</h3>
                            <p className="met-header-sub">
                                {new Date(turno.fecha).toLocaleString("es-AR", {
                                    weekday: "long", day: "numeric", month: "long",
                                    year: "numeric", hour: "2-digit", minute: "2-digit"
                                })}
                            </p>
                        </div>
                    </div>
                    <button className="met-close" onClick={onClose} title="Cerrar">
                        <FaTimes />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="met-form">
                    <div className="met-body">

                        {/* Sección: Datos del turno */}
                        <div className="met-section">
                            <h4 className="met-section-title">
                                <FaCalendarAlt /> Datos del Turno
                            </h4>
                            <div className="met-grid-2">
                                <div className="met-field">
                                    <label htmlFor="met-fecha">Fecha y Hora</label>
                                    <input
                                        id="met-fecha"
                                        type="datetime-local"
                                        name="fecha"
                                        value={formData.fecha}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </div>
                                <div className="met-field">
                                    <label htmlFor="met-estado">Estado</label>
                                    <select
                                        id="met-estado"
                                        name="estado"
                                        value={formData.estado}
                                        onChange={handleChange}
                                        disabled={loading}
                                    >
                                        <option value="disponible">Disponible</option>
                                        <option value="reservado">Reservado</option>
                                        <option value="finalizado">Finalizado</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Sección: Doctor y Estudio */}
                        <div className="met-section">
                            <h4 className="met-section-title">
                                <FaUserMd /> Doctor y Estudio
                            </h4>
                            <div className="met-grid-2">
                                <div className="met-field">
                                    <label htmlFor="met-doctor">Doctor</label>
                                    <select
                                        id="met-doctor"
                                        name="doctorId"
                                        value={formData.doctorId}
                                        onChange={handleChange}
                                        disabled={loading}
                                    >
                                        <option value="">-- Sin doctor --</option>
                                        {doctores.map(d => (
                                            <option key={d._id} value={d._id}>
                                                {d.nombre} {d.especialidad ? `(${d.especialidad})` : ""}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="met-field">
                                    <label>Buscar Estudio</label>
                                    <input
                                        type="text"
                                        placeholder="Filtrar estudios..."
                                        value={busquedaEstudio}
                                        onChange={e => setBusquedaEstudio(e.target.value)}
                                        disabled={loading || loadingEstudios}
                                        className="met-search"
                                    />
                                </div>
                            </div>
                            <div className="met-field">
                                <label htmlFor="met-estudio">Estudio</label>
                                <select
                                    id="met-estudio"
                                    name="estudioId"
                                    value={formData.estudioId}
                                    onChange={handleChange}
                                    disabled={loading || loadingEstudios}
                                    size={estudiosFiltrados.length > 4 ? "5" : "1"}
                                    className="met-select-tall"
                                >
                                    <option value="">{loadingEstudios ? "Cargando..." : "-- Sin estudio --"}</option>
                                    {estudiosFiltrados.map(est => (
                                        <option key={est._id} value={est._id}>
                                            {est.tipo}{est.precio ? ` — $${est.precio}` : ""}
                                        </option>
                                    ))}
                                </select>
                                {estudioActual?.aclaraciones && (
                                    <div className="met-alert-info">
                                        <strong>⚠ Aclaraciones:</strong> {estudioActual.aclaraciones}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sección: Paciente */}
                        <div className="met-section">
                            <h4 className="met-section-title">
                                <FaUser /> Paciente
                            </h4>

                            {/* Selector tipo de paciente */}
                            <div className="met-tabs">
                                <button
                                    type="button"
                                    className={`met-tab ${tipoPaciente === "registrado" ? "active" : ""}`}
                                    onClick={() => setTipoPaciente("registrado")}
                                >
                                    Paciente Registrado
                                </button>
                                <button
                                    type="button"
                                    className={`met-tab ${tipoPaciente === "invitado" ? "active" : ""}`}
                                    onClick={() => setTipoPaciente("invitado")}
                                >
                                    Paciente Invitado
                                </button>
                                <button
                                    type="button"
                                    className={`met-tab ${tipoPaciente === "ninguno" ? "active" : ""}`}
                                    onClick={() => setTipoPaciente("ninguno")}
                                >
                                    Sin Paciente
                                </button>
                            </div>

                            {/* Formulario paciente registrado */}
                            {tipoPaciente === "registrado" && (
                                <div className="met-patient-section">
                                    <div className="met-field">
                                        <label>Buscar paciente</label>
                                        <input
                                            type="text"
                                            placeholder="Nombre, DNI o email..."
                                            value={busquedaPaciente}
                                            onChange={e => setBusquedaPaciente(e.target.value)}
                                            disabled={loading || loadingPacientes}
                                            className="met-search"
                                        />
                                        <small className="met-hint">
                                            {loadingPacientes ? "Cargando pacientes..." : `${pacientesFiltrados.length} de ${pacientes.length} pacientes`}
                                        </small>
                                    </div>
                                    <div className="met-field">
                                        <label htmlFor="met-paciente">
                                            Seleccionar Paciente <span className="met-required">*</span>
                                        </label>
                                        <select
                                            id="met-paciente"
                                            name="pacienteId"
                                            value={formData.pacienteId}
                                            onChange={handleChange}
                                            disabled={loading || loadingPacientes}
                                            size="6"
                                            className="met-select-tall"
                                        >
                                            <option value="">-- Seleccione un paciente --</option>
                                            {pacientesFiltrados.map(p => (
                                                <option key={p._id} value={p._id}>
                                                    {p.nombre}{p.dni ? ` — DNI: ${p.dni}` : ""}
                                                </option>
                                            ))}
                                        </select>
                                        {pacienteActual && (
                                            <div className="met-patient-preview">
                                                <span>📧 {pacienteActual.email || "Sin email"}</span>
                                                <span>📞 {pacienteActual.telefono || "Sin teléfono"}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Formulario paciente invitado */}
                            {tipoPaciente === "invitado" && (
                                <div className="met-patient-section">
                                    <div className="met-field">
                                        <label htmlFor="met-inv-nombre">
                                            Nombre Completo <span className="met-required">*</span>
                                        </label>
                                        <input
                                            id="met-inv-nombre"
                                            type="text"
                                            name="invNombre"
                                            value={formData.invNombre}
                                            onChange={handleChange}
                                            placeholder="Nombre y apellido del paciente"
                                            disabled={loading}
                                        />
                                    </div>
                                    <div className="met-grid-2">
                                        <div className="met-field">
                                            <label htmlFor="met-inv-dni">
                                                DNI <span className="met-required">*</span>
                                            </label>
                                            <input
                                                id="met-inv-dni"
                                                type="text"
                                                name="invDni"
                                                value={formData.invDni}
                                                onChange={handleChange}
                                                placeholder="Número de documento"
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="met-field">
                                            <label htmlFor="met-inv-tel">
                                                Teléfono <span className="met-required">*</span>
                                            </label>
                                            <input
                                                id="met-inv-tel"
                                                type="text"
                                                name="invTelefono"
                                                value={formData.invTelefono}
                                                onChange={handleChange}
                                                placeholder="Número de contacto"
                                                disabled={loading}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {tipoPaciente === "ninguno" && (
                                <div className="met-empty-patient">
                                    <p>El turno quedará marcado como <strong>disponible</strong> sin paciente asignado.</p>
                                </div>
                            )}
                        </div>

                        {/* Sección: Motivo y Comentarios */}
                        <div className="met-section">
                            <h4 className="met-section-title">
                                <FaFlask /> Observaciones
                            </h4>
                            <div className="met-field">
                                <label htmlFor="met-motivo">Motivo de Consulta</label>
                                <textarea
                                    id="met-motivo"
                                    name="motivoConsulta"
                                    value={formData.motivoConsulta}
                                    onChange={handleChange}
                                    placeholder="Describa el motivo de la consulta..."
                                    rows="3"
                                    disabled={loading}
                                />
                            </div>
                            <div className="met-field">
                                <label htmlFor="met-comentarios">Comentarios Internos</label>
                                <textarea
                                    id="met-comentarios"
                                    name="comentarios"
                                    value={formData.comentarios}
                                    onChange={handleChange}
                                    placeholder="Notas internas del turno (no visibles para el paciente)..."
                                    rows="2"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="met-footer">
                        <button
                            type="button"
                            className="met-btn-cancel"
                            onClick={onClose}
                            disabled={loading}
                        >
                            <FaTimes /> Cancelar
                        </button>
                        <button
                            type="submit"
                            className="met-btn-save"
                            disabled={loading}
                        >
                            {loading ? (
                                <><span className="met-spinner" /> Guardando...</>
                            ) : (
                                <><FaSave /> Guardar Cambios</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
