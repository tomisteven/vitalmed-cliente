import React, { useState, useEffect } from "react";
import { Menu } from "semantic-ui-react";
import { Link, useLocation } from "react-router-dom";
import "./AdminMenu.css";

export default function AdminMenu({ onLoad }) {
  //const esAdconst user = JSON.parse(localStorage.getItem("user"));
  const user = JSON.parse(localStorage.getItem("userLog"));

  const userRole = user ? user.rol : "";

  // console.log(userRole);

  const location = useLocation().pathname.split("/")[2];

  const [activeItem, setActiveItem] = useState(location);

  // Ejecuta onLoad al cargar el componente
  useEffect(() => {
    onLoad();
  }, [onLoad]);

  // Actualiza el estado cuando cambia la ruta
  useEffect(() => {
    setActiveItem(location);
    //console.log(activeItem);
  }, [location]);

  const menuItems = [
    {
      key: "/",
      path: "/",
      label: "USUARIO",
      roles: ["doctor", "secretaria"],
    },
    {
      key: "/admin/pacientes",
      path: "/admin/pacientes",
      label: "PACIENTES",
      roles: ["doctor", "secretaria"],
    },
    {
      key: "/admin/secretarias",
      path: "/admin/secretarias",
      label: "SECRETARIAS",
      roles: ["doctor", "secretaria"],
    },
    {
      key: "/admin/doctores",
      path: "/admin/doctores",
      label: "DOCTORES",
      roles: ["doctor", "secretaria"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <Menu className="admin-menu" icon fluid text>
      {filteredMenuItems.map(({ key, path, label }) => (
        <Link
          key={key}
          to={path}
          onClick={() => setActiveItem(key.split("/")[2])}
          title={label}
          className={
            activeItem === key.split("/")[2]
              ? "items-cont-active"
              : "items-cont"
          }
        >
          {label}
        </Link>
      ))}
    </Menu>
  );
}
