import React from "react";
import { Link } from "react-router-dom";
import "./NotFound.css";

const NotFound = () => {
  return (
    <div className="not-found-container">
      <h1 className="error-4">404</h1>
      <p>¡Oops! La página que buscas no existe.</p>
      <Link to="/pacientes/" className="not-found-button">
        Volver al inicio
      </Link>
    </div>
  );
};

export default NotFound;
