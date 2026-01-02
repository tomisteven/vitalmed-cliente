import React, { useState, useEffect } from "react";
import { TurnosApi } from "../../api/Turnos";
import { PacienteApi } from "../../api/Paciente";
import { formatearFechaHora } from "../../utils/dateHelpers";
import { getEstadoColor, getEstadoLabel } from "../../utils/turnoHelpers";
import ModalAsignarTurno from "./ModalAsignarTurno";
import toast from "react-hot-toast";
import "./ListaTurnosAdmin.css";
import { EstudiosApi } from "../../api/Estudios";

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
                                        {turno.paciente?.nombre || (
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
                                    <td>
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
        </div>
    );
}
