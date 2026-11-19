import React, { Suspense, lazy } from "react";
import "./AdminLayout.scss";
import "./AdminLayout.css";
import "../../pages/admin/adminTheme.css";
import AdminMenuMovile from "../../Components/Admin/AdminLayout/AdminMenuMovile/AdminMenuMovile.js";
import FontSizeControl from "../../Components/Admin/FontSizeControl";

import Logo from "../../assets/vitalmed/LogoJGIcon.png";

const Component_Menu_left = lazy(() =>
  import("../../Components/Admin/AdminLayout/AdminMenu/AdminMenu")
);

export function AdminLayout(props) {
  const { children } = props;

  return (
    <div className="admin-layout">
      <aside className="admin-layout__left">
        <div className="admin-sidebar-brand">
          <img className="logo" src={Logo} alt="DoctoraEcos" />
          <div className="admin-sidebar-brand-text">
            <strong>DoctoraEcos</strong>
            <span>Panel de gestión</span>
          </div>
        </div>
        <Suspense
          fallback={<div className="sidebar-loading">Cargando menú...</div>}
        >
          <Component_Menu_left />
        </Suspense>
      </aside>

      <AdminMenuMovile />
      <main className="admin-layout__right-content">{children}</main>
      <FontSizeControl />
    </div>
  );
}
