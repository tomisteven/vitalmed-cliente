import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePacientes } from "../../hooks/usePacientes";
import Breadcrumbs from "../../utils/Breadcums";
import { WiCloudRefresh } from "react-icons/wi";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

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
  const [formData, setFormData] = useState({
    nombre: "",
    dni: "",
    email: "",
    fechaNacimiento: "",
    id: "",
  });

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userLog"));

  if (!user) navigate("/admin/login");
  if (user.rol === "paciente") navigate(`/admin/paciente/${user.usuario._id}`);

  const handleSubmit = async (e) => {
    console.log(formData);

    e.preventDefault();
    await savePaciente(formData, !!selectedPaciente);
    setModalOpen(false);
    setFormData({ nombre: "", dni: "", email: "", id: "" });
    setSelectedPaciente(null);
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
        onClick={() => setModalOpen(true)}
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
                    onClick={() => {
                      setSelectedPaciente(paciente);
                      setFormData({
                        nombre: paciente.nombre,
                        dni: paciente.dni,
                        email: paciente.email,
                        usuario: paciente.usuario,
                        password: paciente.password,
                        telefono: paciente.telefono,
                        fechaNacimiento: paciente.fechaNacimiento,
                        id: paciente._id,
                      });
                      setModalOpen(true);
                    }}
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

      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h3 className="paciente-crear-titulo">
              {selectedPaciente ? "Editar Paciente" : "Crear Nuevo Paciente"}
            </h3>
            <form onSubmit={handleSubmit}>
              <label className="label-paciente" for="">
                Nombre y Apellido
              </label>
              <input
                type="text"
                placeholder="Nombre y Apellido"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                required
              />
              <label className="label-paciente" for="">
                Telefono
              </label>
              <input
                type="text"
                placeholder="Numero de Telefono"
                value={formData.telefono}
                onChange={(e) =>
                  setFormData({ ...formData, telefono: e.target.value })
                }
              />
              <label className="label-paciente" for="">
                Cedula Identidad
              </label>
              <input
                type="text"
                placeholder="Cedula de Identidad"
                value={formData.dni}
                onChange={(e) =>
                  setFormData({ ...formData, dni: e.target.value })
                }
                required
              />
              <label className="label-paciente" for="">
                Email
              </label>
              <input
                type="text"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
              <label className="label-paciente" for="">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                value={formData.fechaNacimiento ? formData.fechaNacimiento.split('T')[0] : ""}
                onChange={(e) =>
                  setFormData({ ...formData, fechaNacimiento: e.target.value })
                }
              />
              <span className="divisor"></span>
              <label className="label-paciente" for="">
                Usuario
              </label>
              <input
                type="text"
                placeholder="Usuario"
                value={formData.usuario}
                onChange={(e) =>
                  setFormData({ ...formData, usuario: e.target.value })
                }
                required
              />
              <label className="label-paciente" for="">
                Contraseña
              </label>
              <input
                type="text"
                placeholder="Contraseña (Opcional)"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
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
