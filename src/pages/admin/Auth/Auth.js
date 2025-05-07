import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import "./Auth.scss";
import "./Auth.css";
import doctora from "../../../assets/vitalmed/Dra.Imag.png";
import doctoraMovil from "../../../assets/vitalmed/doctoraMovil.png";
import textlogo from "../../../assets/vitalmed/Logotext.png";
import { Icon } from "semantic-ui-react";
import { AuthAPI } from "../../../api/auth";
import ToastMessage from "../../../utils/ToastMessage";
import { ENV } from "../../../utils/constants";

const AuthController = new AuthAPI();

export function Auth() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const formik = useFormik({
    initialValues: {
      password: "",
      usuario: "",
    },
    validationSchema: Yup.object({
      password: Yup.string().required("Requerido"),
      usuario: Yup.string(),
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
          //navigate(`/admin/paciente/${response.usuario._id}`);

          window.open(
            `${ENV.URL_CLIENT}/#/admin/pacientes/${response.usuario._id}`,
            "_blank"
          );

          //cerrar la ventana actual
          window.close();
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

  const width = window.innerWidth;

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-left">
          <div className="cont-header-logo-text">
            <img className="logo-text" src={textlogo} alt="" />
          </div>
          <img
            src={width < 768 ? doctoraMovil : doctora}
            alt="Dra. Jeremmy"
            className="login-image"
          />
        </div>

        <div className="login-right">
          <h2 className="text-bienvenida">
            Bienvenidos (a):
            <br />
            DoctoraEcos
            <br />
            Dra. Jeremmy Gutierrez
          </h2>
          <p>Inicio de sesión</p>
          <form className="login-form" onSubmit={formik.handleSubmit}>
            <div className="input-group">
              <label>Usuario</label>
              <input
                type="text"
                className="input-field"
                {...formik.getFieldProps("usuario")}
              />
              {formik.touched.usuario && formik.errors.usuario ? (
                <div className="error-text">{formik.errors.usuario}</div>
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
