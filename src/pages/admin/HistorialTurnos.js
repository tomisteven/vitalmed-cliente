import React, { useEffect, useState } from "react";
import { Table, Button, Loader, Header, Icon, Message, Input } from "semantic-ui-react";
import toast from "react-hot-toast";
import { ENV } from "../../utils/constants";

export default function HistorialTurnos() {
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busqueda, setBusqueda] = useState("");

    const fetchHistorial = async () => {
        try {
            setLoading(true);
            const token = "vitalmed0258525"; // O obtener del localStorage si aplica
            const res = await fetch(`${ENV.URL}/api/historial-turnos`, {
                headers: {
                    Authorization: token
                }
            });
            const data = await res.json();
            setHistorial(data);
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
        try {
            const token = "vitalmed0258525";
            await fetch(`${ENV.URL}/api/historial-turnos`, {
                method: "DELETE",
                headers: {
                    Authorization: token
                }
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
            minute: "2-digit"
        });
    };

    const getBadgeColor = (creadoPor) => {
        switch (creadoPor) {
            case "paciente_registrado": return "blue";
            case "paciente_invitado": return "orange";
            case "admin_secretaria": return "green";
            default: return "grey";
        }
    };

    const getOrigenLabel = (creadoPor) => {
        switch (creadoPor) {
            case "paciente_registrado": return "Registrado";
            case "paciente_invitado": return "Invitado / Admin";
            case "admin_secretaria": return "Admin";
            default: return "Desconocido";
        }
    };

    const historialFiltrado = historial.filter(item => {
        if (!busqueda) return true;
        const search = busqueda.toLowerCase();
        return (
            (item.nombreCompleto && item.nombreCompleto.toLowerCase().includes(search)) ||
            (item.telefono && item.telefono.includes(search)) ||
            (item.dni && item.dni.includes(search)) ||
            (item.doctor && item.doctor.toLowerCase().includes(search))
        );
    });

    return (
        <div style={{ padding: "30px", background: "#f8fafc", minHeight: "100vh" }}>
            <div style={{
                background: "white",
                padding: "30px",
                borderRadius: "16px",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.04)",
                border: "1px solid rgba(0,0,0,0.03)"
            }}>
                <Header as="h2" style={{ color: "#0f172a", marginBottom: "30px" }}>
                    <Icon name="history" style={{ color: "#653057" }} />
                    <Header.Content>
                        Historial de Turnos Registrados
                        <Header.Subheader>
                            Registro inmutable de todos los turnos agendados en el sistema
                        </Header.Subheader>
                    </Header.Content>
                </Header>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                    <Input
                        icon="search"
                        placeholder="Buscar por paciente, teléfono o médico..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        style={{ width: "400px" }}
                    />
                    <div>
                        <Button
                            color="blue"
                            icon="refresh"
                            content="Actualizar"
                            onClick={fetchHistorial}
                            basic
                        />
                        <Button
                            color="red"
                            icon="trash"
                            content="Limpiar Historial"
                            onClick={() => {
                                if (window.confirm("¿Seguro que deseas eliminar TODO el historial? Esta acción no se puede deshacer.")) {
                                    vaciarHistorial();
                                }
                            }}
                            basic
                        />
                    </div>
                </div>

                {loading ? (
                    <Loader active inline="centered" style={{ margin: "50px 0" }} />
                ) : historial.length === 0 ? (
                    <Message info icon="info circle" header="Historial Vacío" content="Aún no se han registrado turnos en el sistema." />
                ) : (
                    <Table celled striped selectable style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell style={{ background: "#f1f5f9", color: "#475569" }}>Fecha de Registro</Table.HeaderCell>
                                <Table.HeaderCell style={{ background: "#f1f5f9", color: "#475569" }}>Paciente</Table.HeaderCell>
                                <Table.HeaderCell style={{ background: "#f1f5f9", color: "#475569" }}>Teléfono</Table.HeaderCell>
                                <Table.HeaderCell style={{ background: "#f1f5f9", color: "#475569" }}>DNI</Table.HeaderCell>
                                <Table.HeaderCell style={{ background: "#f1f5f9", color: "#475569" }}>Médico / Especialidad</Table.HeaderCell>
                                <Table.HeaderCell style={{ background: "#f1f5f9", color: "#475569" }}>Fecha del Turno</Table.HeaderCell>
                                <Table.HeaderCell style={{ background: "#f1f5f9", color: "#475569" }}>Origen</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            {historialFiltrado.map((item) => (
                                <Table.Row key={item._id}>
                                    <Table.Cell style={{ fontWeight: "600", color: "#64748b" }}>
                                        {formatearFecha(item.fechaReserva)}
                                    </Table.Cell>
                                    <Table.Cell style={{ fontWeight: "bold", color: "#1e293b" }}>
                                        {item.nombreCompleto}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Icon name="phone" color="grey" /> {item.telefono || "No especificado"}
                                    </Table.Cell>
                                    <Table.Cell>{item.dni || "-"}</Table.Cell>
                                    <Table.Cell>
                                        <div><strong>{item.doctor}</strong></div>
                                        <div style={{ fontSize: "0.85em", color: "#64748b" }}>{item.especialidad}</div>
                                    </Table.Cell>
                                    <Table.Cell>
                                        {formatearFecha(item.fechaTurno)}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <div style={{
                                            display: "inline-block",
                                            padding: "4px 10px",
                                            borderRadius: "20px",
                                            fontSize: "0.8em",
                                            fontWeight: "bold",
                                            background: getBadgeColor(item.creadoPor) === "blue" ? "#e0f2fe" : 
                                                        getBadgeColor(item.creadoPor) === "orange" ? "#ffedd5" : "#dcfce7",
                                            color: getBadgeColor(item.creadoPor) === "blue" ? "#0284c7" : 
                                                   getBadgeColor(item.creadoPor) === "orange" ? "#c2410c" : "#15803d"
                                        }}>
                                            {getOrigenLabel(item.creadoPor)}
                                        </div>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                            {historialFiltrado.length === 0 && (
                                <Table.Row>
                                    <Table.Cell colSpan="7" textAlign="center" style={{ padding: "20px" }}>
                                        No se encontraron resultados para la búsqueda.
                                    </Table.Cell>
                                </Table.Row>
                            )}
                        </Table.Body>
                    </Table>
                )}
            </div>
        </div>
    );
}
