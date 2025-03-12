import React, { useState, Suspense, lazy } from "react";
import "./AdminLayout.scss";
import "./AdminLayout.css";

import { Logout } from "../../Components/Admin/AdminLayout/Logout/Logout";

import Logo from "../../assets/vitalmed/LogoJGIcon.png";

const Component_Menu_left = lazy(() =>
  import("../../Components/Admin/AdminLayout/AdminMenu/AdminMenu")
);

export function AdminLayout(props) {
  const [loading, setLoading] = useState(true);
  const { children } = props;

  const handleLoading = () => {
    setLoading(false);
  };

  return (
    <div className="admin-layout">
      <Suspense fallback={<h1>Loading...</h1>}>
        <div className="admin-layout__left">
          <img className="logo" src={Logo} alt="logo" />
          <Component_Menu_left onLoad={handleLoading} />
          <Logout onLoad={handleLoading} />
        </div>
        <div className="admin-layout__right-content">{children}</div>
        <p className="copyrigth">
          Copyrigth &copy; {new Date().getFullYear()} - Dr. Jeremmy Gutierrez
        </p>
      </Suspense>
    </div>
  );
}
