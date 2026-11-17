import React from "react";
import { useDoctor } from "../../hooks/useDoctor";
import {
  FaEdit,
  FaPlus,
  FaRedo,
  FaSearch,
  FaStar,
  FaTimes,
  FaTrash,
  FaUserMd,
} from "react-icons/fa";
import "./Doctores.css";

const Doctores = ({ notificacion }) => {
  const {
    doctores,
    loading,
    modalOpen,
    editingDoctor,
    doctorData,
    handleInputChange,
    handleSaveDoctor,
    handleEdit,
    openModal,
    deleteDoctor,
    closeModal,
    fetchDoctores,
  } = useDoctor({ notificacion });

  const [busqueda, setBusqueda] = React.useState("");
  const [especialidadFiltro, setEspecialidadFiltro] = React.useState("");

  const especialidades = React.useMemo(() => {
    return [...new Set(doctores.map((doctor) => doctor.especialidad).filter(Boolean))];
  }, [doctores]);

  const doctoresFiltrados = React.useMemo(() => {
    return doctores.filter((doctor) => {
      const nombre = (doctor.nombre || "").toLowerCase();
      const matchNombre = nombre.includes(busqueda.toLowerCase());
      const matchEspecialidad = especialidadFiltro
        ? doctor.especialidad === especialidadFiltro
        : true;
      return matchNombre && matchEspecialidad;
    });
  }, [doctores, busqueda, especialidadFiltro]);

  const total = doctoresFiltrados.length;
  const totalEspecialidades = especialidades.length;

  return (
    <div className="container-doctores admin-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">Equipo médico</span>
          <h1 className="admin-page-title">Doctores</h1>
          <p className="admin-page-subtitle">
            Administrá los profesionales que forman parte del consultorio.
          </p>
        </div>

        <div className="admin-page-actions">
          <button
            type="button"
            className="adm-btn adm-btn-ghost"
            onClick={fetchDoctores}
          >
            <FaRedo /> Actualizar
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-primary"
            onClick={openModal}
          >
            <FaPlus /> Nuevo doctor
          </button>
        </div>
      </header>

      <div className="adm-stats">
        <div className="adm-stat">
          <div className="adm-stat-icon">
            <FaUserMd />
          </div>
          <div>
            <span className="adm-stat-value">{total}</span>
            <span className="adm-stat-label">Doctores</span>
          </div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-icon">
            <FaStar />
          </div>
          <div>
            <span className="adm-stat-value">{totalEspecialidades}</span>
            <span className="adm-stat-label">Especialidades</span>
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
            <select
              className="adm-select"
              value={especialidadFiltro}
              onChange={(e) => setEspecialidadFiltro(e.target.value)}
            >
              <option value="">Todas las especialidades</option>
              {especialidades.map((especialidad) => (
                <option key={especialidad} value={especialidad}>
                  {especialidad}
                </option>
              ))}
            </select>
          </div>
          <div className="adm-toolbar-right">
            <span className="adm-count">
              <FaUserMd /> {doctoresFiltrados.length} doctores
            </span>
          </div>
        </div>

        {loading ? (
          <div className="adm-loading">
            <div className="adm-spinner" />
            <p>Cargando doctores...</p>
          </div>
        ) : doctoresFiltrados.length === 0 ? (
          <div className="adm-empty">
            <FaUserMd />
            <h3>No se encontraron doctores</h3>
            <p>Probá con otro nombre o especialidad.</p>
          </div>
        ) : (
          <div className="adm-table-wrapper">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Especialidad</th>
                  <th>Usuario</th>
                  <th>Teléfono</th>
                  <th>Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {doctoresFiltrados.map((doctor) => (
                  <tr key={doctor._id}>
                    <td>
                      <div className="adm-cell-main">{doctor.nombre}</div>
                      <div className="adm-cell-sub">
                        {doctor.email || "Sin email"}
                      </div>
                    </td>
                    <td>
                      {doctor.especialidad ? (
                        <span className="adm-badge info">
                          {doctor.especialidad}
                        </span>
                      ) : (
                        <span className="adm-badge neutral">Sin definir</span>
                      )}
                    </td>
                    <td>{doctor.usuario || "No especifica"}</td>
                    <td>{doctor.telefono || "-"}</td>
                    <td>
                      {doctor.created_at
                        ? new Date(doctor.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>
                      <div className="adm-actions">
                        <button
                          type="button"
                          className="adm-icon-btn edit"
                          title="Editar doctor"
                          onClick={() => handleEdit(doctor)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          type="button"
                          className="adm-icon-btn delete"
                          title="Eliminar doctor"
                          onClick={() => deleteDoctor(doctor._id)}
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
                <span className="adm-modal-eyebrow">Equipo médico</span>
                <h3>{editingDoctor ? "Editar doctor" : "Nuevo doctor"}</h3>
              </div>
              <button
                type="button"
                className="adm-modal-close"
                onClick={closeModal}
                title="Cerrar"
              >
                <FaTimes />
              </button>
            </div>

            <div className="adm-modal-body">
              <div className="adm-form-grid">
                <div className="adm-field full">
                  <label>Nombre y apellido</label>
                  <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre completo"
                    value={doctorData.nombre}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="adm-field">
                  <label>Especialidad</label>
                  <input
                    type="text"
                    name="especialidad"
                    placeholder="Ej: Ultrasonografía"
                    value={doctorData.especialidad}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="adm-field">
                  <label>Usuario</label>
                  <input
                    type="text"
                    name="usuario"
                    placeholder="Usuario de acceso"
                    value={doctorData.usuario}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="adm-field">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="correo@ejemplo.com"
                    value={doctorData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="adm-field">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    name="telefono"
                    placeholder="Número de contacto"
                    value={doctorData.telefono}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="adm-field full">
                  <label>Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Contraseña de acceso"
                    value={doctorData.password}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="adm-modal-footer">
              <button
                type="button"
                className="adm-btn adm-btn-ghost"
                onClick={closeModal}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                onClick={handleSaveDoctor}
                disabled={loading}
              >
                {loading
                  ? "Guardando..."
                  : editingDoctor
                    ? "Guardar cambios"
                    : "Crear doctor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctores;
