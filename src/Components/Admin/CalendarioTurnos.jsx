import React, { useState, useEffect, useCallback } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { es } from "date-fns/locale";
import { TurnosApi } from "../../api/Turnos";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./CalendarioTurnos.css";

const turnosApi = new TurnosApi();

// Configurar localizador con date-fns en español
const locales = { es };
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1, locale: es }),
    getDay,
    locales,
});

// Mensajes en español
const messages = {
    allDay: "Todo el día",
    previous: "Anterior",
    next: "Siguiente",
    today: "Hoy",
    month: "Mes",
    week: "Semana",
    day: "Día",
    agenda: "Agenda",
    date: "Fecha",
    time: "Hora",
    event: "Turno",
    noEventsInRange: "No hay turnos en este rango de fechas",
    showMore: (total) => `+ Ver ${total} más`,
};

export default function CalendarioTurnos() {
    const [eventos, setEventos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState("month");
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        cargarTurnos();
    }, []);

    const cargarTurnos = async () => {
        setLoading(true);
        try {
            const response = await turnosApi.buscarTurnos();

            // Manejar respuesta como array directo o como objeto con .turnos
            const listaTurnos = Array.isArray(response)
                ? response
                : (response?.turnos || []);

            const eventosFormateados = listaTurnos.map((turno) => ({
                id: turno._id,
                title: turno.estado === "disponible"
                    ? "Disponible"
                    : (turno.paciente?.nombre || "Reservado"),
                start: new Date(turno.fecha),
                end: new Date(new Date(turno.fecha).getTime() + 30 * 60000),
                resource: turno,
                doctor: turno.doctor?.nombre || "Doctor no asignado",
                estudio: turno.estudio?.tipo || turno.especialidad || "No especificado",
                estado: turno.estado,
                paciente: turno.paciente,
            }));

            setEventos(eventosFormateados);
        } catch (error) {
            console.error("Error al cargar turnos:", error);
            toast.error("Error al cargar los turnos del calendario");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectEvent = useCallback((evento) => {
        const turno = evento.resource;
        const fechaFormateada = format(new Date(turno.fecha), "EEEE d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es });

        Swal.fire({
            title: `<span class="swal-title-icon">📅</span> Detalles del Turno`,
            html: `
                <div class="turno-detail-modal">
                    <div class="detail-row">
                        <span class="detail-label">📆 Fecha:</span>
                        <span class="detail-value">${fechaFormateada}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">👤 Paciente:</span>
                        <span class="detail-value">${turno.paciente?.nombre || turno.pacienteNoRegistrado?.nombre || "No asignado"}</span>
                    </div>
                    ${turno.paciente?.email ? `
                    <div class="detail-row">
                        <span class="detail-label">📧 Email:</span>
                        <span class="detail-value">${turno.paciente.email}</span>
                    </div>
                    ` : ""}
                    ${turno.paciente?.telefono ? `
                    <div class="detail-row">
                        <span class="detail-label">📞 Teléfono:</span>
                        <span class="detail-value">${turno.paciente.telefono}</span>
                    </div>
                    ` : ""}
                    <div class="detail-row">
                        <span class="detail-label">👨‍⚕️ Doctor:</span>
                        <span class="detail-value">${turno.doctor?.nombre || "No especificado"}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">🔬 Estudio:</span>
                        <span class="detail-value">${turno.estudio?.tipo || turno.especialidad || "No especificado"}</span>
                    </div>
                    ${turno.motivoConsulta ? `
                    <div class="detail-row detail-motivo">
                        <span class="detail-label">📝 Motivo:</span>
                        <span class="detail-value">${turno.motivoConsulta}</span>
                    </div>
                    ` : ""}
                    <div class="detail-row">
                        <span class="detail-label">Estado:</span>
                        <span class="detail-badge estado-${turno.estado}">${turno.estado}</span>
                    </div>
                </div>
            `,
            showCloseButton: true,
            showConfirmButton: false,
            width: "500px",
            customClass: {
                popup: "turno-detail-popup",
            },
        });
    }, []);

    const handleNavigate = useCallback((newDate) => {
        setDate(newDate);
    }, []);

    const handleViewChange = useCallback((newView) => {
        setView(newView);
    }, []);

    // Estilo personalizado para eventos
    const eventStyleGetter = useCallback((event) => {
        let backgroundColor;
        let borderColor;

        // Verde para disponible, Rojo para reservado
        if (event.estado === "disponible") {
            backgroundColor = "#28a745";  // Verde
            borderColor = "#218838";
        } else if (event.estado === "reservado") {
            backgroundColor = "#dc3545";  // Rojo
            borderColor = "#c82333";
        } else if (event.estado === "cancelado") {
            backgroundColor = "#6c757d";  // Gris
            borderColor = "#5a6268";
        } else if (event.estado === "completado") {
            backgroundColor = "#17a2b8";  // Azul
            borderColor = "#138496";
        } else {
            backgroundColor = "#667eea";  // Default morado
            borderColor = "#5a67d8";
        }

        return {
            style: {
                backgroundColor,
                borderColor,
                borderRadius: "6px",
                opacity: 0.9,
                color: "white",
                border: `2px solid ${borderColor}`,
                display: "block",
                fontSize: "0.85rem",
                fontWeight: "500",
            },
        };
    }, []);

    // Formato personalizado para eventos
    const formats = {
        eventTimeRangeFormat: () => "",
        timeGutterFormat: (date) => format(date, "HH:mm", { locale: es }),
        dayHeaderFormat: (date) => format(date, "EEEE d", { locale: es }),
        dayRangeHeaderFormat: ({ start, end }) =>
            `${format(start, "d MMM", { locale: es })} - ${format(end, "d MMM yyyy", { locale: es })}`,
        agendaDateFormat: (date) => format(date, "EEE d MMM", { locale: es }),
        agendaTimeFormat: (date) => format(date, "HH:mm", { locale: es }),
        agendaTimeRangeFormat: ({ start, end }) =>
            `${format(start, "HH:mm", { locale: es })} - ${format(end, "HH:mm", { locale: es })}`,
    };

    // Componente personalizado para mostrar eventos
    const EventComponent = ({ event }) => (
        <div className="custom-event">
            <span className="event-title">{event.title}</span>
            {view !== "month" && (
                <span className="event-detail">{event.estudio}</span>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="calendario-loading">
                <div className="spinner"></div>
                <p>Cargando calendario...</p>
            </div>
        );
    }

    return (
        <div className="calendario-turnos">
            <div className="calendario-header">
                <h3>📅 Calendario de Turnos</h3>
                <div className="calendario-stats">
                    <span className="stat-item">
                        <span className="stat-number">{eventos.length}</span>
                        <span className="stat-label">turnos totales</span>
                    </span>
                    <span className="stat-item">
                        <span className="stat-number">{eventos.filter((e) => e.estado === "disponible").length}</span>
                        <span className="stat-label">turnos disponibles</span>
                    </span>
                    <span className="stat-item">
                        <span className="stat-number">{eventos.filter((e) => e.estado === "reservado").length}</span>
                        <span className="stat-label">turnos reservados</span>
                    </span>
                    <span className="stat-item">
                        <span className="stat-number">{eventos.filter((e) => e.estado === "cancelado").length}</span>
                        <span className="stat-label">turnos cancelados</span>
                    </span>
                </div>
            </div>

            <div className="calendario-container">
                <Calendar
                    localizer={localizer}
                    events={eventos}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 700 }}
                    views={["month", "week", "day", "agenda"]}
                    view={view}
                    date={date}
                    onNavigate={handleNavigate}
                    onView={handleViewChange}
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={eventStyleGetter}
                    messages={messages}
                    formats={formats}
                    components={{
                        event: EventComponent,
                    }}
                    popup
                    selectable={false}
                    culture="es"
                />
            </div>

            <div className="calendario-legend">
                <div className="legend-item">
                    <span className="legend-color disponible"></span>
                    <span>Disponible</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color reservado"></span>
                    <span>Reservado</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color completado"></span>
                    <span>Completado</span>
                </div>
                <div className="legend-item">
                    <span className="legend-color cancelado"></span>
                    <span>Cancelado</span>
                </div>
            </div>
        </div>
    );
}
