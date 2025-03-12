import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PacienteApi } from "../../api/Paciente";
import "./Pacientes.css";
import Breadcrumbs from "../../utils/Breadcums";
import ClipLoader from "react-spinners/ClipLoader"; // Importamos el loader
import { Icon } from "semantic-ui-react";

const PacienteController = new PacienteApi();

export default function Pacientes({ notificacion }) {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true); // Estado para el loader
  const [modalOpen, setModalOpen] = useState(false);
  const [statusChange, setStatusChange] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [formData, setFormData] = useState({ nombre: "", dni: "", email: "" });
  const [create, setCreate] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userLog"));

  if (!user) {
    navigate("/admin/login");
  }

  if (user.rol === "paciente") {
    navigate("/admin/paciente/" + user.usuario._id);
  }



  useEffect(() => {
    const fetchPacientes = async () => {
      setLoading(true);
      try {
        const response = await PacienteController.getPacientes();
        setPacientes(response.reverse());
        sessionStorage.setItem("pacientes", JSON.stringify(response.reverse())); // Guardar en caché
      } catch (error) {
        console.error("Error al obtener los pacientes", error);
      } finally {
        setLoading(false);
      }
    };
    const cachedPacientes = sessionStorage.getItem("pacientes");
    if (cachedPacientes) {
      setPacientes(JSON.parse(cachedPacientes));
      setLoading(false);
    } else {
      fetchPacientes();
    }
  }, [statusChange]);

  const changeStatus = () => {
    setStatusChange(!statusChange);
  };

  const searchPaciente = async (e) => {
    try {
      const response = await PacienteController.getPacientes();
      const filteredPacientes = response.filter((paciente) =>
        paciente.nombre.toLowerCase().includes(e.target.value.toLowerCase())
      );
      setPacientes(filteredPacientes);
    } catch (error) {
      console.error("Error al buscar pacientes", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedPaciente) {
        const paciente = await PacienteController.updatePaciente(
          selectedPaciente._id,
          formData
        );
      } else {
        const paciente = await PacienteController.createPaciente(formData);
      }
      setModalOpen(false);
      setFormData({ nombre: "", dni: "", email: "" });
      setSelectedPaciente(null);
      changeStatus();
      setPacientes(
        selectedPaciente
          ? pacientes.map((paciente) =>
              paciente._id === selectedPaciente._id
                ? { ...paciente, ...formData }
                : paciente
            )
          : [...pacientes, paciente]
      );
    } catch (error) {
      console.error("Error al guardar paciente", error);
    }
  };

  const openEditModal = (paciente) => {
    setSelectedPaciente(paciente);
    setFormData({
      nombre: paciente.nombre,
      dni: paciente.dni,
      email: paciente.email,
    });
    setModalOpen(true);
  };

  return (
    <div className="container-pacientes">
      <Breadcrumbs />
      <h2 className="title">Lista de Pacientes</h2>{" "}
      <Icon
        name="redo"
        className="icon-reload"
        color="blue"
        onClick={() => fetchPacientes()}
      />
      <input
        type="text"
        placeholder="Buscar por nombre"
        onChange={searchPaciente}
        className="search-input-pacientes"
      />
      <button
        className="add-button"
        onClick={() => {
          setModalOpen(true);
          setSelectedPaciente(null);
          setFormData({ nombre: "", dni: "", email: "" });
        }}
      >
        Crear Paciente
      </button>
      {loading ? (
        <div className="container-pacientes">
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
                    onClick={() => openEditModal(paciente)}
                  >
                    Editar
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
