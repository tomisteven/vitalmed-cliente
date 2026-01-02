import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiUser,
  FiUsers,
  FiUserCheck,
  FiCalendar,
  FiClipboard,
  FiClock
} from "react-icons/fi";
import { FaUserDoctor, FaHouseUser } from "react-icons/fa6";
import "./AdminMenu.css";
import { Logout } from "../Logout";

export default function AdminMenu({ onLoad }) {
  const user = JSON.parse(localStorage.getItem("userLog"));
  const userRole = user ? user.rol : "";
  const location = useLocation().pathname.split("/")[2];
  const [activeItem, setActiveItem] = useState(location);

  useEffect(() => {
    onLoad();
  }, [onLoad]);

  useEffect(() => {
    setActiveItem(location);
  }, [location]);

  const menuItems = [
    {
      key: "/",
      path: "/",
      label: "Usuario",
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
      key: "/admin/secretarias",
      path: "/admin/secretarias",
      label: "Secretarias",
      icon: <FiUserCheck />,
      roles: ["secretaria"],
    },
    {
      key: "/admin/doctores",
      path: "/admin/doctores",
      label: "Doctores",
      icon: <FaUserDoctor />,
      roles: ["secretaria"],
    },
    {
      key: "/admin/pacientes/" + user?.usuario._id,
      path: "/admin/pacientes/" + user?.usuario._id,
      label: "Mi Perfil",
      icon: <FiUser />,
      roles: ["paciente"],
    },
    {
      key: "/admin/turnos",
      path: "/admin/turnos",
      label: "Turnos",
      icon: <FiCalendar />,
      roles: ["doctor", "secretaria"],
    },
    {
      key: "/admin/mis-turnos",
      path: "/admin/mis-turnos",
      label: "Mis Turnos",
      icon: <FiClipboard />,
      roles: ["paciente"],
    },
    {
      key: "/admin/reservar-turno",
      path: "/admin/reservar-turno",
      label: "Agendar",
      icon: <FiClock />,
      roles: ["paciente"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <nav className="admin-sidebar">
      <div className="sidebar-menu">
        {filteredMenuItems.map(({ key, path, label, icon }) => (
          <Link
            key={key}
            to={path}
            onClick={() => setActiveItem(key.split("/")[2])}
            className={`sidebar-item ${activeItem === key.split("/")[2] ? "active" : ""
              }`}
            title={label}
          >
            <span className="sidebar-icon">{icon}</span>
            <span className="sidebar-label">{label}</span>
          </Link>
        ))}
      </div>
      <Logout />
    </nav>
  );
}
