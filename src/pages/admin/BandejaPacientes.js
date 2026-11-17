import React, { useCallback, useEffect, useMemo, useState } from "react";
import { TurnosApi } from "../../api/Turnos";
import { formatearHora } from "../../utils/dateHelpers";
import toast from "react-hot-toast";
import {
    FaCheckCircle,
    FaClipboardList,
    FaEnvelope,
    FaExclamationTriangle,
    FaRedo,
    FaSearch,
    FaUserClock,
    FaUserPlus,
} from "react-icons/fa";
import ModalEnviarInforme from "../../Components/Admin/ModalEnviarInforme";
import "./BandejaPacientes.css";

const turnosApi = new TurnosApi();

const ESTADO_CONFIG = {
    agendado: {
        label: "Agendado",
        className: "estado-agendado",
        next: "en_consulta",
        nextLabel: "Iniciar consulta",
        icon: <FaUserClock />,
    },
    en_consulta: {
        label: "En consulta / Asistió",
        className: "estado-en-consulta",
        next: "pendiente_informe",
        nextLabel: "Pendiente de informe",
        icon: <FaClipboardList />,
    },
    pendiente_informe: {
        label: "Pendiente por informe",
        className: "estado-pendiente",
        next: "informe_completado",
        nextLabel: "Informe completado",
        icon: <FaExclamationTriangle />,
    },
    informe_completado: {
        label: "Informe completado",
        className: "estado-completado",
        next: null,
        nextLabel: null,
        icon: <FaCheckCircle />,
    },
};

const getEstadoConfig = (turno) =>
    ESTADO_CONFIG[turno.estadoAtencion] || ESTADO_CONFIG.agendado;

const nombrePaciente = (turno) =>
    turno.paciente?.nombre ||
    turno.pacienteNoRegistrado?.nombre ||
    "Sin paciente";

const dniPaciente = (turno) =>
    turno.paciente?.dni || turno.pacienteNoRegistrado?.dni || "-";

const telefonoPaciente = (turno) =>
    turno.paciente?.telefono || turno.pacienteNoRegistrado?.telefono || "-";

const tipoPacienteConfig = {
    primera_vez: { label: "Primera vez", className: "tipo-primera" },
    control: { label: "Control", className: "tipo-control" },
    invitado: { label: "Invitado", className: "tipo-invitado" },
};

