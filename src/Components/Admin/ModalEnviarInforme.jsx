import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FaCheckSquare,
  FaFilePdf,
  FaPaperPlane,
  FaSquare,
  FaTimes,
  FaUpload,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { EmailApi } from "../../api/Email";
import { TurnosApi } from "../../api/Turnos";
import { PacienteApi } from "../../api/Paciente";
import { ConfiguracionApi } from "../../api/Configuracion";
import "./ModalEnviarInforme.css";

const emailApi = new EmailApi();
const turnosApi = new TurnosApi();
const pacienteApi = new PacienteApi();
const configuracionApi = new ConfiguracionApi();

const ASUNTO_DEFAULT = "Tu informe médico está disponible - DoctoraEcos";
const mensajeDefault = (nombre) =>
  `Hola ${nombre || ""}, tu informe médico ya está disponible. Adjuntamos los archivos correspondientes.`;

const esPdf = (archivo) => {
  const url = String(archivo?.urlArchivo || "").toLowerCase();
  const tipo = String(archivo?.tipoArchivo || "").toLowerCase();
  const nombre = String(
    archivo?.nombreMostrar ||
      archivo?.nombreArchivo ||
      archivo?.originalFilename ||
      ""
  ).toLowerCase();
  return tipo === "pdf" || url.includes(".pdf") || nombre.endsWith(".pdf");
};

const nombreArchivo = (archivo) =>
  archivo.nombreMostrar ||
  archivo.nombreArchivo ||
  archivo.originalFilename ||
  "Documento.pdf";

