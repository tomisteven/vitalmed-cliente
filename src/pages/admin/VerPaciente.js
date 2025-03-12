import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PacienteApi } from "../../api/Paciente";
const PacienteController = new PacienteApi();
import "./VerPaciente.css";
import {
  FaPhone,
  FaEnvelope,
  FaUserMd,
  FaCalendarAlt,
  FaDownload,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import avatar from "../../assets/vitalmed/avatar.png";
import { toast } from "react-toastify";
import Loader from "../../utils/Loader";
import Breadcrumbs from "../../utils/Breadcums";

export default function VerPaciente() {
  const { id } = useParams();
  const [paciente, setPaciente] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [nombreArchivo, setNombreArchivo] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [loadingFile, setLoadingFile] = useState(false);
  const user = JSON.parse(localStorage.getItem("userLog"));

  useEffect(() => {
    const fetchPaciente = async () => {
      try {
        const response = await PacienteController.getPacienteById(id);
        setPaciente(response);
        setDocumentos(response.documentos || []);
        console.log(response);
      } catch (error) {
        console.error("Error al obtener los datos del paciente", error);
      }
    };
    fetchPaciente();
  }, [id]);

  const handleUpload = async () => {
    if (!nombreArchivo || !archivo) {
      alert("Debes completar todos los campos.");
      return;
    }
    setLoadingFile(true);

    const formData = new FormData();
    formData.append("dicom", archivo);
    formData.append("nombreArchivo", nombreArchivo);

    try {
      const r = await PacienteController.subirDocumento(id, formData);
      setDocumentos([
        ...documentos,
        {
          nombreArchivo: nombreArchivo,
          dicom: URL.createObjectURL(archivo),
          urlArchivo: r.urlArchivo,
        },
      ]);

      if (r.ok === true) {
        setLoadingFile(false);
        setModalOpen(false);
        setNombreArchivo("");
        setArchivo(null);

        toast.success("Subido Correctamente");
      } else {
        toast.error("Error al subir el archivo");
      }
    } catch (error) {
      console.error("Error al subir el archivo", error);
      toast.error("Error al subir el archivo, Intente en unos minutos");
    }
  };

  if (!paciente) {
    return <Loader />;
  }

  return (
    <div className="paciente-container">
      <Breadcrumbs />
      {/* Datos del paciente */}
      <div className="paciente-header">
        <img
          src={paciente.avatar || avatar}
          alt="Paciente"
          className="paciente-avatar"
        />
        <div className="paciente-info">
          <h2>{paciente.nombre || "No especifica"}</h2>
          <p>{paciente.dni ? `DNI: ${paciente.dni}` : "No especifica"}</p>
          <div className="contact-info">
            <p>
              <FaPhone /> {paciente.telefono || "No especifica"}
            </p>
            <p>
              <FaEnvelope /> {paciente.email || "No especifica"}
            </p>
          </div>
        </div>
      </div>
      <div className="visit-info">
        <h3>Información de la visita</h3>
        <p>
          <FaCalendarAlt /> Fecha:{" "}
          {paciente.created_at
            ? new Date(paciente.created_at).toLocaleDateString()
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

      {/* Documentos */}
      <div className="documentos">
        <div className="doc-header">
          <h3 className="titulo-doc">Documentos del Paciente</h3>
          {user.rol !== "paciente" && (
            <button className="btn-upload" onClick={() => setModalOpen(true)}>
              <FaPlus /> {"Subir Archivo"}
            </button>
          )}
        </div>
        {documentos.length > 0 ? (
          <table className="document-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Fecha</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {documentos.map((doc, index) => (
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

      {/* Modal de Subida */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Subir Documento</h3>
              <FaTimes
                className="close-icon"
                onClick={() => setModalOpen(false)}
              />
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="Nombre del archivo"
                value={nombreArchivo}
                onChange={(e) => setNombreArchivo(e.target.value)}
              />
              <input
                type="file"
                onChange={(e) => {
                  setArchivo(e.target.files[0]); // Guarda el archivo en el estado
                }}
              />

              {/* 📌 Aquí se muestra el nombre del archivo si se selecciona */}
              {archivo && (
                <p className="file-preview">
                  <strong>Archivo seleccionado:</strong> {archivo.name}
                </p>
              )}

              <button className="btn-submit" onClick={handleUpload}>
                {loadingFile ? "Subiendo Archivo..." : "Subir Archivo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
