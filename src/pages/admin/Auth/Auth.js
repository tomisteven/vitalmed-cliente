import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import "./Auth.scss";
import "./Auth.css";
import doctora from "../../../assets/vitalmed/Dra.Imag.png";
import logo from "../../../assets/vitalmed/LogoJGIcon.png";
import { Icon } from "semantic-ui-react";
import { AuthAPI } from "../../../api/auth";
import { ToastContainer, toast } from "react-toastify";
import ToastMessage from "../../../utils/ToastMessage";

const AuthController = new AuthAPI();

export function Auth({ notificacion }) {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Correo inválido").required("Requerido"),
      password: Yup.string().required("Requerido"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await AuthController.loginForm(values);

        if (!response.ok) {
          showToast(response.message, "error");
          return;
        }

        const user = {
          usuario: response.usuario,
          rol: response.rol,
        };

        localStorage.setItem("userLog", JSON.stringify(user));
        showToast("Inicio de sesión exitoso", "success");

        if (user.rol === "paciente") {
          navigate("/admin/pacientes/" + user.usuario._id);
        } else {
          navigate("/admin/pacientes");
        }
        window.location.reload();
      } catch (error) {
        console.error("Error al iniciar sesión", error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-left">
          <div className="cont-header-logo-text">
            <div className="img-text">
              <img className="doc-logo" src={logo} alt="Logo" />
            </div>
            <div className="login-header">
              <h1>Dra. Jeremmy Gutierrez</h1>
              <p>Ultrasonografía</p>
            </div>
          </div>
          <img src={doctora} alt="Dra. Jeremmy" className="login-image" />
        </div>

        <div className="login-right">
          <h2 className="text-bienvenida">
            Bienvenidos (a) DoctoraEcos Jeremmy Guterrez
          </h2>
          <p>Inicio de sesión</p>
          <form className="login-form" onSubmit={formik.handleSubmit}>
            <div className="input-group">
              <label>Usuario</label>
              <input
                type="text"
                className="input-field"
                {...formik.getFieldProps("email")}
              />
              {formik.touched.email && formik.errors.email ? (
                <div className="error-text">{formik.errors.email}</div>
              ) : null}
            </div>
            <div className="input-group">
              <label>Contraseña</label>
              <div className="contra-group">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input-field"
                  {...formik.getFieldProps("password")}
                />
                <button
                  type="button" // Asegúrate de que el botón no dispare el submit
                  onClick={() => {
                    setShowPassword(!showPassword);
                  }}
                  className="show-password"
                >
                  <Icon className="icon" name="eye" size="large" />
                </button>
              </div>
              {formik.touched.password && formik.errors.password ? (
                <div className="error-text">{formik.errors.password}</div>
              ) : null}
            </div>
            <button
              className="login-button"
              type="submit"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? "Cargando..." : "Acceso"}
            </button>
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Recordar contraseña</label>
            </div>
          </form>
          <div className="social-icons">
            <a href="https://wa.me/qr/NGJUQHKJKLDWC1">
              <Icon className="icon" name="whatsapp" size="big" />
            </a>
            <a href="https://www.instagram.com/doctoraecos?igsh=MXVnbGZzaXg3YzJxdQ==">
              <Icon className="icon" name="instagram" size="big" />
            </a>
          </div>
        </div>
      </div>
      {toast && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
