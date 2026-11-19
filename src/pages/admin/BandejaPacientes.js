import React, { useCallback, useEffect, useMemo, useState } from "react";
import { TurnosApi } from "../../api/Turnos";
import { formatearHora } from "../../utils/dateHelpers";
import toast from "react-hot-toast";
import {
  FaCheckCircle,
  FaChevronDown,
  FaClipboardList,
  FaEnvelope,
  FaExclamationTriangle,
  FaRedo,
  FaSearch,
  FaUserClock,
  FaUserPlus,
} from "react-icons/fa";
import ModalEnviarInforme from "../../Components/Admin/ModalEnviarInforme";
import ModalVisitaSinTurno from "../../Components/Admin/ModalVisitaSinTurno";
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

const filtrarTurnos = (lista, filtroEstado, busqueda) => {
  let resultado = lista;

  if (filtroEstado === "pendientes_trabajo") {
    resultado = resultado.filter((turno) =>
      ["agendado", "en_consulta", "pendiente_informe"].includes(
        turno.estadoAtencion || "agendado"
      )
    );
  } else if (filtroEstado !== "todos") {
    resultado = resultado.filter(
      (turno) => (turno.estadoAtencion || "agendado") === filtroEstado
    );
  }

  const termino = busqueda.trim().toLowerCase();
  if (!termino) return resultado;

  return resultado.filter((turno) => {
    const nombre = nombrePaciente(turno).toLowerCase();
    const dni = String(dniPaciente(turno)).toLowerCase();
    const estudio = (turno.estudio?.tipo || "").toLowerCase();
    return (
      nombre.includes(termino) ||
      dni.includes(termino) ||
      estudio.includes(termino)
    );
  });
};

function EstadoSelector({ turno, onChange, disabled }) {
  const config = getEstadoConfig(turno);
  const estado = turno.estadoAtencion || "agendado";

  return (
    <span
      className={`estado-editor ${config.className} ${
        estado === "pendiente_informe" ? "pulso" : ""
      }`}
    >
      <span className="estado-editor-icon">{config.icon}</span>
      <select
        className="estado-editor-select"
        value={estado}
        onChange={(event) => onChange(turno, event.target.value, event)}
        disabled={disabled}
        aria-label={`Cambiar estado de ${nombrePaciente(turno)}`}
        title="Cambiar estado de atención"
      >
        {Object.entries(ESTADO_CONFIG).map(([key, estadoConfig]) => (
          <option key={key} value={key}>
            {estadoConfig.label}
          </option>
        ))}
      </select>
      <FaChevronDown className="estado-editor-chevron" />
    </span>
  );
}

function BandejaVacia({ icono, titulo, texto }) {
  return (
    <div className="bandeja-vacia">
      {icono}
      <h3>{titulo}</h3>
      <p>{texto}</p>
    </div>
  );
}

