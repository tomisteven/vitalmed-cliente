import React, { createContext, useContext, useEffect, useState } from "react";

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  useEffect(() => {}, []);

  return <DataContext.Provider>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext);
