import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { TurnosApi } from "../../api/Turnos";
import { PacienteApi } from "../../api/Paciente";
import { formatearFechaHora } from "../../utils/dateHelpers";
import TarjetaTurno from "./TarjetaTurno";
import AcordeonHorario from "./AcordeonHorario";
import "./BuscadorTurnos.css";

const turnosApi = new TurnosApi();
const pacienteApi = new PacienteApi();

export default function BuscadorTurnos() {
    const [doctores, setDoctores] = useState([]);
    const [turnos, setTurnos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busquedaRealizada, setBusquedaRealizada] = useState(false);
    const [filtros, setFiltros] = useState({
        especialidad: "",
        doctorId: "",
        fecha: "",
    });

    useEffect(() => {
        cargarDoctores();
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFiltros({
            ...filtros,
            [name]: value,
            // Si cambia la especialidad, resetear el doctor
            ...(name === "especialidad" && { doctorId: "" }),
        });
    };

    const buscarTurnos = async (e) => {
        e.preventDefault();
        setLoading(true);
        setBusquedaRealizada(true);

        try {
            const filtrosAPI = {
                estado: "disponible",
                ...filtros,
            };

            // Helper para obtener fecha local formato YYYY-MM-DD (Match visual con TarjetaTurno)
            const getFechaLocal = (isoString) => {
                if (!isoString) return "";
                const date = new Date(isoString);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const response = await turnosApi.buscarTurnos(filtrosAPI);
            let turnosEncontrados = Array.isArray(response) ? response : [];

            // Filtrado Client-Side riguroso
            if (filtros.fecha) {
                console.log("Filtrando por fecha:", filtros.fecha);
                turnosEncontrados = turnosEncontrados.filter((turno) => {
                    const turnoFechaLocal = getFechaLocal(turno.fecha);
                    const match = turnoFechaLocal === filtros.fecha;
                    console.log(`Turno: ${turno.fecha} -> Local: ${turnoFechaLocal}. Match? ${match}`);
                    return match;
                });
            }

            setTurnos(turnosEncontrados);
        } catch (error) {
            console.error("Error al buscar turnos:", error);
            setTurnos([]);
        } finally {
            setLoading(false);
        }
    };

    const handleTurnoReservado = () => {
        // Recargar turnos después de reservar
        if (busquedaRealizada) {
            buscarTurnos({ preventDefault: () => { } });
        }
    };

    // Obtener especialidades únicas
    const especialidades = [
        ...new Set(doctores.map((d) => d.especialidad).filter(Boolean)),
    ];

    // Filtrar doctores por especialidad seleccionada
    const doctoresFiltrados = filtros.especialidad
        ? doctores.filter((d) => d.especialidad === filtros.especialidad)
        : doctores;

    // Agrupar turnos por fecha/hora para mostrar acordeones
    const turnosAgrupados = useMemo(() => {
        if (turnos.length === 0) return [];

        const grupos = {};

        turnos.forEach((turno) => {
            // Crear una clave única basada en la fecha y hora
            const fechaHoraKey = formatearFechaHora(turno.fecha);

            if (!grupos[fechaHoraKey]) {
                grupos[fechaHoraKey] = {
                    fechaHora: fechaHoraKey,
                    turnos: [],
                    timestamp: new Date(turno.fecha).getTime()
                };
            }
            grupos[fechaHoraKey].turnos.push(turno);
        });

        // Convertir a array y ordenar por fecha
        return Object.values(grupos).sort((a, b) => a.timestamp - b.timestamp);
    }, [turnos]);

    return (
        <div className="buscador-turnos">
            <h3>Buscar Turnos Disponibles</h3>
            <p className="buscador-description">
                Seleccione la especialidad y/o médico para ver los turnos disponibles.
            </p>

            <form onSubmit={buscarTurnos} className="buscador-form">
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="especialidad">Especialidad</label>
                        <select
                            id="especialidad"
                            name="especialidad"
                            value={filtros.especialidad}
                            onChange={handleChange}
                        >
                            <option value="">Todas las especialidades</option>
                            {especialidades.map((esp) => (
                                <option key={esp} value={esp}>
                                    {esp}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="doctorId">Médico (opcional)</label>
                        <select
                            id="doctorId"
                            name="doctorId"
                            value={filtros.doctorId}
                            onChange={handleChange}
                        >
                            <option value="">Todos los médicos</option>
                            {doctoresFiltrados.map((doctor) => (
                                <option key={doctor._id} value={doctor._id}>
                                    {doctor.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="fecha">Fecha (opcional)</label>
                        <input
                            type="date"
                            id="fecha"
                            name="fecha"
                            value={filtros.fecha}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-buscar" disabled={loading}>
                        {loading ? "Buscando..." : "Buscar Turnos"}
                    </button>
                </div>
            </form>

            {/* Resultados */}
            <div className="resultados-container">
                {loading ? (
                    <div className="loading-message">Buscando turnos disponibles...</div>
                ) : busquedaRealizada ? (
                    turnos.length === 0 ? (
                        <div className="empty-message">
                            <p>No se encontraron turnos disponibles con los filtros seleccionados.</p>
                            <p className="empty-hint">
                                Intente con otra especialidad o fecha.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="resultados-header">
                                <h4>Turnos Disponibles ({turnos.length})</h4>
                                <span className="grupos-info">
                                    {turnosAgrupados.length} {turnosAgrupados.length === 1 ? 'horario' : 'horarios'} disponibles
                                </span>
                            </div>
                            <div className="acordeones-container">
                                {turnosAgrupados.map((grupo) => (
                                    grupo.turnos.length === 1 ? (
                                        // Si solo hay 1 turno en este horario, mostrar directamente la tarjeta
                                        <TarjetaTurno
                                            key={grupo.turnos[0]._id}
                                            turno={grupo.turnos[0]}
                                            onReservado={handleTurnoReservado}
                                        />
                                    ) : (
                                        // Si hay múltiples turnos, mostrar acordeón
                                        <AcordeonHorario
                                            key={grupo.fechaHora}
                                            fechaHora={grupo.fechaHora}
                                            turnos={grupo.turnos}
                                            onReservado={handleTurnoReservado}
                                        />
                                    )
                                ))}
                            </div>
                        </>
                    )
                ) : (
                    <div className="info-message">
                        Utilice los filtros para buscar turnos disponibles.
                    </div>
                )}
            </div>
        </div>
    );
}
