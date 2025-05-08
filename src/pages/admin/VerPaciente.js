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
import PdfViewer from "../../utils/PdfViewer";
import ModalAsignarDoctor from "../../Components/ModalAsignarDoctor";
import { LoaderIcon } from "react-hot-toast";
import "./VerPaciente.css";
import ModalNota from "../../Components/ModalNota";

export default function VerPaciente() {
  const [toast, setToast] = useState(null);
  const [modalAsignarDoctorOpen, setModalAsignarDoctorOpen] = useState(false);
  const [notaModalOpen, setNotaModalOpen] = useState(false);
  const [nuevaNota, setNuevaNota] = useState({ nota: "", author: "" });
  const [doctoresList, setDoctoresList] = useState([]);

  const showToast = (message, type) => setToast({ message, type });

  const {
    state,
    dispatch,
    user,
    handleUpload,
    setNombreArchivo,
    setArchivos,
    setNota,
    loading,
    eliminarDoctorDelPaciente,
    fetchDoctores, // <-- debes agregar esta función en tu hook (usePacienteIndividual)
  } = usePaciente({ showToast });

  const handleOpenModalDoctor = async () => {
    setModalAsignarDoctorOpen(true);
    if (doctoresList.length === 0) {
      const doctores = await fetchDoctores();
      setDoctoresList(doctores || []);
    }
  };

  const handleGuardarNota = () => {
    if (!nuevaNota.nota || !nuevaNota.author) {
      showToast("Completa todos los campos", "error");
      return;
    }
    setNota(nuevaNota);
    setNuevaNota({ nota: "", author: "" });
    setNotaModalOpen(false);
    showToast("Nota guardada correctamente", "success");
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setArchivos((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setArchivos((prev) => prev.filter((_, i) => i !== index));
  };

  if (!state.paciente) return <Loader />;

  return (
    <div className="paciente-container">
      <Breadcrumbs />

      {/* Header Paciente */}
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
              ? `Cedula de Identidad: ${state.paciente.dni}`
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

      {/* Info Visitas */}
      <div className="visit-info">
        <h3>Información de la visita</h3>
        <p>
          <FaCalendarAlt /> Fecha:{" "}
          {state.paciente.created_at
            ? new Date(state.paciente.created_at).toLocaleDateString()
            : "No especifica"}
        </p>

        {/* Doctores Asignados */}
        <h3>Doctores Asignados</h3>
        {state.doctores?.map((doctor) => (
          <p className="doctor-paciente" key={doctor._id}>
            <FaUserMd /> Doctor: {doctor.nombre || "No especifica"}
            <button
              style={
                user.rol === "paciente"
                  ? { display: "none" }
                  : { display: "block" }
              }
              className="btn-doctor-asignado-eliminar"
              onClick={() => eliminarDoctorDelPaciente(doctor._id)}
            >
              {loading ? (
                <LoaderIcon
                  style={{
                    width: "15px",
                    height: "15px",
                    color: "#ff7e67",
                    marginTop: "5px",
                  }}
                />
              ) : (
                <FaTimes />
              )}
            </button>
          </p>
        ))}
        <button
          hidden={user.rol === "paciente"}
          className="btn-agregar-nota"
          onClick={handleOpenModalDoctor}
        >
          <FaPlus /> Agregar Doctor
        </button>

        {/* Notas */}

        {state.paciente.notas?.length > 0 &&
          user.rol !== "paciente" &&
          state.paciente.notas.map((nota, index) => (
            <div className="nota-paciente" key={index}>
              <p className="nota-paciente-p">
                Autor: {nota.author} - {nota.nota || "No especifica"} -{" "}
                {new Date(nota.fecha).toLocaleDateString()}
              </p>
            </div>
          ))}
        <button
          hidden={user.rol === "paciente"}
          className="btn-agregar-nota"
          onClick={() => setNotaModalOpen(true)}
        >
          <FaPlus /> Agregar Nota
        </button>
      </div>

      {/* Documentos */}
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
              <FaPlus /> Subir Archivo
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

      {/* Modales */}
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
          onChange={(e) =>
            setArchivos([...state.archivos, ...Array.from(e.target.files)])
          }
        />

        {state.archivos.length > 0 && (
          <div className="file-preview">
            <strong>Archivos seleccionados: {state.archivos.length}</strong>
            <ul className="ul-item-img">
              {state.archivos.map((file, index) => (
                <li className="li-item-img" key={index}>
                  {file.name}
                  <button
                    className="item-eliminar-archivo"
                    onClick={() => {
                      const nuevos = [...state.archivos];
                      nuevos.splice(index, 1);
                      setArchivos(nuevos);
                    }}
                  >
                    x
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button className="btn-submit-ventas" onClick={handleUpload}>
          {state.loadingFile ? <LoaderIcon className="loader-icon" /> : "Subir Archivos"}
        </button>
      </div>
    </div>
  </div>
)}
      {notaModalOpen && (
        <ModalNota
          onClose={() => setNotaModalOpen(false)}
          showToast={showToast}
          setNotaModalOpen={setNotaModalOpen}
          nuevaNota={nuevaNota}
          setNuevaNota={setNuevaNota}
          handleGuardarNota={handleGuardarNota}
        />
      )}

      {modalAsignarDoctorOpen && (
        <ModalAsignarDoctor
          showToast={showToast}
          doctoresPaciente={state.doctores}
          id={state.paciente._id}
          doctores={doctoresList}
          onClose={() => setModalAsignarDoctorOpen(false)}
        />
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
        <p className="nombre-carpeta">
          📁 {doc.nombreArchivo || "Sin nombre"} ↓{" "}
        </p>
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
