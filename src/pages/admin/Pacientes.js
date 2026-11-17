import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePacientes } from "../../hooks/usePacientes";
import {
  FaEdit,
  FaEye,
  FaFolderOpen,
  FaPlus,
  FaRedo,
  FaSearch,
  FaTrash,
  FaUserPlus,
  FaUsers,
} from "react-icons/fa";
import ModalPaciente from "../../Components/Admin/ModalPaciente";
import "./Pacientes.css";

export default function Pacientes({ notificacion }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userLog") || "null");

  const {
    pacientes,
    loading,
    savePaciente,
    deletePaciente,
    searchPaciente,
    refreshPacientes,
  } = usePacientes({ notificacion });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [loadingSave, setLoadingSave] = useState(false);

  if (!user) {
    navigate("/admin/login");
    return null;
  }

  if (user.rol === "paciente") {
    navigate(`/admin/pacientes/${user.usuario._id}`);
    return null;
  }

  const pacientesFiltrados = pacientes.filter((paciente) => {
    if (user.rol === "doctor") {
      const pacientesDoctor = user.usuario.pacientes || [];
      return pacientesDoctor.some((p) => (p._id || p) === paciente._id);
    }
    return true;
  });

  const total = pacientesFiltrados.length;
  const ahora = new Date();
  const nuevosMes = pacientesFiltrados.filter((paciente) => {
    if (!paciente.created_at) return false;
    const fecha = new Date(paciente.created_at);
    return (
      fecha.getMonth() === ahora.getMonth() &&
      fecha.getFullYear() === ahora.getFullYear()
    );
  }).length;
  const conDocumentos = pacientesFiltrados.filter(
    (paciente) => (paciente.documentos?.length || 0) > 0
  ).length;

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

  const handleRefresh = () => {
    refreshPacientes();
    notificacion("Pacientes actualizados", "success");
  };

  return (
    <div className="container-pacientes admin-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">Gestión de pacientes</span>
          <h1 className="admin-page-title">Pacientes</h1>
          <p className="admin-page-subtitle">
            Consultá, actualizá y administrá la información de tus pacientes.
          </p>
        </div>

        <div className="admin-page-actions">
          <button
            type="button"
            className="adm-btn adm-btn-ghost"
            onClick={handleRefresh}
          >
            <FaRedo /> Actualizar
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-primary"
            hidden={user.rol === "paciente" || user.rol === "doctor"}
            onClick={() => handleOpenModal()}
          >
            <FaPlus /> Nuevo paciente
          </button>
        </div>
      </header>

      <div className="adm-stats">
        <div className="adm-stat">
          <div className="adm-stat-icon">
            <FaUsers />
          </div>
          <div>
            <span className="adm-stat-value">{total}</span>
            <span className="adm-stat-label">Pacientes visibles</span>
          </div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-icon">
            <FaUserPlus />
          </div>
          <div>
            <span className="adm-stat-value">{nuevosMes}</span>
            <span className="adm-stat-label">Nuevos este mes</span>
          </div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-icon">
            <FaFolderOpen />
          </div>
          <div>
            <span className="adm-stat-value">{conDocumentos}</span>
            <span className="adm-stat-label">Con documentos</span>
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
                placeholder="Buscar por nombre o cédula..."
                onChange={(e) => searchPaciente(e.target.value)}
              />
            </div>
          </div>
          <div className="adm-toolbar-right">
            <span className="adm-count">
              <FaUsers /> {pacientesFiltrados.length} pacientes
            </span>
          </div>
        </div>

        {loading ? (
          <div className="adm-loading">
            <div className="adm-spinner" />
            <p>Cargando pacientes...</p>
          </div>
        ) : pacientesFiltrados.length === 0 ? (
          <div className="adm-empty">
            <FaUsers />
            <h3>No se encontraron pacientes</h3>
            <p>Probá con otro término de búsqueda.</p>
          </div>
        ) : (
          <div className="adm-table-wrapper">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Cédula</th>
                  <th>Teléfono</th>
                  <th>Usuario</th>
                  <th>Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {pacientesFiltrados.map((paciente) => (
                  <tr key={paciente._id}>
                    <td>
                      <div className="adm-cell-main">{paciente.nombre}</div>
                      <div className="adm-cell-sub">
                        {paciente.email || "Sin email"}
                      </div>
                    </td>
                    <td>{paciente.dni || "-"}</td>
                    <td>{paciente.telefono || "-"}</td>
                    <td>{paciente.usuario || "No especifica"}</td>
                    <td>
                      {paciente.created_at
                        ? new Date(paciente.created_at).toLocaleDateString()
                        : "-"}
                    </td>
                    <td>
                      <div className="adm-actions">
                        <button
                          type="button"
                          className="adm-icon-btn view"
                          title="Ver detalle"
                          onClick={() =>
                            navigate(`/admin/pacientes/${paciente._id}`)
                          }
                        >
                          <FaEye />
                        </button>
                        <button
                          type="button"
                          className="adm-icon-btn edit"
                          title="Editar paciente"
                          hidden={
                            user.rol === "paciente" || user.rol === "doctor"
                          }
                          onClick={() => handleOpenModal(paciente)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          type="button"
                          className="adm-icon-btn delete"
                          title="Eliminar paciente"
                          hidden={
                            user.rol === "paciente" || user.rol === "doctor"
                          }
                          onClick={() => deletePaciente(paciente._id)}
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
