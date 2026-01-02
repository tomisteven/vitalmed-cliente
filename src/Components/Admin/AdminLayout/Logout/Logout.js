import React from "react";
import { Menu, Icon, Button } from "semantic-ui-react";
import "./Logout.css";

export function Logout() {
  return (
    <button
      className="btn-logout-left"
      onClick={() => {
        localStorage.removeItem("userLog");
        window.location.href = "/";
      }}
    >
      <span>
        <Icon name="log out" />
      </span>
    </button>
  );
}
