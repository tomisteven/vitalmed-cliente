import React, { useState, useEffect } from "react";
import { EstudiosApi } from "../../api/Estudios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import "./GestionEstudios.css";

const estudiosApi = new EstudiosApi();

export default function GestionEstudios() {
    const [estudios, setEstudios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingEstudio, setEditingEstudio] = useState(null);
    const [formData, setFormData] = useState({
        tipo: "",
        precio: "",
        aclaraciones: "",
        activo: true,
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        cargarEstudios();
    }, []);

    const cargarEstudios = async () => {
        setLoading(true);
        try {
            const response = await estudiosApi.getEstudios();
            // Handle different response structures
            const listaEstudios = Array.isArray(response)
                ? response
                : response.estudios || [];
            setEstudios(listaEstudios);
        } catch (error) {
            console.error("Error al cargar estudios:", error);
            toast.error("Error al cargar los estudios");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (estudio = null) => {
        if (estudio) {
            setEditingEstudio(estudio);
            setFormData({
                tipo: estudio.tipo || "",
                precio: estudio.precio || "",
                aclaraciones: estudio.aclaraciones || "",
                activo: estudio.activo !== undefined ? estudio.activo : true,
            });
        } else {
            setEditingEstudio(null);
            setFormData({
                tipo: "",
                precio: "",
                aclaraciones: "",
                activo: true,
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingEstudio(null);
        setFormData({
            tipo: "",
            precio: "",
            aclaraciones: "",
            activo: true,
        });
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.tipo.trim()) {
            toast.error("El tipo de estudio es requerido");
            return;
        }

        setSubmitting(true);

        try {
            const dataToSend = {
                ...formData,
                precio: formData.precio ? Number(formData.precio) : 0,
            };

            if (editingEstudio) {
                await estudiosApi.actualizarEstudio(editingEstudio._id, dataToSend);
                toast.success("✓ Estudio actualizado exitosamente");
            } else {
                await estudiosApi.crearEstudio(dataToSend);
                toast.success("✓ Estudio creado exitosamente");
            }

            handleCloseModal();
            cargarEstudios();
        } catch (error) {
            console.error("Error al guardar estudio:", error);
            toast.error(error.message || "Error al guardar el estudio");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (estudio) => {
        const result = await Swal.fire({
            title: "¿Eliminar estudio?",
            text: `¿Está seguro de eliminar "${estudio.tipo}"? Esta acción no se puede deshacer.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#dc3545",
            cancelButtonColor: "#6c757d",
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
        });

        if (result.isConfirmed) {
            try {
                await estudiosApi.eliminarEstudio(estudio._id);
                toast.success("✓ Estudio eliminado exitosamente");
                cargarEstudios();
            } catch (error) {
                console.error("Error al eliminar estudio:", error);
                toast.error(error.message || "Error al eliminar el estudio");
            }
        }
    };

    const formatPrecio = (precio) => {
        if (!precio && precio !== 0) return "-";
        return new Intl.NumberFormat("es-AR", {
            style: "currency",
            currency: "ARS",
        }).format(precio);
    };

    return (
        <div className="gestion-estudios">
            <div className="estudios-header">
                <h3 className="text-white-gestion">Gestión de Estudios</h3>
                <button className="btn-agregar" onClick={() => handleOpenModal()}>
                    <span className="btn-icon">+</span>
                    Agregar Estudio
                </button>
            </div>

            {loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Cargando estudios...</p>
                </div>
            ) : estudios.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h4>No hay estudios registrados</h4>
                    <p>Agregue un nuevo estudio para comenzar</p>
                </div>
            ) : (
                <div className="estudios-table-container">
                    <table className="estudios-table">
                        <thead>
                            <tr>
                                <th>Tipo de Estudio</th>
                                <th>Precio</th>
                                <th>Aclaraciones</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {estudios.map((estudio) => (
                                <tr key={estudio._id}>
                                    <td className="td-tipo">{estudio.tipo}</td>
                                    <td className="td-precio">{formatPrecio(estudio.precio)}</td>
                                    <td className="td-aclaraciones">
                                        {estudio.aclaraciones || "-"}
                                    </td>
                                    <td className="td-estado">
                                        <span
                                            className={`badge ${estudio.activo ? "badge-activo" : "badge-inactivo"
                                                }`}
                                        >
                                            {estudio.activo ? "Activo" : "Inactivo"}
                                        </span>
                                    </td>
                                    <td className="td-acciones">
                                        <button
                                            className="btn-editar"
                                            onClick={() => handleOpenModal(estudio)}
                                            title="Editar"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="btn-eliminar"
                                            onClick={() => handleDelete(estudio)}
                                            title="Eliminar"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div
                        className="modal-content-estudio"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="modal-header">
                            <h4>{editingEstudio ? "Editar Estudio" : "Nuevo Estudio"}</h4>
                            <button className="modal-close" onClick={handleCloseModal}>
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="tipo">
                                        Tipo de Estudio <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="tipo"
                                        name="tipo"
                                        value={formData.tipo}
                                        onChange={handleChange}
                                        placeholder="Ej: Ecografía Abdominal"
                                        disabled={submitting}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="precio">Precio (ARS)</label>
                                    <input
                                        type="number"
                                        id="precio"
                                        name="precio"
                                        value={formData.precio}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        disabled={submitting}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="aclaraciones">Aclaraciones</label>
                                    <textarea
                                        id="aclaraciones"
                                        name="aclaraciones"
                                        value={formData.aclaraciones}
                                        onChange={handleChange}
                                        placeholder="Indicaciones para el paciente, preparación, etc."
                                        rows="3"
                                        disabled={submitting}
                                    />
                                </div>

                                <div className="form-group form-group-checkbox">
                                    <label className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            name="activo"
                                            checked={formData.activo}
                                            onChange={handleChange}
                                            disabled={submitting}
                                        />
                                        <span className="checkbox-text">Estudio activo</span>
                                    </label>
                                    <small className="help-text">
                                        Solo los estudios activos aparecen al reservar turnos
                                    </small>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="btn-cancelar-modal"
                                    disabled={submitting}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-guardar-modal"
                                    disabled={submitting}
                                >
                                    {submitting
                                        ? "Guardando..."
                                        : editingEstudio
                                            ? "Actualizar"
                                            : "Crear Estudio"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
