import React, { useState } from "react";
import {
  FaPhone,
  FaEnvelope,
  FaDownload,
  FaPlus,
  FaCalendarAlt,
  FaUserMd,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import avatar from "../../assets/vitalmed/avatar.png";
import ToastMessage from "../../utils/ToastMessage";
import Loader from "../../utils/Loader";
import Breadcrumbs from "../../utils/Breadcums";
import { usePaciente } from "../../hooks/usePacienteIndividual";
import "./VerPaciente.css";
import { LoaderIcon } from "react-hot-toast";
import { Icon } from "semantic-ui-react";

export default function VerPaciente({ notificacion }) {
  const showToast = (message, type) => {
    setToast({ message, type });
  };
  const { state, dispatch, user, handleUpload, setNombreArchivo, setArchivos } =
    usePaciente({ showToast });

  const [toast, setToast] = useState(null);

  if (!state.paciente) return <Loader />;

  return (
    <div className="paciente-container">
      <Breadcrumbs />
      <div className="paciente-header">
        <img
          src={state.paciente.avatar || avatar}
          alt="Paciente"
          className="paciente-avatar"
        />
        <div className="paciente-info">
          <h2>{state.paciente.nombre || "No especifica"}</h2>
          <p>
            {state.paciente.dni
              ? `DNI: ${state.paciente.dni}`
              : "No especifica"}
          </p>
          <div className="contact-info">
            <p>
              <FaPhone /> {state.paciente.telefono || "No especifica"}
            </p>
            <p>
              <FaEnvelope /> {state.paciente.email || "No especifica"}
            </p>
          </div>
        </div>
      </div>
      <div className="visit-info">
        <h3>Información de la visita</h3>
        <p>
          <FaCalendarAlt /> Fecha:{" "}
          {state.paciente.created_at
            ? new Date(state.paciente.created_at).toLocaleDateString()
            : "No especifica"}
        </p>
        <p>
          <FaUserMd /> Médico Asignado: No especifica
        </p>
        <p>Razón de consulta: No especifica</p>
      </div>

      <div className="emergency-contact">
        <h3>Contacto de emergencia</h3>
        <p>
          <FaPhone /> No especifica
        </p>
      </div>

      <div className="documentos">
        <div className="doc-header">
          <h3 className="titulo-doc">Documentos del Paciente</h3>
          {user.rol !== "paciente" && (
            <button
              className="btn-upload"
              onClick={() => dispatch({ type: "TOGGLE_MODAL" })}
            >
              <FaPlus /> {"Subir Archivo"}
            </button>
          )}
        </div>
        {state.documentos.length > 0 ? (
          <div className="carpetas">
            {state.documentos.map((doc, index) => (
              <Carpeta key={index} doc={doc} />
            ))}
          </div>
        ) : (
          <p>No hay documentos disponibles</p>
        )}
      </div>

      {state.modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Subir Documentos</h3>
              <FaTimes
                className="close-icon"
                onClick={() => dispatch({ type: "TOGGLE_MODAL" })}
              />
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="Nombre del archivo (general)"
                value={state.nombreArchivo}
                onChange={(e) => setNombreArchivo(e.target.value)}
              />
              <input
                type="file"
                multiple
                onChange={(e) => setArchivos(Array.from(e.target.files))}
              />

              {state.archivos.length > 0 && (
                <div className="file-preview">
                  <strong>Archivos seleccionados:</strong>
                  <ul>
                    {state.archivos.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button className="btn-submit" onClick={handleUpload}>
                {state.loadingFile ? (
                  <LoaderIcon className="loader-icon" />
                ) : (
                  "Subir Archivos"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

// Componente para el acordeón de carpetas
const Carpeta = ({ doc }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleFiles = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="carpeta">
      <div className="carpeta-header" onClick={toggleFiles}>
        <p className="nombre-carpeta">
          <Icon className="icon" name="folder" color="black" size="large" />
          {"   "}
          {doc.nombreArchivo || "Sin nombre"}
        </p>
        <button className="btn-toggle">
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>
      {isOpen && (
        <div className="archivos">
          {doc.archivos.map((archivo) => (
            <div className="archivo" key={archivo._id}>
              <span className="archivo-nombre">{archivo.originalFilename}</span>
              <span className="archivo-fecha">
                {new Date(archivo.fechaSubida).toLocaleDateString()}
              </span>
              <a
                href={archivo.urlArchivo}
                target="_blank"
                rel="noreferrer"
                className="btn-descargar"
              >
                <FaDownload /> Descargar
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
