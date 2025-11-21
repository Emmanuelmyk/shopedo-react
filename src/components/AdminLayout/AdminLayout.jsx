// ==========================================
// FILE: src/components/AdminLayout/AdminLayout.jsx
// Modern Responsive Admin Layout with Mobile Menu
// ==========================================
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";
import "./AdminLayout.css";

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false); // Closed by default on mobile
  const [userEmail, setUserEmail] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
      }
    };
    getUser();

    // Handle window resize
    const handleResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(true); // Auto-open on desktop
      } else {
        setSidebarOpen(false); // Auto-close on mobile
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="admin-layout">
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebarOnMobile}></div>
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo" onClick={closeSidebarOnMobile}>
            <img src="/assets/logo.png" alt="EDOFINDS" className="logo-image" />
          </Link>
          {isMobile && (
            <button className="sidebar-close" onClick={toggleSidebar}>
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/admin/dashboard"
            className={`nav-item ${
              isActive("/admin/dashboard") ? "active" : ""
            }`}
            onClick={closeSidebarOnMobile}
          >
            <i className="bi bi-speedometer2"></i>
            <span>Dashboard</span>
          </Link>

          <Link
            to="/admin/products"
            className={`nav-item ${
              isActive("/admin/products") ? "active" : ""
            }`}
            onClick={closeSidebarOnMobile}
          >
            <i className="bi bi-box-seam"></i>
            <span>Products</span>
          </Link>

          <Link
            to="/admin/products/add"
            className={`nav-item ${
              isActive("/admin/products/add") ? "active" : ""
            }`}
            onClick={closeSidebarOnMobile}
          >
            <i className="bi bi-plus-circle"></i>
            <span>Add Product</span>
          </Link>

          <Link
            to="/"
            className="nav-item"
            target="_blank"
            onClick={closeSidebarOnMobile}
          >
            <i className="bi bi-globe"></i>
            <span>View Marketplace</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              <i className="bi bi-person-circle"></i>
            </div>
            <div className="user-details">
              <span className="user-email">{userEmail}</span>
              <span className="user-role">Seller</span>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Modern Navbar */}
        <header className="admin-navbar">
          <div className="navbar-left">
            <button className="menu-toggle" onClick={toggleSidebar}>
              <i className="bi bi-list"></i>
            </button>
            <div className="navbar-brand">
              <img
                src="/assets/logo.png"
                alt="EDOFINDS"
                className="brand-logo"
              />
              <span className="brand-text">Seller Dashboard</span>
            </div>
          </div>

          <div className="navbar-right">
            <div className="navbar-user">
              <div className="user-avatar-small">
                <i className="bi bi-person-circle"></i>
              </div>
              <span className="user-email-small">{userEmail}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
