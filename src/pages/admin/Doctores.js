import React from "react";
import { useDoctor } from "../../hooks/useDoctor";
import ClipLoader from "react-spinners/ClipLoader";
import Breadcrumbs from "../../utils/Breadcums";
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
        <div className="container-doctores">
          <ClipLoader size={50} color={"#123abc"} loading={loading} />
        </div>
      ) : doctores.length === 0 ? (
        <p className="empty-message">No hay doctores registrados.</p>
      ) : (
        <table className="doctores-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Contraseña</th>
              <th>Fecha de Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {doctores.map((doctor) => (
              <tr key={doctor._id}>
                <td>{doctor.nombre}</td>
                <td>{doctor.email}</td>
                <td>{doctor.password}</td>
                <td>{new Date(doctor.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(doctor)}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => deleteDoctor(doctor._id)}
                  >
                    🗑️ Eliminar
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
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={doctorData.email}
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
                  <ClipLoader size={15} color={"#123abc"} loading={loading} />
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
