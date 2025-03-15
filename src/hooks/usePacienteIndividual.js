// usePaciente.js
import { useReducer, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { PacienteApi } from "../api/Paciente";
import { toast } from "react-toastify";

const PacienteController = new PacienteApi();
const initialState = {
  paciente: null,
  documentos: [],
  modalOpen: false,
  nombreArchivo: "",
  archivo: null,
  loadingFile: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_PACIENTE":
      return {
        ...state,
        paciente: action.payload,
        documentos: action.payload.documentos || [],
      };
    case "TOGGLE_MODAL":
      return { ...state, modalOpen: !state.modalOpen };
    case "SET_NOMBRE_ARCHIVO":
      return { ...state, nombreArchivo: action.payload };
    case "SET_ARCHIVO":
      return { ...state, archivo: action.payload };
    case "SET_LOADING":
      return { ...state, loadingFile: action.payload };
    case "ADD_DOCUMENTO":
      return { ...state, documentos: [...state.documentos, action.payload] };
    default:
      return state;
  }
}

export function usePaciente() {
  const { id } = useParams();
  const [state, dispatch] = useReducer(reducer, initialState);
  const user = useMemo(() => JSON.parse(localStorage.getItem("userLog")), []);

  useEffect(() => {
    const fetchPaciente = async () => {
      try {
        const response = await PacienteController.getPacienteById(id);
        dispatch({ type: "SET_PACIENTE", payload: response });
      } catch (error) {
        console.error("Error al obtener los datos del paciente", error);
      }
    };
    fetchPaciente();
  }, [id]);

  const setNombreArchivo = (nombre) => {
    dispatch({ type: "SET_NOMBRE_ARCHIVO", payload: nombre });
  };

    const setArchivo = (archivo) => {
    dispatch({ type: "SET_ARCHIVO", payload: archivo });
    };

  const handleUpload = useCallback(async () => {
    if (!state.nombreArchivo || !state.archivo) {
      alert("Debes completar todos los campos.");
      return;
    }
    dispatch({ type: "SET_LOADING", payload: true });

    const formData = new FormData();
    formData.append("dicom", state.archivo);
    formData.append("nombreArchivo", state.nombreArchivo);

    try {
      const r = await PacienteController.subirDocumento(id, formData);
      if (r.ok) {
        dispatch({
          type: "ADD_DOCUMENTO",
          payload: {
            nombreArchivo: state.nombreArchivo,
            dicom: URL.createObjectURL(state.archivo),
            urlArchivo: r.urlArchivo,
          },
        });
        dispatch({ type: "SET_LOADING", payload: false });
        dispatch({ type: "TOGGLE_MODAL" });
        toast.success("Subido Correctamente");
      } else {
        toast.error("Error al subir el archivo");
      }
    } catch (error) {
      console.error("Error al subir el archivo", error);
      toast.error("Error al subir el archivo, Intente en unos minutos");
    }
  }, [state.nombreArchivo, state.archivo, id]);

  return { state, dispatch, user, handleUpload, setNombreArchivo, setArchivo };
}
