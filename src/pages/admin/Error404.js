import React from "react";
import { Link } from "react-router-dom";
import "./NotFound.css";

const NotFound = () => {
  return (
    <div className="not-found">
      <h1>404 - Página no encontrada</h1>
      <p>La página que buscas no existe.</p>
      <Link to="/">Volver al inicio</Link>
    </div>
  );
};

export default NotFound;
