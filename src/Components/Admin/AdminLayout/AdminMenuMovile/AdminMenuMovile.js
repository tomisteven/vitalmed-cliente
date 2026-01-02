import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiUser, FiUsers, FiUserCheck } from "react-icons/fi";
import { FaUserDoctor, FaHouseUser, FaCalendar, FaClipboard, FaClock } from "react-icons/fa6";
import "./AdminMenuMobile.css";

export default function AdminMenuMobile() {
  const user = JSON.parse(localStorage.getItem("userLog"));
  const userRole = user ? user.rol : "";
  const location = useLocation().pathname.split("/")[2];
  const [activeItem, setActiveItem] = useState(location);

  useEffect(() => {
    setActiveItem(location);
  }, [location]);

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
      key: "/admin/secretarias",
      path: "/admin/secretarias",
      icon: <FiUserCheck />,
      roles: ["doctor", "secretaria"],
    },
    {
      key: "/admin/doctores",
      path: "/admin/doctores",
      icon: <FaUserDoctor />,
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
            onClick={() => setActiveItem(key.split("/")[2])}
            className={
              activeItem === key.split("/")[2]
                ? "menu-item active"
                : "menu-item"
            }
          >
            {icon}
          </Link>
        ))}
      </nav>
    </div>
  );
}
