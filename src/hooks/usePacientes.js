import {
  useEffect,
  useCallback,
  useMemo,
  useReducer,
} from "react";
import { PacienteApi } from "../api/Paciente";
import Swal from "sweetalert2";

const PacienteController = new PacienteApi();

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

  const fetchPacientes = useCallback(async () => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const response = await PacienteController.getPacientes();
      if (Array.isArray(response)) {
        const pacientesOrdenados = response.slice().reverse();
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
    if (!valor) {
      return fetchPacientes();
    }
    const search = state.pacientes.filter((paciente) => {
      return (
        paciente.nombre.toLowerCase().includes(valor.toLowerCase()) ||
        paciente.dni.toString().includes(valor)
      );
    });

    dispatch({ type: "SET_SEARCH", payload: search });
  };

  useEffect(() => {
    fetchPacientes();
  }, [state.statusChange, fetchPacientes]);

  const refreshPacientes = useCallback(() => {
    dispatch({ type: "TOGGLE_STATUS" });
  }, []);

  const setPacientes = useCallback((pacientes) => {
    dispatch({ type: "SET_PACIENTES", payload: pacientes });
  }, []);

  const savePaciente = useCallback(
    async (paciente, isEdit = false) => {
      try {
        dispatch({ type: "SET_LOADING", payload: true });
        if (isEdit) {
          await PacienteController.updatePaciente(paciente.id, paciente);
          notificacion("Paciente actualizado correctamente", "success");
        } else {
          await PacienteController.createPaciente(paciente);
          notificacion("Paciente creado correctamente", "success  ");
        }
        refreshPacientes();
      } catch (error) {
        console.error("Error al guardar paciente", error);
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [refreshPacientes]
  );

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

  const pacientesMemo = useMemo(() => state.pacientes, [state.pacientes]);

  return {
    pacientes: pacientesMemo,
    loading: state.loading,
    refreshPacientes,
    savePaciente,
    deletePaciente,
    searchPaciente,
    setPacientes,
  };
};
