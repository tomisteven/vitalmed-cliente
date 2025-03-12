import React from "react";
import { HashRouter, Switch } from "react-router-dom";
import { AdminRoutes } from "./router";

import "./App.css";

import toast from "react-hot-toast";

export default function App() {
  const notificacion = (notificacion) => {
    toast.success(notificacion);
  };

  return (
    <HashRouter>
      <AdminRoutes notificacion={notificacion} />
    </HashRouter>
  );
}
