import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import "./ModalAsignarDoctor.css";
import { PacienteApi } from "../api/Paciente";
import { set } from "lodash";
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

  useEffect(() => {
    setLoading(true);
    const cargarDoctores = async () => {
      try {
        const response = await PacienteController.getDoctoresList();
        if (response.ok) {
          //console.log(doctoresPaciente);

          //filtramos que doctores tiene el paciente y el uqe ya existe lo eliminamos del array doctores list
          const doctoresAsignados = doctoresPaciente.map((doc) => doc._id);
          console.log(doctoresAsignados);
          const doctoresFiltrados = response.doctores.filter(
            (doc) => !doctoresAsignados.includes(doc._id)
          );
          console.log(doctoresFiltrados);

          setDoctoresDisponibles(doctoresFiltrados); // Asumo que el array de doctores viene en response.data
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
  }, []);

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
    }
  };

  // Filtro para no mostrar en el select los que ya están agregados
  const doctoresFiltrados = doctoresDisponibles.filter(
    (doctor) => !doctoresAsignados.includes(doctor._id)
  );

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Asignar Doctor</h3>
          <FaTimes className="close-icon" onClick={onClose} />
        </div>
        <div className="modal-body">
          <select
            disabled={loading}
            className="select-doctor"
            value={doctorSeleccionado}
            onChange={(e) => setDoctorSeleccionado(e.target.value)}
          >
            <option value="">Selecciona un doctor...</option>
            {doctoresFiltrados.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.nombre}
              </option>
            ))}
          </select>

          <button className="btn-agregar" onClick={agregarDoctor}>
            Agregar Doctor
          </button>

          <h4 className="title-doctores-asignados">Doctores Asignados:</h4>
          <div className="lista-doctores">
            {doctoresAsignados.map((id) => {
              const doctor = doctoresDisponibles.find((doc) => doc._id === id);
              return (
                <div key={id} className="doctor-item">
                  {doctor ? doctor.nombre : "Doctor no encontrado"}
                  <button
                    className="btn-remove"
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
            className="btn-submit-asignar-doctor"
            onClick={handleAsignar}
          >
            {loading ? <LoaderIcon /> : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
