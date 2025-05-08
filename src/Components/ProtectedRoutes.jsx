import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ user, allowedRoles, children }) => {
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!allowedRoles.includes(user.rol)) {
    return <Navigate to="/" replace />; // Redirigí a donde quieras
  }

  return children;
};

export default ProtectedRoute;