function TablaBandeja({
  turnos,
  actualizandoId,
  onAvanzar,
  onCambiarEstado,
  onEmail,
  tituloHora = "Hora",
}) {
  return (
    <div className="bandeja-tabla-wrapper">
      <table className="bandeja-tabla">
        <thead>
          <tr>
            <th>{tituloHora}</th>
            <th>Paciente</th>
            <th>Tipo</th>
            <th>Estudio</th>
            <th>Estado de atención</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {turnos.map((turno) => {
            const config = getEstadoConfig(turno);
            const estado = turno.estadoAtencion || "agendado";
            const tipo =
              tipoPacienteConfig[turno.tipoPaciente] ||
              tipoPacienteConfig.invitado;
            const actualizando = actualizandoId === turno._id;

            return (
              <tr
                key={turno._id}
                className={`bandeja-row ${config.className} ${
                  estado === "pendiente_informe" ? "fila-alerta" : ""
                }`}
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
                  {!turno.esDeHoy &&
                    ["en_consulta", "pendiente_informe"].includes(estado) && (
                      <span className="badge-backlog">
                        Pendiente anterior
                      </span>
                    )}
                  {!turno.esDeHoy && estado === "informe_completado" && (
                    <span className="badge-historico">Histórico</span>
                  )}
                </td>
                <td>
                  <div className="paciente-nombre">
                    {nombrePaciente(turno)}
                    {turno.esVisitaEspontanea && (
                      <span className="badge-sin-turno">Sin turno</span>
                    )}
                  </div>
                  <div className="paciente-meta">
                    CI: {dniPaciente(turno)} · Tel:{" "}
                    {telefonoPaciente(turno)}
                  </div>
                </td>
                <td>
                  <span className={`tipo-badge ${tipo.className}`}>
                    {turno.tipoPaciente === "primera_vez" && <FaUserPlus />}
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
                  <EstadoSelector
                    turno={turno}
                    onChange={onCambiarEstado}
                    disabled={actualizando}
                  />
                </td>
                <td>
                  <div className="bandeja-acciones">
                    {config.next ? (
                      <button
                        className="btn-avanzar-estado"
                        onClick={() => onAvanzar(turno)}
                        disabled={actualizando}
                      >
                        {actualizando ? "Guardando..." : config.nextLabel}
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
                        onClick={() => onEmail(turno)}
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
  );
}

export default function BandejaPacientes() {
  const [turnosHoy, setTurnosHoy] = useState([]);
  const [atendidos, setAtendidos] = useState([]);
  const [emailTurno, setEmailTurno] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorAtendidos, setErrorAtendidos] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [busqueda, setBusqueda] = useState("");
  const [actualizandoId, setActualizandoId] = useState(null);
  const [visitaModalOpen, setVisitaModalOpen] = useState(false);

  const cargarBandeja = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorAtendidos(null);

    try {
      const [resultadoHoy, resultadoAtendidos] = await Promise.allSettled([
        turnosApi.obtenerBandejaDelDia(),
        turnosApi.obtenerBandejaAtendidos(),
      ]);

      if (resultadoHoy.status === "rejected") {
        throw resultadoHoy.reason;
      }

      const hoy = Array.isArray(resultadoHoy.value)
        ? resultadoHoy.value.filter((turno) => turno.esDeHoy)
        : [];
      setTurnosHoy(hoy);

      if (resultadoAtendidos.status === "fulfilled") {
        setAtendidos(
          Array.isArray(resultadoAtendidos.value)
            ? resultadoAtendidos.value
            : []
        );
      } else {
        console.error(
          "Error al cargar la bandeja de atendidos:",
          resultadoAtendidos.reason
        );
        setAtendidos([]);
        setErrorAtendidos(
          resultadoAtendidos.reason?.message ||
            "No se pudo cargar la bandeja de pacientes atendidos."
        );
      }
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

  const todosUnicos = useMemo(() => {
    const mapa = new Map();
    [...turnosHoy, ...atendidos].forEach((turno) => {
      if (turno?._id) mapa.set(String(turno._id), turno);
    });
    return [...mapa.values()];
  }, [turnosHoy, atendidos]);

  const resumen = useMemo(() => {
    return todosUnicos.reduce(
      (acc, turno) => {
        const estado = turno.estadoAtencion || "agendado";
        acc.total += 1;
        if (turno.esDeHoy) acc.hoy += 1;
        if (estado === "agendado") acc.agendados += 1;
        if (estado === "en_consulta") acc.enConsulta += 1;
        if (estado === "pendiente_informe") acc.pendientes += 1;
        if (estado === "informe_completado") acc.completados += 1;
        return acc;
      },
      {
        total: 0,
        hoy: 0,
        agendados: 0,
        enConsulta: 0,
        pendientes: 0,
        completados: 0,
      }
    );
  }, [todosUnicos]);

  const turnosHoyFiltrados = useMemo(
    () => filtrarTurnos(turnosHoy, filtroEstado, busqueda),
    [turnosHoy, filtroEstado, busqueda]
  );

  const atendidosFiltrados = useMemo(
    () => filtrarTurnos(atendidos, filtroEstado, busqueda),
    [atendidos, filtroEstado, busqueda]
  );

  const handleCambiarEstado = async (turno, nuevoEstado, event) => {
    const estadoActual = turno.estadoAtencion || "agendado";
    if (nuevoEstado === estadoActual) return;

    if (nuevoEstado === "informe_completado") {
      const confirmar = window.confirm(
        `¿Marcar el informe de ${nombrePaciente(turno)} como completado?`
      );
      if (!confirmar) {
        if (event) event.target.value = estadoActual;
        return;
      }
    }

    setActualizandoId(turno._id);
    try {
      const resultado = await turnosApi.actualizarEstadoAtencion(
        turno._id,
        nuevoEstado
      );

      if (nuevoEstado === "informe_completado") {
        if (resultado?.emailEnviado) {
          toast.success("Informe completado y correo enviado al paciente");
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
      if (event) event.target.value = estadoActual;
    } finally {
      setActualizandoId(null);
    }
  };

  const handleAvanzar = (turno) => {
    const config = getEstadoConfig(turno);
    if (!config.next) return;
    handleCambiarEstado(turno, config.next);
  };

  const handleEmailGuardado = (email) => {
    const actualizarEmail = (lista) =>
      lista.map((turno) =>
        turno._id === emailTurno?._id
          ? { ...turno, paciente: { ...turno.paciente, email } }
          : turno
      );

    setTurnosHoy(actualizarEmail);
    setAtendidos(actualizarEmail);
    setEmailTurno((prev) =>
      prev ? { ...prev, paciente: { ...prev.paciente, email } } : prev
    );
    cargarBandeja();
  };

  const irASeccion = (id) => {
    setFiltroEstado("todos");
    setBusqueda("");
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const filtros = [
    { key: "todos", label: "Todos", count: resumen.total },
    {
      key: "pendientes_trabajo",
      label: "En trabajo",
      count: resumen.agendados + resumen.enConsulta + resumen.pendientes,
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

  const doctorSugerido =
    turnosHoy[0]?.doctor?._id || atendidos[0]?.doctor?._id || "";

  return (
    <div className="bandeja-page">
      <div className="bandeja-header">
        <div>
          <h1>Bandeja de Pacientes</h1>
          <p>
            Citas de hoy y seguimiento de todos los pacientes que concurrieron
            a una cita.
          </p>
        </div>
        <div className="bandeja-header-actions">
          <button
            className="btn-visita-sin-turno"
            onClick={() => setVisitaModalOpen(true)}
          >
            <FaUserPlus /> Visita sin turno
          </button>
          <button
            className="btn-refresh-bandeja"
            onClick={cargarBandeja}
            disabled={loading}
          >
            <FaRedo /> Actualizar
          </button>
        </div>
      </div>

      <div className="bandeja-alerta-persistencia">
        <FaExclamationTriangle />
        <span>
          Hoy hay <strong>{resumen.hoy}</strong> citas. La bandeja de atendidos
          reúne <strong>{atendidos.length}</strong> pacientes que concurrieron,
          incluso de fechas anteriores.
        </span>
      </div>

      <div className="bandeja-resumen">
        <button
          className="resumen-card hoy"
          onClick={() => irASeccion("citas-hoy")}
        >
          <span className="resumen-numero">{resumen.hoy}</span>
          <span className="resumen-label">Citas de hoy</span>
        </button>

        <button
          className="resumen-card atendidos"
          onClick={() => irASeccion("atendidos")}
        >
          <span className="resumen-numero">{atendidos.length}</span>
          <span className="resumen-label">Pacientes atendidos</span>
        </button>

        <button
          className={`resumen-card agendado ${
            filtroEstado === "agendado" ? "active" : ""
          }`}
          onClick={() => setFiltroEstado("agendado")}
        >
          <span className="resumen-numero">{resumen.agendados}</span>
          <span className="resumen-label">Agendados</span>
        </button>

        <button
          className={`resumen-card en-consulta ${
            filtroEstado === "en_consulta" ? "active" : ""
          }`}
          onClick={() => setFiltroEstado("en_consulta")}
        >
          <span className="resumen-numero">{resumen.enConsulta}</span>
          <span className="resumen-label">En consulta</span>
        </button>

        <button
          className={`resumen-card pendiente ${
            filtroEstado === "pendiente_informe" ? "active" : ""
          }`}
          onClick={() => setFiltroEstado("pendiente_informe")}
        >
          <span className="resumen-numero">{resumen.pendientes}</span>
          <span className="resumen-label">Pendientes de informe</span>
        </button>

        <button
          className={`resumen-card completado ${
            filtroEstado === "informe_completado" ? "active" : ""
          }`}
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
              className={`filtro-chip ${
                filtroEstado === filtro.key ? "active" : ""
              }`}
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
            onChange={(event) => setBusqueda(event.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="bandeja-loading">
          <div className="spinner"></div>
          <p>Cargando pacientes...</p>
        </div>
      ) : error ? (
        <div className="bandeja-error">
          <FaExclamationTriangle />
          <p>{error}</p>
          <button onClick={cargarBandeja}>Reintentar</button>
        </div>
      ) : (
        <>
          <section className="bandeja-seccion" id="citas-hoy">
            <div className="bandeja-seccion-head">
              <div>
                <h2>
                  <FaUserClock /> Citas de hoy
                </h2>
                <p>Pacientes con turno para hoy.</p>
              </div>
              <span className="bandeja-seccion-count">
                {turnosHoyFiltrados.length}
              </span>
            </div>

            {turnosHoyFiltrados.length === 0 ? (
              <BandejaVacia
                icono={<FaUserClock />}
                titulo="No hay citas para hoy"
                texto={
                  turnosHoy.length === 0
                    ? "Todavía no hay turnos reservados para hoy."
                    : "Ninguna cita coincide con el filtro o la búsqueda."
                }
              />
            ) : (
              <TablaBandeja
                turnos={turnosHoyFiltrados}
                actualizandoId={actualizandoId}
                onAvanzar={handleAvanzar}
                onCambiarEstado={handleCambiarEstado}
                onEmail={setEmailTurno}
                tituloHora="Hora"
              />
            )}
          </section>

          <section className="bandeja-seccion" id="atendidos">
            <div className="bandeja-seccion-head">
              <div>
                <h2>
                  <FaClipboardList /> Pacientes atendidos
                </h2>
                <p>
                  Todos los que concurrieron a una cita, incluso de fechas
                  anteriores.
                </p>
              </div>
              <span className="bandeja-seccion-count">
                {atendidosFiltrados.length}
              </span>
            </div>

            {errorAtendidos ? (
              <div className="bandeja-seccion-alerta">
                <FaExclamationTriangle />
                <span>{errorAtendidos}</span>
              </div>
            ) : atendidosFiltrados.length === 0 ? (
              <BandejaVacia
                icono={<FaClipboardList />}
                titulo="Todavía no hay pacientes atendidos"
                texto={
                  atendidos.length === 0
                    ? "Cuando un paciente pase a “En consulta” aparecerá en esta bandeja."
                    : "Ninguno coincide con el filtro o la búsqueda."
                }
              />
            ) : (
              <TablaBandeja
                turnos={atendidosFiltrados}
                actualizandoId={actualizandoId}
                onAvanzar={handleAvanzar}
                onCambiarEstado={handleCambiarEstado}
                onEmail={setEmailTurno}
                tituloHora="Fecha / hora"
              />
            )}
          </section>
        </>
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

      <ModalVisitaSinTurno
        open={visitaModalOpen}
        onClose={() => setVisitaModalOpen(false)}
        onCreada={() => {
          setVisitaModalOpen(false);
          cargarBandeja();
        }}
        doctorSugerido={doctorSugerido}
      />
    </div>
  );
}