export default function ModalEnviarInforme({
  open,
  onClose,
  paciente,
  turnoId = null,
  archivos = [],
  onSent,
  onEmailGuardado,
}) {
  const [seleccionados, setSeleccionados] = useState([]);
  const [asunto, setAsunto] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [emailDestino, setEmailDestino] = useState("");
  const [guardarEmail, setGuardarEmail] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [subiendoAdjunto, setSubiendoAdjunto] = useState(false);
  const [archivosExtra, setArchivosExtra] = useState([]);
  const [error, setError] = useState("");
  const editadoRef = useRef(false);

  const pdfs = useMemo(() => {
    const mapa = new Map();
    [...(Array.isArray(archivos) ? archivos : []), ...archivosExtra]
      .filter(esPdf)
      .forEach((archivo) => {
        if (archivo?.urlArchivo && !mapa.has(archivo.urlArchivo)) {
          mapa.set(archivo.urlArchivo, archivo);
        }
      });
    return [...mapa.values()];
  }, [archivos, archivosExtra]);

  useEffect(() => {
    if (!open) return;

    editadoRef.current = false;
    setSeleccionados(pdfs.map((archivo) => archivo.urlArchivo));
    setAsunto(ASUNTO_DEFAULT);
    setMensaje(mensajeDefault(paciente?.nombre));
    setEmailDestino(paciente?.email || "");
    setGuardarEmail(true);
    setArchivosExtra([]);
    setSubiendoAdjunto(false);
    setError("");
    setEnviando(false);

    let vigente = true;

    const cargarPlantillas = async () => {
      try {
        const config = await configuracionApi.getEmail();
        if (!vigente || editadoRef.current) return;
        const plantillas = config?.plantillas || {};
        if (plantillas.informeAsunto) setAsunto(plantillas.informeAsunto);
        if (plantillas.informeMensaje) setMensaje(plantillas.informeMensaje);
      } catch (error) {
        console.error("No se pudieron cargar las plantillas de correo:", error);
      }
    };

    cargarPlantillas();

    return () => {
      vigente = false;
    };
  }, [open, paciente?._id]);

  if (!open) return null;

  const toggleSeleccion = (url) => {
    setSeleccionados((prev) =>
      prev.includes(url) ? prev.filter((item) => item !== url) : [...prev, url]
    );
  };

  const toggleTodos = () => {
    setSeleccionados((prev) =>
      prev.length === pdfs.length
        ? []
        : pdfs.map((archivo) => archivo.urlArchivo)
    );
  };

  const handleAdjuntar = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const esArchivoPdf =
      file.type === "application/pdf" || /\.pdf$/i.test(file.name);

    if (!esArchivoPdf) {
      toast.error("Solo se permiten archivos PDF");
      event.target.value = "";
      return;
    }

    setSubiendoAdjunto(true);
    try {
      let nuevo = null;

      if (turnoId) {
        const result = await turnosApi.subirArchivoTurno(
          turnoId,
          file,
          file.name
        );
        const archivo =
          result?.archivo ||
          result?.turno?.archivosAdjuntos?.[
            result.turno.archivosAdjuntos.length - 1
          ];

        if (archivo?.urlArchivo) {
          nuevo = {
            ...archivo,
            nombreArchivo: file.name,
            nombreMostrar: file.name,
            tipoArchivo: "pdf",
            origen: "Adjuntado ahora",
          };
        }
      } else {
        const formData = new FormData();
        formData.append("dicoms", file);
        formData.append("nombreArchivo", "Informes enviados");
        const result = await pacienteApi.subirDocumento(
          paciente._id,
          formData
        );
        const subido = result?.archivosSubidos?.[0];

        if (subido?.urlArchivo) {
          nuevo = {
            urlArchivo: subido.urlArchivo,
            originalFilename: subido.originalFilename || file.name,
            nombreArchivo: file.name,
            nombreMostrar: file.name,
            tipoArchivo: "pdf",
            origen: "Informes enviados",
          };
        }
      }

      if (!nuevo) {
        toast.error("No se pudo adjuntar el PDF");
        return;
      }

      setArchivosExtra((prev) => [...prev, nuevo]);
      setSeleccionados((prev) => [
        ...new Set([...prev, nuevo.urlArchivo]),
      ]);
      toast.success("PDF adjuntado al correo");
    } catch (error) {
      console.error("Error al adjuntar PDF:", error);
      toast.error(error.message || "No se pudo adjuntar el PDF");
    } finally {
      setSubiendoAdjunto(false);
      event.target.value = "";
    }
  };

  const handleEnviar = async () => {
    if (!paciente?._id) {
      setError("No se encontró el paciente.");
      return;
    }

    const emailLimpio = emailDestino.trim();

    if (!emailLimpio) {
      setError("Ingresá un email para enviar el informe.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpio)) {
      setError("El email ingresado no es válido.");
      return;
    }

    setEnviando(true);
    setError("");

    try {
      if (guardarEmail && emailLimpio !== (paciente?.email || "")) {
        const actualizado = await pacienteApi.updatePaciente(paciente._id, {
          email: emailLimpio,
        });

        if (!actualizado?.ok) {
          throw new Error(
            actualizado?.message ||
              "No se pudo guardar el email en la ficha del paciente."
          );
        }

        onEmailGuardado?.(emailLimpio);
        toast.success("Email guardado en la ficha del paciente");
      }

      const adjuntos = pdfs
        .filter((archivo) => seleccionados.includes(archivo.urlArchivo))
        .map((archivo) => ({
          ...archivo,
          nombreArchivo: nombreArchivo(archivo),
        }));

      const result = await emailApi.enviarInforme({
        pacienteId: paciente._id,
        turnoId,
        asunto,
        mensaje,
        archivos: adjuntos,
        email: emailLimpio,
      });

      toast.success(result.message || "Correo enviado correctamente");
      if (result.omitidos?.length > 0) {
        toast(
          `${result.omitidos.length} archivo(s) no se pudieron adjuntar`,
          { icon: "⚠️" }
        );
      }
      onSent?.(result);
      onClose();
    } catch (err) {
      console.error("Error al enviar informe:", err);
      setError(err.message || "No se pudo enviar el correo.");
      toast.error(err.message || "No se pudo enviar el correo");
    } finally {
      setEnviando(false);
    }
  };

  const todosSeleccionados =
    pdfs.length > 0 && seleccionados.length === pdfs.length;

  return (
    <div className="mei-overlay" onClick={onClose}>
      <div className="mei-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mei-header">
          <div>
            <span className="mei-eyebrow">Correo al paciente</span>
            <h3>Enviar informe</h3>
          </div>
          <button
            type="button"
            className="mei-close"
            onClick={onClose}
            title="Cerrar"
          >
            <FaTimes />
          </button>
        </div>

        <div className="mei-body">
          <div className="mei-patient">
            <strong>{paciente?.nombre || "Paciente"}</strong>
            <span>{paciente?.email || "Sin email registrado"}</span>
          </div>

          {!paciente?.email && (
            <div className="mei-alert">
              El paciente no tiene email registrado. Ingresalo debajo para poder
              enviar el informe y, si querés, guardarlo en su ficha.
            </div>
          )}

          <label className="mei-field">
            <span>Email del paciente</span>
            <input
              type="email"
              value={emailDestino}
              onChange={(e) => setEmailDestino(e.target.value)}
              placeholder="correo@ejemplo.com"
              disabled={enviando}
            />
          </label>

          {emailDestino.trim() &&
            emailDestino.trim() !== (paciente?.email || "") && (
              <label className="mei-checkbox">
                <input
                  type="checkbox"
                  checked={guardarEmail}
                  onChange={(e) => setGuardarEmail(e.target.checked)}
                  disabled={enviando}
                />
                <span>Guardar este email en la ficha del paciente</span>
              </label>
            )}

          <label className="mei-field">
            <span>Asunto</span>
            <input
              type="text"
              value={asunto}
              onChange={(e) => {
                editadoRef.current = true;
                setAsunto(e.target.value);
              }}
              disabled={enviando}
            />
          </label>

          <label className="mei-field">
            <span>Mensaje</span>
            <textarea
              rows="4"
              value={mensaje}
              onChange={(e) => {
                editadoRef.current = true;
                setMensaje(e.target.value);
              }}
              disabled={enviando}
            />
          </label>

          <div className="mei-files">
            <div className="mei-files-header">
              <span>
                Archivos PDF {pdfs.length > 0 ? `(${pdfs.length})` : ""}
              </span>
              {pdfs.length > 0 && (
                <button
                  type="button"
                  className="mei-select-all"
                  onClick={toggleTodos}
                  disabled={enviando}
                >
                  {todosSeleccionados ? <FaCheckSquare /> : <FaSquare />}
                  {todosSeleccionados ? "Quitar todos" : "Seleccionar todos"}
                </button>
              )}
            </div>

            <div className="mei-upload-row">
              <label
                className={`mei-upload-btn ${
                  subiendoAdjunto || enviando ? "disabled" : ""
                }`}
              >
                <FaUpload />{" "}
                {subiendoAdjunto ? "Subiendo PDF..." : "Adjuntar PDF"}
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  hidden
                  onChange={handleAdjuntar}
                  disabled={subiendoAdjunto || enviando}
                />
              </label>
              <span className="mei-upload-hint">
                Se guarda en {turnoId ? "el turno" : "la ficha del paciente"} y
                se adjunta al correo.
              </span>
            </div>

            {pdfs.length === 0 ? (
              <p className="mei-empty">
                No hay PDFs disponibles para este paciente. Podés enviar un
                aviso por correo sin adjuntos.
              </p>
            ) : (
              <div className="mei-file-list">
                {pdfs.map((archivo) => {
                  const seleccionado = seleccionados.includes(
                    archivo.urlArchivo
                  );
                  return (
                    <label
                      key={archivo.urlArchivo}
                      className={`mei-file ${seleccionado ? "selected" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={seleccionado}
                        onChange={() => toggleSeleccion(archivo.urlArchivo)}
                        disabled={enviando}
                      />
                      <span className="mei-file-icon">
                        <FaFilePdf />
                      </span>
                      <span className="mei-file-info">
                        <strong>{nombreArchivo(archivo)}</strong>
                        {(archivo.origen || archivo.carpeta) && (
                          <small>{archivo.origen || archivo.carpeta}</small>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {error && <div className="mei-error">{error}</div>}
        </div>

        <div className="mei-footer">
          <button
            type="button"
            className="mei-btn mei-btn-ghost"
            onClick={onClose}
            disabled={enviando}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="mei-btn mei-btn-primary"
            onClick={handleEnviar}
            disabled={enviando || !emailDestino.trim()}
          >
            <FaPaperPlane /> {enviando ? "Enviando..." : "Enviar correo"}
          </button>
        </div>
      </div>
    </div>
  );
}
