import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiUser,
  FiUsers,
  FiUserCheck,
  FiCalendar,
  FiClipboard,
  FiClock,
  FiAlertTriangle,
  FiFileText,
  FiFolder,
  FiPlusCircle,
  FiSettings,
  FiInbox,
  FiImage,
  FiSliders,
} from "react-icons/fi";
import { FaHouseUser, FaUserDoctor } from "react-icons/fa6";
import "./AdminMenu.css";
import { Logout } from "../Logout";

const ETIQUETAS_ROL = {
  doctor: "Doctor/a",
  secretaria: "Secretaría",
  paciente: "Paciente",
  admin: "Administrador",
};

export default function AdminMenu() {
  const user = JSON.parse(localStorage.getItem("userLog") || "null");
  const perfil = user?.usuario || {};
  const userRole = String(user?.rol || perfil?.rol || "").toLowerCase();
  const location = useLocation().pathname;

  const nombreCompleto =
    [perfil.nombre, perfil.apellido].filter(Boolean).join(" ").trim() ||
    perfil.usuario ||
    perfil.email ||
    "Usuario";

  const iniciales =
    nombreCompleto
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte.charAt(0))
      .join("")
      .toUpperCase() || "U";

  const rolEtiqueta = ETIQUETAS_ROL[userRole] || user?.rol || "Usuario";

  const isActive = (path) => {
    if (path === "/") return location === "/";
    if (path === "/admin/estudios") return location === "/admin/estudios";
    return location === path || location.startsWith(`${path}/`);
  };

  const grupos = [
    {
      titulo: "Principal",
      items: [
        {
          key: "/",
          path: "/",
          label: "Inicio",
          icon: <FaHouseUser />,
          roles: ["doctor", "secretaria"],
        },
        {
          key: "/admin/pacientes",
          path: "/admin/pacientes",
          label: "Pacientes",
          icon: <FiUsers />,
          roles: ["doctor", "secretaria"],
        },
        {
          key: "/admin/bandeja-del-dia",
          path: "/admin/bandeja-del-dia",
          label: "Bandeja del Día",
          icon: <FiInbox />,
          roles: ["doctor", "secretaria"],
        },
        {
          key: "/admin/turnos",
          path: "/admin/turnos",
          label: "Turnos",
          icon: <FiCalendar />,
          roles: ["doctor", "secretaria"],
        },
      ],
    },
    {
      titulo: "Gestión clínica",
      items: [
        {
          key: "/admin/doctores",
          path: "/admin/doctores",
          label: "Doctores",
          icon: <FaUserDoctor />,
          roles: ["secretaria"],
        },
        {
          key: "/admin/secretarias",
          path: "/admin/secretarias",
          label: "Secretarias",
          icon: <FiUserCheck />,
          roles: ["secretaria"],
        },
        {
          key: "/admin/disponibilidad",
          path: "/admin/disponibilidad",
          label: "Disponibilidad",
          icon: <FiSettings />,
          roles: ["doctor", "secretaria"],
        },
        {
          key: "/admin/estudios",
          path: "/admin/estudios",
          label: "Estudios",
          icon: <FiFolder />,
          roles: ["doctor", "secretaria"],
        },
        {
          key: "/admin/estudios/crear",
          path: "/admin/estudios/crear",
          label: "Crear estudio",
          icon: <FiPlusCircle />,
          roles: ["doctor", "secretaria"],
        },
        {
          key: "/admin/galeria",
          path: "/admin/galeria",
          label: "Galería",
          icon: <FiImage />,
          roles: ["secretaria"],
        },
      ],
    },
    {
      titulo: "Sistema",
      items: [
        {
          key: "/admin/historial-turnos",
          path: "/admin/historial-turnos",
          label: "Historial",
          icon: <FiFileText />,
          roles: ["secretaria"],
        },
        {
          key: "/admin/logs",
          path: "/admin/logs",
          label: "Logs",
          icon: <FiAlertTriangle />,
          roles: ["secretaria"],
        },
        {
          key: "/admin/configuracion",
          path: "/admin/configuracion",
          label: "Configuración",
          icon: <FiSliders />,
          roles: ["secretaria"],
        },
      ],
    },
    {
      titulo: "Mi cuenta",
      items: [
        {
          key: `/admin/pacientes/${user?.usuario?._id || ""}`,
          path: `/admin/pacientes/${user?.usuario?._id || ""}`,
          label: "Mi perfil",
          icon: <FiUser />,
          roles: ["paciente"],
        },
        {
          key: "/admin/mis-turnos",
          path: "/admin/mis-turnos",
          label: "Mis turnos",
          icon: <FiClipboard />,
          roles: ["paciente"],
        },
        {
          key: "/admin/reservar-turno",
          path: "/admin/reservar-turno",
          label: "Agendar turno",
          icon: <FiClock />,
          roles: ["paciente"],
        },
      ],
    },
  ];

  const gruposFiltrados = grupos
    .map((grupo) => ({
      ...grupo,
      items: grupo.items.filter((item) => item.roles.includes(userRole)),
    }))
    .filter((grupo) => grupo.items.length > 0);

  return (
    <nav className="admin-sidebar">
      <div className="sidebar-profile">
        <div className="sidebar-avatar">{iniciales}</div>
        <div className="sidebar-profile-info">
          <strong title={nombreCompleto}>{nombreCompleto}</strong>
          <span>{rolEtiqueta}</span>
        </div>
      </div>

      <div className="sidebar-menu">
        {gruposFiltrados.map((grupo) => (
          <div className="sidebar-group" key={grupo.titulo}>
            <span className="sidebar-group-title">{grupo.titulo}</span>
            {grupo.items.map(({ key, path, label, icon }) => (
              <Link
                key={key}
                to={path}
                className={`sidebar-item ${isActive(path) ? "active" : ""}`}
                title={label}
                aria-label={label}
              >
                <span className="sidebar-icon">{icon}</span>
                <span className="sidebar-label">{label}</span>
              </Link>
            ))}
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <Logout />
      </div>
    </nav>
  );
}
