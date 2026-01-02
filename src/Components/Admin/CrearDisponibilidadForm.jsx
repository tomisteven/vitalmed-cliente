import React, { useState, useEffect } from "react";
import { TurnosApi } from "../../api/Turnos";
import { PacienteApi } from "../../api/Paciente";
import { EstudiosApi } from "../../api/Estudios";
import { generarHorarios, obtenerFechaHoy } from "../../utils/dateHelpers";
import toast from "react-hot-toast";
import "./CrearDisponibilidadForm.css";

const turnosApi = new TurnosApi();
const pacienteApi = new PacienteApi();
const estudiosApi = new EstudiosApi();

export default function CrearDisponibilidadForm() {
    const [doctores, setDoctores] = useState([]);
    const [estudios, setEstudios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingEstudios, setLoadingEstudios] = useState(true);
    const [formData, setFormData] = useState({
        doctorId: "",
        fecha: obtenerFechaHoy(),
        horaInicio: "09:00",
        horaFin: "17:00",
        intervalo: 30,
        estudiosIds: [],
    });

    useEffect(() => {
        cargarDoctores();
        cargarEstudios();
    }, []);

    const cargarDoctores = async () => {
        try {
            const response = await pacienteApi.getDoctoresList();
            if (response && response.doctores) {
                setDoctores(response.doctores);
            }
        } catch (error) {
            console.error("Error al cargar doctores:", error);
            toast.error("Error al cargar la lista de doctores");
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
            toast.error("Error al cargar los estudios");
        } finally {
            setLoadingEstudios(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleEstudioChange = (estudioId) => {
        setFormData(prev => {
            const estudiosIds = prev.estudiosIds.includes(estudioId)
                ? prev.estudiosIds.filter(id => id !== estudioId)
                : [...prev.estudiosIds, estudioId];
            return { ...prev, estudiosIds };
        });
    };

    const validarFormulario = () => {
        if (!formData.doctorId) {
            toast.error("Debe seleccionar un doctor");
            return false;
        }

        const fechaSeleccionada = new Date(formData.fecha);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (fechaSeleccionada < hoy) {
            toast.error("La fecha debe ser futura");
            return false;
        }

        const [horaInicioH, horaInicioM] = formData.horaInicio.split(":");
        const [horaFinH, horaFinM] = formData.horaFin.split(":");

        const inicio = parseInt(horaInicioH) * 60 + parseInt(horaInicioM);
        const fin = parseInt(horaFinH) * 60 + parseInt(horaFinM);

        if (fin <= inicio) {
            toast.error("La hora de fin debe ser mayor a la hora de inicio");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) {
            return;
        }

        setLoading(true);

        try {
            // Generar array de horarios
            const horarios = generarHorarios(
                formData.fecha,
                formData.horaInicio,
                formData.horaFin,
                parseInt(formData.intervalo)
            );

            if (horarios.length === 0) {
                toast.error("No se generaron horarios. Verifique los datos ingresados.");
                setLoading(false);
                return;
            }

            // Crear disponibilidad con estudios seleccionados
            const response = await turnosApi.crearDisponibilidad(
                formData.doctorId,
                horarios,
                formData.estudiosIds
            );

            if (response && response.turnos) {
                toast.success(
                    `✓ Se crearon ${response.turnos.length} turnos exitosamente`
                );

                // Resetear formulario
                setFormData({
                    ...formData,
                    fecha: obtenerFechaHoy(),
                    horaInicio: "09:00",
                    horaFin: "17:00",
                    estudiosIds: [],
                });
            }
        } catch (error) {
            console.error("Error al crear disponibilidad:", error);
            toast.error(error.message || "Error al crear disponibilidad");
        } finally {
            setLoading(false);
        }
    };

    const seleccionarTodosEstudios = () => {
        setFormData(prev => ({
            ...prev,
            estudiosIds: estudios.map(e => e._id)
        }));
    };

    const deseleccionarTodosEstudios = () => {
        setFormData(prev => ({
            ...prev,
            estudiosIds: []
        }));
    };

    return (
        <div className="crear-disponibilidad-form">
            <h3>Crear Disponibilidad de Turnos</h3>
            <p className="form-description">
                Genere turnos disponibles para un médico seleccionando el rango horario
                y el intervalo deseado.
            </p>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="doctorId">
                        Doctor <span className="required">*</span>
                    </label>
                    <select
                        id="doctorId"
                        name="doctorId"
                        value={formData.doctorId}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Seleccione un doctor</option>
                        {doctores.map((doctor) => (
                            <option key={doctor._id} value={doctor._id}>
                                {doctor.nombre} - {doctor.especialidad || "Sin especialidad"}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="fecha">
                            Fecha <span className="required">*</span>
                        </label>
                        <input
                            type="date"
                            id="fecha"
                            name="fecha"
                            value={formData.fecha}
                            onChange={handleChange}
                            min={obtenerFechaHoy()}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="intervalo">
                            Intervalo (minutos) <span className="required">*</span>
                        </label>
                        <select
                            id="intervalo"
                            name="intervalo"
                            value={formData.intervalo}
                            onChange={handleChange}
                            required
                        >
                            <option value="15">15 minutos</option>
                            <option value="30">30 minutos</option>
                            <option value="45">45 minutos</option>
                            <option value="60">60 minutos</option>
                        </select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="horaInicio">
                            Hora Inicio <span className="required">*</span>
                        </label>
                        <input
                            type="time"
                            id="horaInicio"
                            name="horaInicio"
                            value={formData.horaInicio}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="horaFin">
                            Hora Fin <span className="required">*</span>
                        </label>
                        <input
                            type="time"
                            id="horaFin"
                            name="horaFin"
                            value={formData.horaFin}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                {/* Sección de Estudios */}
                <div className="form-group estudios-section">
                    <label>
                        Estudios Disponibles para estos Turnos
                    </label>
                    <p className="help-text">
                        Seleccione los estudios que estarán disponibles para reservar en estos turnos.
                        Si no selecciona ninguno, todos los estudios activos estarán disponibles.
                    </p>

                    {loadingEstudios ? (
                        <p className="loading-text">Cargando estudios...</p>
                    ) : estudios.length === 0 ? (
                        <p className="no-estudios-text">No hay estudios activos disponibles</p>
                    ) : (
                        <>
                            <div className="estudios-actions">
                                <button
                                    type="button"
                                    className="btn-select-all"
                                    onClick={seleccionarTodosEstudios}
                                >
                                    Seleccionar todos
                                </button>
                                <button
                                    type="button"
                                    className="btn-deselect-all"
                                    onClick={deseleccionarTodosEstudios}
                                >
                                    Deseleccionar todos
                                </button>
                                <span className="estudios-count">
                                    {formData.estudiosIds.length} de {estudios.length} seleccionados
                                </span>
                            </div>

                            <div className="estudios-grid">
                                {estudios.map((estudio) => (
                                    <label
                                        key={estudio._id}
                                        className={`estudio-checkbox ${formData.estudiosIds.includes(estudio._id) ? 'selected' : ''}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={formData.estudiosIds.includes(estudio._id)}
                                            onChange={() => handleEstudioChange(estudio._id)}
                                        />
                                        <span className="estudio-info">
                                            <span className="estudio-tipo">{estudio.tipo}</span>
                                            {estudio.precio > 0 && (
                                                <span className="estudio-precio">${estudio.precio}</span>
                                            )}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn-generar-turnos"
                        disabled={loading}
                    >
                        {loading ? "Generando..." : "Generar Turnos"}
                    </button>
                </div>
            </form>
        </div>
    );
}