export default function BandejaPacientes() {
    const [turnos, setTurnos] = useState([]);
    const [emailTurno, setEmailTurno] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroEstado, setFiltroEstado] = useState("todos");
    const [busqueda, setBusqueda] = useState("");
    const [actualizandoId, setActualizandoId] = useState(null);

    const cargarBandeja = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await turnosApi.obtenerBandejaDelDia();
            setTurnos(Array.isArray(response) ? response : []);
        } catch (err) {
            console.error("Error al cargar la bandeja:", err);
            setError(err.message || "Error al cargar la bandeja del día");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarBandeja();
    }, [cargarBandeja]);

    const resumen = useMemo(() => {
        return turnos.reduce(
            (acc, turno) => {
                const estado = turno.estadoAtencion || "agendado";
                acc.total += 1;
                if (turno.esDeHoy) acc.hoy += 1;
                else acc.backlog += 1;
                if (estado === "agendado") acc.agendados += 1;
                if (estado === "en_consulta") acc.enConsulta += 1;
                if (estado === "pendiente_informe") acc.pendientes += 1;
                if (estado === "informe_completado") acc.completados += 1;
                return acc;
            },
            {
                total: 0,
                hoy: 0,
                backlog: 0,
                agendados: 0,
                enConsulta: 0,
                pendientes: 0,
                completados: 0,
            }
        );
    }, [turnos]);

    const turnosFiltrados = useMemo(() => {
        let lista = turnos;

        if (filtroEstado === "pendientes_trabajo") {
            lista = lista.filter((turno) =>
                ["agendado", "en_consulta", "pendiente_informe"].includes(
                    turno.estadoAtencion || "agendado"
                )
            );
        } else if (filtroEstado !== "todos") {
            lista = lista.filter(
                (turno) => (turno.estadoAtencion || "agendado") === filtroEstado
            );
        }

        if (!busqueda.trim()) return lista;

        const termino = busqueda.toLowerCase();
        return lista.filter((turno) => {
            const nombre = nombrePaciente(turno).toLowerCase();
            const dni = String(dniPaciente(turno)).toLowerCase();
            const estudio = (turno.estudio?.tipo || "").toLowerCase();
            return (
                nombre.includes(termino) ||
                dni.includes(termino) ||
                estudio.includes(termino)
            );
        });
    }, [turnos, filtroEstado, busqueda]);

    const handleAvanzar = async (turno) => {
        const config = getEstadoConfig(turno);
        if (!config.next) return;

        if (config.next === "informe_completado") {
            const confirmar = window.confirm(
                `¿Marcar el informe de ${nombrePaciente(turno)} como completado?`
            );
            if (!confirmar) return;
        }

        setActualizandoId(turno._id);
        try {
            const resultado = await turnosApi.actualizarEstadoAtencion(
                turno._id,
                config.next
            );

            if (config.next === "informe_completado") {
                if (resultado?.emailEnviado) {
                    toast.success(
                        "Informe completado y correo enviado al paciente"
                    );
                } else if (resultado?.emailMotivo) {
                    toast(`Informe completado. ${resultado.emailMotivo}`, {
                        icon: "⚠️",
                    });
                } else {
                    toast.success("Informe completado");
                }

                if (resultado?.emailOmitidos?.length > 0) {
                    toast(
                        `${resultado.emailOmitidos.length} archivo(s) no se pudieron adjuntar`,
                        { icon: "⚠️" }
                    );
                }
            } else {
                toast.success("Estado de atención actualizado");
            }

            await cargarBandeja();
        } catch (err) {
            console.error("Error al actualizar estado:", err);
            toast.error(err.message || "Error al actualizar el estado");
        } finally {
            setActualizandoId(null);
        }
    };

    const handleEmailGuardado = (email) => {
        setEmailTurno((prev) =>
            prev
                ? { ...prev, paciente: { ...prev.paciente, email } }
                : prev
        );
        cargarBandeja();
    };

    const filtros = [
        { key: "todos", label: "Todos", count: resumen.total },
        {
            key: "pendientes_trabajo",
            label: "En trabajo",
            count:
                resumen.agendados + resumen.enConsulta + resumen.pendientes,
        },
        { key: "agendado", label: "Agendados", count: resumen.agendados },
        { key: "en_consulta", label: "En consulta", count: resumen.enConsulta },
        {
            key: "pendiente_informe",
            label: "Pendientes de informe",
            count: resumen.pendientes,
        },
        {
            key: "informe_completado",
            label: "Completados",
            count: resumen.completados,
        },
    ];

    return (
        <div className="bandeja-page">
            <div className="bandeja-header">
                <div>
                    <h1>Bandeja de Pacientes del Día</h1>
                    <p>
                        Citas de hoy y controles. El estado se gestiona por cita e
                        informe, no por historial del paciente.
                    </p>
                </div>
                <button
                    className="btn-refresh-bandeja"
                    onClick={cargarBandeja}
                    disabled={loading}
                >
                    <FaRedo /> Actualizar
                </button>
            </div>

            <div className="bandeja-alerta-persistencia">
                <FaExclamationTriangle />
                <span>
                    Los pacientes atendidos permanecen en la lista de trabajo hasta
                    que su informe cambie a <strong>Completado</strong>.{" "}
                    <strong>{resumen.hoy}</strong> citas de hoy y{" "}
                    <strong>{resumen.backlog}</strong> pendientes de días anteriores.
                </span>
            </div>

            <div className="bandeja-resumen">
                <button
                    className={`resumen-card ${filtroEstado === "todos" ? "active" : ""}`}
                    onClick={() => setFiltroEstado("todos")}
                >
                    <span className="resumen-numero">{resumen.total}</span>
                    <span className="resumen-label">Total en bandeja</span>
                </button>
                <button
                    className={`resumen-card agendado ${filtroEstado === "agendado" ? "active" : ""}`}
                    onClick={() => setFiltroEstado("agendado")}
                >
                    <span className="resumen-numero">{resumen.agendados}</span>
                    <span className="resumen-label">Agendados</span>
                </button>
                <button
                    className={`resumen-card en-consulta ${filtroEstado === "en_consulta" ? "active" : ""}`}
                    onClick={() => setFiltroEstado("en_consulta")}
                >
                    <span className="resumen-numero">{resumen.enConsulta}</span>
                    <span className="resumen-label">En consulta</span>
                </button>
                <button
                    className={`resumen-card pendiente ${filtroEstado === "pendiente_informe" ? "active" : ""}`}
                    onClick={() => setFiltroEstado("pendiente_informe")}
                >
                    <span className="resumen-numero">{resumen.pendientes}</span>
                    <span className="resumen-label">Pendientes de informe</span>
                </button>
                <button
                    className={`resumen-card completado ${filtroEstado === "informe_completado" ? "active" : ""}`}
                    onClick={() => setFiltroEstado("informe_completado")}
                >
                    <span className="resumen-numero">{resumen.completados}</span>
                    <span className="resumen-label">Completados</span>
                </button>
            </div>

            <div className="bandeja-controles">
                <div className="bandeja-filtros">
                    {filtros.map((filtro) => (
                        <button
                            key={filtro.key}
                            className={`filtro-chip ${filtroEstado === filtro.key ? "active" : ""}`}
                            onClick={() => setFiltroEstado(filtro.key)}
                        >
                            {filtro.label}
                            <span className="chip-count">{filtro.count}</span>
                        </button>
                    ))}
                </div>
                <div className="bandeja-buscador">
                    <FaSearch />
                    <input
                        type="text"
                        placeholder="Buscar por paciente, DNI o estudio..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="bandeja-loading">
                    <div className="spinner"></div>
                    <p>Cargando pacientes del día...</p>
                </div>
            ) : error ? (
                <div className="bandeja-error">
                    <FaExclamationTriangle />
                    <p>{error}</p>
                    <button onClick={cargarBandeja}>Reintentar</button>
                </div>
            ) : turnosFiltrados.length === 0 ? (
                <div className="bandeja-vacia">
                    <FaClipboardList />
                    <h3>No hay pacientes para mostrar</h3>
                    <p>
                        {turnos.length === 0
                            ? "Todavía no hay citas reservadas para hoy."
                            : "Ningún paciente coincide con el filtro seleccionado."}
                    </p>
                </div>
            ) : (
                <div className="bandeja-tabla-wrapper">
                    <table className="bandeja-tabla">
                        <thead>
                            <tr>
                                <th>Hora</th>
                                <th>Paciente</th>
                                <th>Tipo</th>
                                <th>Estudio</th>
                                <th>Estado de atención</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {turnosFiltrados.map((turno) => {
                                const config = getEstadoConfig(turno);
                                const tipo =
                                    tipoPacienteConfig[turno.tipoPaciente] ||
                                    tipoPacienteConfig.invitado;
                                const actualizando = actualizandoId === turno._id;

                                return (
                                    <tr
                                        key={turno._id}
                                        className={`bandeja-row ${config.className} ${turno.estadoAtencion === "pendiente_informe" ? "fila-alerta" : ""}`}
                                    >
                                        <td className="hora-cell">
                                            <div className="hora-principal">
                                                {formatearHora(turno.fecha)}
                                            </div>
                                            <div className="fecha-secundaria">
                                                {turno.esDeHoy
                                                    ? "Hoy"
                                                    : new Date(turno.fecha).toLocaleDateString("es-ES")}
                                            </div>
                                            {!turno.esDeHoy && (
                                                <span className="badge-backlog">
                                                    Pendiente anterior
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="paciente-nombre">
                                                {nombrePaciente(turno)}
                                            </div>
                                            <div className="paciente-meta">
                                                CI: {dniPaciente(turno)} · Tel:{" "}
                                                {telefonoPaciente(turno)}
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`tipo-badge ${tipo.className}`}>
                                                {turno.tipoPaciente === "primera_vez" && (
                                                    <FaUserPlus />
                                                )}
                                                {tipo.label}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="estudio-nombre">
                                                {turno.estudio?.tipo || "Sin estudio"}
                                            </div>
                                            {turno.motivoConsulta && (
                                                <div className="estudio-motivo">
                                                    {turno.motivoConsulta}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            <span
                                                className={`estado-badge ${config.className} ${turno.estadoAtencion === "pendiente_informe" ? "pulso" : ""}`}
                                            >
                                                {config.icon}
                                                {config.label}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="bandeja-acciones">
                                                {config.next ? (
                                                    <button
                                                        className="btn-avanzar-estado"
                                                        onClick={() => handleAvanzar(turno)}
                                                        disabled={actualizando}
                                                    >
                                                        {actualizando
                                                            ? "Guardando..."
                                                            : config.nextLabel}
                                                    </button>
                                                ) : (
                                                    <span className="completado-texto">
                                                        <FaCheckCircle /> Completado
                                                    </span>
                                                )}
                                                {turno.paciente && (
                                                    <button
                                                        type="button"
                                                        className="btn-email-paciente"
                                                        title="Enviar informe por correo"
                                                        onClick={() => setEmailTurno(turno)}
                                                    >
                                                        <FaEnvelope />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {emailTurno && (
                <ModalEnviarInforme
                    open={!!emailTurno}
                    onClose={() => setEmailTurno(null)}
                    paciente={emailTurno.paciente}
                    turnoId={emailTurno._id}
                    archivos={(emailTurno.archivosAdjuntos || []).map((archivo) => ({
                        ...archivo,
                        origen: `Turno del ${new Date(
                            emailTurno.fecha
                        ).toLocaleDateString("es-ES")}`,
                    }))}
                    onEmailGuardado={handleEmailGuardado}
                />
            )}
        </div>
    );
}
