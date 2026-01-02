import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaEye, FaEyeSlash, FaUser, FaLock, FaWhatsapp, FaInstagram } from "react-icons/fa";
import "./Auth.css";
import doctora from "../../../assets/vitalmed/Dra.Imag.png";
import doctoraMovil from "../../../assets/vitalmed/doctoraMovil.png";
import textlogo from "../../../assets/vitalmed/Logotext.png";
import { AuthAPI } from "../../../api/auth";
import ToastMessage from "../../../utils/ToastMessage";

const AuthController = new AuthAPI();

export function Auth() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const formik = useFormik({
    initialValues: {
      usuario: "",
      password: "",
      remember: false,
    },
    validationSchema: Yup.object({
      usuario: Yup.string()
        .min(3, "El usuario debe tener al menos 3 caracteres")
        .required("El campo usuario es requerido"),
      password: Yup.string()
        .min(4, "La contraseña debe tener al menos 4 caracteres")
        .required("El campo contraseña es requerido"),
    }),
    validateOnChange: false,
    validateOnBlur: false,
    onSubmit: async (values, { setSubmitting }) => {
      // Limpiar error previo
      setFormError("");

      // Validar campos
      const errors = await formik.validateForm(values);
      if (Object.keys(errors).length > 0) {
        setFormError("Por favor, completa todos los campos correctamente");
        setSubmitting(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await AuthController.loginForm({
          usuario: values.usuario,
          password: values.password,
        });

        if (!res.ok) {
          setFormError(res.message || "Usuario o contraseña incorrectos");
          setIsLoading(false);
          return;
        }

        const { usuario, rol } = res;
        const user = { usuario, rol };

        // Guardar en localStorage
        localStorage.setItem("userLog", JSON.stringify(user));

        if (values.remember) {
          localStorage.setItem("rememberedUser", values.usuario);
        } else {
          localStorage.removeItem("rememberedUser");
        }

        showToast("¡Inicio de sesión exitoso!", "success");

        // Pequeño delay para mostrar el toast
        setTimeout(() => {
          // Redirección basada en rol
          if (rol === "paciente" && usuario?._id) {
            navigate(`/admin/pacientes/${usuario._id}`, { replace: true });
          } else {
            navigate("/admin/pacientes", { replace: true });
          }
          window.location.reload();
        }, 1000);
      } catch (err) {
        console.error("Error en login:", err);
        setFormError("Ocurrió un error inesperado. Por favor, intente nuevamente.");
        setIsLoading(false);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const width = window.innerWidth;

  // Cargar usuario recordado al montar
  React.useEffect(() => {
    const rememberedUser = localStorage.getItem("rememberedUser");
    if (rememberedUser) {
      formik.setFieldValue("usuario", rememberedUser);
      formik.setFieldValue("remember", true);
    }
  }, []);

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Sección Izquierda - Imagen */}
        <div className="auth-left">
          <div className="auth-logo-section">
            <img src={textlogo} alt="VitalMed Logo" className="auth-logo" />
          </div>
          <div className="auth-image-wrapper">
            <img
              src={width < 768 ? doctoraMovil : doctora}
              alt="Dra. Jeremmy Gutierrez"
              className="auth-image"
            />
          </div>
          <div className="auth-welcome-text">
            <h2>Sistema de Gestión Médica</h2>
            <p>Dra. Jeremmy Gutierrez</p>
          </div>
        </div>

        {/* Sección Derecha - Formulario */}
        <div className="auth-right">
          <div className="auth-form-container">
            <div className="auth-header">
              <h1>Bienvenido</h1>
              <p>Ingresa tus credenciales para acceder</p>
            </div>

            <form className="auth-form" onSubmit={formik.handleSubmit}>
              {/* Campo Usuario */}
              <div className="form-group">
                <label htmlFor="usuario">Usuario</label>
                <div className="input-wrapper">
                  <FaUser className="input-icon" />
                  <input
                    id="usuario"
                    type="text"
                    placeholder="Ingresa tu usuario"
                    {...formik.getFieldProps("usuario")}
                    className="form-input"
                  />
                </div>
              </div>

              {/* Campo Contraseña */}
              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <div className="input-wrapper">
                  <FaLock className="input-icon" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña"
                    {...formik.getFieldProps("password")}
                    className="form-input"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>

              {/* Recordar contraseña */}
              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    {...formik.getFieldProps("remember")}
                    checked={formik.values.remember}
                  />
                  <span>Recordar usuario</span>
                </label>
              </div>

              {/* Mensaje de Error General */}
              {formError && (
                <div className="form-error-message">
                  <span>⚠</span>
                  <span>{formError}</span>
                </div>
              )}

              {/* Botón de Login */}
              <button
                type="submit"
                className="btn-login"
                disabled={formik.isSubmitting || isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  "Iniciar Sesión"
                )}
              </button>
            </form>

            {/* Redes Sociales */}
            <div className="auth-social">
              <p>Síguenos en nuestras redes</p>
              <div className="social-links">
                <a
                  href="https://wa.me/qr/NGJUQHKJKLDWC1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link whatsapp"
                  aria-label="WhatsApp"
                >
                  <FaWhatsapp />
                </a>
                <a
                  href="https://www.instagram.com/doctoraecos?igsh=MXVnbGZzaXg3YzJxdQ=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link instagram"
                  aria-label="Instagram"
                >
                  <FaInstagram />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Messages */}
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
