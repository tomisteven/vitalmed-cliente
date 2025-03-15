import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useReducer,
  useRef,
} from "react";
import Swal from "sweetalert2";

//controlador de la api
import { SecretariaApi } from "../api/Secretaria";
const SecretariaController = new SecretariaApi();

//estado inicial
const initialState = {
  secretarias: [],
  loading: true,
  statusChange: false,
};

//reducer para manejar el estado global del hook
const secretariasReducer = (state, action) => {
  switch (action.type) {
    case "SET_SECRETARIAS":
      return { ...state, secretarias: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "TOGGLE_STATUS":
      return { ...state, statusChange: !state.statusChange };
    case "SET_SEARCH":
      return { ...state, secretarias: action.payload };
    default:
      return state;
  }
};

export const useSecretaria = ({ notificacion }) => {
  //useReducer para manejar el estado global del hook
  const [state, dispach] = useReducer(secretariasReducer, initialState);

  //useRef para evitar renders innecesarios
  const statusRef = useRef(false);

  const fetchSecretarias = useCallback(async () => {
    //set loading true
    dispach({ type: "SET_LOADING", payload: true });

    try {
      const response = await SecretariaController.getSecretarias();
      if (Array.isArray(response)) {
        const secretariasOrdenadas = response.slice().reverse();
        sessionStorage.setItem(
          "secretarias",
          JSON.stringify(secretariasOrdenadas)
        );
        //set secretarias
        dispach({ type: "SET_SECRETARIAS", payload: secretariasOrdenadas });
        return;
      }
      console.warn("La respuesta no es válida:", response);
      //set secretarias
      dispach({ type: "SET_SECRETARIAS", payload: [] });
    } catch (error) {
      console.error("Error al obtener las secretarias:", error);
      //set secretarias
      dispach({ type: "SET_SECRETARIAS", payload: [] });
    } finally {
      //set loading false
      dispach({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const searchPacientes = async (search) => {
    const listado = JSON.parse(sessionStorage.getItem("secretarias"));
    const secretarias = state.secretarias;

    if (!search) {
      return dispach({ type: "SET_SECRETARIAS", payload: listado });
    }

    const searchResult = secretarias.filter((secretaria) => {
      return secretaria.nombre.toLowerCase().includes(search.toLowerCase());
    });

    dispach({ type: "SET_SEARCH", payload: searchResult });
  };

  useEffect(() => {
    //verificamos que no se haya hecho la petición
    const cache = sessionStorage.getItem("secretarias");

    if (cache && !statusRef.current) {
      dispach({ type: "SET_SECRETARIAS", payload: JSON.parse(cache) });
      dispach({ type: "SET_LOADING", payload: false });
      statusRef.current = true;
    } else {
      fetchSecretarias();
    }

    statusRef.current = false;
  }, [state.statusChange, fetchSecretarias]);

  //refrescar pagina

  const changeStatus = useCallback(() => {
    statusRef.current = true;
    dispach({ type: "TOGGLE_STATUS" });
  }, []);

  const saveSecretaria = useCallback(
    async (secretaria, isEdit = false) => {
      try {
        dispach({ type: "SET_LOADING", payload: true });
        if (isEdit) {
          await SecretariaController.updateSecretaria(
            secretaria.id,
            secretaria
          );
          notificacion("Secretaria actualizada correctamente", "success");
        } else {
          const newSecretaria = await SecretariaController.createSecretaria(
            secretaria
          );
          if (newSecretaria.ok) {
            notificacion("Secretaria creada correctamente", "success");
            dispach({ type: "SET_LOADING", payload: false });
          }
        }
        changeStatus();
      } catch (error) {
        notificacion("Error al guardar la secretaria", "error");
        dispach({ type: "SET_LOADING", payload: false });
      }
    },
    [changeStatus]
  );

  const deleteSecretaria = useCallback(
    async (id) => {
      console.log(id);

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
          const eliminado = await SecretariaController.deleteSecretaria(id);
          if (eliminado.ok) {
            Swal.fire(
              "Eliminado!",
              "El paciente ha sido eliminado.",
              "success"
            );
            changeStatus();
          }
        } catch (error) {
          console.error("Error al eliminar paciente", error);
        }
      }
    },
    [changeStatus]
  );

  const secretariaMemo = useMemo(() => state.secretarias, [state.secretarias]);

  return {
    secretarias: secretariaMemo,
    loading: state.loading,
    refreshSecretarias: fetchSecretarias,
    saveSecretaria,
    deleteSecretaria,
    searchPacientes,
  };
};
