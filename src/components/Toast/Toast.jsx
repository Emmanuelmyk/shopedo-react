// ==========================================
// FILE: src/components/Toast/Toast.jsx
// ==========================================
import React, { useEffect } from "react";
import "./Toast.css";

const Toast = ({
  show,
  message,
  onClose,
  duration = 3000,
  type = "success",
}) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div className="toast-wrapper">
      <div className={`toast-message toast-${type}`}>
        <div className="toast-content">
          <i className="bi bi-check-circle-fill"></i>
          <span>{message}</span>
        </div>

        <button className="toast-close" onClick={onClose}>
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
