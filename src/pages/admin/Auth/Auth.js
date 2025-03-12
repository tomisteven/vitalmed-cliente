import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importar useNavigate
import "./Auth.scss";
import "./Auth.css";
import doctora from "../../../assets/vitalmed/Dra.Imag.png";
import logo from "../../../assets/vitalmed/LogoJGIcon.png";
import { Icon } from "semantic-ui-react";
import { AuthAPI } from "../../../api/auth";
import { ToastContainer, toast } from "react-toastify";

const AuthController = new AuthAPI();

export function Auth({ notificacion }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Hook para navegar

  const login = async () => {
    try {
      setLoading(true);
      const response = await AuthController.loginForm(formData);

      response.ok
        ? toast.success("Inicio de sesión exitoso")
        : toast.error("Credenciales incorrectas");

      const user = {
        usuario: response.usuario,
        rol: response.rol,
      };

      localStorage.setItem("userLog", JSON.stringify(user));

      if (user.rol === "paciente") {
        navigate("/admin/paciente/" + user.usuario._id);
        window.location.reload();
      } else {
        navigate("/admin/pacientes");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error al iniciar sesión", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-left">
          <div className="cont-header-logo-text">
            <div className="img-text">
              <img className="doc-logo" src={logo} alt="" />
            </div>
            <div className="login-header">
              <h1>Dra. Jeremmy Gutierrez</h1>
              <p>Ultrasonografía</p>
            </div>
          </div>
          <img src={doctora} alt="Dra. Jeremmy" className="login-image" />
        </div>

        <div className="login-right">
          <h2>BIENVENIDO (a) a Doctoraecos</h2>
          <p>Inicio de sesión</p>
          <form
            className="login-form"
            onSubmit={(e) => {
              e.preventDefault();
              login();
            }}
          >
            <div className="input-group">
              <label>Nombre de usuario o Email</label>
              <input
                type="text"
                className="input-field"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="input-group">
              <label>Contraseña</label>
              <input
                type="password"
                className="input-field"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
            <button className="login-button" type="submit" disabled={loading}>
              {loading ? "Cargando..." : "Acceso"}
            </button>
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Recordar contraseña</label>
            </div>
          </form>
          <div className="social-icons">
            <Icon className="icon" name="whatsapp" size="big" />
            <Icon className="icon" name="instagram" size="big" />
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
