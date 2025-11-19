// ==========================================
// FILE: src/components/Button/Button.jsx
// ==========================================
import React from "react";
import "./Button.css";

const Button = ({
  children,
  variant = "primary",
  onClick,
  disabled = false,
  className = "",
  type = "button",
  ...props
}) => {
  return (
    <button
      type={type}
      className={`custom-btn custom-btn-${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
