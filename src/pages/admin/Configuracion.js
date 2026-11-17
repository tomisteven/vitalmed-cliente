import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaCheckCircle,
  FaEnvelope,
  FaExclamationTriangle,
  FaPaperPlane,
  FaPenNib,
  FaSave,
  FaShieldAlt,
} from "react-icons/fa";
import { ConfiguracionApi } from "../../api/Configuracion";
import "./Configuracion.css";

const configuracionApi = new ConfiguracionApi();

const VARIABLES_PLANTILLA = [
  "{{paciente}}",
  "{{fecha}}",
  "{{especialidad}}",
  "{{estudio}}",
  "{{doctor}}",
  "{{motivo}}",
  "{{adjuntos}}",
  "{{clinica}}",
  "{{telefono}}",
  "{{direccion}}",
];

const PLANTILLAS_INICIALES = {
  confirmacionAsunto: "",
  confirmacionMensaje: "",
  informeAsunto: "",
  informeMensaje: "",
};

const FORM_INICIAL = {
  activo: true,
  servicio: "gmail",
  usuario: "",
  password: "",
  remitente: "",
  smtpHost: "",
  smtpPort: 587,
  smtpSecure: false,
  plantillas: { ...PLANTILLAS_INICIALES },
};

export default function Configuracion() {
  const [form, setForm] = useState({ ...FORM_INICIAL });
  const [meta, setMeta] = useState({
    passwordConfigurada: false,
    configurado: false,
    origen: "sin_configurar",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [destinatario, setDestinatario] = useState("");

  const cargarConfiguracion = async () => {
    setLoading(true);
    try {
      const data = await configuracionApi.getEmail();
      setForm({
        activo: data.activo !== false,
        servicio: data.servicio || "gmail",
        usuario: data.usuario || "",
        password: "",
        remitente: data.remitente || "",
        smtpHost: data.smtpHost || "",
        smtpPort: data.smtpPort || 587,
        smtpSecure: Boolean(data.smtpSecure),
        plantillas: {
          ...PLANTILLAS_INICIALES,
          ...(data.plantillas || {}),
        },
      });
      setMeta({
        passwordConfigurada: Boolean(data.passwordConfigurada),
        configurado: Boolean(data.configurado),
        origen: data.origen || "sin_configurar",
      });
      setDestinatario(data.usuario || "");
    } catch (error) {
      toast.error(error.message || "Error al cargar la configuración");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarConfiguracion();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePlantillaChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      plantillas: {
        ...prev.plantillas,
        [name]: value,
      },
    }));
  };

  const guardar = async () => {
    if (!form.usuario.trim()) {
      toast.error("Ingresá el correo o usuario de la cuenta.");
      return;
    }

    if (form.servicio === "smtp" && !form.smtpHost.trim()) {
      toast.error("Ingresá el host SMTP.");
      return;
    }

    if (!meta.passwordConfigurada && !form.password.trim()) {
      toast.error("Ingresá la contraseña o App Password.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        activo: form.activo,
        servicio: form.servicio,
        usuario: form.usuario.trim(),
        remitente: form.remitente.trim(),
        smtpHost: form.smtpHost.trim(),
        smtpPort: Number(form.smtpPort) || 587,
        smtpSecure: Boolean(form.smtpSecure),
        plantillas: form.plantillas,
      };

      if (form.password.trim()) {
        payload.password = form.password;
      }

      await configuracionApi.guardarEmail(payload);
      toast.success("Configuración de correo guardada");
      await cargarConfiguracion();
    } catch (error) {
      toast.error(error.message || "Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  const probar = async () => {
    if (!destinatario.trim()) {
      toast.error("Ingresá un destinatario para la prueba.");
      return;
    }

    setTesting(true);
    try {
      const result = await configuracionApi.probarEmail(destinatario.trim());
      toast.success(result.message || "Correo de prueba enviado");
    } catch (error) {
      toast.error(error.message || "Error al enviar el correo de prueba");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="admin-page configuracion-page">
      <header className="admin-page-header">
        <div>
          <span className="admin-page-eyebrow">Configuración</span>
          <h1 className="admin-page-title">Correo electrónico</h1>
          <p className="admin-page-subtitle">
            Configurá la cuenta de correo desde la que se envían confirmaciones
            de turnos e informes a los pacientes.
          </p>
        </div>
      </header>

      {loading ? (
        <div className="adm-loading">
          <div className="adm-spinner" />
          <p>Cargando configuración...</p>
        </div>
      ) : (
        <>
          <div
            className={`configuracion-status ${meta.configurado ? "ok" : "warn"}`}
          >
            {meta.configurado ? <FaCheckCircle /> : <FaExclamationTriangle />}
            <div>
              <strong>
                {meta.configurado
                  ? "Correo configurado"
                  : "Correo sin configurar"}
              </strong>
              <span>
                {meta.configurado
                  ? `Los correos se envían desde ${form.usuario || "la cuenta configurada"}.`
                  : "Completá los datos para activar el envío de correos."}
              </span>
            </div>
          </div>

          <div className="configuracion-grid">
            <form
              className="adm-card configuracion-card"
              onSubmit={(e) => {
                e.preventDefault();
                guardar();
              }}
            >
              <h2 className="configuracion-section-title">Cuenta de envío</h2>

              <div className="adm-form-grid">
                <div className="adm-field">
                  <label>Proveedor</label>
                  <select
                    name="servicio"
                    value={form.servicio}
                    onChange={handleChange}
                  >
                    <option value="gmail">Gmail</option>
                    <option value="smtp">SMTP personalizado</option>
                  </select>
                </div>

                <div className="adm-field">
                  <label>Estado</label>
                  <label className="configuracion-checkbox">
                    <input
                      type="checkbox"
                      name="activo"
                      checked={form.activo}
                      onChange={handleChange}
                    />
                    <span>Envío de correos activo</span>
                  </label>
                </div>

                <div className="adm-field full">
                  <label>Correo / Usuario</label>
                  <input
                    type="email"
                    name="usuario"
                    placeholder="ejemplo@gmail.com"
                    value={form.usuario}
                    onChange={handleChange}
                  />
                </div>

                <div className="adm-field full">
                  <label>Contraseña / App Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder={
                      meta.passwordConfigurada
                        ? "•••••••• (dejar vacío para mantener la actual)"
                        : "Contraseña o App Password"
                    }
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                  <small className="configuracion-help">
                    {meta.passwordConfigurada
                      ? "La contraseña ya está guardada de forma segura. Dejá este campo vacío si no querés cambiarla."
                      : "Para Gmail usá una contraseña de aplicación (sin espacios), no tu contraseña normal."}
                  </small>
                </div>

                <div className="adm-field full">
                  <label>Remitente visible</label>
                  <input
                    type="text"
                    name="remitente"
                    placeholder={`"DoctoraEcos" <${form.usuario || "correo@gmail.com"}>`}
                    value={form.remitente}
                    onChange={handleChange}
                  />
                </div>

                {form.servicio === "smtp" && (
                  <>
                    <div className="adm-field full">
                      <label>Host SMTP</label>
                      <input
                        type="text"
                        name="smtpHost"
                        placeholder="smtp.tuproveedor.com"
                        value={form.smtpHost}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="adm-field">
                      <label>Puerto SMTP</label>
                      <input
                        type="number"
                        name="smtpPort"
                        value={form.smtpPort}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="adm-field">
                      <label>Conexión segura</label>
                      <label className="configuracion-checkbox">
                        <input
                          type="checkbox"
                          name="smtpSecure"
                          checked={form.smtpSecure}
                          onChange={handleChange}
                        />
                        <span>Usar SSL/TLS</span>
                      </label>
                    </div>
                  </>
                )}
              </div>

              <div className="configuracion-actions">
                <button
                  type="submit"
                  className="adm-btn adm-btn-primary"
                  disabled={saving}
                >
                  <FaSave /> {saving ? "Guardando..." : "Guardar configuración"}
                </button>
              </div>

              <div className="configuracion-security">
                <FaShieldAlt />
                <span>
                  La contraseña se almacena cifrada y nunca se muestra en el
                  panel.
                </span>
              </div>
            </form>

            <aside className="configuracion-side">
              <div className="adm-card configuracion-card">
                <h2 className="configuracion-section-title">
                  <FaPaperPlane /> Probar envío
                </h2>
                <p className="configuracion-side-text">
                  Guardá los cambios y luego enviá un correo de prueba para
                  verificar que la cuenta está funcionando.
                </p>

                <div className="adm-field">
                  <label>Destinatario</label>
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={destinatario}
                    onChange={(e) => setDestinatario(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="adm-btn adm-btn-ghost configuracion-test-btn"
                  onClick={probar}
                  disabled={testing}
                >
                  <FaPaperPlane />{" "}
                  {testing ? "Enviando..." : "Enviar correo de prueba"}
                </button>
              </div>

              <div className="configuracion-help-card">
                <FaEnvelope />
                <h3>¿Cómo obtener una App Password de Gmail?</h3>
                <ol>
                  <li>Activá la verificación en dos pasos en tu cuenta Google.</li>
                  <li>Entrá a Seguridad → Contraseñas de aplicaciones.</li>
                  <li>Creá una contraseña para “Correo” y copiala.</li>
                  <li>Pegala en “Contraseña / App Password”, sin espacios, y guardá.</li>
                </ol>
                <a
                  className="configuracion-help-link"
                  href="https://myaccount.google.com/apppasswords"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir contraseñas de aplicaciones de Google
                </a>
                <p>
                  Si usás Google Workspace y no aparece la opción, el
                  administrador de Workspace debe habilitar las contraseñas de
                  aplicaciones. Para otro proveedor, elegí “SMTP personalizado”.
                </p>
              </div>
            </aside>
          </div>

          <div className="adm-card configuracion-card configuracion-plantillas">
            <h2 className="configuracion-section-title">
              <FaPenNib /> Plantillas de correo
            </h2>
            <p className="configuracion-plantillas-intro">
              Personalizá el asunto y el mensaje de los correos automáticos y del
              envío manual de informes. Las variables se reemplazan con los datos
              del paciente y del turno.
            </p>

            <div className="configuracion-variables">
              {VARIABLES_PLANTILLA.map((variable) => (
                <code key={variable}>{variable}</code>
              ))}
            </div>

            <p className="configuracion-plantillas-nota">
              <code>{"{{adjuntos}}"}</code> solo está disponible en el correo de
              informe y se reemplaza por la lista de PDFs adjuntos.
            </p>

            <div className="adm-form-grid">
              <div className="adm-field full">
                <label>Asunto de confirmación de turno</label>
                <input
                  type="text"
                  name="confirmacionAsunto"
                  value={form.plantillas.confirmacionAsunto}
                  onChange={handlePlantillaChange}
                />
              </div>

              <div className="adm-field full">
                <label>Mensaje de confirmación de turno</label>
                <textarea
                  name="confirmacionMensaje"
                  rows="7"
                  value={form.plantillas.confirmacionMensaje}
                  onChange={handlePlantillaChange}
                />
              </div>

              <div className="adm-field full">
                <label>Asunto del correo de informe</label>
                <input
                  type="text"
                  name="informeAsunto"
                  value={form.plantillas.informeAsunto}
                  onChange={handlePlantillaChange}
                />
              </div>

              <div className="adm-field full">
                <label>Mensaje del correo de informe</label>
                <textarea
                  name="informeMensaje"
                  rows="9"
                  value={form.plantillas.informeMensaje}
                  onChange={handlePlantillaChange}
                />
              </div>
            </div>

            <div className="configuracion-actions">
              <button
                type="button"
                className="adm-btn adm-btn-primary"
                onClick={guardar}
                disabled={saving}
              >
                <FaSave /> {saving ? "Guardando..." : "Guardar plantillas"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
