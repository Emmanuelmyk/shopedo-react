// ==========================================
// FILE: src/components/Navbar/Navbar.jsx
// ==========================================
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({
  wishlistCount,
  onWishlistClick,
  onMenuToggle,
  menuActive,
  wishlistActive,
}) => {
  const [badgeBurst, setBadgeBurst] = useState(false);
  const prevCountRef = useRef(wishlistCount);

  useEffect(() => {
    const previousCount = prevCountRef.current;

    if (wishlistCount > previousCount) {
      setBadgeBurst(true);
      const timer = setTimeout(() => {
        setBadgeBurst(false);
      }, 550);

      prevCountRef.current = wishlistCount;
      return () => clearTimeout(timer);
    }

    prevCountRef.current = wishlistCount;
    return undefined;
  }, [wishlistCount]);

  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container px-3">
        <Link className="navbar-brand" to="/">
          <img src="/assets/logo.png" alt="Nearbuy" className="logo-img" />
          <span className="brand-text">Nearbuy</span>
        </Link>

        <div className="nav-spacer"></div>

        <div className="nav-actions">
          {/* Wishlist Button */}
          <button
            className={`nav-action-btn wishlist-btn ${
              wishlistActive ? "active" : ""
            } ${badgeBurst ? "pop" : ""}`}
            type="button"
            onClick={onWishlistClick}
            aria-label="Toggle Wishlist"
            aria-expanded={wishlistActive}
            title="View saved items"
          >
            <i
              className={`bi ${
                wishlistActive ? "bi-bookmark-fill" : "bi-bookmark"
              }`}
            ></i>
            {wishlistCount > 0 && (
              <span className={`wishlist-badge ${badgeBurst ? "pop" : ""}`}>
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Sell Button */}
          <Link to="/admin/login" className="nav-action-link">
            <button className="sell-btn">
              <i className="bi bi-plus-circle"></i>
              Sell
            </button>
          </Link>

          {/* Mobile Hamburger Menu */}
          <button
            id="menuToggleBtn"
            className="nav-hamburger d-lg-none"
            type="button"
            onClick={onMenuToggle}
            aria-label="Toggle menu"
            aria-expanded={menuActive}
          >
            <div className={`hamburger ${menuActive ? "active" : ""}`}>
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
