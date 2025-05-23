import React from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Auth } from "../pages/admin/index";
import { AdminLayout } from "../layouts";
import NotFound from "../pages/admin/Error404";
import Pacientes from "../pages/admin/Pacientes.js";
import VerPaciente from "../pages/admin/VerPaciente.js";
import Doctores from "../pages/admin/Doctores.js";
import Secretarias from "../pages/admin/Secretarias.js";
import toast, { Toaster } from "react-hot-toast";
import UsuarioLogueado from "../pages/admin/UsuarioLogueado.js";
import ProtectedRoute from "../Components/ProtectedRoutes.jsx";

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
        <Route path="/admin/*" element={<Auth />} />
        <Route path="*" element={<Navigate to="/admin/auth" />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Si no hay usuario, redirigir siempre a /admin/login */}
      {!user ? (
        <>
          <Route
            path="/admin/login"
            element={<Auth notificacion={notificacion} />}
          />
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </>
      ) : (
        <>
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
              <ProtectedRoute user={user} allowedRoles={["secretaria"]}>
                {loadLayout(AdminLayout, Doctores, {
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
        </>
      )}
    </Routes>
  );
}
