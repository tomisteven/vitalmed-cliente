import React from "react";
import {
  FaPhone,
  FaEnvelope,
  FaDownload,
  FaPlus,
  FaCalendarAlt,
  FaUserMd,
  FaTimes,
} from "react-icons/fa";
import avatar from "../../assets/vitalmed/avatar.png";
import { toast } from "react-toastify";
import Loader from "../../utils/Loader";
import Breadcrumbs from "../../utils/Breadcums";
import { usePaciente } from "../../hooks/usePacienteIndividual";
import "./VerPaciente.css";
import { LoaderIcon } from "react-hot-toast";

export default function VerPaciente() {
  const { state, dispatch, user, handleUpload, setNombreArchivo, setArchivo } =
    usePaciente();

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
          <table className="document-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Fecha</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {state.documentos.map((doc, index) => (
                <tr key={index}>
                  <td>{doc.nombreArchivo || "Sin nombre"}</td>
                  <td>
                    {doc.fechaSubida
                      ? new Date(doc.fechaSubida).toLocaleDateString()
                      : "No especifica"}
                  </td>
                  <td>
                    <a href={doc.urlArchivo} target="_blank" rel="noreferrer">
                      <FaDownload /> Descargar
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No hay documentos disponibles</p>
        )}
      </div>

      {state.modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Subir Documento</h3>
              <FaTimes
                className="close-icon"
                onClick={() => dispatch({ type: "TOGGLE_MODAL" })}
              />
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="Nombre del archivo"
                value={state.nombreArchivo}
                onChange={(e) => setNombreArchivo(e.target.value)}
              />
              <input
                type="file"
                onChange={(e) => setArchivo(e.target.files[0])}
              />

              {state.archivo && (
                <p className="file-preview">
                  <strong>Archivo seleccionado:</strong> {state.archivo.name}
                </p>
              )}

              <button className="btn-submit" onClick={handleUpload}>
                {state.loadingFile ? <LoaderIcon className="loader-icon"/> : "Subir Archivo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
