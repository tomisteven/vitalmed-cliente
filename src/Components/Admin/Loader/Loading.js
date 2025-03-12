import React from "react";
import { Dimmer} from "semantic-ui-react";
import { RotatingTriangles } from "react-loader-spinner";
import "./loading.css"
import { useAuth } from "../../../hooks/useAuth";

export default function Loading({ obscuro, text }) {

  const { user } = useAuth();

  return (
    <div className="loading-container">

        <RotatingTriangles
          visible={true}
          height="80"
          width="80"
          ariaLabel="blocks-loading"
          wrapperStyle={{}}
          wrapperClass="blocks-wrapper"
        />

    </div>
  );
}

