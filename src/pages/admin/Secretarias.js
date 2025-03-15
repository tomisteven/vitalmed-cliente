import React, { useEffect, useState } from "react";
import { SecretariaApi } from "../../api/Secretaria";
import "./Secretarias.css"; // Importa los estilos
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../../utils/Breadcums";
import { ClipLoader } from "react-spinners"; // Importa el loader
import { useSecretaria } from "../../hooks/useSecretaria";


const Secretarias = ({ notificacion }) => {
  const {
    secretarias,
    loading,
    saveSecretaria,
    deleteSecretaria,
  } = useSecretaria({ notificacion });
  const [selectSecretaria, setSelectSecretaria] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [secretariaData, setSecretariaData] = useState({
    nombre: "",
    email: "",
    password: "",
    id: "",
  });

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userLog"));

  if (!user) {
    navigate("/admin/login");
  }

  if (user.rol === "paciente") {
    navigate("/admin/paciente/" + user.usuario._id);
  }

  const handleSubmit = async (e) => {
    console.log(secretariaData);

    e.preventDefault();
    await saveSecretaria(secretariaData, !!selectSecretaria);
    setModalOpen(false);
    setSecretariaData({ nombre: "", email: "", password: "", id: "" });
    setSelectSecretaria(null);
  };

  const handleEdit = (secretaria) => {
    setSecretariaData({
      nombre: secretaria.nombre,
      email: secretaria.email,
      password: secretaria.password,
      id: secretaria._id,
    });
    setSelectSecretaria(secretaria);
    setModalOpen(true);
  };

  return (
    <div className="container-secretarias">
      <Breadcrumbs />
      <h2 className="title-secretarias">Cantidad de Secretarias: {secretarias.length}</h2>
      <button className="btn-add" onClick={() => setModalOpen(true)}>
        + Agregar Secretaria
      </button>

      {loading ? (
        // Muestra el loader mientras carga la data
        <div className="container-secretarias">
          <ClipLoader size={50} color={"#007bff"} loading={loading} />
          <p className="p-cargando">Cargando secretarias...</p>
        </div>
      ) : secretarias.length === 0 ? (
        <p className="empty-message">No hay secretarias registradas.</p>
      ) : (
        <table className="secretarias-table">
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
            {secretarias.map((secretaria) => (
              <tr key={secretaria._id}>
                <td>{secretaria.nombre}</td>
                <td>{secretaria.email}</td>
                <td>{secretaria.password}</td>
                <td>{new Date(secretaria.created_at).toLocaleDateString()}</td>
                <td>
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(secretaria)}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    className="btn-eliminar"
                    onClick={() => deleteSecretaria(secretaria._id)}
                  >
                    🗑️ Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* MODAL */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>
              {selectSecretaria
                ? "Editar Secretaria"
                : "Agregar Nueva Secretaria"}
            </h3>
            <label>Nombre</label>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={secretariaData.nombre}
                onChange={(e) =>
                  setSecretariaData({
                    ...secretariaData,
                    nombre: e.target.value,
                  })
                }
              />
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={secretariaData.email}
                onChange={(e) =>
                  setSecretariaData({
                    ...secretariaData,
                    email: e.target.value,
                  })
                }
              />
              <label>Contraseña</label>
              <input
                type="password"
                name="password"
                placeholder="Contraseña"
                value={secretariaData.password}
                onChange={(e) =>
                  setSecretariaData({
                    ...secretariaData,
                    password: e.target.value,
                  })
                }
              />
              <div className="modal-buttons">
                <button className="btn-save" type="submit">
                  {loading ? "Guardando... Aguarde" : "Guardar"}
                </button>
                <button
                  className="btn-close"
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
};

export default Secretarias;
