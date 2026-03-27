// ==========================================
// FILE: src/pages/NotFound/NotFound.jsx
// ==========================================
import React from "react";
import { useNavigate } from "react-router-dom";
import "./NotFound.css";

const NotFound = ({
  message = "The page you're looking for doesn't exist or may have been moved.",
}) => {
  const navigate = useNavigate();

  return (
    <div className="nf-root">
      {/* minimal header */}
      <header className="nf-header">
        <a href="/" className="nf-logo">
          <img src="/assets/logo.png" alt="EDOFINDS" />
        </a>
      </header>

      <main className="nf-body">
        <div className="nf-card">
          <div className="nf-code">404</div>

          <div className="nf-icon-wrap">
            <i className="bi bi-compass"></i>
          </div>

          <h1 className="nf-heading">Page not found</h1>
          <p className="nf-message">{message}</p>

          <div className="nf-actions">
            <button
              className="nf-btn nf-btn--outline"
              onClick={() => navigate(-1)}
            >
              <i className="bi bi-arrow-left me-2"></i>Go back
            </button>
            <a href="/" className="nf-btn nf-btn--primary">
              <i className="bi bi-house me-2"></i>Home
            </a>
          </div>

          <div className="nf-links">
            <span>Try one of these:</span>
            <a href="/houses">Houses</a>
            <a href="/jobs">Jobs</a>
            <a href="/events">Events</a>
            <a href="/services">Services</a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
