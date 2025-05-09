import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { PacienteApi } from "../api/Paciente";
import { LoaderIcon } from "react-hot-toast";

import { usePaciente } from "../hooks/usePacienteIndividual";

import { useParams } from "react-router-dom";
const PacienteController = new PacienteApi();

export default function ModalNota({ onClose, showToast, setNotaModalOpen }) {
  const { setNota, loading } = usePaciente({ showToast });

  const [nuevaNota, setNuevaNota] = useState({ nota: "", author: "" });

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Agregar Nota</h3>
          <FaTimes
            className="close-icon"
            onClick={() => setNotaModalOpen(false)}
          />
        </div>
        <div className="modal-body">
          <input
            type="text"
            placeholder="Autor"
            value={nuevaNota.author}
            onChange={(e) =>
              setNuevaNota({ ...nuevaNota, author: e.target.value })
            }
          />
          <textarea
            placeholder="Escribe la nota..."
            value={nuevaNota.nota}
            onChange={(e) =>
              setNuevaNota({ ...nuevaNota, nota: e.target.value })
            }
          ></textarea>

          <button className="btn-submit" onClick={() => setNota(nuevaNota)}>
            {loading ? <LoaderIcon /> : "Guardar Nota"}
          </button>
        </div>
      </div>
    </div>
  );
}
