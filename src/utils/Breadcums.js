import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Breadcrumbs.css";
import { useNavigate } from "react-router-dom";
import { Icon } from "semantic-ui-react";

export const Breadcrumbs = () => {
  const navigate = useNavigate();

  const rol = JSON.parse(localStorage.getItem("userLog")).rol;

  if (rol === "paciente") {
    return null;
  }

  const handleBack = () => {
    navigate(-1); // Navega a la ruta anterior
  };

  if (
    useLocation().pathname === "/admin/ordenes" ||
    useLocation().pathname === "/admin/crear-orden"
  ) {
    return null;
  }

  return (
    <nav className="breadcrumbs-with-back">
      <button className="back-button" onClick={handleBack}>
        <Icon name="arrow left" color="black" size="large" />
        Atrás
      </button>
    </nav>
  );
};

export default Breadcrumbs;
