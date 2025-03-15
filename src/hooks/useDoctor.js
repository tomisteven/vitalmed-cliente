import {
  useEffect,
  useState,
  useReducer,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { DoctoresApi } from "../api/Doctores";
import Swal from "sweetalert2";

const doctorApi = new DoctoresApi();

const initialState = {
  doctores: [],
  loading: false,
  statusChange: false,
};

const doctorReducer = (state, action) => {
  switch (action.type) {
    case "SET_DOCTORES":
      return { ...state, doctores: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "TOGGLE_STATUS":
      return { ...state, statusChange: !state.statusChange };
    case "SET_SEARCH":
      return { ...state, doctores: action.payload };
    default:
      return state;
  }
};

export const useDoctor = ({ notificacion }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [doctorData, setDoctorData] = useState({
    nombre: "",
    email: "",
    password: "",
  });

  const [state, dispach] = useReducer(doctorReducer, initialState);
  const statusRef = useRef(false);

  // Obtener lista de doctores
  const fetchDoctores = async () => {
    dispach({ type: "SET_LOADING", payload: true });
    try {
      const response = await doctorApi.getDoctores();

      if (Array.isArray(response)) {
        const doctoresOrdenados = response.slice().reverse();
        sessionStorage.setItem("doctores", JSON.stringify(doctoresOrdenados));
        dispach({ type: "SET_DOCTORES", payload: doctoresOrdenados });
        return;
      }
    } catch (error) {
      console.error("Error al obtener los doctores", error);
    } finally {
      dispach({ type: "SET_LOADING", payload: false });
    }
  };

  useEffect(() => {
    const cachedDoctores = sessionStorage.getItem("doctores");
    if (cachedDoctores && !statusRef.current) {
      dispach({ type: "SET_DOCTORES", payload: JSON.parse(cachedDoctores) });
      dispach({ type: "SET_LOADING", payload: false });
    } else {
      fetchDoctores();
    }
    statusRef.current = false;
    dispach({ type: "SET_LOADING", payload: false });
  }, [state.statusChange]);

  const refresh = useCallback(() => {
    statusRef.current = true;
    dispach({ type: "TOGGLE_STATUS" });
  }, []);

  // Manejo de cambios en el formulario
  const handleInputChange = (e) => {
    setDoctorData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Guardar o actualizar doctor
  const handleSaveDoctor = useCallback(async () => {
    dispach({ type: "SET_LOADING", payload: true });
    try {
      if (editingDoctor) {
        const res = await doctorApi.updateDoctor(editingDoctor._id, doctorData);
        if (res.ok) {
          notificacion("Doctor actualizado correctamente", "success");
        }
      } else {
        const res = await doctorApi.createDoctor(doctorData);
        if (res.ok) {
          notificacion("Doctor creado correctamente", "success");
        }
      }

      closeModal();
      refresh();
    } catch (error) {
      console.error("Error al guardar el doctor", error);
    } finally {
      dispach({ type: "SET_LOADING", payload: false });
    }
  }, [doctorData, editingDoctor, refresh]);

  // Preparar edición de doctor
  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setDoctorData({
      nombre: doctor.nombre,
      email: doctor.email,
      password: doctor.password,
    });
    setModalOpen(true);
  };

  // Abrir modal para agregar un nuevo doctor
  const openModal = () => {
    setDoctorData({ nombre: "", email: "", password: "" });
    setEditingDoctor(null);
    setModalOpen(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setModalOpen(false);
    setEditingDoctor(null);
    setDoctorData({ nombre: "", email: "", password: "" });
  };

  const doctoresMemo = useMemo(() => {
    return state.doctores;
  }, [state.doctores]);

  const deleteDoctor = useCallback(
    async (id) => {
      Swal.fire({
        title: "¿Estás seguro?",
        text: "Una vez eliminado, no podrás recuperar este doctor",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            dispach({ type: "SET_LOADING", payload: true });
            const res = await doctorApi.deleteDoctor(id);
            if (res.ok) {
              refresh();
            }
          } catch (error) {
            console.error("Error al eliminar el doctor", error);
            notificacion("Error al eliminar el doctor", "error");
          } finally {
            dispach({ type: "SET_LOADING", payload: false });
            notificacion("Doctor eliminado correctamente", "success");
          }
        }
      });
    },
    [refresh]
  );

  return {
    doctores: doctoresMemo,
    loading: state.loading,
    modalOpen,
    editingDoctor,
    doctorData,
    fetchDoctores,
    handleInputChange,
    handleSaveDoctor,
    handleEdit,
    openModal,
    closeModal,
    deleteDoctor,
  };
};
