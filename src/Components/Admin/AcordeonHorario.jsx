import React, { useState } from "react";
import { FaChevronDown, FaChevronRight, FaClock, FaUserMd } from "react-icons/fa";
import TarjetaTurno from "./TarjetaTurno";
import "./AcordeonHorario.css";

export default function AcordeonHorario({ fechaHora, turnos, onReservado }) {
    const [expandido, setExpandido] = useState(false);

    // Obtener especialidades únicas para mostrar en el header
    const especialidades = [...new Set(turnos.map(t => t.especialidad || t.doctor?.especialidad).filter(Boolean))];

    // Obtener doctores únicos
    const doctores = [...new Set(turnos.map(t => t.doctor?.nombre).filter(Boolean))];

    return (
        <div className={`acordeon-horario ${expandido ? 'expandido' : ''}`}>
            <button
                className="acordeon-header"
                onClick={() => setExpandido(!expandido)}
                aria-expanded={expandido}
            >
                <div className="acordeon-info">
                    <div className="acordeon-tiempo">
                        <FaClock className="icono-reloj" />
                        <span className="fecha-hora-texto">{fechaHora}</span>
                    </div>
                    <div className="acordeon-detalles">
                        <span className="cantidad-turnos">
                            {turnos.length} {turnos.length === 1 ? 'turno disponible' : 'turnos disponibles'}
                        </span>
                        <div className="especialidades-preview">
                            {especialidades.slice(0, 3).map((esp, idx) => (
                                <span key={idx} className="tag-especialidad">{esp}</span>
                            ))}
                            {especialidades.length > 3 && (
                                <span className="tag-mas">+{especialidades.length - 3}</span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="acordeon-icono">
                    {expandido ? <FaChevronDown /> : <FaChevronRight />}
                </div>
            </button>

            <div className={`acordeon-contenido ${expandido ? 'visible' : ''}`}>
                <div className="turnos-acordeon-grid">
                    {turnos.map((turno) => (
                        <TarjetaTurno
                            key={turno._id}
                            turno={turno}
                            onReservado={onReservado}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
