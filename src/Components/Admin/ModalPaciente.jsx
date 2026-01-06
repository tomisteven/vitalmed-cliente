import React, { useState, useEffect } from "react";
import "./ModalPaciente.css";

export default function ModalPaciente({ open, onClose, selectedPaciente, onSave, loading }) {
    const [formData, setFormData] = useState({
        nombre: "",
        dni: "",
        email: "",
        telefono: "",
        usuario: "",
        password: "",
        fechaNacimiento: "",
        id: "",
    });

    // Date picker states
    const [day, setDay] = useState("");
    const [month, setMonth] = useState("");
    const [year, setYear] = useState("");

    const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
    const months = [
        { value: "01", label: "Enero" },
        { value: "02", label: "Febrero" },
        { value: "03", label: "Marzo" },
        { value: "04", label: "Abril" },
        { value: "05", label: "Mayo" },
        { value: "06", label: "Junio" },
        { value: "07", label: "Julio" },
        { value: "08", label: "Agosto" },
        { value: "09", label: "Septiembre" },
        { value: "10", label: "Octubre" },
        { value: "11", label: "Noviembre" },
        { value: "12", label: "Diciembre" },
    ];

    const getDaysInMonth = (m, y) => {
        if (!m || !y) return 31;
        return new Date(y, parseInt(m), 0).getDate();
    };

    const daysCount = getDaysInMonth(month, year);
    const days = Array.from({ length: daysCount }, (_, i) => i + 1);

    useEffect(() => {
        if (selectedPaciente) {
            setFormData({
                nombre: selectedPaciente.nombre || "",
                dni: selectedPaciente.dni || "",
                email: selectedPaciente.email || "",
                telefono: selectedPaciente.telefono || "",
                usuario: selectedPaciente.usuario || "",
                password: selectedPaciente.password || "",
                fechaNacimiento: selectedPaciente.fechaNacimiento || "",
                id: selectedPaciente._id || "",
            });

            if (selectedPaciente.fechaNacimiento) {
                const date = new Date(selectedPaciente.fechaNacimiento);
                if (!isNaN(date.getTime())) {
                    setDay(date.getUTCDate().toString());
                    setMonth((date.getUTCMonth() + 1).toString().padStart(2, "0"));
                    setYear(date.getUTCFullYear().toString());
                }
            } else {
                setDay("");
                setMonth("");
                setYear("");
            }
        } else {
            setFormData({
                nombre: "",
                dni: "",
                email: "",
                telefono: "",
                usuario: "",
                password: "",
                fechaNacimiento: "",
                id: "",
            });
            setDay("");
            setMonth("");
            setYear("");
        }
    }, [selectedPaciente, open]);

    useEffect(() => {
        if (day && month && year) {
            const formattedDate = `${year}-${month}-${day.padStart(2, "0")}`;
            setFormData(prev => ({ ...prev, fechaNacimiento: formattedDate }));
        }
    }, [day, month, year]);

    if (!open) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData, !!selectedPaciente);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container-paciente">
                <h3 className="paciente-crear-titulo">
                    {selectedPaciente ? "Editar Paciente" : "Crear Nuevo Paciente"}
                </h3>
                <form onSubmit={handleSubmit} className="form-paciente">
                    <div className="form-group-paciente">
                        <label className="label-paciente">Nombre y Apellido</label>
                        <input
                            type="text"
                            placeholder="Nombre y Apellido"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-row-paciente">
                        <div className="form-group-paciente">
                            <label className="label-paciente">Teléfono</label>
                            <input
                                type="text"
                                placeholder="Número de Teléfono"
                                value={formData.telefono}
                                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                            />
                        </div>
                        <div className="form-group-paciente">
                            <label className="label-paciente">Cédula Identidad</label>
                            <input
                                type="text"
                                placeholder="Cédula de Identidad"
                                value={formData.dni}
                                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group-paciente">
                        <label className="label-paciente">Email</label>
                        <input
                            type="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="form-group-paciente">
                        <label className="label-paciente">Fecha de Nacimiento</label>
                        <div className="birthday-selector">
                            <select value={day} onChange={(e) => setDay(e.target.value)} required>
                                <option value="">Día</option>
                                {days.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <select value={month} onChange={(e) => setMonth(e.target.value)} required>
                                <option value="">Mes</option>
                                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                            <select value={year} onChange={(e) => setYear(e.target.value)} required>
                                <option value="">Año</option>
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>

                    <span className="divisor-modal"></span>

                    <div className="form-row-paciente">
                        <div className="form-group-paciente">
                            <label className="label-paciente">Usuario</label>
                            <input
                                type="text"
                                placeholder="Usuario"
                                value={formData.usuario}
                                onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group-paciente">
                            <label className="label-paciente">Contraseña</label>
                            <input
                                type="text"
                                placeholder="Contraseña (Opcional)"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="modal-actions-paciente">
                        <button type="submit" className="btn-guardar-paciente" disabled={loading}>
                            {loading ? "Guardando..." : "Guardar"}
                        </button>
                        <button type="button" className="btn-cancelar-paciente" onClick={onClose}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
