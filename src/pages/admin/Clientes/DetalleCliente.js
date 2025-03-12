import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Breadcrumbs from "../../../utils/Breadcums";
import Loader from "../../../utils/Loader";
import { ClienteApi } from "../../../api/Clientes";

import "./detalleCliente.css";
import { RenderComprasRealizadas } from "./components/RenderComprasRealizadas";

const clienteController = new ClienteApi();

export const DetalleCliente = ({ loading, setLoading }) => {
  const [clienteData, setClienteData] = useState(null);
  const location = useLocation();
  const { idCliente, nombre, cliente } = location.state || {}

  useEffect(() => {
    const fetchVentasCliente = async () => {
      setLoading(true);
      try {
        const data = await clienteController.getVentasCliente(idCliente);
        setClienteData(data);
      } catch (error) {
        console.error("Error fetching ventas del cliente:", error);
      } finally {
        setLoading(false);
      }
    };

    if (idCliente) fetchVentasCliente();
  }, [idCliente, setLoading]);

  const handleLinkClick = () => {
    if (clienteData) {
      const { cliente, compras } = clienteData; 
      const clienteSeleccionado = {
        _id: cliente._id,
        nombreCompleto: cliente.nombreCompleto,
        telefono: cliente.telefono,
        totalGastado: cliente.totalGastado,
        comprasRealizadas: compras.individuales.map(compra => compra._id), 
        comprasCombosRealizadas: [], 
        fechaCreacion: new Date().toISOString(),
      };
  
      localStorage.setItem("clienteSeleccionado", JSON.stringify(clienteSeleccionado));
    }
  };
  

  if (loading) return <Loader />;

  if (!clienteData) return <p>No se encontró información del cliente.</p>;

  const { 
    compras 
  } = clienteData;


  return (
    <>
      <Breadcrumbs />
      <div className="detalle-cliente-container">
        <div className="detalle-header">
          <h2>{nombre}</h2>
          <p className="cliente-telefono">Teléfono: {clienteData.cliente.telefono || "No disponible"}</p>
        </div>
        <RenderComprasRealizadas
          compras={compras}
        />

        <div className="total-container">
          <p>
            <strong>TOTAL GASTADO:</strong>
          </p>
          <p className="total-amount">${clienteData.cliente.totalGastado  || 0}</p>
        </div>

        <div className="total-container">
        <Link
            className="agregar-servicio-link"
            to="/admin/crear-orden"
            onClick={handleLinkClick}
          >
            Agregar Servicio
          </Link>
        </div>
      </div>
    </>
  );
};