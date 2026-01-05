import React, { useState, useEffect } from "react";
import { TurnosApi } from "../../api/Turnos";
import { PacienteApi } from "../../api/Paciente";
import { formatearFechaHora } from "../../utils/dateHelpers";
import { getEstadoColor, getEstadoLabel } from "../../utils/turnoHelpers";
import ModalAsignarTurno from "./ModalAsignarTurno";
import toast from "react-hot-toast";
import "./ListaTurnosAdmin.css";
import { EstudiosApi } from "../../api/Estudios";
import { FaEye, FaDownload, FaFilePdf, FaFileImage, FaTimes, FaUser, FaPhone, FaIdCard, FaClipboardList, FaPaperclip } from "react-icons/fa";

const turnosApi = new TurnosApi();
const pacienteApi = new PacienteApi();
const estudiosApi = new EstudiosApi();

export default function ListaTurnosAdmin() {
    const [turnos, setTurnos] = useState([]);
    const [doctores, setDoctores] = useState([]);
    const [estudios, setEstudios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalAsignar, setModalAsignar] = useState({
        show: false,
        turno: null,
    });
    const [modalDetalles, setModalDetalles] = useState({
        show: false,
        turno: null,
    });
    const [filtros, setFiltros] = useState({
        estado: "",
        doctorId: "",
        especialidad: "",
        estudio: "",
        fecha: "",
    });

    useEffect(() => {
        cargarDoctores();
        cargarTurnos();
        cargarEstudios();

        console.log(turnos);

    }, []);

    const cargarDoctores = async () => {
        try {
            const response = await pacienteApi.getDoctoresList();
            if (response && response.doctores) {
                setDoctores(response.doctores);
            }
        } catch (error) {
            console.error("Error al cargar doctores:", error);
        }
    };

    const cargarEstudios = async () => {
        try {
            const response = await estudiosApi.getEstudios();
            if (response) {
                setEstudios(response);
            }
        } catch (error) {
            console.error("Error al cargar estudios:", error);
        }
    };

    const cargarTurnos = async (filtrosAplicados = {}) => {
        setLoading(true);
        try {
            const response = await turnosApi.buscarTurnos(filtrosAplicados);
            if (response) {
                setTurnos(Array.isArray(response) ? response : []);
            }
        } catch (error) {
            console.error("Error al cargar turnos:", error);
            toast.error("Error al cargar los turnos");
        } finally {
            setLoading(false);
        }
    };

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros({
            ...filtros,
            [name]: value,
        });
    };

    const aplicarFiltros = () => {
        const filtrosLimpios = {};

        Object.keys(filtros).forEach((key) => {
            if (filtros[key]) {
                filtrosLimpios[key] = filtros[key];
            }
        });

        cargarTurnos(filtrosLimpios);
    };

    const limpiarFiltros = () => {
        setFiltros({
            estado: "",
            doctorId: "",
            especialidad: "",
            estudio: "",
            fecha: "",
        });
        cargarTurnos();
    };

    const handleCancelar = async (turnoId) => {
        const confirmar = window.confirm(
            "¿Está seguro que desea cancelar este turno? El turno volverá a estar disponible."
        );

        if (!confirmar) return;

        try {
            const response = await turnosApi.cancelarTurno(
                turnoId,
                "Cancelado por secretaría"
            );

            if (response) {
                toast.success("Turno cancelado exitosamente");
                cargarTurnos(filtros);
            }
        } catch (error) {
            console.error("Error al cancelar turno:", error);
            toast.error(error.message || "Error al cancelar el turno");
        }
    };

    const handleAsignarTurno = (turno) => {
        setModalAsignar({
            show: true,
            turno: turno,
        });
    };

    const handleCloseModal = () => {
        setModalAsignar({
            show: false,
            turno: null,
        });
    };

    const handleTurnoAsignado = () => {
        cargarTurnos(filtros);
    };

    const handleVerDetalles = (turno) => {
        setModalDetalles({
            show: true,
            turno: turno,
        });
    };

    const handleCloseDetalles = () => {
        setModalDetalles({
            show: false,
            turno: null,
        });
    };

    const handleEliminar = async (turnoId) => {
        const confirmar = window.confirm(
            "⚠️ ¿Está seguro que desea ELIMINAR este turno permanentemente?\n\nEsta acción no se puede deshacer."
        );

        if (!confirmar) return;

        try {
            const response = await turnosApi.eliminarTurno(turnoId);

            if (response) {
                toast.success("Turno eliminado exitosamente");
                cargarTurnos(filtros);
            }
        } catch (error) {
            console.error("Error al eliminar turno:", error);
            toast.error(error.message || "Error al eliminar el turno");
        }
    };

    // Obtener especialidades únicas de los doctores
    const especialidades = [
        ...new Set(doctores.map((d) => d.especialidad).filter(Boolean)),
    ];



    return (
        <div className="lista-turnos-admin">
            <h3>Gestión de Turnos</h3>

            {/* Filtros */}
            <div className="filtros-container">
                <div className="filtros-row">
                    <div className="filtro-group">
                        <label>Estado</label>
                        <select
                            name="estado"
                            value={filtros.estado}
                            onChange={handleFiltroChange}
                        >
                            <option value="">Todos</option>
                            <option value="disponible">Disponible</option>
                            <option value="reservado">Reservado</option>
                            <option value="finalizado">Finalizado</option>
                        </select>
                    </div>

                    <div className="filtro-group">
                        <label>Doctor</label>
                        <select
                            name="doctorId"
                            value={filtros.doctorId}
                            onChange={handleFiltroChange}
                        >
                            <option value="">Todos</option>
                            {doctores.map((doctor) => (
                                <option key={doctor._id} value={doctor._id}>
                                    {doctor.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="filtro-group">
                        <label>Estudio</label>
                        <select
                            name="estudio"
                            value={filtros.estudio}
                            onChange={handleFiltroChange}
                        >
                            <option value="">Todos</option>
                            {estudios.map((estudio) => (
                                <option key={estudio._id} value={estudio._id}>
                                    {estudio.tipo}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="filtro-group">
                        <label>Especialidad</label>
                        <select
                            name="especialidad"
                            value={filtros.especialidad}
                            onChange={handleFiltroChange}
                        >
                            <option value="">Todas</option>
                            {especialidades.map((esp) => (
                                <option key={esp} value={esp}>
                                    {esp}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filtro-group">
                        <label>Fecha</label>
                        <input
                            type="date"
                            name="fecha"
                            value={filtros.fecha}
                            onChange={handleFiltroChange}
                        />
                    </div>


                </div>

                <div className="filtros-actions">
                    <button onClick={aplicarFiltros} className="btn-aplicar">
                        Buscar
                    </button>
                    <button onClick={limpiarFiltros} className="btn-limpiar">
                        Limpiar
                    </button>
                </div>
            </div>

            {/* Tabla de turnos */}
            <div className="tabla-container">
                {loading ? (
                    <div className="loading-message">Cargando turnos...</div>
                ) : turnos.length === 0 ? (
                    <div className="empty-message">
                        No se encontraron turnos con los filtros aplicados.
                    </div>
                ) : (
                    <table className="tabla-turnos">
                        <thead>
                            <tr>
                                <th>Fecha y Hora</th>
                                <th>Doctor</th>
                                <th>Estudio</th>
                                <th>Paciente</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {turnos.map((turno) => (
                                <tr key={turno._id}>
                                    <td className="fecha-cell">
                                        {formatearFechaHora(turno.fecha)}
                                    </td>
                                    <td>
                                        {turno.doctor?.nombre || "Doctor no especificado"}
                                    </td>
                                    <td>{turno.estudio?.tipo || "-"}</td>
                                    <td>
                                        {turno.paciente?.nombre ? (
                                            turno.paciente.nombre
                                        ) : turno.pacienteNoRegistrado?.nombre ? (
                                            <span className="paciente-invitado">
                                                {turno.pacienteNoRegistrado.nombre}
                                                <span className="badge-invitado">Invitado</span>
                                            </span>
                                        ) : (
                                            <span className="text-muted">Disponible</span>
                                        )}
                                    </td>
                                    <td>
                                        <span
                                            className="badge-estado"
                                            style={{
                                                backgroundColor: getEstadoColor(turno.estado),
                                            }}
                                        >
                                            {getEstadoLabel(turno.estado)}
                                        </span>
                                    </td>
                                    <td className="acciones-cell">
                                        {/* Botón Ver Detalles - para invitados o turnos con archivos */}
                                        {(turno.pacienteNoRegistrado || turno.archivosAdjuntos?.length > 0 || turno.motivoConsulta) && (
                                            <button
                                                onClick={() => handleVerDetalles(turno)}
                                                className="btn-ver-detalles"
                                                title="Ver detalles del turno"
                                            >
                                                <FaEye /> Detalles
                                            </button>
                                        )}
                                        {turno.estado === "disponible" && (
                                            <button
                                                onClick={() => handleAsignarTurno(turno)}
                                                className="btn-asignar"
                                            >
                                                Asignar
                                            </button>
                                        )}
                                        {turno.estado === "reservado" && (
                                            <button
                                                onClick={() => handleCancelar(turno._id)}
                                                className="btn-cancelar"
                                            >
                                                Cancelar
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleEliminar(turno._id)}
                                            className="btn-eliminar-turno"
                                            title="Eliminar turno permanentemente"
                                        >
                                            🗑️ Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="resultados-info">
                Total de turnos: <strong>{turnos.length}</strong>
            </div>

            {/* Modal Asignar Turno */}
            {modalAsignar.show && (
                <ModalAsignarTurno
                    turno={modalAsignar.turno}
                    onClose={handleCloseModal}
                    onAsignado={handleTurnoAsignado}
                />
            )}

            {/* Modal Ver Detalles del Turno */}
            {modalDetalles.show && modalDetalles.turno && (
                <div className="modal-overlay" onClick={handleCloseDetalles}>
                    <div className="modal-detalles" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-detalles-header">
                            <h3>Detalles del Turno</h3>
                            <button className="btn-close-modal" onClick={handleCloseDetalles}>
                                <FaTimes />
                            </button>
                        </div>

                        <div className="modal-detalles-body">
                            {/* Información del turno */}
                            <div className="detalles-section">
                                <h4>📅 Información del Turno</h4>
                                <div className="detalles-grid">
                                    <div className="detalle-item">
                                        <span className="detalle-label">Fecha y Hora:</span>
                                        <span className="detalle-value">{formatearFechaHora(modalDetalles.turno.fecha)}</span>
                                    </div>
                                    <div className="detalle-item">
                                        <span className="detalle-label">Doctor:</span>
                                        <span className="detalle-value">{modalDetalles.turno.doctor?.nombre || "No asignado"}</span>
                                    </div>
                                    <div className="detalle-item">
                                        <span className="detalle-label">Estudio:</span>
                                        <span className="detalle-value">{modalDetalles.turno.estudio?.tipo || "No especificado"}</span>
                                    </div>
                                    <div className="detalle-item">
                                        <span className="detalle-label">Estado:</span>
                                        <span
                                            className="badge-estado"
                                            style={{ backgroundColor: getEstadoColor(modalDetalles.turno.estado) }}
                                        >
                                            {getEstadoLabel(modalDetalles.turno.estado)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Información del paciente no registrado */}
                            {modalDetalles.turno.pacienteNoRegistrado && (
                                <div className="detalles-section">
                                    <h4><FaUser /> Paciente (Invitado)</h4>
                                    <div className="detalles-grid">
                                        <div className="detalle-item">
                                            <span className="detalle-label"><FaUser /> Nombre:</span>
                                            <span className="detalle-value">{modalDetalles.turno.pacienteNoRegistrado.nombre}</span>
                                        </div>
                                        <div className="detalle-item">
                                            <span className="detalle-label"><FaIdCard /> DNI:</span>
                                            <span className="detalle-value">{modalDetalles.turno.pacienteNoRegistrado.dni}</span>
                                        </div>
                                        <div className="detalle-item">
                                            <span className="detalle-label"><FaPhone /> Teléfono:</span>
                                            <span className="detalle-value">
                                                <a href={`tel:${modalDetalles.turno.pacienteNoRegistrado.telefono}`}>
                                                    {modalDetalles.turno.pacienteNoRegistrado.telefono}
                                                </a>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Motivo de consulta */}
                            {modalDetalles.turno.motivoConsulta && (
                                <div className="detalles-section">
                                    <h4><FaClipboardList /> Motivo de Consulta</h4>
                                    <p className="motivo-consulta-text">
                                        {modalDetalles.turno.motivoConsulta}
                                    </p>
                                </div>
                            )}

                            {/* Archivos adjuntos */}
                            {modalDetalles.turno.archivosAdjuntos?.length > 0 && (
                                <div className="detalles-section">
                                    <h4><FaPaperclip /> Archivos Adjuntos ({modalDetalles.turno.archivosAdjuntos.length})</h4>
                                    <div className="archivos-lista">
                                        {modalDetalles.turno.archivosAdjuntos.map((archivo, index) => (
                                            <div key={archivo._id || index} className="archivo-item">
                                                <div className="archivo-info">
                                                    {archivo.tipoArchivo === 'pdf' ? (
                                                        <FaFilePdf className="archivo-icon-pdf" />
                                                    ) : (
                                                        <FaFileImage className="archivo-icon-img" />
                                                    )}
                                                    <div className="archivo-detalles">
                                                        <span className="archivo-nombre">{archivo.nombreArchivo}</span>
                                                        <span className="archivo-fecha">
                                                            Subido: {new Date(archivo.fechaSubida).toLocaleDateString('es-ES')}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="archivo-acciones">
                                                    <a
                                                        href={archivo.urlArchivo}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="btn-ver-archivo"
                                                        title="Ver archivo"
                                                    >
                                                        <FaEye /> Ver
                                                    </a>
                                                    <a
                                                        href={archivo.urlArchivo}
                                                        download={archivo.nombreArchivo}
                                                        className="btn-descargar-archivo"
                                                        title="Descargar archivo"
                                                    >
                                                        <FaDownload /> Descargar
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
