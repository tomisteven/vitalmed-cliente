import React, { useEffect, useState } from "react";
import { SecretariaApi } from "../../api/Secretaria";
import "./Secretarias.css"; // Importa los estilos
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../../utils/Breadcums";
import { ClipLoader } from "react-spinners"; // Importa el loader

const secretariaApi = new SecretariaApi();

const Secretarias = () => {
  const [secretarias, setSecretarias] = useState([]);
  const [loading, setLoading] = useState(true); // Estado para el loader
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSecretaria, setEditingSecretaria] = useState(null);
  const [statusChange, setStatusChange] = useState(false);
  const [secretariaData, setSecretariaData] = useState({
    nombre: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("userLog"));

  if (!user) {
    navigate("/admin/login");
  }

  if (user.rol === "paciente") {
    navigate("/admin/paciente/" + user.usuario._id);
  }

  useEffect(() => {
    const secretariasCache = sessionStorage.getItem("secretarias");
    if (secretariasCache) {
      setSecretarias(JSON.parse(secretariasCache));
      setLoading(false);
    } else {
      fetchSecretarias();
    }
  }, [statusChange]);

  const changeStatus = () => {
    setStatusChange(!statusChange);
  };

  const fetchSecretarias = async () => {
    setLoading(true); // Activa el loader antes de la petición
    try {
      const response = await secretariaApi.getSecretarias();
      setSecretarias(response);
      sessionStorage.setItem("secretarias", JSON.stringify(response)); // Guardar en caché
    } catch (error) {
      console.error("Error al obtener las secretarias", error);
    }
    setLoading(false); // Desactiva el loader después de obtener los datos
  };

  const handleInputChange = (e) => {
    setSecretariaData({ ...secretariaData, [e.target.name]: e.target.value });
  };

  const handleSaveSecretaria = async () => {
    try {
      if (editingSecretaria) {
        await secretariaApi.updateSecretaria(
          editingSecretaria._id,
          secretariaData
        );
      } else {
        await secretariaApi.createSecretaria(secretariaData);
      }

      setModalOpen(false);
      setSecretariaData({ nombre: "", email: "", password: "" });
      setEditingSecretaria(null);
      fetchSecretarias();
    } catch (error) {
      console.error("Error al guardar la secretaria", error);
    }
  };

  const handleEdit = (secretaria) => {
    setEditingSecretaria(secretaria);
    setSecretariaData({
      nombre: secretaria.nombre,
      email: secretaria.email,
      password: secretaria.password,
    });
    setModalOpen(true);
  };

  return (
    <div className="container-secretarias">
      <Breadcrumbs />
      <h2 className="title-secretarias">Lista de Secretarias</h2>
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
              {editingSecretaria
                ? "Editar Secretaria"
                : "Agregar Nueva Secretaria"}
            </h3>
            <label>Nombre</label>
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={secretariaData.nombre}
              onChange={handleInputChange}
            />
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={secretariaData.email}
              onChange={handleInputChange}
            />
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={secretariaData.password}
              onChange={handleInputChange}
            />
            <div className="modal-buttons">
              <button className="btn-save" onClick={handleSaveSecretaria}>
                {editingSecretaria ? "Actualizar" : "Guardar"}
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

export default Secretarias;
