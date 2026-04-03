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

const AdminLayout = ({ children, pageTitle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 992);
  const [collapsed, setCollapsed]     = useState(false);
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
      if (!mobile) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const toggle = () => {
    if (isMobile) setSidebarOpen((v) => !v);
    else setCollapsed((v) => !v);
  };

  const closeOnMobile = () => {
    if (isMobile) setSidebarOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const isActive = (path) => location.pathname === path;

  const rootClass = [
    "al-root",
    sidebarOpen ? "al-sidebar-open" : "al-sidebar-closed",
    !isMobile && collapsed ? "al-sidebar-collapsed" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={rootClass}>

      {/* ── Overlay (mobile only) ── */}
      {isMobile && sidebarOpen && (
        <div className="al-overlay" onClick={closeOnMobile} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`al-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="al-sidebar-brand">
          <img src="/assets/logo.png" alt="Nearbuy" className="al-brand-logo" />
          {/* Mobile: X close button */}
          <button className="al-sidebar-close" onClick={closeOnMobile} aria-label="Close menu">
            <i className="bi bi-x-lg"></i>
          </button>
          {/* Desktop: collapse chevron */}
          <button
            className="al-sidebar-toggle-collapse"
            onClick={() => setCollapsed((v) => !v)}
            aria-label="Collapse sidebar"
          >
            <i className="bi bi-chevron-left"></i>
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
          <span className="al-nav-section-label">Main</span>
          {NAV_LINKS.map(({ to, icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`al-nav-item ${isActive(to) ? "al-nav-item--active" : ""}`}
              onClick={closeOnMobile}
            >
              <i className={`bi ${icon}`}></i>
              <span className="al-nav-label">{label}</span>
            </Link>
          ))}

          <span className="al-nav-section-label">Account</span>
          <Link
            to="/"
            className="al-nav-item"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeOnMobile}
          >
            <i className="bi bi-globe"></i>
            <span className="al-nav-label">View Marketplace</span>
          </Link>
        </nav>

        <button className="al-logout-btn" onClick={handleLogout}>
          <i className="bi bi-box-arrow-right"></i>
          <span className="al-nav-label">Logout</span>
        </button>
      </aside>

      {/* ── Main ── */}
      <div className="al-main">
        <header className="al-topbar">
          <div className="al-topbar-left">
            <button className="al-hamburger" onClick={toggle} aria-label="Toggle menu">
              <i className="bi bi-list"></i>
            </button>
            {pageTitle && (
              <span className="al-topbar-page-title">{pageTitle}</span>
            )}
          </div>

          <div className="al-topbar-right">
            <button className="al-topbar-bell" aria-label="Notifications">
              <i className="bi bi-bell"></i>
            </button>
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
