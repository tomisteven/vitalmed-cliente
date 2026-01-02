import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { LoaderIcon } from "react-hot-toast";
import { usePaciente } from "../hooks/usePacienteIndividual";
import "./ModalNota.css";

export default function ModalNota({ onClose, showToast, setNotaModalOpen }) {
  const { setNota, loading } = usePaciente({ showToast });

  const [nuevaNota, setNuevaNota] = useState({ nota: "", author: "" });

  return (
    <div className="modal-nota-overlay">
      <div className="modal-nota-container">
        <div className="modal-nota-header">
          <h3>Agregar Nota</h3>
          <FaTimes
            className="modal-nota-close-icon"
            onClick={() => setNotaModalOpen(false)}
          />
        </div>
        <div className="modal-nota-body">
          <input
            type="text"
            placeholder="Autor"
            value={nuevaNota.author}
            onChange={(e) =>
              setNuevaNota({ ...nuevaNota, author: e.target.value })
            }
            className="modal-nota-input"
          />
          <textarea
            placeholder="Escribe la nota..."
            value={nuevaNota.nota}
            onChange={(e) =>
              setNuevaNota({ ...nuevaNota, nota: e.target.value })
            }
            className="modal-nota-textarea"
          ></textarea>

          <button className="modal-nota-btn-submit" onClick={() => setNota(nuevaNota)}>
            {loading ? <LoaderIcon /> : "Guardar Nota"}
          </button>
        </div>
      </div>
    </div>
  );
}
