import React from "react";
import { useDoctor } from "../../hooks/useDoctor";
import { LoaderIcon } from "react-hot-toast";
import Breadcrumbs from "../../utils/Breadcums";
import { FaEdit, FaTrash } from "react-icons/fa";
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
  } = useDoctor({ notificacion });

  // Estados para el buscador
  const [busqueda, setBusqueda] = React.useState("");
  const [especialidadFiltro, setEspecialidadFiltro] = React.useState("");

  // Obtener lista única de especialidades
  const especialidades = React.useMemo(() => {
    return [...new Set(doctores.map(d => d.especialidad).filter(Boolean))];
  }, [doctores]);

  // Filtrar doctores
  const doctoresFiltrados = React.useMemo(() => {
    return doctores.filter((doctor) => {
      const matchNombre = doctor.nombre.toLowerCase().includes(busqueda.toLowerCase());
      const matchEspecialidad = especialidadFiltro ? doctor.especialidad === especialidadFiltro : true;
      return matchNombre && matchEspecialidad;
    });
  }, [doctores, busqueda, especialidadFiltro]);

  return (
    <div className="container-doctores">
      <Breadcrumbs />
      
      {/* Buscador y Filtros */}
      <div className="filtros-container" style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap', backgroundColor: '#894172', padding: '10px', borderRadius: '5px' }}>
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-search"
            style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #ddd', minWidth: '250px' }}
          />
        </div>
        <div className="filter-box">
          <select
            value={especialidadFiltro}
            onChange={(e) => setEspecialidadFiltro(e.target.value)}
            className="select-filter"
            style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #ddd', minWidth: '200px' }}
          >
            <option value="">Todas las especialidades</option>
            {especialidades.map(esp => (
              <option key={esp} value={esp}>{esp}</option>
            ))}
          </select>
        </div>
      </div>

      <h2 className="title">Cantidad de Doctores: {doctoresFiltrados.length}</h2>
      <button className="btn-add-doctor" onClick={openModal}>
        + Agregar Doctor
      </button>

      {loading ? (
        <div className="container-pacientes-loader">
          <LoaderIcon
            style={{
              width: "30px",
              height: "30px",
              color: "#ff7e67",
              marginTop: "50px",
            }}
          />
        </div>
      ) : doctoresFiltrados.length === 0 ? (
        <p className="empty-message">No se encontraron doctores con los filtros seleccionados.</p>
      ) : (
        <table className="doctores-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Usuario</th>
              <th>Contraseña</th>
              <th>Especialidad</th>
              <th>Fecha de Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {doctoresFiltrados.map((doctor) => (
              <tr key={doctor._id}>
                <td>{doctor.nombre}</td>
                <td>{doctor.usuario}</td>
                <td>{doctor.password}</td>
                <td>{doctor.especialidad}</td>
                <td>{new Date(doctor.created_at).toLocaleDateString()}</td>
                <td className="acciones-cell">
                  <button
                    className="btn-icon btn-edit"
                    onClick={() => handleEdit(doctor)}
                    title="Editar doctor"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    onClick={() => deleteDoctor(doctor._id)}
                    title="Eliminar doctor"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{editingDoctor ? "Editar Doctor" : "Agregar Nuevo Doctor"}</h3>
            <label>Nombre</label>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={doctorData.nombre}
              onChange={handleInputChange}
            />
            <label>Especialidad</label>
            <input
              type="text"
              name="especialidad"
              placeholder="Especialidad"
              value={doctorData.especialidad}
              onChange={handleInputChange}
            />
            <label>Usuario</label>
            <input
              type="usuario"
              name="usuario"
              placeholder="Usuario"
              value={doctorData.usuario}
              onChange={handleInputChange}
            />
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={doctorData.password}
              onChange={handleInputChange}
            />

            <div className="modal-buttons">
              <button className="btn-save" onClick={handleSaveDoctor}>
                {loading ? (
                  <LoaderIcon />
                ) : editingDoctor ? (
                  "Guardar Cambios"
                ) : (
                  "Agregar Doctor"
                )}
              </button>
              <button className="btn-close" onClick={closeModal}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctores;
