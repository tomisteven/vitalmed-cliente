import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCalendarCheck,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle,
  FaEye,
  FaEyeSlash,
  FaFileMedicalAlt,
  FaHome,
  FaInstagram,
  FaLock,
  FaShieldAlt,
  FaUser,
  FaWhatsapp,
} from "react-icons/fa";
import "./Auth.css";
import SEO from "../../../Components/SEO";
import logo from "../../../assets/vitalmed/LogoJGIcon.png";
import { AuthAPI } from "../../../api/auth";
import ToastMessage from "../../../utils/ToastMessage";

const AuthController = new AuthAPI();

const WHATSAPP =
  "https://api.whatsapp.com/send?phone=584244664961&text=Hola%2C+soy+la+Asistente+de+la+Dra+Jeremmy+G+en+que+podemos+ayudarte";
const INSTAGRAM = "https://www.instagram.com/doctoraecos/";

export function Auth() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [rememberedUser] = useState(
    () => localStorage.getItem("rememberedUser") || ""
  );

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const formik = useFormik({
    initialValues: {
      usuario: rememberedUser,
      password: "",
      remember: Boolean(rememberedUser),
    },
    validationSchema: Yup.object({
      usuario: Yup.string()
        .min(3, "El usuario debe tener al menos 3 caracteres")
        .required("El campo usuario es requerido"),
      password: Yup.string()
        .min(4, "La contraseña debe tener al menos 4 caracteres")
        .required("El campo contraseña es requerido"),
    }),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { setSubmitting }) => {
      setFormError("");
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

        localStorage.setItem("userLog", JSON.stringify(user));

        if (values.remember) {
          localStorage.setItem("rememberedUser", values.usuario);
        } else {
          localStorage.removeItem("rememberedUser");
        }

        showToast("¡Inicio de sesión exitoso!", "success");

        setTimeout(() => {
          if (rol === "paciente" && usuario?._id) {
            navigate(`/admin/pacientes/${usuario._id}`, { replace: true });
          } else {
            navigate("/admin/pacientes", { replace: true });
          }
          window.location.reload();
        }, 1000);
      } catch (err) {
        console.error("Error en login:", err);
        setFormError(
          "Ocurrió un error inesperado. Por favor, intentá nuevamente."
        );
        setIsLoading(false);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const errorUsuario =
    (formik.touched.usuario || formik.submitCount > 0) &&
    formik.errors.usuario;
  const errorPassword =
    (formik.touched.password || formik.submitCount > 0) &&
    formik.errors.password;

  const limpiarErrorGeneral = () => {
    if (formError) setFormError("");
  };

  return (
    <div className="auth-container">
      <SEO
        title="Ingresar"
        description="Accedé a tu cuenta de DoctoraEcos para gestionar turnos, informes y datos personales."
        canonical="https://doctoraecos.com/#/admin/auth"
      />

      <div className="auth-shell">
        <aside className="auth-visual">
          <div className="auth-visual-top">
            <button
              type="button"
              className="auth-brand"
              onClick={() => navigate("/")}
            >
              <img src={logo} alt="DoctoraEcos" className="auth-brand-logo" />
              <span className="auth-brand-text">
                <strong>DoctoraEcos</strong>
                <small>Ultrasonografía diagnóstica</small>
              </span>
            </button>
            <span className="auth-pill">
              <span className="auth-pill-dot" /> Portal médico
            </span>
          </div>

          <div className="auth-visual-copy">
            <h1>
              Tu salud, <em>clara</em> y cerca.
            </h1>
            <p>
              Accedé a tus turnos, informes y datos de tu cuenta en un solo
              lugar.
            </p>
          </div>

          <div className="auth-visual-art">
            <span className="auth-art-ring" />
            <span className="auth-art-glow" />

            <div className="auth-portal-card">
              <div className="auth-portal-top">
                <div className="auth-portal-brand">
                  <img src={logo} alt="" />
                  <span>
                    <strong>Portal del paciente</strong>
                    <small>DoctoraEcos</small>
                  </span>
                </div>
                <span className="auth-portal-status">
                  <span className="auth-portal-dot" /> En línea
                </span>
              </div>

              <div className="auth-portal-welcome">
                <span>Tu espacio de salud</span>
                <strong>
                  Todo lo que necesitás,
                  <br />
                  en un solo lugar.
                </strong>
              </div>

              <div className="auth-portal-list">
                <div className="auth-portal-item">
                  <span className="auth-portal-icon">
                    <FaCalendarCheck />
                  </span>
                  <div className="auth-portal-info">
                    <strong>Próximo turno</strong>
                    <small>Ecografía abdominal</small>
                  </div>
                  <span className="auth-portal-badge">Mañana · 09:00</span>
                </div>

                <div className="auth-portal-item">
                  <span className="auth-portal-icon">
                    <FaFileMedicalAlt />
                  </span>
                  <div className="auth-portal-info">
                    <strong>Informes</strong>
                    <small>Resultados digitales</small>
                  </div>
                  <span className="auth-portal-badge">2 disponibles</span>
                </div>

                <div className="auth-portal-item">
                  <span className="auth-portal-icon">
                    <FaShieldAlt />
                  </span>
                  <div className="auth-portal-info">
                    <strong>Datos protegidos</strong>
                    <small>Acceso seguro</small>
                  </div>
                  <span className="auth-portal-badge auth-portal-badge--ok">
                    <FaCheckCircle /> Verificado
                  </span>
                </div>
              </div>

              <div className="auth-portal-foot">
                <span>
                  <FaClock /> Actualizado hoy
                </span>
                <span>Dra. Jeremmy Gutierrez</span>
              </div>
            </div>
          </div>

          <div className="auth-visual-foot">
            <div>
              <strong>+18</strong>
              <span>años de experiencia</span>
            </div>
            <div>
              <strong>100%</strong>
              <span>diagnóstico por imagen</span>
            </div>
            <div>
              <strong>La Viña</strong>
              <span>Consultorio 102</span>
            </div>
          </div>
        </aside>

        <main className="auth-panel">
          <div className="auth-panel-top">
            <button
              type="button"
              className="auth-back"
              onClick={() => navigate("/")}
            >
              <FaArrowLeft /> Volver al inicio
            </button>
            <span className="auth-secure">
              <FaShieldAlt /> Acceso seguro
            </span>
          </div>

          <div className="auth-form-wrap">
            <button
              type="button"
              className="auth-mobile-brand"
              onClick={() => navigate("/")}
            >
              <img src={logo} alt="DoctoraEcos" />
              <span>
                <strong>DoctoraEcos</strong>
                <small>Portal médico</small>
              </span>
            </button>

            <header className="auth-header">
              <span className="auth-eyebrow">Bienvenido de nuevo</span>
              <h2>Ingresá a tu cuenta</h2>
              <p>
                Gestioná tus turnos, informes y datos de forma simple y segura.
              </p>
            </header>

            <form className="auth-form" onSubmit={formik.handleSubmit} noValidate>
              <div className="auth-field">
                <label htmlFor="usuario">Usuario</label>
                <div
                  className={`auth-input ${
                    errorUsuario ? "auth-input--error" : ""
                  }`}
                >
                  <FaUser className="auth-input-icon" />
                  <input
                    id="usuario"
                    type="text"
                    placeholder="Tu usuario"
                    autoComplete="username"
                    autoFocus
                    {...formik.getFieldProps("usuario")}
                    onChange={(event) => {
                      formik.handleChange(event);
                      limpiarErrorGeneral();
                    }}
                    className="auth-input-field"
                    aria-invalid={Boolean(errorUsuario)}
                  />
                </div>
                {errorUsuario && (
                  <small className="auth-field-error">{errorUsuario}</small>
                )}
              </div>

              <div className="auth-field">
                <label htmlFor="password">Contraseña</label>
                <div
                  className={`auth-input ${
                    errorPassword ? "auth-input--error" : ""
                  }`}
                >
                  <FaLock className="auth-input-icon" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Tu contraseña"
                    autoComplete="current-password"
                    {...formik.getFieldProps("password")}
                    onChange={(event) => {
                      formik.handleChange(event);
                      limpiarErrorGeneral();
                    }}
                    className="auth-input-field"
                    aria-invalid={Boolean(errorPassword)}
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={
                      showPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errorPassword && (
                  <small className="auth-field-error">{errorPassword}</small>
                )}
              </div>

              <div className="auth-options">
                <label className="auth-checkbox">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formik.values.remember}
                    onChange={formik.handleChange}
                  />
                  <span>Recordar usuario</span>
                </label>
                <a
                  className="auth-help"
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ¿Necesitás ayuda?
                </a>
              </div>

              {formError && (
                <div className="auth-alert" role="alert">
                  <FaExclamationCircle />
                  <span>{formError}</span>
                </div>
              )}

              <button
                type="submit"
                className="auth-submit"
                disabled={formik.isSubmitting || isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="auth-spinner" />
                    <span>Ingresando...</span>
                  </>
                ) : (
                  <>
                    <span>Ingresar</span>
                    <FaArrowRight />
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>o</span>
            </div>

            <div className="auth-secondary">
              <button
                type="button"
                className="auth-secondary-btn"
                onClick={() => navigate("/reservar-sin-registro")}
              >
                <FaCalendarCheck /> Agendar una cita
              </button>
              <button
                type="button"
                className="auth-secondary-btn"
                onClick={() => navigate("/")}
              >
                <FaHome /> Ir al inicio
              </button>
            </div>

            <div className="auth-social">
              <span>¿Dudas? Escribinos</span>
              <div className="auth-social-links">
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaWhatsapp /> WhatsApp
                </a>
                <a
                  href={INSTAGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaInstagram /> Instagram
                </a>
              </div>
            </div>

            <p className="auth-legal">
              © {new Date().getFullYear()} DoctoraEcos · Dra. Jeremmy Gutierrez
            </p>
          </div>
        </main>
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
