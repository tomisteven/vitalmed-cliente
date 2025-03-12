import React from "react";
import { Oval } from "react-loader-spinner";
import "./Loader.css";

export default function Loader() {
  return (
    <div className="loader">
      <Oval
        visible={true}
        height="30"
        width="30"

        color="black"
        ariaLabel="oval-loading"
        wrapperStyle={{}}
        wrapperClass=""
      />
    </div>
  );
}
