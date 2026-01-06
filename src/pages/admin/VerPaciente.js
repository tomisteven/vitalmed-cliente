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
  FaFileVideo,
  FaFileExcel,
  FaFileWord,
  FaEye,
  FaImages,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarCheck,
  FaClock,
  FaStethoscope,
  FaNotesMedical,
  FaHistory,
} from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
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
  const userID = userLogueado?.usuario?._id || userLogueado?._id;
  const userRole = (userLogueado?.rol || userLogueado?.usuario?.rol)?.toLowerCase();

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

  // Filter for future appointments only
  const futureAppointments = useMemo(() => {
    if (!state.turnosAsignados) return [];
    const now = new Date();
    return state.turnosAsignados.filter((turno) => {
      const fechaTurno = new Date(turno.fecha);
      return fechaTurno >= now;
    });
  }, [state.turnosAsignados]);

  const openCarousel = (startIndex = 0) => {
    setCarouselIndex(startIndex);
    setCarouselOpen(true);
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return null;
    const today = new Date();
    const birthDate = new Date(fechaNacimiento);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = state.paciente ? calcularEdad(state.paciente.fechaNacimiento) : null;

  if (!state.paciente) return <Loader />;

  return (
    <div className="ver-paciente-page">
      <Breadcrumbs />

      {/* Header con información del paciente */}
      <div className="patient-header-card">
        <div className="patient-avatar-section">
          <div className="avatar-wrapper">
            <div className="patient-avatar-initials">
              {(() => {
                const nombre = state.paciente.nombre || "";
                const partes = nombre.trim().split(" ");
                const iniciales = partes.length >= 2
                  ? (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
                  : partes[0] ? partes[0].substring(0, 2).toUpperCase() : "??";
                return iniciales;
              })()}
            </div>
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
              <span className="contact-label">Fecha de Nacimiento / Edad</span>
              <span className="contact-value">
                {state.paciente.fechaNacimiento
                  ? `${new Date(state.paciente.fechaNacimiento).toLocaleDateString()} (${age} años)`
                  : "No especifica"}
              </span>
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
            {user.rol?.toLowerCase() !== "paciente" && user.rol?.toLowerCase() !== "doctor" && (
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
                    {user.rol?.toLowerCase() !== "paciente" && (
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
        {user.rol?.toLowerCase() !== "paciente" && (
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

      {/* Sección de Turnos */}
      <div className="patient-appointments-section">
        <div className="section-header">
          <h2>
            <FaCalendarCheck /> Próximos Turnos
          </h2>
        </div>
        {futureAppointments && futureAppointments.length > 0 ? (
          <div className="appointments-grid">
            {futureAppointments.map((turno) => (
              <div key={turno._id} className={`appointment-card ${turno.estado}`}>
                <div className="appointment-date-badge">
                  <span className="month">{new Date(turno.fecha).toLocaleDateString("es-ES", { month: "short" }).toUpperCase()}</span>
                  <span className="day">{new Date(turno.fecha).getDate()}</span>
                </div>
                <div className="appointment-details-main">
                  <div className="appointment-time-row">
                    <div className="time-info">
                      <FaClock /> <span>{new Date(turno.fecha).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <span className={`status-badge-inline ${turno.estado}`}>{turno.estado}</span>
                  </div>
                  <h4 className="appointment-study">
                    <FaStethoscope /> {turno.estudio?.tipo || "Estudio no especificado"}
                  </h4>
                  <div className="appointment-doctor-row">
                    <FaUserMd /> <span>{turno.doctor?.nombre || "Sin doctor asignado"}</span>
                  </div>
                  {turno.motivoConsulta && (
                    <div className="appointment-reason">
                      <FaNotesMedical /> <strong>Motivo:</strong> {turno.motivoConsulta}
                    </div>
                  )}
                  {turno.comentarios && (
                    <div className="appointment-comments">
                      <FaHistory /> <strong>Obs:</strong> {turno.comentarios}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-message-no-card">No hay próximos turnos programados.</p>
        )}
      </div>


      {/* Sección de Documentos */}
      {(userRole === "secretaria" ||
        userRole === "paciente" ||
        (userRole === "doctor" &&
          state.doctores.some((doctor) => doctor._id === userID))) && (
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
                {userLogueado.rol?.toLowerCase() !== "paciente" && (
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
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.includes(".pdf")) return <FaFilePdf className="file-type-icon pdf" />;
    if (lowerUrl.includes(".jpg") || lowerUrl.includes(".png") || lowerUrl.includes(".jpeg") || lowerUrl.includes(".webp") || lowerUrl.includes(".gif")) return <FaFileImage className="file-type-icon image" />;
    if (lowerUrl.includes(".mp4") || lowerUrl.includes(".mov") || lowerUrl.includes(".avi") || lowerUrl.includes(".webm")) return <FaFileVideo className="file-type-icon video" />;
    if (lowerUrl.includes(".xlsx") || lowerUrl.includes(".xls") || lowerUrl.includes(".csv")) return <FaFileExcel className="file-type-icon excel" />;
    if (lowerUrl.includes(".doc") || lowerUrl.includes(".docx")) return <FaFileWord className="file-type-icon word" />;
    return <FaFileAlt className="file-type-icon" />;
  };

  const isVideo = (url) => {
    const lowerUrl = url.toLowerCase();
    return lowerUrl.includes(".mp4") || lowerUrl.includes(".mov") || lowerUrl.includes(".avi") || lowerUrl.includes(".webm") || lowerUrl.includes(".mov");
  };

  const isImage = (url) => {
    const lowerUrl = url.toLowerCase();
    return lowerUrl.includes(".jpg") || lowerUrl.includes(".png") || lowerUrl.includes(".jpeg") || lowerUrl.includes(".webp") || lowerUrl.includes(".gif") || lowerUrl.includes(".bmp");
  };

  const isSpecialFile = (url) => {
    const lowerUrl = url.toLowerCase();
    return lowerUrl.includes(".pdf") || lowerUrl.includes(".xlsx") || lowerUrl.includes(".xls") || lowerUrl.includes(".doc") || lowerUrl.includes(".docx") || lowerUrl.includes(".dmc") || lowerUrl.includes(".csv");
  };

  return (
    <div className={`folder-card ${isOpen ? "open" : ""}`}>
      <div className="folder-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="folder-title">
          {isOpen ? <FaFolderOpen className="folder-icon open" /> : <FaFolder className="folder-icon" />}
          <span>{doc.nombreArchivo || "Sin nombre"}</span>
          <span className="file-count">{doc.archivos.length} archivo(s)</span>
        </div>
        {userLogueado.rol?.toLowerCase() !== "paciente" && (
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
                  {isSpecialFile(archivo.urlArchivo) ? (
                    <div className="pdf-placeholder">
                      {getFileIcon(archivo.urlArchivo)}
                      <span>{archivo.urlArchivo.split('.').pop().toUpperCase()}</span>
                    </div>
                  ) : isVideo(archivo.urlArchivo) ? (
                    <div className="pdf-placeholder video">
                      <FaFileVideo />
                      <span>VIDEO</span>
                    </div>
                  ) : (
                    <img
                      src={archivo.urlArchivo}
                      alt="Archivo"
                      className="file-thumbnail"
                      onError={(e) => {
                        console.error("Error loading image:", archivo.urlArchivo);
                        e.target.src = "https://placehold.co/400?text=Error+Cargando+Imagen";
                      }}
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
                    {userLogueado.rol?.toLowerCase() !== "paciente" && (
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
          {isVideo(currentImage.urlArchivo) ? (
            <div className="carousel-video-description">
              <FaFileVideo size={60} />
              <p>Este archivo es un video (. {currentImage.urlArchivo.split('.').pop()})</p>
              <button className="btn-open-original" onClick={handleDownload}>
                <FaEye /> Ver video original
              </button>
            </div>
          ) : (
            <img
              src={currentImage.urlArchivo}
              alt={currentImage.originalFilename || "Imagen"}
              className="carousel-image"
              onError={(e) => {
                console.error("Error loading carousel image:", currentImage.urlArchivo);
                e.target.src = "https://placehold.co/800x600?text=Error+Cargando+Imagen";
              }}
            />
          )}
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
