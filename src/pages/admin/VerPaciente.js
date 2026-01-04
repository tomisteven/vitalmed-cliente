import React, { useState, useMemo } from "react";
import {
  FaPhone,
  FaEnvelope,
  FaDownload,
  FaPlus,
  FaCalendarAlt,
  FaUserMd,
  FaTimes,
  FaIdCard,
  FaFolder,
  FaFolderOpen,
  FaFileAlt,
  FaFilePdf,
  FaFileImage,
  FaEye,
  FaImages,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import avatar from "../../assets/vitalmed/avatar.png";
import ToastMessage from "../../utils/ToastMessage";
import Loader from "../../utils/Loader";
import Breadcrumbs from "../../utils/Breadcums";
import { usePaciente } from "../../hooks/usePacienteIndividual";
import ModalAsignarDoctor from "../../Components/ModalAsignarDoctor";
import { LoaderIcon } from "react-hot-toast";
import ModalNota from "../../Components/ModalNota";
import "./VerPaciente.css";

export default function VerPaciente() {
  const [toast, setToast] = useState(null);
  const [modalAsignarDoctorOpen, setModalAsignarDoctorOpen] = useState(false);
  const [notaModalOpen, setNotaModalOpen] = useState(false);
  const [nuevaNota, setNuevaNota] = useState({ nota: "", author: "" });
  const [doctoresList, setDoctoresList] = useState([]);
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const userLogueado = JSON.parse(localStorage.getItem("userLog"));
  const userID = userLogueado.usuario._id;

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
    fetchDoctores,
    eliminarArchivo,
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

  // Collect all images from all folders (excluding PDFs and videos)
  const allImages = useMemo(() => {
    if (!state.documentos || state.documentos.length === 0) return [];

    const images = [];
    state.documentos.forEach((doc) => {
      doc.archivos.forEach((archivo) => {
        const url = archivo.urlArchivo.toLowerCase();
        const isImage = url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || url.includes('.gif') || url.includes('.webp') || url.includes('.bmp');
        const isPdfOrVideo = url.includes('.pdf') || url.includes('.mp4') || url.includes('.mov') || url.includes('.avi') || url.includes('.xlsx') || url.includes('.dmc');

        if (isImage && !isPdfOrVideo) {
          images.push({
            ...archivo,
            folderName: doc.nombreArchivo
          });
        }
      });
    });
    return images;
  }, [state.documentos]);

  const openCarousel = (startIndex = 0) => {
    setCarouselIndex(startIndex);
    setCarouselOpen(true);
  };

  if (!state.paciente) return <Loader />;

  return (
    <div className="ver-paciente-page">
      <Breadcrumbs />

      {/* Header con información del paciente */}
      <div className="patient-header-card">
        <div className="patient-avatar-section">
          <div className="avatar-wrapper">
            <img
              src={state.paciente.avatar || avatar}
              alt="Paciente"
              className="patient-avatar-img"
            />
          </div>
          <div className="patient-basic-info">
            <h1 className="patient-name">{state.paciente.nombre || "No especifica"}</h1>
            <div className="patient-dni">
              <FaIdCard />
              <span>{state.paciente.dni ? `CI: ${state.paciente.dni}` : "Sin CI"}</span>
            </div>
          </div>
        </div>

        <div className="patient-contact-grid">
          <div className="contact-item">
            <div className="contact-icon">
              <FaPhone />
            </div>
            <div className="contact-details">
              <span className="contact-label">Teléfono</span>
              <span className="contact-value">{state.paciente.telefono || "No especifica"}</span>
            </div>
          </div>

          <div className="contact-item">
            <div className="contact-icon">
              <FaEnvelope />
            </div>
            <div className="contact-details">
              <span className="contact-label">Email</span>
              <span className="contact-value">{state.paciente.email || "No especifica"}</span>
            </div>
          </div>

          <div className="contact-item">
            <div className="contact-icon">
              <FaCalendarAlt />
            </div>
            <div className="contact-details">
              <span className="contact-label">Fecha de Registro</span>
              <span className="contact-value">
                {state.paciente.created_at
                  ? new Date(state.paciente.created_at).toLocaleDateString()
                  : "No especifica"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sección de Doctores y Notas */}
      <div className="info-cards-grid">
        {/* Card de Doctores */}
        <div className="info-card doctors-card">
          <div className="card-header">
            <h3>
              <FaUserMd /> Doctores Asignados
            </h3>
            {user.rol !== "paciente" && user.rol !== "doctor" && (
              <button className="btn-add-small" onClick={handleOpenModalDoctor}>
                <FaPlus /> Agregar
              </button>
            )}
          </div>

          <div className="card-content">
            {state.doctores && state.doctores.length > 0 ? (
              <div className="doctors-list">
                {state.doctores.map((doctor) => (
                  <div className="doctor-item" key={doctor._id}>
                    <div className="doctor-info">
                      <FaUserMd className="doctor-icon" />
                      <span className="doctor-name">{doctor.nombre || "No especifica"}</span>
                    </div>
                    {user.rol !== "paciente" && (
                      <button
                        className="btn-remove-doctor"
                        onClick={() => eliminarDoctorDelPaciente(doctor._id)}
                        disabled={loading}
                      >
                        {loading ? <LoaderIcon style={{ width: "15px", height: "15px" }} /> : <FaTimes />}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-message">No hay doctores asignados</p>
            )}
          </div>
        </div>

        {/* Card de Notas */}
        {user.rol !== "paciente" && (
          <div className="info-card notes-card">
            <div className="card-header">
              <h3>
                📝 Notas Médicas
              </h3>
              {user.rol !== "doctor" && (
                <button className="btn-add-small" onClick={() => setNotaModalOpen(true)}>
                  <FaPlus /> Agregar
                </button>
              )}
            </div>

            <div className="card-content">
              {state.paciente.notas && state.paciente.notas.length > 0 ? (
                <div className="notes-list">
                  {state.paciente.notas.map((nota, index) => (
                    <div className="note-item" key={index}>
                      <div className="note-header">
                        <span className="note-author">{nota.author}</span>
                        <span className="note-date">
                          {new Date(nota.fecha).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="note-content">{nota.nota || "No especifica"}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-message">No hay notas registradas</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sección de Documentos */}
      {(userLogueado.rol === "secretaria" ||
        userLogueado.rol === "paciente" ||
        (userLogueado.rol === "doctor" &&
          state.doctores.some(
            (doctor) =>
              doctor._id === userID &&
              doctor.pacientes.includes(state.paciente._id)
          ))) && (
          <div className="documents-section">
            <div className="section-header">
              <h2>
                <FaFolder /> Documentos del Paciente
              </h2>
              <div className="section-header-actions">
                {allImages.length > 0 && (
                  <button
                    className="btn-carousel-view"
                    onClick={() => openCarousel(0)}
                  >
                    <FaImages /> Ver estilo carrusel ({allImages.length})
                  </button>
                )}
                {userLogueado.rol !== "paciente" && (
                  <button
                    className="btn-upload-doc"
                    onClick={() => {
                      setNombreArchivo("");
                      setArchivos([]);
                      dispatch({ type: "TOGGLE_MODAL" });
                    }}
                  >
                    <FaPlus /> Subir Documentos
                  </button>
                )}
              </div>
            </div>

            {state.documentos.length > 0 ? (
              <div className="folders-grid">
                {state.documentos.map((doc, index) => (
                  <FolderCard
                    key={index}
                    doc={doc}
                    dispatch={dispatch}
                    setNombreArchivo={setNombreArchivo}
                    eliminarArchivo={eliminarArchivo}
                    loading={loading}
                    userLogueado={userLogueado}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-documents">
                <FaFileAlt />
                <p>No hay documentos disponibles</p>
              </div>
            )}
          </div>
        )}

      {/* Modal de Subir Archivos */}
      {state.modalOpen && (
        <div className="modal-overlay" onClick={() => dispatch({ type: "TOGGLE_MODAL" })}>
          <div className="modal-upload" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-upload">
              <h3>Subir Documentos</h3>
              <FaTimes
                className="close-icon"
                onClick={() => dispatch({ type: "TOGGLE_MODAL" })}
              />
            </div>

            <div className="modal-body-upload">
              <div className="form-group-upload">
                <label className="label-upload">Nombre de la Carpeta</label>
                <input
                  type="text"
                  placeholder="Ej: Estudios de Laboratorio"
                  value={state.nombreArchivo}
                  onChange={(e) => setNombreArchivo(e.target.value)}
                />
              </div>

              <div className="form-group-upload">
                <label>Seleccionar Archivos</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    setArchivos([
                      ...state.archivos,
                      ...Array.from(e.target.files),
                    ])
                  }
                  className="file-input"
                />
              </div>

              {state.archivos.length > 0 && (
                <div className="files-preview">
                  <strong>Archivos seleccionados: {state.archivos.length}</strong>
                  <ul className="files-list">
                    {state.archivos.map((file, index) => (
                      <li key={index} className="file-item">
                        <span>{file.name}</span>
                        <button
                          className="btn-remove-file"
                          onClick={() => {
                            const nuevos = [...state.archivos];
                            nuevos.splice(index, 1);
                            setArchivos(nuevos);
                          }}
                        >
                          <FaTimes />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button className="btn-submit-upload" onClick={handleUpload} disabled={state.loadingFile}>
                {state.loadingFile ? (
                  <>
                    <LoaderIcon className="loader-icon-small" />
                    <span>Subiendo...</span>
                  </>
                ) : (
                  <>
                    <FaPlus />
                    <span>Subir Archivos</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modales */}
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
          modalAsignarDoctorOpen={modalAsignarDoctorOpen}
          setModalAsignarDoctorOpen={setModalAsignarDoctorOpen}
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

      {/* Image Carousel Modal */}
      {carouselOpen && allImages.length > 0 && (
        <ImageCarouselModal
          images={allImages}
          currentIndex={carouselIndex}
          setCurrentIndex={setCarouselIndex}
          onClose={() => setCarouselOpen(false)}
        />
      )}
    </div>
  );
}

// Componente de Carpeta Rediseñado
const FolderCard = ({
  doc,
  dispatch,
  setNombreArchivo,
  eliminarArchivo,
  loading,
  userLogueado,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getFileIcon = (url) => {
    if (url.includes(".pdf") || url.includes(".PDF")) return <FaFilePdf className="file-type-icon pdf" />;
    if (url.includes(".jpg") || url.includes(".png") || url.includes(".jpeg")) return <FaFileImage className="file-type-icon image" />;
    return <FaFileAlt className="file-type-icon" />;
  };

  return (
    <div className={`folder-card ${isOpen ? "open" : ""}`}>
      <div className="folder-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="folder-title">
          {isOpen ? <FaFolderOpen className="folder-icon open" /> : <FaFolder className="folder-icon" />}
          <span>{doc.nombreArchivo || "Sin nombre"}</span>
          <span className="file-count">{doc.archivos.length} archivo(s)</span>
        </div>
        {userLogueado.rol !== "paciente" && (
          <button
            className="btn-add-to-folder"
            onClick={(e) => {
              e.stopPropagation();
              setNombreArchivo(doc.nombreArchivo);
              dispatch({ type: "TOGGLE_MODAL" });
            }}
          >
            <FaPlus /> Agregar
          </button>
        )}
      </div>

      {isOpen && (
        <div className="folder-content">
          <div className="files-grid">
            {doc.archivos.map((archivo) => (
              <div className="file-card" key={archivo._id}>
                <div className="file-preview">
                  {archivo.urlArchivo.includes(".pdf") ||
                    archivo.urlArchivo.includes(".PDF") ||
                    archivo.urlArchivo.includes(".xlsx") ||
                    archivo.urlArchivo.includes(".dmc") ? (
                    <div className="pdf-placeholder">
                      <FaFilePdf />
                      <span>PDF</span>
                    </div>
                  ) : (
                    <img
                      src={archivo.urlArchivo}
                      alt="Archivo"
                      className="file-thumbnail"
                    />
                  )}
                </div>

                <div className="file-info">
                  <span className="file-name">{archivo.originalFilename}</span>
                  <div className="file-actions">
                    <button
                      style={{
                        border: "none",
                        backgroundColor: "green",
                      }}
                      onClick={() => window.open(archivo.urlArchivo, "_blank")}
                      className="btn-eye-file"><FaEye /></button>
                    <a
                      href={archivo.urlArchivo}
                      download

                      className="btn-download-file"
                    >
                      <FaDownload /> Descargar
                    </a>
                    {userLogueado.rol !== "paciente" && (
                      <button
                        className="btn-delete-file"
                        onClick={() => eliminarArchivo(archivo._id, doc.nombreArchivo)}
                        disabled={loading}
                      >
                        {loading ? (
                          <LoaderIcon style={{ width: "15px", height: "15px" }} />
                        ) : (
                          <MdDeleteForever />
                        )}
                      </button>
                    )}

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Image Carousel Modal Component
const ImageCarouselModal = ({ images, currentIndex, setCurrentIndex, onClose }) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const currentImage = images[currentIndex];
  const minSwipeDistance = 50;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") goToPrevious();
    if (e.key === "ArrowRight") goToNext();
    if (e.key === "Escape") onClose();
  };

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) goToNext();
    if (isRightSwipe) goToPrevious();
  };

  React.useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleDownload = () => {
    // Open image in new tab - user can right-click > Save as...
    // For proper download from S3, a backend proxy endpoint is needed
    window.open(currentImage.urlArchivo, '_blank');
  };

  return (
    <div className="carousel-modal-overlay" onClick={onClose}>
      <div
        className="carousel-modal-content"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Close Button */}
        <button className="carousel-close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        {/* Open Image Button */}
        <button className="carousel-download-btn" onClick={handleDownload}>
          <FaEye />
          <span>Abrir imagen</span>
        </button>

        {/* Image Counter */}
        <div className="carousel-counter">
          {currentIndex + 1} / {images.length}
        </div>

        {/* Navigation Arrows */}
        <button className="carousel-nav-btn prev" onClick={goToPrevious}>
          <FaChevronLeft />
        </button>
        <button className="carousel-nav-btn next" onClick={goToNext}>
          <FaChevronRight />
        </button>

        {/* Main Image */}
        <div className="carousel-image-container">
          <img
            src={currentImage.urlArchivo}
            alt={currentImage.originalFilename || "Imagen"}
            className="carousel-image"
          />
        </div>

        {/* Image Info */}
        <div className="carousel-image-info">
          <span className="carousel-folder-name">{currentImage.folderName}</span>
          <span className="carousel-file-name">{currentImage.originalFilename}</span>
        </div>

        {/* Dots Indicator */}
        <div className="carousel-dots">
          {images.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
