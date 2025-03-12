import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "./ToastMessage.css";
import { Icon } from "semantic-ui-react";


const ToastMessage = ({ message, type, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!visible) return null;

  return (
    <div className={`toast-message ${type}`}>
      <Icon name={
        type === "success" ? "check circle" : "exclamation triangle"
      } />  {message}
    </div>
  );
};

ToastMessage.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["success", "error"]).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ToastMessage;
