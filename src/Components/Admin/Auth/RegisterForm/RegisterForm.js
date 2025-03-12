import React, { useState } from "react";
import { Form, Button, Input, Checkbox } from "semantic-ui-react";
import { initialValues, validationSchema } from "./RegisterForm.form.js";
import { useFormik } from "formik";
import "./RegisterForm.scss";
import { Auth } from "../../../../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const authController = new Auth(); //instanciamos la clase Auth de auth.js para poder usar sus metodos  y propiedades

export function RegisterForm(props) {
  const saludo = () => {
    toast("Registro Exitoso, Ahora Inicia Sesion!", {
      position: toast.POSITION.TOP_RIGHT,
    });
  };

  const [error, setError] = useState("");
  const { openLogin } = props;
  const formik = useFormik({
    initialValues: initialValues(), //valores iniciales del formulario
    validationSchema: validationSchema(), //validaciones con yup
    validateOnChange: false, //no valida al cambiar
    //cuando el formulario se envia
    onSubmit: async (formData) => {
      try {
        setError("");
        await authController.register(formData); //envia los datos al servidor
        openLogin(); //abre el login cuando se registra correctamente
      } catch (error) {
        setError(error);
      }
    },
  });

  return (
    <>
      <Form className="register-form" onSubmit={formik.handleSubmit}>
        <Input
          className="register-form__input"
          type="email"
          name="email"
          placeholder="Correo Electronico"
          onChange={formik.handleChange}
          value={formik.values.email}
          error={formik.errors.email}
        />
        <Input
          className="register-form__input"
          type="name"
          name="name"
          placeholder="Nombre"
          onChange={formik.handleChange}
          value={formik.values.name}
          error={formik.errors.name}
        />
        <Input
          className="register-form__input"
          type="name"
          name="lastname"
          placeholder="Apellido"
          onChange={formik.handleChange}
          value={formik.values.lastname}
          error={formik.errors.lastname}
        />
        {formik.errors.email && (
          <span className="register-form__errorMensaje">
            {formik.errors.email}
          </span>
        )}

        <Input
          className="register-form__input"
          type="password"
          name="password"
          placeholder="Password"
          onChange={formik.handleChange}
          value={formik.values.password}
          error={formik.errors.password}
        />

        {formik.errors.password && (
          <span className="register-form__errorMensaje">
            {formik.errors.password}
          </span>
        )}

        <Input
          className="register-form__input"
          type="password"
          name="repeatPassword"
          placeholder="Repetir Password"
          onChange={formik.handleChange}
          value={formik.values.repeatPassword}
          error={formik.errors.repeatPassword}
        />

        {formik.errors.repeatPassword && (
          <span className="register-form__errorMensaje">
            {formik.errors.repeatPassword}
          </span>
        )}

        <Checkbox
          className="register-form__checkbox"
          name="privacyPolicy"
          label="He Leido y Acepto las politicas de privacidad"
          onChange={(_, data) =>
            formik.setFieldValue("privacyPolicy", data.checked)
          }
          checked={formik.values.privacyPolicy}
          error={formik.errors.privacyPolicy}
        />

        {formik.errors.privacyPolicy && (
          <span className="register-form__errorMensaje">
            {" "}
            Debe aceptar las Politicas de privacidad
          </span>
        )}

        <Button
          onClick={saludo}
          type="submit"
          className="btn-color-register"
          fluid
          loading={formik.isSubmitting}
        >
          {" "}
          Crear cuenta{" "}
        </Button>

        <p className="register-form__error">{error}</p>
      </Form>
      <ToastContainer />
    </>
  );
}
