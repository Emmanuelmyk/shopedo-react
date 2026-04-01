// ==========================================
// FILE: src/components/AdminLayout/AdminLayout.jsx
// ==========================================
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";
import { useInactivityLogout } from "../../hooks/useInactivityLogout";
import "./AdminLayout.css";

const NAV_LINKS = [
  { to: "/admin/dashboard",    icon: "bi-speedometer2",  label: "Dashboard" },
  { to: "/admin/products",     icon: "bi-box-seam",      label: "My Listings" },
  { to: "/admin/products/add", icon: "bi-plus-circle",   label: "Post Listing" },
  { to: "/admin/billing",      icon: "bi-credit-card",   label: "Billing" },
  { to: "/admin/edit-info",    icon: "bi-pencil-square", label: "Edit Info" },
];

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 992);
  const [isMobile, setIsMobile]       = useState(window.innerWidth < 992);
  const [userEmail, setUserEmail]     = useState("");
  const navigate  = useNavigate();
  const location  = useLocation();

  const { showWarning } = useInactivityLogout(5 * 60 * 1000, 1 * 60 * 1000);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserEmail(user.email);
    });

    const onResize = () => {
      const mobile = window.innerWidth < 992;
      setIsMobile(mobile);
      // auto-open on desktop, auto-close on mobile when resizing
      if (!mobile) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const toggle = () => setSidebarOpen((v) => !v);

  const closeOnMobile = () => {
    if (isMobile) setSidebarOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`al-root ${sidebarOpen ? "al-sidebar-open" : "al-sidebar-closed"}`}>

      {/* ── Overlay (mobile only) ── */}
      {isMobile && sidebarOpen && (
        <div className="al-overlay" onClick={closeOnMobile} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`al-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="al-sidebar-brand">
          <img src="/assets/logo.png" alt="Nearbuy" className="al-brand-logo" />
          <button className="al-sidebar-close" onClick={toggle} aria-label="Close menu">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="al-user-block">
          <div className="al-user-avatar">
            <i className="bi bi-person-fill"></i>
          </div>
          <div className="al-user-info">
            <span className="al-user-email">{userEmail || "Seller"}</span>
            <span className="al-user-role">Seller Account</span>
          </div>
        </div>

        <nav className="al-nav">
          {NAV_LINKS.map(({ to, icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`al-nav-item ${isActive(to) ? "al-nav-item--active" : ""}`}
              onClick={closeOnMobile}
            >
              <i className={`bi ${icon}`}></i>
              <span>{label}</span>
            </Link>
          ))}

          <Link
            to="/"
            className="al-nav-item"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeOnMobile}
          >
            <i className="bi bi-globe"></i>
            <span>View Marketplace</span>
          </Link>
        </nav>

        <button className="al-logout-btn" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </button>
      </aside>

      {/* ── Main ── */}
      <div className="al-main">
        <header className="al-topbar">
          <button className="al-hamburger" onClick={toggle} aria-label="Toggle menu">
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div className="al-topbar-right">
            <div className="al-topbar-user">
              <div className="al-topbar-avatar">
                <i className="bi bi-person-fill"></i>
              </div>
              <span className="al-topbar-email">{userEmail}</span>
            </div>
          </div>
        </header>

        {showWarning && (
          <div className="al-inactivity">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            You will be logged out in 2 minutes due to inactivity. Move your mouse or press any key to stay logged in.
          </div>
        )}

        <main className="al-content">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
