import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EstudiosApi } from "../../api/Estudios";
import toast from "react-hot-toast";
import "../../Components/Admin/CrearDisponibilidadForm.css";

const estudiosApi = new EstudiosApi();

export default function CrearEstudio() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        tipo: "",
        precio: "",
        aclaraciones: "",
        activo: true,
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.tipo.trim()) {
            toast.error("El tipo de estudio es requerido");
            return;
        }

        setSubmitting(true);
        try {
            await estudiosApi.crearEstudio({
                ...formData,
                precio: formData.precio ? Number(formData.precio) : 0,
            });
            toast.success("✓ Estudio creado exitosamente");
            navigate("/admin/estudios");
        } catch (error) {
            console.error("Error al crear estudio:", error);
            toast.error(error.message || "Error al crear el estudio");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="crear-disponibilidad-form">
            <button
                type="button"
                className="btn-limpiar-horarios"
                onClick={() => navigate("/admin/estudios")}
            >
                ← Volver al listado
            </button>

            <h3>Crear Estudio</h3>
            <p className="form-description">
                Cargue o redacte un nuevo estudio para el catálogo del consultorio.
            </p>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="tipo">
                        Tipo de Estudio <span className="required">*</span>
                    </label>
                    <input
                        id="tipo"
                        name="tipo"
                        type="text"
                        placeholder="Ej: Ecografía Abdominal"
                        value={formData.tipo}
                        onChange={handleChange}
                        disabled={submitting}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="precio">REF / Precio</label>
                    <input
                        id="precio"
                        name="precio"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        value={formData.precio}
                        onChange={handleChange}
                        disabled={submitting}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="aclaraciones">Aclaraciones / Preparación</label>
                    <textarea
                        id="aclaraciones"
                        name="aclaraciones"
                        placeholder="Indicaciones para el paciente, preparación, etc."
                        rows="4"
                        value={formData.aclaraciones}
                        onChange={handleChange}
                        disabled={submitting}
                    />
                </div>

                <div className="form-group">
                    <label className="checkbox-estudio">
                        <input
                            type="checkbox"
                            name="activo"
                            checked={formData.activo}
                            onChange={handleChange}
                            disabled={submitting}
                        />
                        <span>Estudio activo</span>
                    </label>
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn-generar-turnos"
                        disabled={submitting}
                    >
                        {submitting ? "Guardando..." : "Crear Estudio"}
                    </button>
                </div>
            </form>
        </div>
    );
}
