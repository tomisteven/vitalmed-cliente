import React from "react";
import { Form } from "semantic-ui-react";
import { useFormik } from "formik";
import { initialValues, validationSchema } from "./LoginForm.form";
import { Auth } from "../../../../api";
import { useAuth } from "../../../../hooks";
import "./loginForm.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const authController = new Auth();

export function LoginForm() {
  const { login } = useAuth(); //obtenemos la funcion de login del contexto de autenticacion

  return (
    <>
      <h2>LOGIN</h2>
    </>
  );
}
