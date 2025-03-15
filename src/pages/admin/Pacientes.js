import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePacientes } from "../../hooks/usePacientes";
import Breadcrumbs from "../../utils/Breadcums";
import ClipLoader from "react-spinners/ClipLoader";
import { Icon } from "semantic-ui-react";
import "./Pacientes.css";

export default function Pacientes({ notificacion }) {
  const {
    pacientes,
    loading,
    refreshPacientes,
    savePaciente,
    deletePaciente,
    searchPaciente,
  } = usePacientes({ notificacion });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    dni: "",
    email: "",
    id: "",
  });
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userLog"));

  if (!user) navigate("/admin/login");
  if (user.rol === "paciente") navigate(`/admin/paciente/${user.usuario._id}`);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await savePaciente(formData, !!selectedPaciente);
    setModalOpen(false);
    setFormData({ nombre: "", dni: "", email: "", id: "" });
    setSelectedPaciente(null);
  };

  return (
    <div className="container-pacientes">
      <Breadcrumbs />
      <h2 className="title">
        Lista de Pacientes {pacientes.length + " (Pacientes)"}
      </h2>

      <input
        type="text"
        placeholder="Buscar por nombre"
        onChange={(e) => searchPaciente(e.target.value)}
        className="search-input-pacientes"
      />
      <button className="add-button" onClick={() => setModalOpen(true)}>
        Crear Paciente
      </button>

      {loading ? (
        <div className="pacientes-container">
          <ClipLoader color="#36d7b7" size={50} />
        </div>
      ) : (
        <table className="pacientes-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>DNI</th>
              <th>Email</th>
              <th>Fecha de Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pacientes.map((paciente) => (
              <tr key={paciente._id}>
                <td>{paciente.nombre}</td>
                <td>{paciente.dni}</td>
                <td>{paciente.email}</td>
                <td>{new Date(paciente.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn-ver"
                    onClick={() => navigate(`/admin/pacientes/${paciente._id}`)}
                  >
                    Ver
                  </button>
                  <button
                    className="btn-editar"
                    onClick={() => {
                      setSelectedPaciente(paciente);
                      setFormData({
                        nombre: paciente.nombre,
                        dni: paciente.dni,
                        email: paciente.email,
                        id: paciente._id,
                      }); // 👈 Ahora se llena el formulario con los datos del paciente
                      setModalOpen(true);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    className="btn-eliminar"
                    onClick={() => deletePaciente(paciente._id)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h3>
              {selectedPaciente ? "Editar Paciente" : "Crear Nuevo Paciente"}
            </h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="DNI"
                value={formData.dni}
                onChange={(e) =>
                  setFormData({ ...formData, dni: e.target.value })
                }
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
              <div className="modal-actions">
                <button type="submit" className="btn-guardar">
                  Guardar
                </button>
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() => setModalOpen(false)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
