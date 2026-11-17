import React from "react";
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Auth } from "../pages/admin/index";
import { AdminLayout } from "../layouts";
import NotFound from "../pages/admin/Error404";
import Pacientes from "../pages/admin/Pacientes.js";
import VerPaciente from "../pages/admin/VerPaciente.js";
import Doctores from "../pages/admin/Doctores.js";
import Secretarias from "../pages/admin/Secretarias.js";
import Turnos from "../pages/admin/Turnos.js";
import BandejaPacientes from "../pages/admin/BandejaPacientes.js";
import CrearEstudio from "../pages/admin/CrearEstudio.js";
import GestionEstudios from "../Components/Admin/GestionEstudios";
import GaleriaAdmin from "../pages/admin/GaleriaAdmin.js";
import CrearDisponibilidadForm from "../Components/Admin/CrearDisponibilidadForm";
import ReservarTurno from "../pages/admin/ReservarTurno.js";
import ReservarSinRegistro from "../pages/admin/ReservarSinRegistro.js";
import MisTurnosPage from "../pages/admin/MisTurnosPage.js";
import toast, { Toaster } from "react-hot-toast";
import UsuarioLogueado from "../pages/admin/UsuarioLogueado.js";
import ProtectedRoute from "../Components/ProtectedRoutes.jsx";
import NuevaPortada from "../pages/NuevaPortada.js";
import Cursos from "../pages/Cursos.js";
import EstudiosPage from "../pages/EstudiosPage.js";
import ServiciosPage from "../pages/ServiciosPage.js";
import Logs from "../pages/admin/Logs.js";
import HistorialTurnos from "../pages/admin/HistorialTurnos.js";
import Configuracion from "../pages/admin/Configuracion.js";

export function AdminRoutes({ notificacion }) {
  const user = JSON.parse(localStorage.getItem("userLog"));

  const [loading, setLoading] = React.useState(true);

  const loadLayout = (Layout, Page, props) => (
    <Layout>
      <Page {...props} />
      <Toaster />
    </Layout>
  );

  if (
    !user ||
    typeof user === "undefined" ||
    user.message === "Token expirado"
  ) {
    return (
      <Routes>
        <Route path="/" element={<NuevaPortada preview={false} />} />
        <Route path="/ejemplo-portada" element={<Navigate to="/" replace />} />
        <Route path="/cursos" element={<Cursos />} />
        <Route path="/estudios" element={<EstudiosPage />} />
        <Route path="/servicios" element={<ServiciosPage />} />
        <Route path="/reservar-sin-registro" element={<ReservarSinRegistro />} />
        <Route path="/admin/auth" element={<Auth />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/ejemplo-portada" element={<Navigate to="/" replace />} />
      <Route path="/estudios" element={<EstudiosPage />} />
      <Route path="/cursos" element={<Cursos />} />
      <Route path="/servicios" element={<ServiciosPage />} />
      <Route
        path="/admin/pacientes"
        element={
          <ProtectedRoute
            user={user}
            allowedRoles={["secretaria", "doctor"]}
          >
            {loadLayout(AdminLayout, Pacientes, {
              loading,
              setLoading,
              notificacion,
            })}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pacientes/:id"
        element={
          <ProtectedRoute
            user={user}
            allowedRoles={["secretaria", "doctor", "paciente"]}
          >
            {loadLayout(AdminLayout, VerPaciente, {
              loading,
              setLoading,
              notificacion,
            })}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/secretarias"
        element={
          <ProtectedRoute user={user} allowedRoles={["secretaria"]}>
            {loadLayout(AdminLayout, Secretarias, {
              loading,
              setLoading,
              notificacion,
            })}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/doctores"
        element={
          <ProtectedRoute user={user} allowedRoles={["doctor", "secretaria"]}>
            {loadLayout(AdminLayout, Doctores, {
              loading,
              setLoading,
              notificacion,
            })}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/turnos"
        element={
          <ProtectedRoute user={user} allowedRoles={["doctor", "secretaria"]}>
            {loadLayout(AdminLayout, Turnos, {
              loading,
              setLoading,
              notificacion,
            })}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bandeja-del-dia"
        element={
          <ProtectedRoute user={user} allowedRoles={["doctor", "secretaria"]}>
            {loadLayout(AdminLayout, BandejaPacientes, {
              loading,
              setLoading,
              notificacion,
            })}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/disponibilidad"
        element={
          <ProtectedRoute user={user} allowedRoles={["doctor", "secretaria"]}>
            {loadLayout(AdminLayout, CrearDisponibilidadForm, {
              loading,
              setLoading,
              notificacion,
            })}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/estudios"
        element={
          <ProtectedRoute user={user} allowedRoles={["doctor", "secretaria"]}>
            {loadLayout(AdminLayout, GestionEstudios, {
              loading,
              setLoading,
              notificacion,
            })}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/estudios/crear"
        element={
          <ProtectedRoute user={user} allowedRoles={["doctor", "secretaria"]}>
            {loadLayout(AdminLayout, CrearEstudio, {
              loading,
              setLoading,
              notificacion,
            })}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/galeria"
        element={
          <ProtectedRoute user={user} allowedRoles={["secretaria"]}>
            {loadLayout(AdminLayout, GaleriaAdmin, {
              loading,
              setLoading,
              notificacion,
            })}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reservar-turno"
        element={
          <ProtectedRoute user={user} allowedRoles={["paciente"]}>
            {loadLayout(AdminLayout, ReservarTurno, {
              loading,
              setLoading,
              notificacion,
            })}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/mis-turnos"
        element={
          <ProtectedRoute user={user} allowedRoles={["paciente"]}>
            {loadLayout(AdminLayout, MisTurnosPage, {
              loading,
              setLoading,
              notificacion,
            })}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/logs"
        element={
          <ProtectedRoute user={user} allowedRoles={["secretaria"]}>
            {loadLayout(AdminLayout, Logs, {
              loading,
              setLoading,
              notificacion,
            })}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/historial-turnos"
        element={
          <ProtectedRoute user={user} allowedRoles={["secretaria"]}>
            {loadLayout(AdminLayout, HistorialTurnos, {
              loading,
              setLoading,
              notificacion,
            })}
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/configuracion"
        element={
          <ProtectedRoute user={user} allowedRoles={["secretaria"]}>
            {loadLayout(AdminLayout, Configuracion, {
              loading,
              setLoading,
              notificacion,
            })}
          </ProtectedRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute
            user={user}
            allowedRoles={["paciente", "doctor", "secretaria"]}
          >
            {loadLayout(AdminLayout, UsuarioLogueado, {
              loading,
              setLoading,
              notificacion,
            })}
          </ProtectedRoute>
        }
      />
      {/* Si la ruta no existe, redirigí a una ruta por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
