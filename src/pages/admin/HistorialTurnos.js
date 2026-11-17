import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
  FaCalendarCheck,
  FaHistory,
  FaRedo,
  FaSearch,
  FaTrash,
  FaUserCheck,
  FaUserPlus,
} from "react-icons/fa";
import { ENV } from "../../utils/constants";

const ORIGEN_CONFIG = {
  paciente_registrado: { label: "Registrado", className: "info" },
  paciente_invitado: { label: "Invitado / Admin", className: "warning" },
  admin_secretaria: { label: "Admin", className: "success" },
};

export default function HistorialTurnos() {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroOrigen, setFiltroOrigen] = useState("todos");

  const fetchHistorial = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${ENV.URL}/api/historial-turnos`, {
        headers: {
          Authorization: "vitalmed0258525",
        },
      });
      const data = await res.json();
      setHistorial(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Error al cargar el historial de turnos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorial();
  }, []);

  const vaciarHistorial = async () => {
    const result = await Swal.fire({
      title: "¿Limpiar todo el historial?",
      text: "Se eliminarán todos los registros de turnos. Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, limpiar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await fetch(`${ENV.URL}/api/historial-turnos`, {
        method: "DELETE",
        headers: {
          Authorization: "vitalmed0258525",
        },
      });
      toast.success("Historial vaciado correctamente");
      fetchHistorial();
    } catch (error) {
      toast.error("Error al vaciar el historial");
    }
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "N/A";
    return new Date(fechaISO).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stats = useMemo(() => {
    return historial.reduce(
      (acc, item) => {
        acc.total += 1;
        if (item.creadoPor === "paciente_registrado") acc.registrados += 1;
        else acc.invitados += 1;
        return acc;
      },
      { total: 0, registrados: 0, invitados: 0 }
    );
  }, [historial]);

  const historialFiltrado = useMemo(() => {
    let lista = historial;

    if (filtroOrigen === "registrado") {
      lista = lista.filter(
        (item) => item.creadoPor === "paciente_registrado"
      );
    } else if (filtroOrigen === "invitado") {
      lista = lista.filter(
        (item) => item.creadoPor === "paciente_invitado"
      );
    } else if (filtroOrigen === "admin") {
      lista = lista.filter((item) => item.creadoPor === "admin_secretaria");
    }

    if (!busqueda.trim()) return lista;

    const termino = busqueda.toLowerCase();
    return lista.filter((item) =>
      [
        item.nombreCompleto,
        item.telefono,
        item.dni,
        item.doctor,
        item.especialidad,
      ].some((valor) => String(valor || "").toLowerCase().includes(termino))
    );
  }, [historial, busqueda, filtroOrigen]);

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">Auditoría</span>
          <h1 className="admin-page-title">Historial de turnos</h1>
          <p className="admin-page-subtitle">
            Registro de todas las reservas realizadas en el sistema, con su
            origen y datos de contacto.
          </p>
        </div>

        <div className="admin-page-actions">
          <button
            type="button"
            className="adm-btn adm-btn-ghost"
            onClick={fetchHistorial}
          >
            <FaRedo /> Actualizar
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-danger"
            onClick={vaciarHistorial}
          >
            <FaTrash /> Limpiar historial
          </button>
        </div>
      </header>

      <div className="adm-stats">
        <div className="adm-stat">
          <div className="adm-stat-icon">
            <FaHistory />
          </div>
          <div>
            <span className="adm-stat-value">{stats.total}</span>
            <span className="adm-stat-label">Registros totales</span>
          </div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-icon">
            <FaUserCheck />
          </div>
          <div>
            <span className="adm-stat-value">{stats.registrados}</span>
            <span className="adm-stat-label">Pacientes registrados</span>
          </div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-icon">
            <FaUserPlus />
          </div>
          <div>
            <span className="adm-stat-value">{stats.invitados}</span>
            <span className="adm-stat-label">Invitados / Admin</span>
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
                placeholder="Buscar por paciente, teléfono, DNI o médico..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <select
              className="adm-select"
              value={filtroOrigen}
              onChange={(e) => setFiltroOrigen(e.target.value)}
            >
              <option value="todos">Todos los orígenes</option>
              <option value="registrado">Registrados</option>
              <option value="invitado">Invitados</option>
              <option value="admin">Admin / Secretaría</option>
            </select>
          </div>
          <div className="adm-toolbar-right">
            <span className="adm-count">
              <FaCalendarCheck /> {historialFiltrado.length} registros
            </span>
          </div>
        </div>

        {loading ? (
          <div className="adm-loading">
            <div className="adm-spinner" />
            <p>Cargando historial...</p>
          </div>
        ) : historialFiltrado.length === 0 ? (
          <div className="adm-empty">
            <FaHistory />
            <h3>No hay registros para mostrar</h3>
            <p>
              {historial.length === 0
                ? "Aún no se han registrado turnos en el sistema."
                : "Ningún registro coincide con los filtros seleccionados."}
            </p>
          </div>
        ) : (
          <div className="adm-table-wrapper">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Fecha de registro</th>
                  <th>Paciente</th>
                  <th>Teléfono</th>
                  <th>DNI</th>
                  <th>Médico / Especialidad</th>
                  <th>Fecha del turno</th>
                  <th>Origen</th>
                </tr>
              </thead>
              <tbody>
                {historialFiltrado.map((item) => {
                  const origen =
                    ORIGEN_CONFIG[item.creadoPor] || {
                      label: "Desconocido",
                      className: "neutral",
                    };

                  return (
                    <tr key={item._id}>
                      <td>{formatearFecha(item.fechaReserva)}</td>
                      <td>
                        <div className="adm-cell-main">
                          {item.nombreCompleto}
                        </div>
                      </td>
                      <td>{item.telefono || "-"}</td>
                      <td>{item.dni || "-"}</td>
                      <td>
                        <div className="adm-cell-main">
                          {item.doctor || "Sin médico"}
                        </div>
                        <div className="adm-cell-sub">
                          {item.especialidad || "Sin especialidad"}
                        </div>
                      </td>
                      <td>{formatearFecha(item.fechaTurno)}</td>
                      <td>
                        <span
                          className={`adm-badge ${origen.className}`}
                        >
                          {origen.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
