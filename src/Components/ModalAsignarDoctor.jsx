import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import "./ModalAsignarDoctor.css";
import { PacienteApi } from "../api/Paciente";
import { LoaderIcon } from "react-hot-toast";

const PacienteController = new PacienteApi();

export default function ModalAsignarDoctor({
  onClose,
  id,
  showToast,
  doctoresPaciente,
}) {
  const [doctorSeleccionado, setDoctorSeleccionado] = useState("");
  const [doctoresAsignados, setDoctoresAsignados] = useState([]);
  const [doctoresDisponibles, setDoctoresDisponibles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setLoading(true);
    const cargarDoctores = async () => {
      try {
        const response = await PacienteController.getDoctoresList();
        if (response.ok) {
          const doctoresAsignadosIds = doctoresPaciente.map((doc) => doc._id);
          const doctoresFiltrados = response.doctores.filter(
            (doc) => !doctoresAsignadosIds.includes(doc._id)
          );
          setDoctoresDisponibles(doctoresFiltrados);
        } else {
          showToast("Error al cargar doctores", "error");
        }
      } catch (error) {
        console.error("Error cargando doctores:", error);
        showToast("Error inesperado al cargar doctores", "error");
      }
      setLoading(false);
    };

    cargarDoctores();
  }, [doctoresPaciente, showToast]);

  const agregarDoctor = () => {
    if (!doctorSeleccionado) {
      alert("Por favor selecciona un doctor");
      return;
    }
    if (doctoresAsignados.includes(doctorSeleccionado)) {
      alert("Este doctor ya fue agregado");
      return;
    }
    setDoctoresAsignados((prev) => [...prev, doctorSeleccionado]);
    setDoctorSeleccionado("");
  };

  const handleAsignar = async () => {
    setLoading(true);
    if (doctoresAsignados.length === 0) {
      alert("Por favor agrega al menos un doctor");
      setLoading(false);
      return;
    }

    const response = await PacienteController.asignarDoctores(id, {
      idDoctores: doctoresAsignados,
    });
    if (response.ok) {
      showToast("Doctores asignados correctamente", "success");
      window.location.reload();
    } else {
      showToast("Error al asignar doctores", "error");
      setLoading(false);
    }
  };

  const doctoresFiltrados = doctoresDisponibles
    .filter((doctor) => !doctoresAsignados.includes(doctor._id))
    .filter((doctor) =>
      doctor.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="modal-asignar-doctor-overlay">
      <div className="modal-asignar-doctor-container">
        <div className="modal-asignar-doctor-header">
          <h3>Asignar Doctor</h3>
          <FaTimes className="modal-asignar-doctor-close-icon" onClick={onClose} />
        </div>
        <div className="modal-asignar-doctor-body">
          {/* Search Input */}
          <div className="modal-asignar-doctor-search">
            <input
              type="text"
              placeholder="🔍 Buscar doctor por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="modal-asignar-doctor-search-input"
            />
          </div>

          <select
            disabled={loading}
            className="modal-asignar-doctor-select"
            value={doctorSeleccionado}
            onChange={(e) => setDoctorSeleccionado(e.target.value)}
          >
            <option value="">Selecciona un doctor... ({doctoresFiltrados.length} disponibles)</option>
            {doctoresFiltrados.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.nombre}
              </option>
            ))}
          </select>

          <button className="modal-asignar-doctor-btn-add" onClick={agregarDoctor}>
            Agregar Doctor
          </button>

          <h4 className="modal-asignar-doctor-title-assigned">Doctores Asignados:</h4>
          <div className="modal-asignar-doctor-list">
            {doctoresAsignados.map((id) => {
              const doctor = doctoresDisponibles.find((doc) => doc._id === id);
              return (
                <div key={id} className="modal-asignar-doctor-item">
                  {doctor ? doctor.nombre : "Doctor no encontrado"}
                  <button
                    className="modal-asignar-doctor-btn-remove"
                    onClick={() =>
                      setDoctoresAsignados((prev) =>
                        prev.filter((docId) => docId !== id)
                      )
                    }
                  >
                    <FaTimes />
                  </button>
                </div>
              );
            })}
          </div>

          <button
            hidden={doctoresAsignados.length === 0}
            className="modal-asignar-doctor-btn-submit"
            onClick={handleAsignar}
            disabled={loading}
          >
            {loading ? <LoaderIcon /> : "Confirmar"}
          </button>
        </div>
        <button className="modal-asignar-doctor-btn-close" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
