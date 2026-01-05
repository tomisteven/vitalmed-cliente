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
    // Estado para el tab activo
    const [activeTab, setActiveTab] = useState("automatico");

    const [doctores, setDoctores] = useState([]);
    const [estudios, setEstudios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingEstudios, setLoadingEstudios] = useState(true);

    // Estado para el formulario automático
    const [formData, setFormData] = useState({
        doctorId: "",
        fecha: obtenerFechaHoy(),
        horaInicio: "09:00",
        horaFin: "17:00",
        intervalo: 30,
        estudiosIds: [],
    });

    // Estado para el formulario manual
    const [formDataManual, setFormDataManual] = useState({
        doctorId: "",
        fecha: obtenerFechaHoy(),
        estudiosIds: [],
    });
    const [horariosManual, setHorariosManual] = useState([]);
    const [nuevoHorario, setNuevoHorario] = useState("09:00");

    // Estados para búsqueda de doctores
    const [doctorSearch, setDoctorSearch] = useState("");
    const [doctorSearchManual, setDoctorSearchManual] = useState("");
    const [showDoctorDropdown, setShowDoctorDropdown] = useState(false);
    const [showDoctorDropdownManual, setShowDoctorDropdownManual] = useState(false);

    useEffect(() => {
        cargarDoctores();
        cargarEstudios();
    }, []);

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.doctor-search-container')) {
                setShowDoctorDropdown(false);
                setShowDoctorDropdownManual(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
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

    const handleChangeManual = (e) => {
        const { name, value } = e.target;
        setFormDataManual({
            ...formDataManual,
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

    const handleEstudioChangeManual = (estudioId) => {
        setFormDataManual(prev => {
            const estudiosIds = prev.estudiosIds.includes(estudioId)
                ? prev.estudiosIds.filter(id => id !== estudioId)
                : [...prev.estudiosIds, estudioId];
            return { ...prev, estudiosIds };
        });
    };

    // Funciones para el selector de doctores con búsqueda
    const filtrarDoctores = (busqueda) => {
        if (!busqueda.trim()) return doctores;
        const termino = busqueda.toLowerCase();
        return doctores.filter(doctor =>
            doctor.nombre?.toLowerCase().includes(termino) ||
            doctor.especialidad?.toLowerCase().includes(termino)
        );
    };

    const seleccionarDoctor = (doctor) => {
        setFormData(prev => ({ ...prev, doctorId: doctor._id }));
        setDoctorSearch(doctor.nombre);
        setShowDoctorDropdown(false);
    };

    const seleccionarDoctorManual = (doctor) => {
        setFormDataManual(prev => ({ ...prev, doctorId: doctor._id }));
        setDoctorSearchManual(doctor.nombre);
        setShowDoctorDropdownManual(false);
    };

    const getDoctorNombre = (doctorId) => {
        const doctor = doctores.find(d => d._id === doctorId);
        return doctor ? doctor.nombre : "";
    };

    const limpiarDoctorSeleccion = () => {
        setFormData(prev => ({ ...prev, doctorId: "" }));
        setDoctorSearch("");
    };

    const limpiarDoctorSeleccionManual = () => {
        setFormDataManual(prev => ({ ...prev, doctorId: "" }));
        setDoctorSearchManual("");
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
            toast.error("Debe seleccionar un doctor");
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
            toast.error("Debe seleccionar un doctor");
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

            // Si hay estudios seleccionados, crear turnos para cada estudio
            if (formData.estudiosIds.length > 0) {
                for (const estudioId of formData.estudiosIds) {
                    const response = await turnosApi.crearDisponibilidad(
                        formData.doctorId,
                        horarios,
                        estudioId
                    );
                    if (response && response.turnos) {
                        totalTurnosCreados += response.turnos.length;
                    }
                }
            } else {
                // Si no hay estudios seleccionados, crear sin estudio
                const response = await turnosApi.crearDisponibilidad(
                    formData.doctorId,
                    horarios,
                    null
                );
                if (response && response.turnos) {
                    totalTurnosCreados = response.turnos.length;
                }
            }

            toast.success(
                `✓ Se crearon ${totalTurnosCreados} turnos exitosamente`
            );

            // Resetear formulario
            setFormData({
                ...formData,
                fecha: obtenerFechaHoy(),
                horaInicio: "09:00",
                horaFin: "17:00",
                estudiosIds: [],
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

            // Si hay estudios seleccionados, crear turnos para cada estudio
            if (formDataManual.estudiosIds.length > 0) {
                for (const estudioId of formDataManual.estudiosIds) {
                    const response = await turnosApi.crearDisponibilidad(
                        formDataManual.doctorId,
                        horarios,
                        estudioId
                    );
                    if (response && response.turnos) {
                        totalTurnosCreados += response.turnos.length;
                    }
                }
            } else {
                // Si no hay estudios seleccionados, crear sin estudio
                const response = await turnosApi.crearDisponibilidad(
                    formDataManual.doctorId,
                    horarios,
                    null
                );
                if (response && response.turnos) {
                    totalTurnosCreados = response.turnos.length;
                }
            }

            toast.success(
                `✓ Se crearon ${totalTurnosCreados} turnos exitosamente`
            );

            // Resetear formulario manual
            setFormDataManual({
                ...formDataManual,
                fecha: obtenerFechaHoy(),
                estudiosIds: [],
            });
            setHorariosManual([]);
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

    const seleccionarTodosEstudiosManual = () => {
        setFormDataManual(prev => ({
            ...prev,
            estudiosIds: estudios.map(e => e._id)
        }));
    };

    const deseleccionarTodosEstudiosManual = () => {
        setFormDataManual(prev => ({
            ...prev,
            estudiosIds: []
        }));
    };

    // Renderizar sección de estudios (reutilizable)
    const renderEstudiosSection = (formState, handleEstudioChangeFn, selectAllFn, deselectAllFn) => (
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
                            onClick={selectAllFn}
                        >
                            Seleccionar todos
                        </button>
                        <button
                            type="button"
                            className="btn-deselect-all"
                            onClick={deselectAllFn}
                        >
                            Deseleccionar todos
                        </button>
                        <span className="estudios-count">
                            {formState.estudiosIds.length} de {estudios.length} seleccionados
                        </span>
                    </div>

                    <div className="estudios-grid">
                        {estudios.map((estudio) => (
                            <label
                                key={estudio._id}
                                className={`estudio-checkbox ${formState.estudiosIds.includes(estudio._id) ? 'selected' : ''}`}
                            >
                                <input
                                    type="checkbox"
                                    checked={formState.estudiosIds.includes(estudio._id)}
                                    onChange={() => handleEstudioChangeFn(estudio._id)}
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
    );

    return (
        <div className="crear-disponibilidad-form">
            <h3>Crear Disponibilidad de Turnos</h3>
            <p className="form-description">
                Genere turnos disponibles para un médico. Elija entre generación automática
                o ingreso manual de horarios.
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
                        <label htmlFor="doctorId">
                            Doctor <span className="required">*</span>
                        </label>
                        <div className="doctor-search-container">
                            <div className="doctor-search-input-wrapper">
                                <input
                                    type="text"
                                    id="doctorId"
                                    className="doctor-search-input"
                                    placeholder="Buscar doctor por nombre o especialidad..."
                                    value={doctorSearch}
                                    onChange={(e) => {
                                        setDoctorSearch(e.target.value);
                                        setShowDoctorDropdown(true);
                                        if (!e.target.value) {
                                            setFormData(prev => ({ ...prev, doctorId: "" }));
                                        }
                                    }}
                                    onFocus={() => setShowDoctorDropdown(true)}
                                    autoComplete="off"
                                />
                                {formData.doctorId && (
                                    <button
                                        type="button"
                                        className="btn-clear-doctor"
                                        onClick={limpiarDoctorSeleccion}
                                        title="Limpiar selección"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                            {showDoctorDropdown && (
                                <div className="doctor-dropdown">
                                    {filtrarDoctores(doctorSearch).length === 0 ? (
                                        <div className="doctor-dropdown-empty">
                                            No se encontraron doctores
                                        </div>
                                    ) : (
                                        filtrarDoctores(doctorSearch).map((doctor) => (
                                            <div
                                                key={doctor._id}
                                                className={`doctor-dropdown-item ${formData.doctorId === doctor._id ? 'selected' : ''}`}
                                                onClick={() => seleccionarDoctor(doctor)}
                                            >
                                                <span className="doctor-nombre">{doctor.nombre}</span>
                                                <span className="doctor-especialidad">
                                                    {doctor.especialidad || "Sin especialidad"}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                        {formData.doctorId && (
                            <div className="doctor-selected-badge">
                                ✓ Doctor seleccionado: <strong>{getDoctorNombre(formData.doctorId)}</strong>
                            </div>
                        )}
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

                    {renderEstudiosSection(formData, handleEstudioChange, seleccionarTodosEstudios, deseleccionarTodosEstudios)}

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
                        <label htmlFor="doctorIdManual">
                            Doctor <span className="required">*</span>
                        </label>
                        <div className="doctor-search-container">
                            <div className="doctor-search-input-wrapper">
                                <input
                                    type="text"
                                    id="doctorIdManual"
                                    className="doctor-search-input"
                                    placeholder="Buscar doctor por nombre o especialidad..."
                                    value={doctorSearchManual}
                                    onChange={(e) => {
                                        setDoctorSearchManual(e.target.value);
                                        setShowDoctorDropdownManual(true);
                                        if (!e.target.value) {
                                            setFormDataManual(prev => ({ ...prev, doctorId: "" }));
                                        }
                                    }}
                                    onFocus={() => setShowDoctorDropdownManual(true)}
                                    autoComplete="off"
                                />
                                {formDataManual.doctorId && (
                                    <button
                                        type="button"
                                        className="btn-clear-doctor"
                                        onClick={limpiarDoctorSeleccionManual}
                                        title="Limpiar selección"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                            {showDoctorDropdownManual && (
                                <div className="doctor-dropdown">
                                    {filtrarDoctores(doctorSearchManual).length === 0 ? (
                                        <div className="doctor-dropdown-empty">
                                            No se encontraron doctores
                                        </div>
                                    ) : (
                                        filtrarDoctores(doctorSearchManual).map((doctor) => (
                                            <div
                                                key={doctor._id}
                                                className={`doctor-dropdown-item ${formDataManual.doctorId === doctor._id ? 'selected' : ''}`}
                                                onClick={() => seleccionarDoctorManual(doctor)}
                                            >
                                                <span className="doctor-nombre">{doctor.nombre}</span>
                                                <span className="doctor-especialidad">
                                                    {doctor.especialidad || "Sin especialidad"}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                        {formDataManual.doctorId && (
                            <div className="doctor-selected-badge">
                                ✓ Doctor seleccionado: <strong>{getDoctorNombre(formDataManual.doctorId)}</strong>
                            </div>
                        )}
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

                    {renderEstudiosSection(formDataManual, handleEstudioChangeManual, seleccionarTodosEstudiosManual, deseleccionarTodosEstudiosManual)}

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
