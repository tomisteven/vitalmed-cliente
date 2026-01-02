import React, { useState, useEffect } from "react";
import { TurnosApi } from "../../api/Turnos";
import { PacienteApi } from "../../api/Paciente";
import TarjetaTurno from "./TarjetaTurno";
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

            const response = await turnosApi.buscarTurnos(filtrosAPI);
            setTurnos(Array.isArray(response) ? response : []);
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
                            </div>
                            <div className="turnos-grid">
                                {turnos.map((turno) => (
                                    <TarjetaTurno
                                        key={turno._id}
                                        turno={turno}
                                        onReservado={handleTurnoReservado}
                                    />
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
