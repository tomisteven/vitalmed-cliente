import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { PacienteApi } from "../api/Paciente";
import Swal from "sweetalert2";

const PacienteController = new PacienteApi();

// 🎯 Reducer para manejar el estado global del hook
const initialState = {
  pacientes: [],
  loading: true,
  statusChange: false,
};

const pacientesReducer = (state, action) => {
  switch (action.type) {
    case "SET_PACIENTES":
      return { ...state, pacientes: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "TOGGLE_STATUS":
      return { ...state, statusChange: !state.statusChange };
    case "SET_SEARCH":
      return { ...state, pacientes: action.payload };
    default:
      return state;
  }
};

export const usePacientes = ({ notificacion }) => {
  const [state, dispatch] = useReducer(pacientesReducer, initialState);
  const statusRef = useRef(false); // useRef para evitar renders innecesarios

  // 🔥 Fetch de pacientes optimizado con useCallback
  const fetchPacientes = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await PacienteController.getPacientes();
      if (Array.isArray(response)) {
        const pacientesOrdenados = response.slice().reverse();
        sessionStorage.setItem("pacientes", JSON.stringify(pacientesOrdenados));
        dispatch({ type: "SET_PACIENTES", payload: pacientesOrdenados });
        return;
      }
      console.warn("La respuesta no es válida:", response);
      dispatch({ type: "SET_PACIENTES", payload: [] });
    } catch (error) {
      console.error("Error al obtener los pacientes:", error);
      dispatch({ type: "SET_PACIENTES", payload: [] });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const searchPaciente = async (valor) => {
    const listado = JSON.parse(sessionStorage.getItem("pacientes"));
    const pacientes = state.pacientes;
    if (!valor) {
      return dispatch({ type: "SET_PACIENTES", payload: listado });
    }
    const search = pacientes.filter((paciente) => {
      return paciente.nombre.toLowerCase().includes(valor.toLowerCase());
    });

    dispatch({ type: "SET_SEARCH", payload: search });
  };

  // 🔥 Efecto optimizado con sessionStorage
  useEffect(() => {
    const cachedPacientes = sessionStorage.getItem("pacientes");
    if (cachedPacientes && !statusRef.current) {
      dispatch({ type: "SET_PACIENTES", payload: JSON.parse(cachedPacientes) });
      dispatch({ type: "SET_LOADING", payload: false });
    } else {
      fetchPacientes();
    }
    statusRef.current = false;
  }, [state.statusChange, fetchPacientes]);

  // 🔄 Función para forzar actualización con useCallback
  const refreshPacientes = useCallback(() => {
    statusRef.current = true;
    dispatch({ type: "TOGGLE_STATUS" });
  }, []);

  // 📝 Función para crear o actualizar paciente
  const savePaciente = useCallback(
    async (paciente, isEdit = false) => {
      try {
        if (isEdit) {
          await PacienteController.updatePaciente(paciente.id, paciente);
          notificacion("Paciente actualizado correctamente", "success");
        } else {
          await PacienteController.createPaciente(paciente);
        }
        refreshPacientes();
      } catch (error) {
        console.error("Error al guardar paciente", error);
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
        notificacion("Paciente creado correctamente", "success");
      }
    },
    [refreshPacientes]
  );

  // ❌ Función para eliminar paciente con confirmación
  const deletePaciente = useCallback(
    async (id) => {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "No podrás revertir esto!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar!",
        cancelButtonText: "Cancelar",
      });

      if (result.isConfirmed) {
        try {
          const eliminado = await PacienteController.deletePaciente(id);
          if (eliminado.ok) {
            Swal.fire(
              "Eliminado!",
              "El paciente ha sido eliminado.",
              "success"
            );
            refreshPacientes();
          }
        } catch (error) {
          console.error("Error al eliminar paciente", error);
        }
      }
    },
    [refreshPacientes]
  );

  // 🏆 Memoización de pacientes para evitar renders innecesarios
  const pacientesMemo = useMemo(() => state.pacientes, [state.pacientes]);

  return {
    pacientes: pacientesMemo,
    loading: state.loading,
    refreshPacientes,
    savePaciente,
    deletePaciente,
    searchPaciente,
  };
};
