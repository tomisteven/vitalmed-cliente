import React, { useEffect, useState } from "react";
import { DoctoresApi } from "../../api/Doctores";
import ClipLoader from "react-spinners/ClipLoader";
import "./Doctores.css"; // Importa los estilos
import Breadcrumbs from "../../utils/Breadcums";

const doctorApi = new DoctoresApi();

const Doctores = () => {
  const [doctores, setDoctores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [doctorData, setDoctorData] = useState({
    nombre: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    fetchDoctores();
  }, []);

  const fetchDoctores = async () => {
    try {
      const response = await doctorApi.getDoctores();
      setDoctores(response);
    } catch (error) {
      console.error("Error al obtener los doctores", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setDoctorData({ ...doctorData, [e.target.name]: e.target.value });
  };

  const handleSaveDoctor = async () => {
    try {
      if (editingDoctor) {
        await doctorApi.updateDoctor(editingDoctor._id, doctorData);
      } else {
        await doctorApi.createDoctor(doctorData);
      }
      setModalOpen(false);
      setDoctorData({ nombre: "", email: "", password: "" });
      setEditingDoctor(null);
      fetchDoctores();
    } catch (error) {
      console.error("Error al guardar el doctor", error);
    }
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setDoctorData({
      nombre: doctor.nombre,
      email: doctor.email,
      password: doctor.password,
    });
    setModalOpen(true);
  };

  return (
    <div className="container-doctores">
      <Breadcrumbs />
      <h2 className="title">Lista de Doctores</h2>
      <button className="btn-add-doctor" onClick={() => setModalOpen(true)}>
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
                {editingDoctor ? "Actualizar" : "Guardar"}
              </button>
              <button className="btn-close" onClick={() => setModalOpen(false)}>
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
