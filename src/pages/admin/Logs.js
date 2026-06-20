import React, { useEffect, useState } from "react";
import { Table, Button, Loader, Header, Icon, Modal, Message } from "semantic-ui-react";
import toast from "react-hot-toast";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8082/api/logs");
      const data = await res.json();
      setLogs(data);
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
    try {
      await fetch("http://localhost:8082/api/logs", { method: "DELETE" });
      toast.success("Logs eliminados correctamente");
      fetchLogs();
    } catch (error) {
      toast.error("Error al eliminar los logs");
    }
  };

  const getStatusColor = (status) => {
    if (status >= 500) return "red";
    if (status >= 400) return "orange";
    return "grey";
  };

  return (
    <div style={{ padding: "20px" }}>
      <Header as="h2">
        <Icon name="bug" />
        <Header.Content>
          Registro de Errores (Logs)
          <Header.Subheader>Visualiza los errores ocurridos en el servidor</Header.Subheader>
        </Header.Content>
      </Header>

      <Button
        color="red"
        icon="trash"
        content="Limpiar Logs"
        onClick={() => {
          if (window.confirm("¿Seguro que deseas eliminar todos los logs?")) {
            borrarLogs();
          }
        }}
        floated="right"
        style={{ marginBottom: "20px" }}
      />
      <Button
        color="blue"
        icon="refresh"
        content="Actualizar"
        onClick={fetchLogs}
        floated="right"
        style={{ marginBottom: "20px" }}
      />

      <div style={{ clear: "both" }} />

      {loading ? (
        <Loader active inline="centered" />
      ) : logs.length === 0 ? (
        <Message info icon="check circle" header="Todo excelente" content="No hay errores registrados en el sistema." />
      ) : (
        <Table celled striped selectable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Fecha / Hora</Table.HeaderCell>
              <Table.HeaderCell>Método</Table.HeaderCell>
              <Table.HeaderCell>Ruta</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Error</Table.HeaderCell>
              <Table.HeaderCell>Acciones</Table.HeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {logs.map((log) => (
              <Table.Row key={log._id}>
                <Table.Cell>{new Date(log.fecha).toLocaleString()}</Table.Cell>
                <Table.Cell><b>{log.metodo}</b></Table.Cell>
                <Table.Cell>{log.ruta}</Table.Cell>
                <Table.Cell>
                  <span style={{ color: getStatusColor(log.status), fontWeight: "bold" }}>
                    {log.status}
                  </span>
                </Table.Cell>
                <Table.Cell style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {log.mensajeError}
                </Table.Cell>
                <Table.Cell>
                  <Button
                    size="small"
                    color="teal"
                    icon="eye"
                    content="Detalles"
                    onClick={() => {
                      setSelectedLog(log);
                      setOpenModal(true);
                    }}
                  />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      {selectedLog && (
        <Modal open={openModal} onClose={() => setOpenModal(false)} size="small">
          <Header icon="bug" content="Detalle del Error" />
          <Modal.Content scrolling>
            <p><b>Fecha:</b> {new Date(selectedLog.fecha).toLocaleString()}</p>
            <p><b>Método:</b> {selectedLog.metodo}</p>
            <p><b>Ruta:</b> {selectedLog.ruta}</p>
            <p><b>Status:</b> {selectedLog.status}</p>
            <p><b>IP Cliente:</b> {selectedLog.ip}</p>
            
            <Header as="h4">Mensaje de Error</Header>
            <Message color="red">
              <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{selectedLog.mensajeError}</pre>
            </Message>

            {selectedLog.body && Object.keys(selectedLog.body).length > 0 && (
              <>
                <Header as="h4">Cuerpo de la Petición (Body)</Header>
                <Message>
                  <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(selectedLog.body, null, 2)}</pre>
                </Message>
              </>
            )}
          </Modal.Content>
          <Modal.Actions>
            <Button color="green" onClick={() => setOpenModal(false)}>
              Cerrar
            </Button>
          </Modal.Actions>
        </Modal>
      )}
    </div>
  );
}
