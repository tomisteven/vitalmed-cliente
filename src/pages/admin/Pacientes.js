import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePacientes } from "../../hooks/usePacientes";
import Breadcrumbs from "../../utils/Breadcums";
import { WiCloudRefresh } from "react-icons/wi";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import ModalPaciente from "../../Components/Admin/ModalPaciente";

import "./Pacientes.css";
import { LoaderIcon } from "react-hot-toast";

export default function Pacientes({ notificacion }) {
  const {
    pacientes,
    loading,
    savePaciente,
    deletePaciente,
    searchPaciente,
    refreshPacientes,
    setPacientes
  } = usePacientes({ notificacion });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [loadingSave, setLoadingSave] = useState(false);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userLog"));

  if (!user) navigate("/admin/login");
  if (user.rol === "paciente") navigate(`/admin/paciente/${user.usuario._id}`);

  const handleOpenModal = (paciente = null) => {
    setSelectedPaciente(paciente);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPaciente(null);
  };

  const handleSave = async (formData, isEdit) => {
    setLoadingSave(true);
    try {
      await savePaciente(formData, isEdit);
      handleCloseModal();
    } finally {
      setLoadingSave(false);
    }
  };

  const pacientesFiltrados = pacientes.filter((paciente) => {
    if (user.rol === "doctor") {
      const pacientesDoctor = user.usuario.pacientes || [];
      return pacientesDoctor.some((p) => (p._id || p) === paciente._id);
    }
    return true;
  });

  return (
    <div className="container-pacientes">
      <Breadcrumbs />
      <h2 className="title ">
        Lista de Pacientes {pacientesFiltrados.length + " (Pacientes)"}
      </h2>
      <button
        className="btn-refresh"
        onClick={() => {
          refreshPacientes();
          notificacion("Pacientes actualizados", "success");
        }}
      >
        <WiCloudRefresh size={40} />
      </button>
      <input
        type="text"
        placeholder="Buscar por nombre o cédula"
        onChange={(e) => searchPaciente(e.target.value)}
        className="search-input-pacientes"
      />
      <button
        hidden={user.rol === "paciente" || user.rol === "doctor"}
        className="add-button"
        onClick={() => handleOpenModal()}
      >
        NUEVO
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
      ) : (
        <table className="pacientes-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Cedula</th>
              <th>Email</th>
              <th>Usuario</th>
              <th>Contraseña</th>
              <th>Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pacientesFiltrados.map((paciente) => (
              <tr key={paciente._id}>
                <td>{paciente.nombre}</td>
                <td>{paciente.dni}</td>
                <td>{paciente.email}</td>
                <td>{paciente.usuario || "No Especifica"}</td>
                <td>{paciente.password || "No Especifica"}</td>
                <td>{new Date(paciente.created_at).toLocaleDateString()}</td>
                <td className="acciones-cell">
                  <button
                    className="btn-icon btn-ver"
                    onClick={() => navigate(`/admin/pacientes/${paciente._id}`)}
                    title="Ver detalles"
                  >
                    <FaEye />
                  </button>
                  <button
                    hidden={user.rol === "paciente" || user.rol === "doctor"}
                    className="btn-icon btn-editar"
                    onClick={() => handleOpenModal(paciente)}
                    title="Editar paciente"
                  >
                    <FaEdit />
                  </button>
                  <button
                    hidden={user.rol === "paciente" || user.rol === "doctor"}
                    className="btn-icon btn-eliminar"
                    onClick={() => deletePaciente(paciente._id)}
                    title="Eliminar paciente"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ModalPaciente
        open={modalOpen}
        onClose={handleCloseModal}
        selectedPaciente={selectedPaciente}
        onSave={handleSave}
        loading={loadingSave}
      />
    </div>
  );
}
