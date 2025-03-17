import React, { useState } from "react";
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
import ToastMessage from "../../utils/ToastMessage";
import Loader from "../../utils/Loader";
import Breadcrumbs from "../../utils/Breadcums";
import { usePaciente } from "../../hooks/usePacienteIndividual";
import "./VerPaciente.css";
import { LoaderIcon } from "react-hot-toast";

import PdfViewer from "../../utils/PdfViewer";

export default function VerPaciente() {
  const showToast = (message, type) => {
    setToast({ message, type });
  };
  const { state, dispatch, user, handleUpload, setNombreArchivo, setArchivos } =
    usePaciente({ showToast });

  const [toast, setToast] = useState(null);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setArchivos([...state.archivos, ...newFiles]);
  };

  const removeFile = (index) => {
    const updatedFiles = state.archivos.filter((_, i) => i !== index);
    setArchivos(updatedFiles);
  };

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
              onClick={() => {
                setNombreArchivo("");
                setArchivos([]);
                dispatch({ type: "TOGGLE_MODAL" });
              }}
            >
              <FaPlus /> {"Subir Archivo"}
            </button>
          )}
        </div>
        {state.documentos.length > 0 ? (
          <div className="carpetas">
            {state.documentos.map((doc, index) => (
              <Carpeta
                key={index}
                doc={doc}
                dispatch={dispatch}
                setNombreArchivo={setNombreArchivo}
              />
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
                  <strong>
                    Archivos seleccionados: {state.archivos.length}
                  </strong>
                  <ul className="ul-item-img">
                    {state.archivos.map((file, index) => (
                      <>
                        <li className="li-item-img" key={index}>
                          {file.name}
                          <button
                            className="item-eliminar-archivo"
                            onClick={() => removeFile(index)}
                          >
                            x
                          </button>
                        </li>
                      </>
                    ))}
                  </ul>
                  <p>Seleccionar Otros archivos</p>
                  <input type="file" onChange={handleFileChange} />
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

const Carpeta = ({ doc, dispatch, setNombreArchivo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false); // Estado para el loader
  const [textCarpetas, setTextCarpetas] = useState("");

  const toggleFiles = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="carpeta">
      <div className="carpeta-header" onClick={toggleFiles}>
        <p className="nombre-carpeta">📁 {doc.nombreArchivo || "Sin nombre"}</p>
      </div>
      {isOpen && (
        <div className="archivos">
          {doc.archivos.map((archivo) => (
            <div className="archivo" key={archivo._id}>
              {loadingImage && <Loader />}{" "}
              {/* Mostrar el loader mientras carga la imagen */}
              <img
                onLoad={() => setLoadingImage(false)} // Cambia el estado a false cuando la imagen se haya cargado
                onError={() => setLoadingImage(false)} // Cambia el estado a false en caso de error de carga
                hidden={
                  archivo.urlArchivo.includes(".pdf") ||
                  archivo.urlArchivo.includes(".PDF") ||
                  archivo.urlArchivo.includes(".xlsx") ||
                  archivo.urlArchivo.includes(".dmc")
                    ? true
                    : false
                }
                className="img-preview"
                src={archivo.urlArchivo}
                alt="Archivo"
                onLoadStart={() => setLoadingImage(true)} // Cambia el estado a true cuando empieza la carga
              />
              <span className="archivo-nombre">{archivo.originalFilename}</span>
              <a
                href={archivo.urlArchivo}
                download
                className="archivo-descarga"
              >
                <FaDownload /> Descargar
              </a>
            </div>
          ))}
        </div>
      )}
      <button
        className="btn-agregar-carpeta"
        onClick={() => {
          setNombreArchivo(doc.nombreArchivo);
          dispatch({ type: "TOGGLE_MODAL" });
        }}
      >
        Agregar archivos +{" "}
      </button>
      {selectedPdf && (
        <div className="modal">
          <button onClick={() => setSelectedPdf(null)}>❌ Cerrar</button>
          <PdfViewer pdfUrl={selectedPdf} />
        </div>
      )}
    </div>
  );
};
