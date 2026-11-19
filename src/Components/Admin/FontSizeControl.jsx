import React, { useEffect, useState } from "react";
import { FaFont, FaMinus, FaPlus } from "react-icons/fa";
import "./FontSizeControl.css";

const STORAGE_KEY = "adminFontScale";
const MIN = 80;
const MAX = 150;
const STEP = 10;

let baseFontSize = 0;

const clamp = (value) => Math.min(MAX, Math.max(MIN, value));

const leerEscala = () => {
  try {
    const guardada = Number(localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(guardada) && guardada >= MIN && guardada <= MAX
      ? guardada
      : 100;
  } catch (error) {
    return 100;
  }
};

export default function FontSizeControl() {
  const [scale, setScale] = useState(leerEscala);

  useEffect(() => {
    if (!baseFontSize) {
      baseFontSize =
        parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
    }
  }, []);

  useEffect(() => {
    const base =
      baseFontSize ||
      parseFloat(getComputedStyle(document.documentElement).fontSize) ||
      16;

    document.documentElement.style.fontSize = `${
      (base * scale) / 100
    }px`;

    try {
      localStorage.setItem(STORAGE_KEY, String(scale));
    } catch (error) {
      // Sin persistencia si el navegador bloquea localStorage.
    }
  }, [scale]);

  useEffect(() => {
    return () => {
      document.documentElement.style.fontSize = "";
    };
  }, []);

  const cambiar = (delta) => {
    setScale((actual) => clamp(actual + delta));
  };

  return (
    <div
      className="admin-font-control"
      role="group"
      aria-label="Tamaño de letra del panel"
    >
      <span className="admin-font-control__icon" aria-hidden="true">
        <FaFont />
      </span>

      <button
        type="button"
        className="admin-font-control__btn"
        onClick={() => cambiar(-STEP)}
        disabled={scale <= MIN}
        aria-label="Reducir tamaño de letra"
        title="Reducir letra"
      >
        <FaMinus />
      </button>

      <button
        type="button"
        className="admin-font-control__value"
        onClick={() => setScale(100)}
        title="Restablecer al 100%"
        aria-label={`Tamaño de letra ${scale}%. Restablecer al 100%`}
      >
        {scale}%
      </button>

      <button
        type="button"
        className="admin-font-control__btn"
        onClick={() => cambiar(STEP)}
        disabled={scale >= MAX}
        aria-label="Agrandar tamaño de letra"
        title="Agrandar letra"
      >
        <FaPlus />
      </button>
    </div>
  );
}
