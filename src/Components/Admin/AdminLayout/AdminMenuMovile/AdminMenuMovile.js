import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiUser, FiUsers, FiUserCheck, FiAlertTriangle, FiFileText, FiFolder, FiPlusCircle, FiSettings, FiInbox, FiImage, FiSliders } from "react-icons/fi";
import { FaHouseUser, FaCalendar, FaClipboard, FaClock, FaUserDoctor } from "react-icons/fa6";
import "./AdminMenuMobile.css";

export default function AdminMenuMobile() {
  const user = JSON.parse(localStorage.getItem("userLog"));
  const userRole = user ? user.rol : "";
  const location = useLocation().pathname;

  const isActive = (path) => {
    if (location === path) return true;
    if (path === "/" || path === "/admin/estudios") return false;
    return location.startsWith(path + "/");
  };

  const menuItems = [
    {
      key: "/",
      path: "/",
      icon: <FaHouseUser />,
      roles: ["doctor", "secretaria", "paciente"],
    },
    {
      key: "/admin/pacientes",
      path: "/admin/pacientes",
      icon: <FiUsers />,
      roles: ["doctor", "secretaria"],
    },
    {
      key: "/admin/doctores",
      path: "/admin/doctores",
      icon: <FaUserDoctor />,
      roles: ["secretaria"],
    },
    {
      key: "/admin/bandeja-del-dia",
      path: "/admin/bandeja-del-dia",
      icon: <FiInbox />,
      roles: ["doctor", "secretaria"],
    },
    {
      key: "/admin/secretarias",
      path: "/admin/secretarias",
      icon: <FiUserCheck />,
      roles: ["doctor", "secretaria"],
    },
    {
      key: "/admin/pacientes/" + user?.usuario._id,
      path: "/admin/pacientes/" + user?.usuario._id,
      icon: <FiUser />,
      roles: ["paciente"],
    },
    {
      key: "/admin/turnos",
      path: "/admin/turnos",
      icon: <FaCalendar />,
      roles: ["doctor", "secretaria"],
    },
    {
      key: "/admin/disponibilidad",
      path: "/admin/disponibilidad",
      icon: <FiSettings />,
      roles: ["doctor", "secretaria"],
    },
    {
      key: "/admin/estudios",
      path: "/admin/estudios",
      icon: <FiFolder />,
      roles: ["doctor", "secretaria"],
    },
    {
      key: "/admin/estudios/crear",
      path: "/admin/estudios/crear",
      icon: <FiPlusCircle />,
      roles: ["doctor", "secretaria"],
    },
    {
      key: "/admin/galeria",
      path: "/admin/galeria",
      icon: <FiImage />,
      roles: ["secretaria"],
    },
    {
      key: "/admin/mis-turnos",
      path: "/admin/mis-turnos",
      icon: <FaClipboard />,
      roles: ["paciente"],
    },
    {
      key: "/admin/reservar-turno",
      path: "/admin/reservar-turno",
      icon: <FaClock />,
      roles: ["paciente"],
    },
    {
      key: "/admin/logs",
      path: "/admin/logs",
      icon: <FiAlertTriangle />,
      roles: ["secretaria"],
    },
    {
      key: "/admin/historial-turnos",
      path: "/admin/historial-turnos",
      icon: <FiFileText />,
      roles: ["secretaria"],
    },
    {
      key: "/admin/configuracion",
      path: "/admin/configuracion",
      icon: <FiSliders />,
      roles: ["secretaria"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <div className="header-movil">
      <nav className="mobile-menu">
        {filteredMenuItems.map(({ key, path, icon }) => (
          <Link
            key={key}
            to={path}
            className={`menu-item ${isActive(path) ? "active" : ""}`}
          >
            {icon}
          </Link>
        ))}
      </nav>
    </div>
  );
}
