import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
  FaBuilding,
  FaEdit,
  FaImages,
  FaPlus,
  FaRedo,
  FaSearch,
  FaStethoscope,
  FaTimes,
  FaTrash,
  FaUpload,
} from "react-icons/fa";
import { GaleriaApi } from "../../api/Galeria";
import { EstudiosApi } from "../../api/Estudios";
import "./GaleriaAdmin.css";

const galeriaApi = new GaleriaApi();
const estudiosApi = new EstudiosApi();

const EMPTY_FORM = {
  categoria: "estudios",
  titulo: "",
  resumen: "",
  indicaciones: "",
  estudio: "",
  portada: "",
  fotos: [],
  activo: true,
  orden: 0,
};

export default function GaleriaAdmin() {
  const [items, setItems] = useState([]);
  const [estudios, setEstudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroEstado, setFiltroEstado] = useState("todos");

  const cargarGaleria = async () => {
    setLoading(true);
    try {
      const data = await galeriaApi.getGaleria("", true);
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar la galería:", error);
      toast.error(error.message || "Error al cargar la galería");
    } finally {
      setLoading(false);
    }
  };

  const cargarEstudios = async () => {
    try {
      const data = await estudiosApi.getEstudios(true);
      setEstudios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar estudios:", error);
    }
  };

  useEffect(() => {
    cargarGaleria();
    cargarEstudios();
  }, []);

  const stats = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        acc.total += 1;
        if (item.categoria === "instalaciones") acc.instalaciones += 1;
        else acc.estudios += 1;
        if (item.activo) acc.activos += 1;
        return acc;
      },
      { total: 0, instalaciones: 0, estudios: 0, activos: 0 }
    );
  }, [items]);

  const itemsFiltrados = useMemo(() => {
    let lista = items;

    if (filtroCategoria !== "todas") {
      lista = lista.filter((item) => item.categoria === filtroCategoria);
    }

    if (filtroEstado === "activos") {
      lista = lista.filter((item) => item.activo);
    } else if (filtroEstado === "inactivos") {
      lista = lista.filter((item) => !item.activo);
    }

    if (!busqueda.trim()) return lista;

    const termino = busqueda.toLowerCase();
    return lista.filter((item) =>
      [item.titulo, item.resumen, item.indicaciones].some((valor) =>
        String(valor || "").toLowerCase().includes(termino)
      )
    );
  }, [items, busqueda, filtroCategoria, filtroEstado]);

  const abrirNuevo = () => {
    setEditing(null);
    setFormData({ ...EMPTY_FORM });
    setModalOpen(true);
  };

  const abrirEditar = (item) => {
    setEditing(item);
    setFormData({
      categoria: item.categoria || "estudios",
      titulo: item.titulo || "",
      resumen: item.resumen || "",
      indicaciones: item.indicaciones || "",
      estudio: item.estudio?._id || item.estudio || "",
      portada: item.portada || "",
      fotos: Array.isArray(item.fotos) ? [...item.fotos] : [],
      activo: item.activo !== false,
      orden: item.orden || 0,
    });
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setEditing(null);
    setFormData({ ...EMPTY_FORM });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEstudioChange = (e) => {
    const estudioId = e.target.value;
    const estudio = estudios.find((item) => item._id === estudioId);
    setFormData((prev) => ({
      ...prev,
      estudio: estudioId,
      titulo: prev.titulo || estudio?.tipo || "",
    }));
  };

  const subirPortada = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const result = await galeriaApi.subirImagenes(files);
      if (result.urls?.[0]) {
        setFormData((prev) => ({ ...prev, portada: result.urls[0] }));
      }
      if (result.errores?.length) {
        toast.error(result.errores.join(" "));
      }
      if (result.avisos?.length) {
        toast(result.avisos.join(" "), { icon: "⚠️" });
      }
    } catch (error) {
      toast.error(error.message || "Error al subir la portada");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const subirFotos = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const result = await galeriaApi.subirImagenes(files);
      if (result.urls?.length) {
        setFormData((prev) => ({
          ...prev,
          fotos: [...prev.fotos, ...result.urls],
        }));
      }
      if (result.errores?.length) {
        toast.error(result.errores.join(" "));
      }
      if (result.avisos?.length) {
        toast(result.avisos.join(" "), { icon: "⚠️" });
      }
    } catch (error) {
      toast.error(error.message || "Error al subir las imágenes");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const quitarFoto = (url) => {
    setFormData((prev) => ({
      ...prev,
      fotos: prev.fotos.filter((foto) => foto !== url),
    }));
  };

  const guardar = async () => {
    if (!formData.titulo.trim()) {
      toast.error("El título es obligatorio");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        titulo: formData.titulo.trim(),
        estudio: formData.estudio || null,
        orden: Number(formData.orden) || 0,
      };

      if (editing) {
        await galeriaApi.actualizarItem(editing._id, payload);
        toast.success("Elemento actualizado correctamente");
      } else {
        await galeriaApi.crearItem(payload);
        toast.success("Elemento creado correctamente");
      }

      cerrarModal();
      cargarGaleria();
    } catch (error) {
      toast.error(error.message || "Error al guardar el elemento");
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async (item) => {
    const result = await Swal.fire({
      title: "¿Eliminar elemento de la galería?",
      text: "Se eliminarán también sus imágenes. Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await galeriaApi.eliminarItem(item._id);
      toast.success("Elemento eliminado correctamente");
      cargarGaleria();
    } catch (error) {
      toast.error(error.message || "Error al eliminar el elemento");
    }
  };

  const cubierta = (item) => item.portada || item.fotos?.[0] || "";

  return (
    <div className="admin-page galeria-admin-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">Contenido</span>
          <h1 className="admin-page-title">Galería de servicios</h1>
          <p className="admin-page-subtitle">
            Administrá las fotos, nombres y textos que se muestran en la
            galería pública del consultorio.
          </p>
        </div>

        <div className="admin-page-actions">
          <button
            type="button"
            className="adm-btn adm-btn-ghost"
            onClick={cargarGaleria}
          >
            <FaRedo /> Actualizar
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-primary"
            onClick={abrirNuevo}
          >
            <FaPlus /> Nuevo elemento
          </button>
        </div>
      </header>

      <div className="adm-stats">
        <div className="adm-stat">
          <div className="adm-stat-icon">
            <FaImages />
          </div>
          <div>
            <span className="adm-stat-value">{stats.total}</span>
            <span className="adm-stat-label">Elementos</span>
          </div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-icon">
            <FaStethoscope />
          </div>
          <div>
            <span className="adm-stat-value">{stats.estudios}</span>
            <span className="adm-stat-label">Estudios</span>
          </div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-icon">
            <FaBuilding />
          </div>
          <div>
            <span className="adm-stat-value">{stats.instalaciones}</span>
            <span className="adm-stat-label">Instalaciones</span>
          </div>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-toolbar">
          <div className="adm-toolbar-left">
            <div className="adm-search">
              <FaSearch />
              <input
                type="text"
                placeholder="Buscar por título o texto..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <select
              className="adm-select"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
            >
              <option value="todas">Todas las categorías</option>
              <option value="estudios">Consulta y Estudios</option>
              <option value="instalaciones">Instalaciones</option>
            </select>
            <select
              className="adm-select"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>
          </div>
          <div className="adm-toolbar-right">
            <span className="adm-count">
              <FaImages /> {itemsFiltrados.length} elementos
            </span>
          </div>
        </div>

        {loading ? (
          <div className="adm-loading">
            <div className="adm-spinner" />
            <p>Cargando galería...</p>
          </div>
        ) : itemsFiltrados.length === 0 ? (
          <div className="adm-empty">
            <FaImages />
            <h3>No hay elementos para mostrar</h3>
            <p>
              {items.length === 0
                ? "Creá el primer elemento para que aparezca en la galería."
                : "Probá con otros filtros o términos de búsqueda."}
            </p>
          </div>
        ) : (
          <div className="galeria-admin-grid">
            {itemsFiltrados.map((item) => {
              const cover = cubierta(item);
              return (
                <article className="galeria-admin-card" key={item._id}>
                  <div className="galeria-admin-cover">
                    {cover ? (
                      <img src={cover} alt={item.titulo} loading="lazy" />
                    ) : (
                      <div className="galeria-admin-cover-placeholder">
                        {item.categoria === "instalaciones" ? (
                          <FaBuilding />
                        ) : (
                          <FaStethoscope />
                        )}
                      </div>
                    )}
                    <span className="galeria-admin-category">
                      {item.categoria === "instalaciones"
                        ? "Instalaciones"
                        : "Estudio"}
                    </span>
                  </div>
                  <div className="galeria-admin-body">
                    <div className="galeria-admin-meta">
                      <span
                        className={`adm-badge ${item.activo ? "success" : "neutral"}`}
                      >
                        {item.activo ? "Visible" : "Oculto"}
                      </span>
                      <span className="galeria-admin-order">
                        Orden: {item.orden || 0}
                      </span>
                    </div>
                    <h3>{item.titulo}</h3>
                    {item.resumen && (
                      <p className="galeria-admin-summary">{item.resumen}</p>
                    )}
                    <div className="galeria-admin-actions">
                      <button
                        type="button"
                        className="adm-icon-btn edit"
                        title="Editar elemento"
                        onClick={() => abrirEditar(item)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        type="button"
                        className="adm-icon-btn delete"
                        title="Eliminar elemento"
                        onClick={() => eliminar(item)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="adm-modal-overlay" onClick={cerrarModal}>
          <div
            className="adm-modal adm-modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-modal-header">
              <div>
                <span className="adm-modal-eyebrow">Galería</span>
                <h3>
                  {editing ? "Editar elemento" : "Nuevo elemento"}
                </h3>
              </div>
              <button
                type="button"
                className="adm-modal-close"
                onClick={cerrarModal}
                title="Cerrar"
              >
                <FaTimes />
              </button>
            </div>

            <div className="adm-modal-body">
              <div className="galeria-admin-form-section">
                <h4>Información</h4>
                <div className="adm-form-grid">
                  <div className="adm-field">
                    <label>Categoría</label>
                    <select
                      name="categoria"
                      value={formData.categoria}
                      onChange={handleChange}
                    >
                      <option value="estudios">Consulta y Estudios</option>
                      <option value="instalaciones">Instalaciones</option>
                    </select>
                  </div>
                  <div className="adm-field">
                    <label>Estudio vinculado</label>
                    <select
                      value={formData.estudio}
                      onChange={handleEstudioChange}
                    >
                      <option value="">Sin vincular</option>
                      {estudios.map((estudio) => (
                        <option key={estudio._id} value={estudio._id}>
                          {estudio.tipo}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="adm-field full">
                    <label>Título</label>
                    <input
                      type="text"
                      name="titulo"
                      placeholder="Ej: Ecografía abdominal"
                      value={formData.titulo}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="adm-field full">
                    <label>Resumen explicativo</label>
                    <textarea
                      name="resumen"
                      rows="3"
                      placeholder="Objetivo del estudio, para qué sirve..."
                      value={formData.resumen}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="adm-field full">
                    <label>Indicaciones básicas</label>
                    <textarea
                      name="indicaciones"
                      rows="3"
                      placeholder="Preparación, recomendaciones, etc."
                      value={formData.indicaciones}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="adm-field">
                    <label>Orden</label>
                    <input
                      type="number"
                      name="orden"
                      min="0"
                      value={formData.orden}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="adm-field">
                    <label>Estado</label>
                    <label className="galeria-admin-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.activo}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            activo: e.target.checked,
                          }))
                        }
                      />
                      <span>Visible en la galería</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="galeria-admin-form-section">
                <h4>Imágenes</h4>

                <div className="galeria-admin-upload-block">
                  <span className="galeria-admin-label">Portada</span>
                  {formData.portada ? (
                    <div className="galeria-admin-cover-preview">
                      <img src={formData.portada} alt="Portada" />
                      <button
                        type="button"
                        className="galeria-admin-remove"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, portada: "" }))
                        }
                        title="Quitar portada"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div className="galeria-admin-cover-empty">
                      <FaImages />
                      <span>Sin portada</span>
                    </div>
                  )}
                  <div className="galeria-admin-upload-row">
                    <label className="adm-btn adm-btn-ghost">
                      <FaUpload /> {uploading ? "Subiendo..." : "Subir portada"}
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={subirPortada}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>

                <div className="galeria-admin-upload-block">
                  <span className="galeria-admin-label">
                    Galería de fotos ({formData.fotos.length})
                  </span>
                  {formData.fotos.length > 0 && (
                    <div className="galeria-admin-thumbs">
                      {formData.fotos.map((foto, index) => (
                        <div className="galeria-admin-thumb" key={`${foto}-${index}`}>
                          <img src={foto} alt={`Foto ${index + 1}`} />
                          <button
                            type="button"
                            className="galeria-admin-remove"
                            onClick={() => quitarFoto(foto)}
                            title="Quitar foto"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="galeria-admin-upload-row">
                    <label className="adm-btn adm-btn-ghost">
                      <FaUpload /> {uploading ? "Subiendo..." : "Subir fotos"}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={subirFotos}
                        disabled={uploading}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="adm-modal-footer">
              <button
                type="button"
                className="adm-btn adm-btn-ghost"
                onClick={cerrarModal}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                onClick={guardar}
                disabled={saving || uploading}
              >
                {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear elemento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
