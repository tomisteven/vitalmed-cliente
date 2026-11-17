import React, { useState, useEffect } from "react";
import { TurnosApi } from "../../api/Turnos";
import { PacienteApi } from "../../api/Paciente";
import { generarHorarios, obtenerFechaHoy, obtenerProximaHoraCercana } from "../../utils/dateHelpers";
import { resolverEspecialistaUnico, nombreEspecialista } from "../../utils/especialista";
import toast from "react-hot-toast";
import "./CrearDisponibilidadForm.css";

const turnosApi = new TurnosApi();
const pacienteApi = new PacienteApi();

export default function CrearDisponibilidadForm() {
    // Estado para el tab activo
    const [activeTab, setActiveTab] = useState("automatico");

    const [especialista, setEspecialista] = useState(null);
    const [loadingEspecialista, setLoadingEspecialista] = useState(true);
    const [loading, setLoading] = useState(false);

    // Estado para el formulario automático
    const [formData, setFormData] = useState({
        doctorId: "",
        fecha: obtenerFechaHoy(),
        horaInicio: obtenerProximaHoraCercana(),
        horaFin: "17:00",
        intervalo: 30,
    });

    // Estado para el formulario manual
    const [formDataManual, setFormDataManual] = useState({
        doctorId: "",
        fecha: obtenerFechaHoy(),
    });
    const [horariosManual, setHorariosManual] = useState([]);
    const [nuevoHorario, setNuevoHorario] = useState(obtenerProximaHoraCercana());

    // Effect to update horaInicio when date is today
    useEffect(() => {
        if (formData.fecha === obtenerFechaHoy()) {
            const proximaHora = obtenerProximaHoraCercana();
            setFormData(prev => ({ ...prev, horaInicio: proximaHora }));
        }
    }, [formData.fecha]);

    useEffect(() => {
        if (formDataManual.fecha === obtenerFechaHoy()) {
            const proximaHora = obtenerProximaHoraCercana();
            setNuevoHorario(proximaHora);
        }
    }, [formDataManual.fecha]);

    useEffect(() => {
        cargarEspecialista();
    }, []);

    const cargarEspecialista = async () => {
        setLoadingEspecialista(true);
        try {
            const response = await pacienteApi.getDoctoresList();
            const lista = response?.doctores || [];
            const fija = resolverEspecialistaUnico(lista);

            if (!fija) {
                toast.error("No se encontró la especialista configurada");
                return;
            }

            setEspecialista(fija);
            setFormData((prev) => ({ ...prev, doctorId: fija._id }));
            setFormDataManual((prev) => ({ ...prev, doctorId: fija._id }));
        } catch (error) {
            console.error("Error al cargar la especialista:", error);
            toast.error("Error al cargar la especialista");
        } finally {
            setLoadingEspecialista(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleChangeManual = (e) => {
        const { name, value } = e.target;
        setFormDataManual({
            ...formDataManual,
            [name]: value,
        });
    };

    // Funciones para manejar horarios manuales
    const agregarHorario = () => {
        if (!nuevoHorario) {
            toast.error("Ingrese un horario válido");
            return;
        }

        if (horariosManual.includes(nuevoHorario)) {
            toast.error("Este horario ya fue agregado");
            return;
        }

        setHorariosManual(prev => [...prev, nuevoHorario].sort());
        setNuevoHorario("09:00");
        toast.success(`Horario ${nuevoHorario} agregado`);
    };

    const eliminarHorario = (horario) => {
        setHorariosManual(prev => prev.filter(h => h !== horario));
    };

    const limpiarHorarios = () => {
        setHorariosManual([]);
        toast.success("Horarios limpiados");
    };

    const validarFormulario = () => {
        if (!formData.doctorId) {
            toast.error("No se encontró la especialista configurada");
            return false;
        }

        //const fechaSeleccionada = new Date(formData.fecha);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);



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

    const validarFormularioManual = () => {
        if (!formDataManual.doctorId) {
            toast.error("No se encontró la especialista configurada");
            return false;
        }

        const fechaSeleccionada = new Date(formDataManual.fecha);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);



        if (horariosManual.length === 0) {
            toast.error("Debe agregar al menos un horario");
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

            let totalTurnosCreados = 0;

            // Crear turnos (un solo turno por horario)
            const response = await turnosApi.crearDisponibilidad(
                formData.doctorId,
                horarios
            );

            if (response && response.turnos) {
                totalTurnosCreados = response.turnos.length;
            }

            toast.success(
                `✓ Se crearon ${totalTurnosCreados} turnos exitosamente`
            );

            // Resetear formulario
            setFormData({
                ...formData,
                fecha: obtenerFechaHoy(),
                horaInicio: obtenerProximaHoraCercana(),
                horaFin: "17:00",
            });
        } catch (error) {
            console.error("Error al crear disponibilidad:", error);
            toast.error(error.message || "Error al crear disponibilidad");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitManual = async (e) => {
        e.preventDefault();

        if (!validarFormularioManual()) {
            return;
        }

        setLoading(true);

        try {
            // Generar array de horarios manuales como fechas ISO (igual que el modo automático)
            const horarios = horariosManual.map(hora => {
                // Combinar fecha + hora en un ISO string
                const [year, month, day] = formDataManual.fecha.split('-');
                const [hours, minutes] = hora.split(':');
                const fechaCompleta = new Date(year, month - 1, day, hours, minutes);
                return fechaCompleta.toISOString();
            });

            let totalTurnosCreados = 0;

            // Crear turnos (un solo turno por horario)
            const response = await turnosApi.crearDisponibilidad(
                formDataManual.doctorId,
                horarios
            );

            if (response && response.turnos) {
                totalTurnosCreados = response.turnos.length;
            }

            toast.success(
                `✓ Se crearon ${totalTurnosCreados} turnos exitosamente`
            );

            // Resetear formulario manual
            setFormDataManual({
                ...formDataManual,
                fecha: obtenerFechaHoy(),
            });
            setHorariosManual([]);
            setNuevoHorario(obtenerProximaHoraCercana());
        } catch (error) {
            console.error("Error al crear disponibilidad:", error);
            toast.error(error.message || "Error al crear disponibilidad");
        } finally {
            setLoading(false);
        }
    };

    // Sección de estudios eliminada ya que no se eligen estudios al crear la disponibilidad

    return (
        <div className="crear-disponibilidad-form">
            <h3>Gestionar Disponibilidad</h3>
            <p className="form-description">
                Configure los horarios de atención y los cupos disponibles de la especialista.
                Elija entre generación automática o ingreso manual de horarios.
            </p>

            {/* Tabs */}
            <div className="tabs-container">
                <button
                    type="button"
                    className={`tab-button ${activeTab === "automatico" ? "active" : ""}`}
                    onClick={() => setActiveTab("automatico")}
                >
                    <span className="tab-icon">⏰</span>
                    Automático
                </button>
                <button
                    type="button"
                    className={`tab-button ${activeTab === "manual" ? "active" : ""}`}
                    onClick={() => setActiveTab("manual")}
                >
                    <span className="tab-icon">✏️</span>
                    Manual
                </button>
            </div>

            {/* Tab Automático */}
            {activeTab === "automatico" && (
                <form onSubmit={handleSubmit} className="tab-content">
                    <div className="tab-description">
                        <p>Genere turnos automáticamente especificando un rango horario e intervalo.</p>
                    </div>

                    <div className="form-group">
                        <label>Especialista</label>
                        <div className="especialista-fija-badge">
                            <span className="especialista-fija-nombre">
                                {loadingEspecialista
                                    ? "Cargando especialista..."
                                    : nombreEspecialista(especialista)}
                            </span>
                            <span className="especialista-fija-tag">Especialista única</span>
                        </div>
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

                    {/* Selector de estudios eliminado */}

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
            )}

            {/* Tab Manual */}
            {activeTab === "manual" && (
                <form onSubmit={handleSubmitManual} className="tab-content">
                    <div className="tab-description">
                        <p>Agregue horarios específicos de forma manual para una fecha determinada.</p>
                    </div>

                    <div className="form-group">
                        <label>Especialista</label>
                        <div className="especialista-fija-badge">
                            <span className="especialista-fija-nombre">
                                {loadingEspecialista
                                    ? "Cargando especialista..."
                                    : nombreEspecialista(especialista)}
                            </span>
                            <span className="especialista-fija-tag">Especialista única</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="fechaManual">
                            Fecha <span className="required">*</span>
                        </label>
                        <input
                            type="date"
                            id="fechaManual"
                            name="fecha"
                            value={formDataManual.fecha}
                            onChange={handleChangeManual}
                            min={obtenerFechaHoy()}
                            required
                        />
                    </div>

                    {/* Sección de agregar horarios */}
                    <div className="form-group horarios-manual-section">
                        <label>
                            Horarios <span className="required">*</span>
                        </label>
                        <p className="help-text">
                            Agregue los horarios específicos que desea crear para esta fecha.
                        </p>

                        <div className="agregar-horario-row">
                            <input
                                type="time"
                                value={nuevoHorario}
                                onChange={(e) => setNuevoHorario(e.target.value)}
                                className="input-horario"
                            />
                            <button
                                type="button"
                                className="btn-agregar-horario"
                                onClick={agregarHorario}
                            >
                                + Agregar
                            </button>
                            {horariosManual.length > 0 && (
                                <button
                                    type="button"
                                    className="btn-limpiar-horarios"
                                    onClick={limpiarHorarios}
                                >
                                    Limpiar todos
                                </button>
                            )}
                        </div>

                        {horariosManual.length > 0 ? (
                            <div className="horarios-lista">
                                <div className="horarios-count">
                                    {horariosManual.length} horario{horariosManual.length !== 1 ? 's' : ''} agregado{horariosManual.length !== 1 ? 's' : ''}
                                </div>
                                <div className="horarios-chips">
                                    {horariosManual.map((horario) => (
                                        <div key={horario} className="horario-chip">
                                            <span className="horario-valor">{horario}</span>
                                            <button
                                                type="button"
                                                className="btn-eliminar-horario"
                                                onClick={() => eliminarHorario(horario)}
                                                title="Eliminar horario"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="horarios-empty">
                                <p>No hay horarios agregados. Use el botón "+ Agregar" para agregar horarios.</p>
                            </div>
                        )}
                    </div>

                    {/* Selector de estudios manual eliminado */}

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn-generar-turnos"
                            disabled={loading || horariosManual.length === 0}
                        >
                            {loading ? "Generando..." : `Crear ${horariosManual.length} Turno${horariosManual.length !== 1 ? 's' : ''}`}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
