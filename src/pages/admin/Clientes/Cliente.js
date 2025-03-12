import React, { useEffect, useState, useMemo, useCallback } from "react";
import { ClienteApi } from "../../../api/Clientes";
import "./cliente.css";
import { Link } from "react-router-dom";
import { Icon } from "semantic-ui-react";
import Loader from "../../../utils/Loader";
import debounce from "lodash.debounce";

const clienteController = new ClienteApi();

export const Cliente = ({ loading, setLoading }) => {
  const [clientes, setClientes] = useState([]);
  const [search, setSearch] = useState("");
  
  useEffect(() => {
    const fetchClientes = async () => {
      setLoading(true);
      try {
        const data = await clienteController.getClientes();
        setClientes(data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, [setLoading]);

  const filteredClientes = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return clientes.filter(
      (cliente) =>
        cliente.nombreCompleto.toLowerCase().includes(lowerSearch) ||
        cliente.telefono.includes(lowerSearch)
    );
  }, [clientes, search]);

  const handleSearchChange = useCallback(
    debounce((value) => {
      setSearch(value);
    }, 300),
    []
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <h2>Lista de Clientes</h2>
      <div className="container">
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar por nombre o teléfono..."
            onChange={(e) => handleSearchChange(e.target.value)}
            className="search-input"
          />
        </div>

        <ClientTable clientes={filteredClientes} />
      </div>
    </>
  );
};

const ClientTable = ({ clientes }) => (
  <table className="table">
    <thead>
      <tr>
        <th>Nombre Completo</th>
        <th>Total Gastado</th>
        <th>Teléfono</th>
        <th>Fecha de Creación</th>
        <th>Compras Realizadas</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      {clientes.map((cliente) => (
        <tr key={cliente._id}>
          <td>{cliente.nombreCompleto}</td>
          <td>${cliente.totalGastado.toLocaleString()}</td>
          <td>{cliente.telefono}</td>
          <td>{new Date(cliente.fechaCreacion).toLocaleDateString()}</td>
          <td>
            <p>
              Individuales: {cliente.comprasIndividualesRealizadas.length}{" "}
              Combos: {cliente.comprasCombosRealizadas.length}
            </p>
          </td>
          <td>
            <Link
              to={`/admin/clientes/${cliente.nombreCompleto}`}
              state={{
                idCliente: cliente._id,
                nombre: cliente.nombreCompleto,
                cliente: cliente,
              }}
            >
              <Icon name="eye" color="black" />
            </Link>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default Cliente;
