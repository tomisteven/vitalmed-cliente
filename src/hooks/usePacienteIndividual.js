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
  doctores: [],
  doctoresList: [],
  loading: false,
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
    case "SET_DOCTORES":
      return { ...state, doctores: action.payload };
    // dentro del reducer
    case "SET_DOCTORES_LIST":
      return { ...state, doctoresList: action.payload };

    case "SET_LOADING_DOCTORES":
      return { ...state, loadingDoctores: action.payload };
    case "TOGGLE_STATUS":
      return { ...state, statusChange: !state.statusChange };
    case "SET_LOADING_GLOBAL":
      return { ...state, loading: action.payload };
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

        dispatch({ type: "SET_PACIENTE", payload: response.paciente });
        dispatch({
          type: "SET_DOCUMENTOS",
          payload: response.documentosAgrupados,
        });
        dispatch({ type: "SET_DOCTORES", payload: response.doctoresAsignados });
      } catch (error) {
        console.error("Error al obtener los datos del paciente", error);
      }
    };

    fetchPaciente();
    if (user?.rol === "paciente") {
      const handlePopState = (event) => {
        window.history.pushState(null, null, window.location.pathname);
      };

      const handleBeforeUnload = (event) => {
        event.preventDefault();
        event.returnValue = ""; // Previene navegación
      };

      window.addEventListener("popstate", handlePopState);
      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        window.removeEventListener("popstate", handlePopState);
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [id, user]);

  const fetchDoctoresList = async () => {
    dispatch({ type: "SET_LOADING_DOCTORES", payload: true });
    try {
      const response = await axios.get("/api/doctores");
      dispatch({ type: "SET_DOCTORES_LIST", payload: response.data });
    } catch (error) {
      console.error("Error fetching doctores:", error);
    } finally {
      dispatch({ type: "SET_LOADING_DOCTORES", payload: false });
    }
  };

  const eliminarDoctorDelPaciente = async (idDoctor) => {
    dispatch({ type: "SET_LOADING_GLOBAL", payload: true });
    try {
      const response = await PacienteController.eliminarDoctor(id, idDoctor);
      if (response.ok) {
        const doctoresActualizados = state.doctores.filter(
          (doctor) => doctor._id !== idDoctor
        );
        dispatch({ type: "SET_DOCTORES", payload: doctoresActualizados });
        showToast("Doctor eliminado correctamente", "success");
      } else {
        showToast("Error al eliminar el doctor", "error");
      }
    } catch (error) {
      console.error("Error al eliminar el doctor", error);
      showToast("Error al eliminar el doctor", "error");
    } finally {
      dispatch({ type: "SET_LOADING_GLOBAL", payload: false });
    }
  };

  const setNota = async (nota) => {
    dispatch({ type: "SET_LOADING_GLOBAL", payload: true });
    if (!nota) {
      showToast("Debe ingresar una nota", "error");
      return;
    }
    try {
      const response = await PacienteController.agregarNota(id, nota);
      if (response.ok) {
        state.paciente.notas.push(nota);
        showToast("Nota ingresada correctamente", "success");
      } else {
        toast.error("Error al actualizar la nota");
      }
    } catch (error) {
      console.error("Error al actualizar la nota", error);
      toast.error("Error al actualizar la nota");
    } finally {
      window.location.reload();
    }
  };

  const changeStatus = useCallback(() => {
    statusRef.current = true;
    dispatch({ type: "TOGGLE_STATUS" });
  }, []);

  const setNombreArchivo = (nombre) => {
    dispatch({ type: "SET_NOMBRE_ARCHIVO", payload: nombre });
  };

  const setArchivos = (archivos) => {
    dispatch({ type: "SET_ARCHIVOS", payload: archivos });
    console.log(archivos);
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
      console.log(formData);

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
    changeStatus,
    setNota,
    eliminarDoctorDelPaciente,
    loading: state.loading,
    fetchDoctoresList,
  };
}
