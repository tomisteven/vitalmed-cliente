import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePacientes } from "../../hooks/usePacientes";
import Breadcrumbs from "../../utils/Breadcums";

import "./Pacientes.css";
import { LoaderIcon } from "react-hot-toast";

export default function Pacientes({ notificacion }) {
  const { pacientes, loading, savePaciente, deletePaciente, searchPaciente } =
    usePacientes({ notificacion });
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
    console.log(formData);

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
      <button
        hidden={user.rol === "paciente" || user.rol === "doctor"}
        className="add-button"
        onClick={() => setModalOpen(true)}
      >
        Crear Paciente
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
              <th>Cedula Identidad</th>
              <th>Email</th>
              <th>Usuario</th>
              <th>Contraseña</th>
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
                <td>{paciente.usuario || "No Especifica"}</td>
                <td>{paciente.password || "No Especifica"}</td>
                <td>{new Date(paciente.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn-ver"
                    onClick={() => navigate(`/admin/pacientes/${paciente._id}`)}
                  >
                    Ver
                  </button>
                  <button
                    hidden={user.rol === "paciente" || user.rol === "doctor"}
                    className="btn-editar"
                    onClick={() => {
                      setSelectedPaciente(paciente);
                      setFormData({
                        nombre: paciente.nombre,
                        dni: paciente.dni,
                        email: paciente.email,
                        usuario: paciente.usuario,
                        password: paciente.password,
                        telefono: paciente.telefono,
                        id: paciente._id,
                      }); // 👈 Ahora se llena el formulario con los datos del paciente
                      setModalOpen(true);
                    }}
                  >
                    Editar
                  </button>
                  <button
                    hidden={user.rol === "paciente" || user.rol === "doctor"}
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
