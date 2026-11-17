import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSecretaria } from "../../hooks/useSecretaria";
import {
  FaEdit,
  FaEnvelope,
  FaPhone,
  FaPlus,
  FaRedo,
  FaSearch,
  FaTimes,
  FaTrash,
  FaUserCheck,
} from "react-icons/fa";
import "./Secretarias.css";

const EMPTY_SECRETARIA = {
  nombre: "",
  usuario: "",
  password: "",
  email: "",
  telefono: "",
  id: "",
};

const Secretarias = ({ notificacion }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userLog") || "null");

  const {
    secretarias,
    saveSecretaria,
    deleteSecretaria,
    loading,
    refreshSecretarias,
  } = useSecretaria({ notificacion });

  const [selectSecretaria, setSelectSecretaria] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [secretariaData, setSecretariaData] = useState({ ...EMPTY_SECRETARIA });
  const [busqueda, setBusqueda] = useState("");

  const secretariasFiltradas = useMemo(() => {
    return secretarias.filter((secretaria) =>
      (secretaria.nombre || "").toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [secretarias, busqueda]);

  if (!user) {
    navigate("/admin/login");
    return null;
  }

  if (user.rol === "paciente") {
    navigate(`/admin/pacientes/${user.usuario._id}`);
    return null;
  }

  const total = secretariasFiltradas.length;
  const conEmail = secretariasFiltradas.filter((s) => s.email).length;
  const conTelefono = secretariasFiltradas.filter((s) => s.telefono).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    await saveSecretaria(secretariaData, !!selectSecretaria);
    setModalOpen(false);
    setSecretariaData({ ...EMPTY_SECRETARIA });
    setSelectSecretaria(null);
  };

  const handleEdit = (secretaria) => {
    setSecretariaData({
      nombre: secretaria.nombre || "",
      usuario: secretaria.usuario || "",
      password: secretaria.password || "",
      email: secretaria.email || "",
      telefono: secretaria.telefono || "",
      id: secretaria._id || "",
    });
    setSelectSecretaria(secretaria);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectSecretaria(null);
    setSecretariaData({ ...EMPTY_SECRETARIA });
  };

  return (
    <div className="container-secretarias admin-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">Equipo administrativo</span>
          <h1 className="admin-page-title">Secretarias</h1>
          <p className="admin-page-subtitle">
            Gestioná los accesos y datos del personal administrativo.
          </p>
        </div>

        <div className="admin-page-actions">
          <button
            type="button"
            className="adm-btn adm-btn-ghost"
            onClick={refreshSecretarias}
          >
            <FaRedo /> Actualizar
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-primary"
            onClick={() => setModalOpen(true)}
          >
            <FaPlus /> Nueva secretaria
          </button>
        </div>
      </header>

      <div className="adm-stats">
        <div className="adm-stat">
          <div className="adm-stat-icon">
            <FaUserCheck />
          </div>
          <div>
            <span className="adm-stat-value">{total}</span>
            <span className="adm-stat-label">Secretarias</span>
          </div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-icon">
            <FaEnvelope />
          </div>
          <div>
            <span className="adm-stat-value">{conEmail}</span>
            <span className="adm-stat-label">Con email</span>
          </div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-icon">
            <FaPhone />
          </div>
          <div>
            <span className="adm-stat-value">{conTelefono}</span>
            <span className="adm-stat-label">Con teléfono</span>
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
                placeholder="Buscar por nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>
          <div className="adm-toolbar-right">
            <span className="adm-count">
              <FaUserCheck /> {secretariasFiltradas.length} secretarias
            </span>
          </div>
        </div>

        {loading ? (
          <div className="adm-loading">
            <div className="adm-spinner" />
            <p>Cargando secretarias...</p>
          </div>
        ) : secretariasFiltradas.length === 0 ? (
          <div className="adm-empty">
            <FaUserCheck />
            <h3>No se encontraron secretarias</h3>
            <p>Probá con otro término de búsqueda.</p>
          </div>
        ) : (
          <div className="adm-table-wrapper">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Secretaria</th>
                  <th>Usuario</th>
                  <th>Teléfono</th>
                  <th>Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {secretariasFiltradas.map((secretaria) => (
                  <tr key={secretaria._id}>
                    <td>
                      <div className="adm-cell-main">{secretaria.nombre}</div>
                      <div className="adm-cell-sub">
                        {secretaria.email || "Sin email"}
                      </div>
                    </td>
                    <td>{secretaria.usuario || "No especifica"}</td>
                    <td>{secretaria.telefono || "-"}</td>
                    <td>
                      {secretaria.created_at
                        ? new Date(secretaria.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>
                      <div className="adm-actions">
                        <button
                          type="button"
                          className="adm-icon-btn edit"
                          title="Editar secretaria"
                          onClick={() => handleEdit(secretaria)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          type="button"
                          className="adm-icon-btn delete"
                          title="Eliminar secretaria"
                          onClick={() => deleteSecretaria(secretaria._id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="adm-modal-overlay">
          <div className="adm-modal">
            <div className="adm-modal-header">
              <div>
                <span className="adm-modal-eyebrow">Equipo administrativo</span>
                <h3>
                  {selectSecretaria ? "Editar secretaria" : "Nueva secretaria"}
                </h3>
              </div>
              <button
                type="button"
                className="adm-modal-close"
                onClick={handleCloseModal}
                title="Cerrar"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="adm-modal-body">
                <div className="adm-form-grid">
                  <div className="adm-field full">
                    <label>Nombre y apellido</label>
                    <input
                      type="text"
                      name="nombre"
                      placeholder="Nombre completo"
                      value={secretariaData.nombre}
                      onChange={(e) =>
                        setSecretariaData({
                          ...secretariaData,
                          nombre: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="adm-field">
                    <label>Usuario</label>
                    <input
                      type="text"
                      name="usuario"
                      placeholder="Usuario de acceso"
                      value={secretariaData.usuario}
                      onChange={(e) =>
                        setSecretariaData({
                          ...secretariaData,
                          usuario: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="adm-field">
                    <label>Contraseña</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Contraseña de acceso"
                      value={secretariaData.password}
                      onChange={(e) =>
                        setSecretariaData({
                          ...secretariaData,
                          password: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="adm-field">
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="correo@ejemplo.com"
                      value={secretariaData.email}
                      onChange={(e) =>
                        setSecretariaData({
                          ...secretariaData,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="adm-field">
                    <label>Teléfono</label>
                    <input
                      type="text"
                      name="telefono"
                      placeholder="Número de contacto"
                      value={secretariaData.telefono}
                      onChange={(e) =>
                        setSecretariaData({
                          ...secretariaData,
                          telefono: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="adm-modal-footer">
                <button
                  type="button"
                  className="adm-btn adm-btn-ghost"
                  onClick={handleCloseModal}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="adm-btn adm-btn-primary"
                  disabled={loading}
                >
                  {loading
                    ? "Guardando..."
                    : selectSecretaria
                      ? "Guardar cambios"
                      : "Crear secretaria"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Secretarias;
