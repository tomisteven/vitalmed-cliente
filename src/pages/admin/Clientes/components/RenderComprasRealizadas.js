import React from "react";
import { cargarLogos } from "../../../../utils/cargarLogos";

export const RenderComprasRealizadas = ({ compras }) => {
  const individuales = compras?.individuales || [];
  const combos = compras?.combos || [];

  const renderCombos = (combos) => {
    if (!combos.length) {
      return <p className="no-compras">No se encontraron combos realizados.</p>;
    }

    return combos.map((combo, index) => {
      const { servicio, cuentas } = combo;

      return (
        <div key={combo._id || index} className="compra-item">
          <div className="compra-info">
            <img
              src={cargarLogos("combo")}
              alt="Combo"
              className="compra-icon"
            />
            <div>
              <p className="compra-servicio">{servicio}</p>
              <div className="compra-cuentas">
                Cuentas asociadas:
                <ul>
                  {cuentas.map((cuenta, idx) => (
                    <li key={idx}>
                      Email: {cuenta.email}, Clave: {cuenta.clave}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  const renderIndividuales = (individuales) => {
    if (!individuales.length) {
      return (
        <p className="no-compras">
          No se encontraron compras individuales realizadas.
        </p>
      );
    }

    return individuales.map((compra, index) => {
      const { cuentas } = compra;
      return (
        <div key={compra._id || index} className="compra-item">
          <div className="compra-info">
            <img
              src={cargarLogos(compra.servicio)}
              alt="Compra Individual"
              className="compra-icon"
            />
            <div>
              <p className="compra-servicio">Compra Individual #{index + 1}</p>
              <div className="compra-cuentas">
                Cuentas asociadas:
                <ul>
                  {cuentas?.map((cuenta, idx) => (
                    <li key={idx}>
                      Email: {cuenta.email}, Clave: {cuenta.clave}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="compras-realizadas">
      <div className="compras-column">
        <h4>Combos Realizados</h4>
        <div className="compras-list">{renderCombos(combos)}</div>
      </div>

      <div className="compras-column">
        <h4>Compras Individuales</h4>
        <div className="compras-list">{renderIndividuales(individuales)}</div>
      </div>
    </div>
  );
};
