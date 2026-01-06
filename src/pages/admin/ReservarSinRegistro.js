import React, { useState, useEffect } from "react";
import { TurnosApi } from "../../api/Turnos";
import { PacienteApi } from "../../api/Paciente";
import { EstudiosApi } from "../../api/Estudios";
import { formatearFechaHora } from "../../utils/dateHelpers";
import toast, { Toaster } from "react-hot-toast";
import { FaCalendarAlt, FaUserMd, FaCheck, FaTimes, FaUpload, FaFilePdf, FaFileImage, FaTrash, FaPrint } from "react-icons/fa";
import "./ReservarSinRegistro.css";

const turnosApi = new TurnosApi();
const pacienteApi = new PacienteApi();
const estudiosApi = new EstudiosApi();

export default function ReservarSinRegistro() {
    // Estados para búsqueda
    const [doctores, setDoctores] = useState([]);
    const [estudios, setEstudios] = useState([]);
    const [turnos, setTurnos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busquedaRealizada, setBusquedaRealizada] = useState(false);
    const [filtros, setFiltros] = useState({
        especialidad: "",
        doctorId: "",
        fecha: "",
    });

    // Estados para reserva
    const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
    const [paso, setPaso] = useState(1); // 1: Buscar, 2: Formulario, 3: Confirmación
    const [loadingReserva, setLoadingReserva] = useState(false);
    const [loadingArchivo, setLoadingArchivo] = useState(false);
    const [reservaExitosa, setReservaExitosa] = useState(null);

    // Datos del formulario de invitado
    const [datosInvitado, setDatosInvitado] = useState({
        dni: "",
        nombre: "",
        telefono: "",
        motivoConsulta: "",
        estudioId: "",
    });

    // Archivo adjunto
    const [archivoAdjunto, setArchivoAdjunto] = useState(null);
    const [archivoSubido, setArchivoSubido] = useState(null);

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
        }
    };

    const cargarEstudios = async () => {
        try {
            const response = await estudiosApi.getEstudios(true);
            const listaEstudios = Array.isArray(response)
                ? response
                : response.estudios || [];
            setEstudios(listaEstudios.filter(e => e.activo));
        } catch (error) {
            console.error("Error al cargar estudios:", error);
        }
    };

    const handleChangeFiltros = (e) => {
        const { name, value } = e.target;
        setFiltros({
            ...filtros,
            [name]: value,
            ...(name === "especialidad" && { doctorId: "" }),
        });
    };

    const handleChangeDatos = (e) => {
        const { name, value } = e.target;
        setDatosInvitado({
            ...datosInvitado,
            [name]: value,
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

    const seleccionarTurno = (turno) => {
        setTurnoSeleccionado(turno);
        setPaso(2);
    };

    const handleArchivoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar tipo de archivo
            const extensionesPermitidas = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf'];
            const extension = file.name.split('.').pop().toLowerCase();

            if (!extensionesPermitidas.includes(extension)) {
                toast.error("Solo se permiten imágenes (jpg, png, webp, gif) y PDF");
                return;
            }

            // Validar tamaño (10MB máximo)
            if (file.size > 10 * 1024 * 1024) {
                toast.error("El archivo no puede superar 10MB");
                return;
            }

            setArchivoAdjunto(file);
        }
    };

    const eliminarArchivo = () => {
        setArchivoAdjunto(null);
    };

    const validarFormulario = () => {
        if (!datosInvitado.dni.trim()) {
            toast.error("El DNI es obligatorio");
            return false;
        }
        if (!datosInvitado.nombre.trim()) {
            toast.error("El nombre es obligatorio");
            return false;
        }
        if (!datosInvitado.telefono.trim()) {
            toast.error("El teléfono es obligatorio");
            return false;
        }
        return true;
    };

    const handleReservar = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) return;

        setLoadingReserva(true);

        try {
            // 1. Reservar el turno
            const response = await turnosApi.reservarTurnoInvitado(
                turnoSeleccionado._id,
                datosInvitado
            );

            if (!response || !response.turno) {
                throw new Error("Error al reservar el turno");
            }

            const turnoReservado = response.turno;

            // 2. Si hay archivo, subirlo
            if (archivoAdjunto) {
                setLoadingArchivo(true);
                try {
                    const archivoResponse = await turnosApi.subirArchivoTurno(
                        turnoReservado._id,
                        archivoAdjunto,
                        archivoAdjunto.name
                    );
                    setArchivoSubido(archivoResponse.archivo);
                } catch (archivoError) {
                    console.error("Error al subir archivo:", archivoError);
                    toast.error("El turno se reservó pero hubo un error al subir el archivo");
                } finally {
                    setLoadingArchivo(false);
                }
            }

            setReservaExitosa(turnoReservado);
            setPaso(3);
            toast.success("¡Turno reservado exitosamente!");

        } catch (error) {
            console.error("Error al reservar:", error);
            toast.error(error.message || "Error al reservar el turno");
        } finally {
            setLoadingReserva(false);
        }
    };

    const volverABuscar = () => {
        setPaso(1);
        setTurnoSeleccionado(null);
        setDatosInvitado({
            dni: "",
            nombre: "",
            telefono: "",
            motivoConsulta: "",
            estudioId: "",
        });
        setArchivoAdjunto(null);
        setArchivoSubido(null);
        setReservaExitosa(null);
    };

    const nuevaReserva = () => {
        volverABuscar();
        setBusquedaRealizada(false);
        setTurnos([]);
    };

    const imprimirComprobante = () => {
        const contenido = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Comprobante de Turno</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: Arial, sans-serif; 
                        padding: 40px; 
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                    }
                    .header { 
                        text-align: center; 
                        border-bottom: 3px solid #653057; 
                        padding-bottom: 20px; 
                        margin-bottom: 30px;
                    }
                    .header h1 { 
                        color: #653057; 
                        font-size: 28px;
                        margin-bottom: 5px;
                    }
                    .header p {
                        color: #666;
                        font-size: 14px;
                    }
                    .success-badge {
                        background: #28a745;
                        color: white;
                        padding: 10px 20px;
                        border-radius: 25px;
                        display: inline-block;
                        margin-bottom: 25px;
                        font-weight: bold;
                    }
                    .section { 
                        margin-bottom: 25px;
                    }
                    .section-title { 
                        font-size: 14px; 
                        color: #888; 
                        text-transform: uppercase;
                        margin-bottom: 10px;
                        letter-spacing: 1px;
                    }
                    .detail-row { 
                        display: flex; 
                        justify-content: space-between; 
                        padding: 12px 0; 
                        border-bottom: 1px solid #eee;
                    }
                    .detail-label { 
                        color: #666; 
                        font-weight: 500;
                    }
                    .detail-value { 
                        color: #333; 
                        font-weight: 600;
                        text-align: right;
                    }
                    .highlight {
                        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                        padding: 20px;
                        border-radius: 10px;
                        border-left: 4px solid #653057;
                        margin-bottom: 25px;
                    }
                    .footer { 
                        margin-top: 40px; 
                        padding-top: 20px; 
                        border-top: 2px solid #eee;
                        text-align: center;
                        color: #888;
                        font-size: 12px;
                    }
                    .note {
                        background: #fff3cd;
                        padding: 15px;
                        border-radius: 8px;
                        margin-top: 20px;
                        font-size: 13px;
                        color: #856404;
                    }
                    @media print {
                        body { padding: 20px; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Comprobante de Turno</h1>
                    <p>DoctoraEcos - Centro de Ultrasonografía</p>
                </div>
                
                <div style="text-align: center;">
                    <span class="success-badge">✓ Reserva Confirmada</span>
                </div>

                <div class="highlight">
                    <div class="section-title">Información del Turno</div>
                    <div class="detail-row">
                        <span class="detail-label">Fecha y Hora:</span>
                        <span class="detail-value">${formatearFechaHora(reservaExitosa?.fecha)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Doctor:</span>
                        <span class="detail-value">${turnoSeleccionado?.doctor?.nombre || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Especialidad:</span>
                        <span class="detail-value">${turnoSeleccionado?.doctor?.especialidad || 'N/A'}</span>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Datos del Paciente</div>
                    <div class="detail-row">
                        <span class="detail-label">Nombre:</span>
                        <span class="detail-value">${datosInvitado.nombre}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">DNI / Cédula:</span>
                        <span class="detail-value">${datosInvitado.dni}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Teléfono:</span>
                        <span class="detail-value">${datosInvitado.telefono}</span>
                    </div>
                    ${datosInvitado.motivoConsulta ? `
                    <div class="detail-row">
                        <span class="detail-label">Motivo:</span>
                        <span class="detail-value">${datosInvitado.motivoConsulta}</span>
                    </div>
                    ` : ''}
                </div>

                ${archivoSubido ? `
                <div class="section">
                    <div class="section-title">Archivo Adjunto</div>
                    <div class="detail-row">
                        <span class="detail-label">Archivo:</span>
                        <span class="detail-value">${archivoSubido.nombreArchivo}</span>
                    </div>
                </div>
                ` : ''}

                <div class="note">
                    <strong>📋 Importante:</strong><br/>
                    • Presentar este comprobante el día de la cita.<br/>
                    • Llegar 15 minutos antes de la hora programada.<br/>
                    • Para cancelar o modificar, comunicarse con la clínica.
                </div>

                <div class="footer">
                    <p>Documento generado el ${new Date().toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}</p>
                    <p style="margin-top: 10px;">DoctoraEcos © ${new Date().getFullYear()}</p>
                </div>
            </body>
            </html>
        `;

        const ventana = window.open('', '_blank');
        ventana.document.write(contenido);
        ventana.document.close();
        ventana.focus();

        // Esperar a que cargue y luego imprimir
        setTimeout(() => {
            ventana.print();
        }, 250);
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
        <div className="reservar-sin-registro-page">
            <Toaster position="top-right" />

            <div className="page-header-guest">
                <h1>Reservar Turno</h1>
                <p className="page-subtitle">Reserve su turno sin necesidad de registrarse</p>
            </div>

            {/* Indicador de pasos */}
            <div className="steps-indicator">
                <div className={`step ${paso >= 1 ? 'active' : ''} ${paso > 1 ? 'completed' : ''}`}>
                    <span className="step-number">1</span>
                    <span className="step-label">Buscar Turno</span>
                </div>
                <div className="step-connector"></div>
                <div className={`step ${paso >= 2 ? 'active' : ''} ${paso > 2 ? 'completed' : ''}`}>
                    <span className="step-number">2</span>
                    <span className="step-label">Completar Datos</span>
                </div>
                <div className="step-connector"></div>
                <div className={`step ${paso >= 3 ? 'active' : ''}`}>
                    <span className="step-number">3</span>
                    <span className="step-label">Confirmación</span>
                </div>
            </div>

            {/* PASO 1: Búsqueda de turnos */}
            {paso === 1 && (
                <div className="search-section">
                    <div className="section-card">
                        <h2><FaCalendarAlt /> Buscar Turnos Disponibles</h2>
                        <p className="section-description">
                            Seleccione la especialidad y/o médico para ver los turnos disponibles.
                        </p>

                        <form onSubmit={buscarTurnos} className="search-form">
                            <div className="form-row-guest">
                                <div className="form-group-guest">
                                    <label htmlFor="especialidad">Especialidad</label>
                                    <select
                                        id="especialidad"
                                        name="especialidad"
                                        value={filtros.especialidad}
                                        onChange={handleChangeFiltros}
                                    >
                                        <option value="">Todas las especialidades</option>
                                        {especialidades.map((esp) => (
                                            <option key={esp} value={esp}>
                                                {esp}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* <div className="form-group-guest">
                                    <label htmlFor="doctorId">Médico (opcional)</label>
                                    <select
                                        id="doctorId"
                                        name="doctorId"
                                        value={filtros.doctorId}
                                        onChange={handleChangeFiltros}
                                    >
                                        <option value="">Todos los médicos</option>
                                        {doctoresFiltrados.map((doctor) => (
                                            <option key={doctor._id} value={doctor._id}>
                                                {doctor.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div> */}

                                <div className="form-group-guest">
                                    <label htmlFor="fecha">Fecha (opcional)</label>
                                    <input
                                        type="date"
                                        id="fecha"
                                        name="fecha"
                                        value={filtros.fecha}
                                        onChange={handleChangeFiltros}
                                    />
                                </div>
                            </div>

                            <div className="form-actions-guest">
                                <button type="submit" className="btn-buscar-guest" disabled={loading}>
                                    {loading ? "Buscando..." : "Buscar Turnos"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Resultados */}
                    {loading ? (
                        <div className="loading-message-guest">Buscando turnos disponibles...</div>
                    ) : busquedaRealizada ? (
                        turnos.length === 0 ? (
                            <div className="empty-message-guest">
                                <p>No se encontraron turnos disponibles con los filtros seleccionados.</p>
                                <p className="empty-hint">Intente con otra especialidad o fecha.</p>
                            </div>
                        ) : (
                            <div className="results-section">
                                <h3>Turnos Disponibles ({turnos.length})</h3>
                                <div className="turnos-grid-guest">
                                    {turnos.map((turno) => (
                                        <div key={turno._id} className="turno-card-guest">
                                            <div className="turno-fecha">
                                                <FaCalendarAlt />
                                                <span>{formatearFechaHora(turno.fecha)}</span>
                                            </div>
                                            <div className="turno-doctor">
                                                <FaUserMd />
                                                <span>{turno.doctor?.nombre || "Doctor no asignado"}</span>
                                            </div>
                                            {turno.doctor?.especialidad && (
                                                <div className="turno-especialidad">
                                                    {turno.doctor.especialidad}
                                                </div>
                                            )}
                                            <button
                                                className="btn-seleccionar"
                                                onClick={() => seleccionarTurno(turno)}
                                            >
                                                Seleccionar
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="info-message-guest">
                            Utilice los filtros para buscar turnos disponibles.
                        </div>
                    )}
                </div>
            )}

            {/* PASO 2: Formulario de datos */}
            {paso === 2 && turnoSeleccionado && (
                <div className="form-section">
                    <div className="section-card">
                        <div className="turno-seleccionado-header">
                            <h2>Turno Seleccionado</h2>
                            <button className="btn-cambiar" onClick={volverABuscar}>
                                Cambiar turno
                            </button>
                        </div>

                        <div className="turno-seleccionado-info">
                            <div className="info-item">
                                <FaCalendarAlt />
                                <span>{formatearFechaHora(turnoSeleccionado.fecha)}</span>
                            </div>
                            <div className="info-item">
                                <FaUserMd />
                                <span>
                                    {turnoSeleccionado.doctor?.nombre} - {turnoSeleccionado.doctor?.especialidad}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="section-card">
                        <h2>Complete sus datos</h2>
                        <p className="section-description">
                            Ingrese sus datos personales para confirmar la reserva.
                        </p>

                        <form onSubmit={handleReservar} className="datos-form">
                            <div className="form-row-guest">
                                <div className="form-group-guest">
                                    <label htmlFor="dni">Cédula <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        id="dni"
                                        name="dni"
                                        value={datosInvitado.dni}
                                        onChange={handleChangeDatos}
                                        placeholder="Ej: 12345678"
                                        required
                                    />
                                </div>

                                <div className="form-group-guest">
                                    <label htmlFor="nombre">Nombre Completo <span className="required">*</span></label>
                                    <input
                                        type="text"
                                        id="nombre"
                                        name="nombre"
                                        value={datosInvitado.nombre}
                                        onChange={handleChangeDatos}
                                        placeholder="Ej: Juan Pérez"
                                        required
                                    />
                                </div>

                                <div className="form-group-guest">
                                    <label htmlFor="telefono">Teléfono <span className="required">*</span></label>
                                    <input
                                        type="tel"
                                        id="telefono"
                                        name="telefono"
                                        value={datosInvitado.telefono}
                                        onChange={handleChangeDatos}
                                        placeholder="Ej: 1122334455"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group-guest full-width">
                                <label htmlFor="motivoConsulta">Motivo de Consulta (opcional)</label>
                                <textarea
                                    id="motivoConsulta"
                                    name="motivoConsulta"
                                    value={datosInvitado.motivoConsulta}
                                    onChange={handleChangeDatos}
                                    placeholder="Describa brevemente el motivo de su consulta..."
                                    rows="3"
                                />
                            </div>

                            {estudios.length > 0 && (
                                <div className="form-group-guest">
                                    <label htmlFor="estudioId">Estudio/Servicio (opcional)</label>
                                    <select
                                        id="estudioId"
                                        name="estudioId"
                                        value={datosInvitado.estudioId}
                                        onChange={handleChangeDatos}
                                    >
                                        <option value="">Seleccione un estudio</option>
                                        {estudios.map((estudio) => (
                                            <option key={estudio._id} value={estudio._id}>
                                                {estudio.tipo}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Adjuntar archivo */}
                            <div className="archivo-section">
                                <h3><FaUpload /> Adjuntar ESTUDIO / ORDEN MEDICA (opcional)</h3>
                                <p className="archivo-description">
                                    Puede adjuntar estudios previos, radiografías o documentos relevantes (imagen o PDF, máx 10MB).
                                </p>

                                {!archivoAdjunto ? (
                                    <div className="archivo-upload-area">
                                        <input
                                            type="file"
                                            id="archivo"
                                            accept="image/*,.pdf"
                                            onChange={handleArchivoChange}
                                            className="archivo-input"
                                        />
                                        <label htmlFor="archivo" className="archivo-label">
                                            <FaUpload />
                                            <span>Seleccionar archivo</span>
                                        </label>
                                    </div>
                                ) : (
                                    <div className="archivo-preview">
                                        <div className="archivo-info">
                                            {archivoAdjunto.type.includes('pdf') ? (
                                                <FaFilePdf className="archivo-icon pdf" />
                                            ) : (
                                                <FaFileImage className="archivo-icon image" />
                                            )}
                                            <span className="archivo-nombre">{archivoAdjunto.name}</span>
                                            <span className="archivo-size">
                                                ({(archivoAdjunto.size / 1024 / 1024).toFixed(2)} MB)
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            className="btn-eliminar-archivo"
                                            onClick={eliminarArchivo}
                                        >
                                            <FaTrash /> Eliminar
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="form-actions-guest">
                                <button
                                    type="button"
                                    className="btn-cancelar-guest"
                                    onClick={volverABuscar}
                                >
                                    <FaTimes /> Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-confirmar"
                                    disabled={loadingReserva}
                                >
                                    {loadingReserva ? (
                                        loadingArchivo ? "Subiendo archivo..." : "Reservando..."
                                    ) : (
                                        <>
                                            <FaCheck /> Confirmar Reserva
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* PASO 3: Confirmación */}
            {paso === 3 && reservaExitosa && (
                <div className="confirmation-section">
                    <div className="section-card confirmation-card">
                        <div className="confirmation-icon">
                            <FaCheck />
                        </div>
                        <h2>¡Reserva Confirmada!</h2>
                        <p className="confirmation-message">
                            Su turno ha sido reservado exitosamente.
                        </p>

                        <div className="confirmation-details">
                            <div className="detail-row">
                                <span className="detail-label">Fecha y hora:</span>
                                <span className="detail-value">{formatearFechaHora(reservaExitosa.fecha)}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Doctor:</span>
                                <span className="detail-value">
                                    {turnoSeleccionado.doctor?.nombre} - {turnoSeleccionado.doctor?.especialidad}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Paciente:</span>
                                <span className="detail-value">{datosInvitado.nombre}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">DNI:</span>
                                <span className="detail-value">{datosInvitado.dni}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Teléfono:</span>
                                <span className="detail-value">{datosInvitado.telefono}</span>
                            </div>
                            {archivoSubido && (
                                <div className="detail-row">
                                    <span className="detail-label">Archivo adjunto:</span>
                                    <span className="detail-value archivo-adjunto">
                                        {archivoSubido.tipoArchivo === 'pdf' ? <FaFilePdf /> : <FaFileImage />}
                                        {archivoSubido.nombreArchivo}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="confirmation-note">
                            <p>📋 Por favor, anote estos datos o tome una captura de pantalla.</p>
                            <p>📞 Si necesita cancelar o modificar su turno, comuníquese al teléfono de la clínica.</p>
                        </div>

                        <div className="confirmation-actions">
                            <button className="btn-imprimir" onClick={imprimirComprobante}>
                                <FaPrint /> Imprimir / Guardar PDF
                            </button>
                            <button className="btn-nueva-reserva" onClick={nuevaReserva}>
                                Realizar otra reserva
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
