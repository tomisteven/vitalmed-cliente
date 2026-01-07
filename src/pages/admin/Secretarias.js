import React, { useState, useMemo } from "react";
import "./Secretarias.css"; // Importa los estilos
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../../utils/Breadcums";
import { useSecretaria } from "../../hooks/useSecretaria";
import { LoaderIcon } from "react-hot-toast";
import { FaEdit, FaTrash } from "react-icons/fa";

const Secretarias = ({ notificacion }) => {
  const { secretarias, saveSecretaria, deleteSecretaria, loading } =
    useSecretaria({ notificacion });
  const [selectSecretaria, setSelectSecretaria] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [secretariaData, setSecretariaData] = useState({
    nombre: "",
    email: "",
    password: "",
    id: "",
  });
  
  // Estado para el buscador
  const [busqueda, setBusqueda] = useState("");

  // Filtrar secretarias por nombre
  const secretariasFiltradas = useMemo(() => {
    return secretarias.filter((secretaria) =>
      secretaria.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [secretarias, busqueda]);

  console.log(secretarias);

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
    const sec = await saveSecretaria(secretariaData, !!selectSecretaria);
    notificacion(sec.message, "success")
    setModalOpen(false);
    setSecretariaData({ nombre: "", usuario: "", password: "", id: "" });
    setSelectSecretaria(null);
  };

  const handleEdit = (secretaria) => {
    setSecretariaData({
      nombre: secretaria.nombre,
      usuario: secretaria.usuario,
      password: secretaria.password,
      id: secretaria._id,
    });
    setSelectSecretaria(secretaria);
    setModalOpen(true);
  };

  return (
    <div className="container-secretarias">
      <Breadcrumbs />

      {/* Buscador */}
      <div className="filtros-container" style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'center', backgroundColor: '#894172', padding: '10px', borderRadius: '5px' }}>
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-search"
            style={{ padding: '8px 12px', borderRadius: '5px', border: '1px solid #ddd', minWidth: '250px' }}
          />
        </div>
      </div>

      <h2 className="title-secretarias">
        Cantidad de Secretarias: {secretariasFiltradas.length}
      </h2>
      <button className="btn-add" onClick={() => setModalOpen(true)}>
        + Agregar Secretaria
      </button>

      {loading ? (
        // Muestra el loader mientras carga la data
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
      ) : secretariasFiltradas.length === 0 ? (
        <p className="empty-message">No se encontraron secretarias con los filtros seleccionados.</p>
      ) : (
        <table className="secretarias-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Usuario</th>
              <th>Contraseña</th>
              <th>Fecha de Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {secretariasFiltradas.map((secretaria) => (
              <tr key={secretaria._id}>
                <td>{secretaria.nombre}</td>
                <td>{secretaria.usuario}</td>
                <td>{secretaria.password}</td>
                <td>{new Date(secretaria.created_at).toLocaleDateString()}</td>
                <td className="acciones-cell">
                  <button
                    className="btn-icon btn-edit"
                    onClick={() => handleEdit(secretaria)}
                    title="Editar secretaria"
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="btn-icon btn-eliminar"
                    onClick={() => deleteSecretaria(secretaria._id)}
                    title="Eliminar secretaria"
                  >
                    <FaTrash />
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

            <form onSubmit={handleSubmit}>
              <label>Nombre y Apellido</label>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre y Apellido"
                value={secretariaData.nombre}
                onChange={(e) =>
                  setSecretariaData({
                    ...secretariaData,
                    nombre: e.target.value,
                  })
                }
              />
              <label>Usuario</label>
              <input
                type="usuario"
                name="usuario"
                placeholder="Usuario"
                value={secretariaData.usuario}
                onChange={(e) =>
                  setSecretariaData({
                    ...secretariaData,
                    usuario: e.target.value,
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
                  {loading ? <LoaderIcon className="loader-icon" /> : "Guardar"}
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
