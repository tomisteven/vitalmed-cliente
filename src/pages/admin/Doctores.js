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

  return (
    <div className="container-doctores">
      <Breadcrumbs />
      <h2 className="title">Cantidad de Doctores: {doctores.length}</h2>
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
      ) : doctores.length === 0 ? (
        <p className="empty-message">No hay doctores registrados.</p>
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
            {doctores.map((doctor) => (
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
