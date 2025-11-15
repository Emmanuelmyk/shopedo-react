// ==========================================
// FILE: src/components/Toast/Toast.jsx
// ==========================================
import React, { useEffect } from 'react';
import './Toast.css';

const Toast = ({ show, message, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  return (
    <div className="toast-container position-fixed bottom-0 start-50 translate-middle-x p-3">
      <div className="toast show text-bg-success border-0" role="alert">
        <div className="d-flex">
          <div className="toast-body d-flex align-items-center gap-2">
            <i className="bi bi-check-circle-fill"></i>
            <span>{message}</span>
          </div>
          <button 
            type="button" 
            className="btn-close btn-close-white me-2 m-auto" 
            onClick={onClose}
            aria-label="Close"
          ></button>
        </div>
      </div>
    </div>
  );
};

export default Toast;