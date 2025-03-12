import React, { useState, useEffect, createContext } from "react";
//import { Auth } from "../api";

export const AuthContext = createContext(); //creamos el contexto de autenticacion y lo exportamos

//creamos el provider de autenticacion
export function AuthProvider(props) {
  const [user, setUser] = useState(true); //creamos el estado del usuario

  const data = {
    user,
  };

  const { children } = props;

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
}
