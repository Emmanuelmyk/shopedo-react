// ==========================================
// FILE: src/components/Navbar/Navbar.jsx
// ==========================================
import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({
  wishlistCount,
  onWishlistClick,
  onMenuToggle,
  menuActive,
  wishlistActive,
}) => {
  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container px-3">
        <Link className="navbar-brand" to="/">
          <img src="/assets/logo.png" alt="EDOFINDS" />
        </Link>
        <div className="d-flex align-items-center ms-auto">
          {/* Wishlist Button */}
          <button
            className={`nav-link position-relative me-2 p-0 border-0 bg-transparent ${
              wishlistActive ? "active" : ""
            }`}
            type="button"
            onClick={onWishlistClick}
            aria-label="Toggle Wishlist"
            aria-expanded={wishlistActive}
          >
            <i
              className={`bi ${
                wishlistActive ? "bi-bookmark-fill" : "bi-bookmark"
              } fs-5`}
            ></i>
            {wishlistCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-dark">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Sell Button */}
          <Link to="/admin/login" className="nav-link position-relative me-2">
            <button className="btn">Sell</button>
          </Link>

          {/* Mobile Hamburger Menu */}
          <button
            id="menuToggleBtn"
            className="btn d-lg-none p-0 border-0 bg-transparent"
            type="button"
            onClick={onMenuToggle}
            aria-label="Toggle menu"
            aria-expanded={menuActive}
          >
            <div
              className={`hamburger ${menuActive ? "active" : ""}`}
              style={{ color: "var(--primary-text)" }}
            >
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
