import { useReducer, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { PacienteApi } from "../api/Paciente";
import { toast } from "react-toastify";
import ToastMessage from "../utils/ToastMessage";

const PacienteController = new PacienteApi();
const initialState = {
  paciente: null,
  documentos: [],
  modalOpen: false,
  nombreArchivo: "",
  archivos: [],
  loadingFile: false,
  statusChange: false,
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
    case "SET_ARCHIVOS":
      return { ...state, archivos: action.payload };
    case "SET_LOADING":
      return { ...state, loadingFile: action.payload };
    case "ADD_DOCUMENTOS":
      return { ...state, documentos: [...state.documentos, ...action.payload] };
    case "SET_DOCUMENTOS":
      return { ...state, documentos: action.payload };
    case "TOGGLE_STATUS":
      return { ...state, statusChange: !state.statusChange };
    default:
      return state;
  }
}

export function usePaciente({ showToast }) {
  const { id } = useParams();

  const statusRef = useRef(false);
  const [state, dispatch] = useReducer(reducer, initialState);
  const user = useMemo(() => JSON.parse(localStorage.getItem("userLog")), []);

  useEffect(() => {
    const fetchPaciente = async () => {
      try {
        const response = await PacienteController.getPacienteById(id);
        const documentosOrdenados = await PacienteController.getDocumentos(id);
        dispatch({ type: "SET_PACIENTE", payload: response });
        dispatch({ type: "SET_DOCUMENTOS", payload: documentosOrdenados });
      } catch (error) {
        console.error("Error al obtener los datos del paciente", error);
      }
    };
    fetchPaciente();
  }, [id]);

  const changeStatus = useCallback(() => {
    statusRef.current = true;
    dispatch({ type: "TOGGLE_STATUS" });
  }, []);

  const setNombreArchivo = (nombre) => {
    dispatch({ type: "SET_NOMBRE_ARCHIVO", payload: nombre });
  };

  const setArchivos = (archivos) => {
    dispatch({ type: "SET_ARCHIVOS", payload: archivos });
    //console.log(archivos);
  };

  const handleUpload = useCallback(async () => {
    if (!state.nombreArchivo || state.archivos.length === 0) {
      showToast("Debe seleccionar un archivo y un nombre", "error");
      return;
    }
    dispatch({ type: "SET_LOADING", payload: true });

    const formData = new FormData();
    state.archivos.forEach((archivo, index) => {
      formData.append("dicoms", archivo);
    });
    formData.append("nombreArchivo", state.nombreArchivo);

    try {
      const r = await PacienteController.subirDocumento(id, formData);

      console.log(r);

      if (r.ok) {
        const nuevosDocumentos = state.archivos.map((archivo) => ({
          nombreArchivo: state.nombreArchivo,
          dicom: URL.createObjectURL(archivo),
          urlArchivo: r.urlArchivo,
        }));
        dispatch({ type: "ADD_DOCUMENTOS", payload: nuevosDocumentos });
        dispatch({ type: "TOGGLE_MODAL" });
        dispatch({ type: "SET_NOMBRE_ARCHIVO", payload: "" });
        dispatch({ type: "SET_ARCHIVOS", payload: [] });
        dispatch({ type: "SET_LOADING", payload: false });
        showToast("Archivos subidos correctamente", "success");
      } else {
        toast.error("Error al subir los archivos");
      }
    } catch (error) {
      console.error("Error al subir los archivos", error);
      toast.error("Error al subir los archivos, Intente en unos minutos");
    } finally {
      window.location.reload();
    }
  }, [state.nombreArchivo, state.archivos, id]);

  return {
    state,
    dispatch,
    user,
    handleUpload,
    setNombreArchivo,
    setArchivos,
  };
}
