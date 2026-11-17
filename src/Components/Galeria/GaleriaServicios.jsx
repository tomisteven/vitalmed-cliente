import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaBuilding,
  FaChevronLeft,
  FaChevronRight,
  FaImages,
  FaStethoscope,
  FaTimes,
  FaWhatsapp,
} from "react-icons/fa";
import { GaleriaApi } from "../../api/Galeria";
import "./GaleriaServicios.css";

const galeriaApi = new GaleriaApi();

const WHATSAPP =
  "https://api.whatsapp.com/send?phone=584244664961&text=Hola%2C+quiero+consultar+por+un+estudio";

const imagenesDe = (item) => {
  if (!item) return [];
  return [...new Set([item.portada, ...(item.fotos || [])].filter(Boolean))];
};

export default function GaleriaServicios({ showHeader = true, onVerTodo = null }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("estudios");
  const [selected, setSelected] = useState(null);
  const [activePhoto, setActivePhoto] = useState(0);

  const cargarGaleria = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await galeriaApi.getGaleria("", false);
      const lista = Array.isArray(data) ? data : [];
      setItems(lista);
      const hayEstudios = lista.some((item) => item.categoria === "estudios");
      const hayInstalaciones = lista.some(
        (item) => item.categoria === "instalaciones"
      );
      if (!hayEstudios && hayInstalaciones) setTab("instalaciones");
    } catch (err) {
      console.error("Error al cargar la galería:", err);
      setError(err.message || "No se pudo cargar la galería.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarGaleria();
  }, []);

  const counts = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        if (item.categoria === "instalaciones") acc.instalaciones += 1;
        else acc.estudios += 1;
        return acc;
      },
      { instalaciones: 0, estudios: 0 }
    );
  }, [items]);

  const itemsFiltrados = useMemo(
    () => items.filter((item) => item.categoria === tab),
    [items, tab]
  );

  const fotos = useMemo(() => imagenesDe(selected), [selected]);

  useEffect(() => {
    if (!selected) return;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setSelected(null);
      if (event.key === "ArrowLeft") {
        setActivePhoto((prev) => (prev === 0 ? fotos.length - 1 : prev - 1));
      }
      if (event.key === "ArrowRight") {
        setActivePhoto((prev) => (prev === fotos.length - 1 ? 0 : prev + 1));
      }
    };

    const overflowOriginal = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = overflowOriginal;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [selected, fotos.length]);

  const abrirModal = (item) => {
    setSelected(item);
    setActivePhoto(0);
  };

  const agendar = (item) => {
    const estudioId =
      item?.estudio?._id ||
      (typeof item?.estudio === "string" ? item.estudio : "");
    const query = estudioId ? `?estudio=${estudioId}` : "";
    const usuario = JSON.parse(localStorage.getItem("userLog") || "null");

    if (!usuario) {
      navigate(`/reservar-sin-registro${query}`);
    } else if (usuario.rol === "paciente") {
      navigate(`/admin/reservar-turno${query}`);
    } else {
      navigate("/admin/turnos");
    }

    setSelected(null);
  };

  const cubierta = (item) => item.portada || item.fotos?.[0] || "";

  const renderPlaceholder = (item, compact = false) => (
    <div className={`gs-placeholder ${compact ? "compact" : ""}`}>
      {item?.categoria === "instalaciones" ? (
        <FaBuilding />
      ) : (
        <FaStethoscope />
      )}
      <span>{item?.categoria === "instalaciones" ? "Instalaciones" : "Estudio"}</span>
    </div>
  );

  return (
    <section id="galeria" className="gs-section">
      <div className="gs-container">
        {showHeader && (
          <div className="gs-header">
            <span className="gs-kicker">Galería</span>
            <h2>Conocé nuestros espacios y estudios</h2>
            <p>
              Un recorrido por el consultorio, sus instalaciones y los estudios
              que realizamos.
            </p>
          </div>
        )}

        <div className="gs-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "instalaciones"}
            className={`gs-tab ${tab === "instalaciones" ? "active" : ""}`}
            onClick={() => setTab("instalaciones")}
          >
            <FaBuilding /> Instalaciones
            <span className="gs-tab-count">{counts.instalaciones}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "estudios"}
            className={`gs-tab ${tab === "estudios" ? "active" : ""}`}
            onClick={() => setTab("estudios")}
          >
            <FaStethoscope /> Consulta y Estudios Médicos
            <span className="gs-tab-count">{counts.estudios}</span>
          </button>
        </div>

        {loading ? (
          <div className="gs-loading">
            <div className="gs-spinner" />
            <p>Cargando galería...</p>
          </div>
        ) : error ? (
          <div className="gs-empty">
            <FaImages />
            <h3>No pudimos cargar la galería</h3>
            <p>{error}</p>
            <button type="button" className="gs-btn gs-btn-outline" onClick={cargarGaleria}>
              Reintentar
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="gs-empty">
            <FaImages />
            <h3>Galería en preparación</h3>
            <p>
              Muy pronto vas a poder conocer nuestros espacios y estudios.
              Mientras tanto, podés agendar tu cita.
            </p>
          </div>
        ) : itemsFiltrados.length === 0 ? (
          <div className="gs-empty">
            <FaImages />
            <h3>No hay elementos en esta categoría</h3>
            <p>Probá con la otra pestaña para ver más contenido.</p>
          </div>
        ) : (
          <div className="gs-grid">
            {itemsFiltrados.map((item, index) => {
              const cover = cubierta(item);
              return (
                <button
                  type="button"
                  key={item._id}
                  className="gs-card"
                  style={{ animationDelay: `${index * 70}ms` }}
                  onClick={() => abrirModal(item)}
                >
                  <div className="gs-card-cover">
                    {cover ? (
                      <img src={cover} alt={item.titulo} loading="lazy" />
                    ) : (
                      renderPlaceholder(item)
                    )}
                    <span className="gs-card-tag">
                      {item.categoria === "instalaciones"
                        ? "Instalaciones"
                        : "Estudio"}
                    </span>
                  </div>
                  <div className="gs-card-body">
                    <h3>{item.titulo}</h3>
                    {item.resumen && <p>{item.resumen}</p>}
                    <span className="gs-card-link">
                      Ver detalles <FaArrowRight />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {onVerTodo && (
          <div className="gs-footer">
            <button type="button" className="gs-btn gs-btn-outline" onClick={onVerTodo}>
              Ver galería completa <FaArrowRight />
            </button>
          </div>
        )}
      </div>

      {selected && (
        <div className="gs-modal-overlay" onClick={() => setSelected(null)}>
          <div className="gs-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="gs-modal-close"
              onClick={() => setSelected(null)}
              aria-label="Cerrar galería"
            >
              <FaTimes />
            </button>

            <div className="gs-modal-gallery">
              <div className="gs-main-image">
                {fotos.length > 0 ? (
                  <img
                    src={fotos[activePhoto] || fotos[0]}
                    alt={selected.titulo}
                  />
                ) : (
                  renderPlaceholder(selected, true)
                )}

                {fotos.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="gs-nav prev"
                      aria-label="Foto anterior"
                      onClick={() =>
                        setActivePhoto((prev) =>
                          prev === 0 ? fotos.length - 1 : prev - 1
                        )
                      }
                    >
                      <FaChevronLeft />
                    </button>
                    <button
                      type="button"
                      className="gs-nav next"
                      aria-label="Foto siguiente"
                      onClick={() =>
                        setActivePhoto((prev) =>
                          prev === fotos.length - 1 ? 0 : prev + 1
                        )
                      }
                    >
                      <FaChevronRight />
                    </button>
                    <span className="gs-counter">
                      {activePhoto + 1} / {fotos.length}
                    </span>
                  </>
                )}
              </div>

              {fotos.length > 1 && (
                <div className="gs-thumbs">
                  {fotos.map((foto, index) => (
                    <button
                      type="button"
                      key={`${foto}-${index}`}
                      className={`gs-thumb ${activePhoto === index ? "active" : ""}`}
                      onClick={() => setActivePhoto(index)}
                      aria-label={`Ver foto ${index + 1}`}
                    >
                      <img src={foto} alt={`${selected.titulo} ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="gs-modal-info">
              <span className="gs-modal-tag">
                {selected.categoria === "instalaciones"
                  ? "Instalaciones"
                  : "Consulta y estudios"}
              </span>
              <h3>{selected.titulo}</h3>

              {selected.resumen && (
                <p className="gs-modal-summary">{selected.resumen}</p>
              )}

              {selected.indicaciones && (
                <div className="gs-indications">
                  <h4>Indicaciones básicas</h4>
                  <p>{selected.indicaciones}</p>
                </div>
              )}

              <div className="gs-modal-actions">
                <button
                  type="button"
                  className="gs-btn gs-btn-primary"
                  onClick={() => agendar(selected)}
                >
                  {selected.categoria === "estudios"
                    ? "Agendar este estudio"
                    : "Agendar una cita"}
                  <FaArrowRight />
                </button>
                <a
                  className="gs-btn gs-btn-outline"
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaWhatsapp /> Consultar
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
