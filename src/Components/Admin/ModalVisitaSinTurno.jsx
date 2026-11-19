import React, { useEffect, useMemo, useState } from "react";
import {
  FaSearch,
  FaTimes,
  FaUserPlus,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { PacienteApi } from "../../api/Paciente";
import { DoctoresApi } from "../../api/Doctores";
import { EstudiosApi } from "../../api/Estudios";
import { TurnosApi } from "../../api/Turnos";
import "./ModalVisitaSinTurno.css";

const pacienteApi = new PacienteApi();
const doctoresApi = new DoctoresApi();
const estudiosApi = new EstudiosApi();
const turnosApi = new TurnosApi();

const ESTADOS = [
  { value: "en_consulta", label: "En consulta / Asistió" },
  { value: "pendiente_informe", label: "Pendiente de informe" },
  { value: "informe_completado", label: "Informe completado" },
  { value: "agendado", label: "Agendado (sin atender aún)" },
];

const iniciales = (nombre) =>
  String(nombre || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.charAt(0))
    .join("")
    .toUpperCase() || "P";

const normalizarLista = (respuesta, clave) => {
  if (Array.isArray(respuesta)) return respuesta;
  if (respuesta && Array.isArray(respuesta[clave])) return respuesta[clave];
  return [];
};

export default function ModalVisitaSinTurno({
  open,
  onClose,
  onCreada,
  doctorSugerido = "",
}) {
  const [pacientes, setPacientes] = useState([]);
  const [doctores, setDoctores] = useState([]);
  const [estudios, setEstudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [pacienteId, setPacienteId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [estudioId, setEstudioId] = useState("");
  const [estadoAtencion, setEstadoAtencion] = useState("en_consulta");
  const [motivoConsulta, setMotivoConsulta] = useState("");

  useEffect(() => {
    if (!open) return;

    let vigente = true;
    setLoading(true);
    setError("");
    setBusqueda("");
    setPacienteId("");
    setDoctorId("");
    setEstudioId("");
    setEstadoAtencion("en_consulta");
    setMotivoConsulta("");

    const cargar = async () => {
      const [pacientesResultado, doctoresResultado, estudiosResultado] =
        await Promise.allSettled([
          pacienteApi.getPacientesShort(),
          doctoresApi.getDoctores(),
          estudiosApi.getEstudios(true),
        ]);

      if (!vigente) return;

      if (pacientesResultado.status === "fulfilled") {
        const lista = normalizarLista(pacientesResultado.value, "pacientes")
          .slice()
          .sort((a, b) =>
            String(a.nombre || "").localeCompare(String(b.nombre || ""), "es")
          );
        setPacientes(lista);
      } else {
        console.error(
          "Error al cargar pacientes:",
          pacientesResultado.reason
        );
        setPacientes([]);
        setError("No se pudo cargar la lista de pacientes.");
      }

      if (doctoresResultado.status === "fulfilled") {
        const lista = normalizarLista(doctoresResultado.value, "doctores")
          .slice()
          .sort((a, b) =>
            String(a.nombre || "").localeCompare(String(b.nombre || ""), "es")
          );
        setDoctores(lista);

        const sugerido = lista.some((doctor) => doctor._id === doctorSugerido)
          ? doctorSugerido
          : lista[0]?._id || "";
        setDoctorId(sugerido);
      } else {
        console.error(
          "Error al cargar profesionales:",
          doctoresResultado.reason
        );
        setDoctores([]);
      }

      if (estudiosResultado.status === "fulfilled") {
        const lista = normalizarLista(estudiosResultado.value, "estudios")
          .slice()
          .sort((a, b) =>
            String(a.tipo || "").localeCompare(String(b.tipo || ""), "es")
          );
        setEstudios(lista);
      } else {
        console.error("Error al cargar estudios:", estudiosResultado.reason);
        setEstudios([]);
      }

      setLoading(false);
    };

    cargar();

    return () => {
      vigente = false;
    };
  }, [open, doctorSugerido]);

  const pacienteSeleccionado = useMemo(
    () => pacientes.find((paciente) => paciente._id === pacienteId),
    [pacientes, pacienteId]
  );

  const pacientesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    const lista = pacientes.filter((paciente) => {
      if (!termino) return true;
      return (
        String(paciente.nombre || "").toLowerCase().includes(termino) ||
        String(paciente.dni || "").toLowerCase().includes(termino)
      );
    });

    return lista.slice(0, 8);
  }, [pacientes, busqueda]);

  if (!open) return null;

  const handleSubmit = async () => {
    setError("");

    if (!pacienteId) {
      setError("Seleccioná un paciente.");
      return;
    }

    if (!doctorId) {
      setError("Seleccioná un profesional.");
      return;
    }

    setGuardando(true);
    try {
      const resultado = await turnosApi.crearVisitaSinTurno({
        pacienteId,
        doctorId,
        estudioId: estudioId || null,
        estadoAtencion,
        motivoConsulta,
      });

      toast.success(
        resultado?.message || "Visita sin turno registrada correctamente"
      );
      onCreada?.(resultado);
      onClose?.();
    } catch (err) {
      console.error("Error al registrar visita sin turno:", err);
      setError(err.message || "No se pudo registrar la visita.");
      toast.error(err.message || "No se pudo registrar la visita");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div
      className="mvt-overlay"
      onClick={() => {
        if (!guardando) onClose?.();
      }}
    >
      <div className="mvt-modal" onClick={(event) => event.stopPropagation()}>
        <header className="mvt-header">
          <div>
            <span className="mvt-eyebrow">Bandeja de pacientes</span>
            <h3>Registrar visita sin turno</h3>
            <p>
              Para un paciente que llegó sin cita. Se registrará con la fecha y
              hora actual.
            </p>
          </div>
          <button
            type="button"
            className="mvt-close"
            onClick={onClose}
            disabled={guardando}
            aria-label="Cerrar"
          >
            <FaTimes />
          </button>
        </header>

        <div className="mvt-body">
          {loading ? (
            <div className="mvt-loading">
              <span className="mvt-spinner" />
              <p>Cargando pacientes y profesionales...</p>
            </div>
          ) : (
            <>
              <div className="mvt-field">
                <label>Paciente</label>

                {pacienteSeleccionado ? (
                  <div className="mvt-selected">
                    <span className="mvt-patient-avatar">
                      {iniciales(pacienteSeleccionado.nombre)}
                    </span>
                    <div>
                      <strong>{pacienteSeleccionado.nombre}</strong>
                      <small>
                        CI: {pacienteSeleccionado.dni || "Sin cédula"}
                      </small>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPacienteId("");
                        setBusqueda("");
                      }}
                    >
                      Cambiar
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mvt-search">
                      <FaSearch />
                      <input
                        type="text"
                        placeholder="Buscar por nombre o cédula..."
                        value={busqueda}
                        onChange={(event) => setBusqueda(event.target.value)}
                        autoFocus
                      />
                    </div>

                    <div className="mvt-patient-list">
                      {pacientesFiltrados.length === 0 ? (
                        <p className="mvt-empty">
                          No se encontraron pacientes con esa búsqueda.
                        </p>
                      ) : (
                        pacientesFiltrados.map((paciente) => (
                          <button
                            type="button"
                            key={paciente._id}
                            className="mvt-patient"
                            onClick={() => {
                              setPacienteId(paciente._id);
                              setError("");
                            }}
                          >
                            <span className="mvt-patient-avatar">
                              {iniciales(paciente.nombre)}
                            </span>
                            <span>
                              <strong>{paciente.nombre}</strong>
                              <small>CI: {paciente.dni || "Sin cédula"}</small>
                            </span>
                          </button>
                        ))
                      )}
                    </div>

                    {!busqueda.trim() && pacientes.length > 8 && (
                      <small className="mvt-hint">
                        Mostrando los primeros 8 de {pacientes.length}. Buscá
                        por nombre o cédula para encontrar otro.
                      </small>
                    )}
                  </>
                )}
              </div>

              <div className="mvt-grid">
                <div className="mvt-field">
                  <label>Profesional</label>
                  <select
                    value={doctorId}
                    onChange={(event) => setDoctorId(event.target.value)}
                  >
                    <option value="">Seleccionar profesional</option>
                    {doctores.map((doctor) => (
                      <option key={doctor._id} value={doctor._id}>
                        {doctor.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mvt-field">
                  <label>Estado inicial</label>
                  <select
                    value={estadoAtencion}
                    onChange={(event) =>
                      setEstadoAtencion(event.target.value)
                    }
                  >
                    {ESTADOS.map((estado) => (
                      <option key={estado.value} value={estado.value}>
                        {estado.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mvt-field">
                <label>
                  Estudio <span>(opcional)</span>
                </label>
                <select
                  value={estudioId}
                  onChange={(event) => setEstudioId(event.target.value)}
                >
                  <option value="">Sin estudio / consulta</option>
                  {estudios.map((estudio) => (
                    <option key={estudio._id} value={estudio._id}>
                      {estudio.tipo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mvt-field">
                <label>
                  Motivo o nota <span>(opcional)</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: control, dolor abdominal, consulta..."
                  value={motivoConsulta}
                  onChange={(event) => setMotivoConsulta(event.target.value)}
                />
              </div>

              <div className="mvt-note">
                <FaUserPlus />
                <span>
                  La visita aparecerá en la bandeja de hoy y, según el estado
                  elegido, también en la bandeja de atendidos. No se envía
                  correo de confirmación.
                </span>
              </div>

              {error && <div className="mvt-error">{error}</div>}
            </>
          )}
        </div>

        <footer className="mvt-footer">
          <button
            type="button"
            className="mvt-btn mvt-btn-ghost"
            onClick={onClose}
            disabled={guardando}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="mvt-btn mvt-btn-primary"
            onClick={handleSubmit}
            disabled={guardando || loading || !pacienteId}
          >
            {guardando ? "Registrando..." : "Registrar visita"}
          </button>
        </footer>
      </div>
    </div>
  );
}
