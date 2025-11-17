// ==========================================
// FILE: src/components/Navbar/Navbar.jsx
// ==========================================
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ wishlistCount, onWishlistClick, onMenuToggle, menuActive }) => {
  return (
    <nav className="navbar navbar-expand-lg">
      <div className="container px-3">
        <Link className="navbar-brand" to="/">
          <img src="/assets/logo.png" alt="EDOFINDS" />
        </Link>
        <div className="d-flex align-items-center ms-auto">
          {/* Wishlist Button */}
          <button 
            className="nav-link position-relative me-2 p-0 border-0 bg-transparent" 
            type="button"
            onClick={(e) => {
              e.preventDefault(); // Prevent default anchor behavior
              onWishlistClick();  // Trigger parent handler to show Wishlist
            }}
            aria-label="Open Wishlist"
          >
            <i className="bi bi-bookmark fs-5"></i>
            {wishlistCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-dark">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Sell Button */}
          <a href="/admin/login.html" className="nav-link position-relative me-2">
            <button className="btn">Sell</button>
          </a>

          {/* Mobile Hamburger Menu */}
          <button 
            id="menuToggleBtn"
            className="btn d-lg-none p-0 border-0 bg-transparent" 
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasMenu"
            aria-controls="offcanvasMenu"
            onClick={onMenuToggle}
          >
            <div className={`hamburger ${menuActive ? 'active' : ''}`} style={{ color: 'var(--primary-text)' }}>
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
