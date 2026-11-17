import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
  FaBug,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEye,
  FaRedo,
  FaSearch,
  FaServer,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { ENV } from "../../utils/constants";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${ENV.URL}/api/logs`, {
        headers: { Authorization: "vitalmed0258525" },
      });
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Error al cargar los logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const borrarLogs = async () => {
    const result = await Swal.fire({
      title: "¿Limpiar todos los logs?",
      text: "Se eliminarán todos los registros de errores del sistema.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, limpiar",
      cancelButtonText: "Cancelar",
    });

    if (!result.isConfirmed) return;

    try {
      await fetch(`${ENV.URL}/api/logs`, {
        method: "DELETE",
        headers: { Authorization: "vitalmed0258525" },
      });
      toast.success("Logs eliminados correctamente");
      fetchLogs();
    } catch (error) {
      toast.error("Error al eliminar los logs");
    }
  };

  const stats = useMemo(() => {
    return logs.reduce(
      (acc, log) => {
        acc.total += 1;
        if (log.status >= 500) acc.server += 1;
        else if (log.status >= 400) acc.client += 1;
        return acc;
      },
      { total: 0, server: 0, client: 0 }
    );
  }, [logs]);

  const logsFiltrados = useMemo(() => {
    let lista = logs;

    if (filtroStatus === "5xx") {
      lista = lista.filter((log) => log.status >= 500);
    } else if (filtroStatus === "4xx") {
      lista = lista.filter((log) => log.status >= 400 && log.status < 500);
    }

    if (!busqueda.trim()) return lista;

    const termino = busqueda.toLowerCase();
    return lista.filter((log) =>
      [log.ruta, log.metodo, log.mensajeError].some((valor) =>
        String(valor || "").toLowerCase().includes(termino)
      )
    );
  }, [logs, busqueda, filtroStatus]);

  const statusClass = (status) => {
    if (status >= 500) return "danger";
    if (status >= 400) return "warning";
    return "neutral";
  };

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">Diagnóstico</span>
          <h1 className="admin-page-title">Logs</h1>
          <p className="admin-page-subtitle">
            Revisá los errores registrados por el servidor y su detalle técnico.
          </p>
        </div>

        <div className="admin-page-actions">
          <button
            type="button"
            className="adm-btn adm-btn-ghost"
            onClick={fetchLogs}
          >
            <FaRedo /> Actualizar
          </button>
          <button
            type="button"
            className="adm-btn adm-btn-danger"
            onClick={borrarLogs}
          >
            <FaTrash /> Limpiar logs
          </button>
        </div>
      </header>

      <div className="adm-stats">
        <div className="adm-stat">
          <div className="adm-stat-icon">
            <FaServer />
          </div>
          <div>
            <span className="adm-stat-value">{stats.total}</span>
            <span className="adm-stat-label">Logs registrados</span>
          </div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-icon">
            <FaExclamationTriangle />
          </div>
          <div>
            <span className="adm-stat-value">{stats.server}</span>
            <span className="adm-stat-label">Errores 5xx</span>
          </div>
        </div>
        <div className="adm-stat">
          <div className="adm-stat-icon">
            <FaBug />
          </div>
          <div>
            <span className="adm-stat-value">{stats.client}</span>
            <span className="adm-stat-label">Errores 4xx</span>
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
                placeholder="Buscar por ruta, método o error..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <select
              className="adm-select"
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="5xx">Errores 5xx</option>
              <option value="4xx">Errores 4xx</option>
            </select>
          </div>
          <div className="adm-toolbar-right">
            <span className="adm-count">
              <FaServer /> {logsFiltrados.length} registros
            </span>
          </div>
        </div>

        {loading ? (
          <div className="adm-loading">
            <div className="adm-spinner" />
            <p>Cargando logs...</p>
          </div>
        ) : logsFiltrados.length === 0 ? (
          <div className="adm-empty">
            <FaCheckCircle />
            <h3>No hay logs para mostrar</h3>
            <p>El sistema no tiene errores registrados con este filtro.</p>
          </div>
        ) : (
          <div className="adm-table-wrapper">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Método</th>
                  <th>Ruta</th>
                  <th>Status</th>
                  <th>Error</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {logsFiltrados.map((log) => (
                  <tr key={log._id}>
                    <td>{new Date(log.fecha).toLocaleString()}</td>
                    <td>
                      <span className="adm-badge info">{log.metodo}</span>
                    </td>
                    <td>
                      <span className="adm-log-route">{log.ruta}</span>
                    </td>
                    <td>
                      <span className={`adm-badge ${statusClass(log.status)}`}>
                        {log.status}
                      </span>
                    </td>
                    <td>
                      <div className="adm-log-error">
                        {log.mensajeError || "Sin mensaje"}
                      </div>
                    </td>
                    <td>
                      <div className="adm-actions">
                        <button
                          type="button"
                          className="adm-icon-btn view"
                          title="Ver detalle"
                          onClick={() => setSelectedLog(log)}
                        >
                          <FaEye />
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

      {selectedLog && (
        <div
          className="adm-modal-overlay"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="adm-modal adm-modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="adm-modal-header">
              <div>
                <span className="adm-modal-eyebrow">Detalle del log</span>
                <h3>
                  {selectedLog.metodo} {selectedLog.ruta}
                </h3>
              </div>
              <button
                type="button"
                className="adm-modal-close"
                onClick={() => setSelectedLog(null)}
                title="Cerrar"
              >
                <FaTimes />
              </button>
            </div>

            <div className="adm-modal-body">
              <div className="adm-detail-grid">
                <div className="adm-detail-item">
                  <span className="adm-detail-label">Fecha</span>
                  <span className="adm-detail-value">
                    {new Date(selectedLog.fecha).toLocaleString()}
                  </span>
                </div>
                <div className="adm-detail-item">
                  <span className="adm-detail-label">Status</span>
                  <span
                    className={`adm-badge ${statusClass(selectedLog.status)}`}
                  >
                    {selectedLog.status}
                  </span>
                </div>
                <div className="adm-detail-item">
                  <span className="adm-detail-label">Método</span>
                  <span className="adm-detail-value">
                    {selectedLog.metodo}
                  </span>
                </div>
                <div className="adm-detail-item">
                  <span className="adm-detail-label">IP</span>
                  <span className="adm-detail-value">
                    {selectedLog.ip || "-"}
                  </span>
                </div>
              </div>

              <div className="adm-modal-section">
                <h4>Mensaje de error</h4>
                <pre className="adm-code">
                  {selectedLog.mensajeError || "Sin mensaje"}
                </pre>
              </div>

              {selectedLog.body &&
                Object.keys(selectedLog.body).length > 0 && (
                  <div className="adm-modal-section">
                    <h4>Body</h4>
                    <pre className="adm-code">
                      {JSON.stringify(selectedLog.body, null, 2)}
                    </pre>
                  </div>
                )}

              {selectedLog.query &&
                Object.keys(selectedLog.query).length > 0 && (
                  <div className="adm-modal-section">
                    <h4>Query</h4>
                    <pre className="adm-code">
                      {JSON.stringify(selectedLog.query, null, 2)}
                    </pre>
                  </div>
                )}

              {selectedLog.params &&
                Object.keys(selectedLog.params).length > 0 && (
                  <div className="adm-modal-section">
                    <h4>Params</h4>
                    <pre className="adm-code">
                      {JSON.stringify(selectedLog.params, null, 2)}
                    </pre>
                  </div>
                )}
            </div>

            <div className="adm-modal-footer">
              <button
                type="button"
                className="adm-btn adm-btn-ghost"
                onClick={() => setSelectedLog(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
