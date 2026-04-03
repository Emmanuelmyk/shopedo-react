// ==========================================
// FILE: src/pages/AdminDashboard/Dashboard.jsx
// ==========================================
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import { supabase } from "../../utils/supabaseClient";
import { formatNumber } from "../../utils/formatUtils";
import { getCategoryName } from "../../utils/categories";
import { SkeletonDashboard } from "../../components/Skeleton/Skeleton";
import "./Dashboard.css";

const POSTING_FLOWS = [
  {
    key: "items",
    title: "Post Item",
    subtitle: "Sell products and goods",
    icon: "bi-bag-heart",
    path: "/admin/products/add?type=items",
    accentClass: "posting-flow-item",
  },
  {
    key: "houses",
    title: "Post House",
    subtitle: "Rent and sale listings",
    icon: "bi-house-door",
    path: "/admin/products/add?type=houses",
    accentClass: "posting-flow-house",
  },
  {
    key: "jobs",
    title: "Post Job",
    subtitle: "Hiring opportunities",
    icon: "bi-briefcase",
    path: "/admin/products/add?type=jobs",
    accentClass: "posting-flow-job",
  },
  {
    key: "events",
    title: "Post Event",
    subtitle: "Tickets and event promotion",
    icon: "bi-calendar-event",
    path: "/admin/products/add?type=events",
    accentClass: "posting-flow-event",
  },
  {
    key: "services",
    title: "Post Service",
    subtitle: "Offer your skills to customers",
    icon: "bi-tools",
    path: "/admin/products/add?type=services",
    accentClass: "posting-flow-service",
  },
];

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    recentProducts: [],
    loading: true,
  });
  const [sellerName, setSellerName] = useState("Seller");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 🔐 Get current seller's ID
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          console.error("No session found");
          setStats((prev) => ({ ...prev, loading: false }));
          return;
        }

        const fallbackName = session.user.email?.split("@")[0] || "Seller";
        setSellerName(
          session.user.user_metadata?.full_name ||
            session.user.user_metadata?.name ||
            fallbackName,
        );

        // 🔐 Fetch total products for THIS seller only
        const { count: productCount } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("seller_id", session.user.id); // Filter by seller_id

        // 🔐 Fetch recent products for THIS seller only
        const { data: recentProducts } = await supabase
          .from("products")
          .select("id, name, price, created_at, category_id")
          .eq("seller_id", session.user.id) // Filter by seller_id
          .order("created_at", { ascending: false })
          .limit(5);

        setStats({
          totalProducts: productCount || 0,
          totalCategories: 10, // From categories.js
          recentProducts: recentProducts || [],
          loading: false,
        });
      } catch (error) {
        console.error("❌ Error fetching stats:", error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  if (stats.loading) {
    return (
      <AdminLayout pageTitle="Dashboard">
        <SkeletonDashboard />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="Dashboard">
      <div className="dashboard-container">
        {/* Welcome Header */}
        <div className="dashboard-welcome">
          <div className="welcome-content">
            <span className="dash-welcome-eyebrow">
              {new Date().toLocaleDateString("en-GB", { weekday: "long", month: "long", day: "numeric" })}
            </span>
            <h1>
              <i className="bi bi-shop me-2"></i>
              Welcome back, {sellerName}!
            </h1>
            <p className="welcome-subtitle">
              Manage your listings faster with category-specific posting flows.
            </p>
          </div>
          <div className="welcome-actions">
            <Link to="/admin/products/add" className="dash-welcome-cta">
              <i className="bi bi-plus-circle me-2"></i>
              <span className="d-none d-sm-inline">Add New Listing</span>
              <span className="d-inline d-sm-none">Add Listing</span>
            </Link>
          </div>
        </div>

        <section className="posting-hub">
          <div className="posting-hub-head">
            <h2>
              <i className="bi bi-lightning-charge-fill me-2"></i>
              Start A New Listing
            </h2>
            <p>
              Choose the listing type and get a guided posting form instantly.
            </p>
          </div>
          <div className="posting-hub-grid">
            {POSTING_FLOWS.map((flow) => (
              <Link
                key={flow.key}
                to={flow.path}
                className={`posting-flow-card ${flow.accentClass}`}
              >
                <div className="posting-flow-icon">
                  <i className={`bi ${flow.icon}`}></i>
                </div>
                <div className="posting-flow-content">
                  <h3>{flow.title}</h3>
                  <p>{flow.subtitle}</p>
                </div>
                <i className="bi bi-arrow-right posting-flow-arrow"></i>
              </Link>
            ))}
          </div>
        </section>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card stat-card-primary dash-stat-card--green">
            <div className="stat-card-header">
              <div className="stat-icon">
                <i className="bi bi-box-seam"></i>
              </div>
              <span className="stat-badge">Products</span>
            </div>
            <div className="stat-card-body">
              <h2 className="stat-number">{stats.totalProducts}</h2>
              <p className="stat-label">My Products</p>
            </div>
            <div className="stat-card-footer">
              <Link to="/admin/products" className="stat-link">
                View all <i className="bi bi-arrow-right"></i>
              </Link>
            </div>
          </div>

          <div className="stat-card stat-card-success dash-stat-card--cyan">
            <div className="stat-card-header">
              <div className="stat-icon">
                <i className="bi bi-grid-3x3-gap"></i>
              </div>
              <span className="stat-badge">Categories</span>
            </div>
            <div className="stat-card-body">
              <h2 className="stat-number">{stats.totalCategories}</h2>
              <p className="stat-label">Available Categories</p>
            </div>
            <div className="stat-card-footer">
              <span className="stat-info">
                <i className="bi bi-info-circle me-1"></i>
                All categories
              </span>
            </div>
          </div>

          <div className="stat-card stat-card-warning dash-stat-card--amber">
            <div className="stat-card-header">
              <div className="stat-icon">
                <i className="bi bi-eye"></i>
              </div>
              <span className="stat-badge">Views</span>
            </div>
            <div className="stat-card-body">
              <h2 className="stat-number">-</h2>
              <p className="stat-label">Total Views</p>
            </div>
            <div className="stat-card-footer">
              <span className="stat-info text-muted">Coming soon</span>
            </div>
          </div>

          <div className="stat-card stat-card-info dash-stat-card--blue">
            <div className="stat-card-header">
              <div className="stat-icon">
                <i className="bi bi-heart"></i>
              </div>
              <span className="stat-badge">Favorites</span>
            </div>
            <div className="stat-card-body">
              <h2 className="stat-number">-</h2>
              <p className="stat-label">Favorites</p>
            </div>
            <div className="stat-card-footer">
              <span className="stat-info text-muted">Coming soon</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dash-actions-row">
          <Link to="/admin/products" className="dash-action-item">
            <div className="dash-action-icon dash-action-icon--green">
              <i className="bi bi-box-seam"></i>
            </div>
            <span className="dash-action-label">My Listings</span>
            <i className="bi bi-arrow-right dash-action-arrow"></i>
          </Link>
          <Link to="/admin/products/add" className="dash-action-item">
            <div className="dash-action-icon dash-action-icon--cyan">
              <i className="bi bi-plus-circle"></i>
            </div>
            <span className="dash-action-label">Post Listing</span>
            <i className="bi bi-arrow-right dash-action-arrow"></i>
          </Link>
          <Link to="/" target="_blank" className="dash-action-item">
            <div className="dash-action-icon dash-action-icon--blue">
              <i className="bi bi-shop-window"></i>
            </div>
            <span className="dash-action-label">View Marketplace</span>
            <i className="bi bi-arrow-right dash-action-arrow"></i>
          </Link>
        </div>

        {/* Recent Products */}
        <div className="recent-products-section">
          <div className="section-header">
            <h2>
              <i className="bi bi-clock-history me-2"></i>
              Recent Products
            </h2>
            {stats.recentProducts.length > 0 && (
              <Link to="/admin/products" className="view-all-link">
                View all <i className="bi bi-arrow-right"></i>
              </Link>
            )}
          </div>

          {stats.recentProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <i className="bi bi-inbox"></i>
              </div>
              <h3>No products yet</h3>
              <p>Start selling by adding your first product</p>
              <Link to="/admin/products/add" className="btn btn-success">
                <i className="bi bi-plus-circle me-2"></i>
                Add Your First Product
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="table-responsive d-none d-md-block">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Category</th>
                      <th>Date Added</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentProducts.map((product) => (
                      <tr key={product.id}>
                        <td>
                          <div className="product-info">
                            <span className="product-id">#{product.id}</span>
                            <span className="product-name">{product.name}</span>
                          </div>
                        </td>
                        <td>
                          <span className="product-price">
                            ₦{formatNumber(product.price)}
                          </span>
                        </td>
                        <td>
                          <span className="category-badge">
                            {getCategoryName(product.category_id)}
                          </span>
                        </td>
                        <td>
                          <span className="product-date">
                            {new Date(product.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </td>
                        <td>
                          <Link
                            to={`/admin/products/edit/${product.id}`}
                            className="btn btn-sm btn-edit"
                          >
                            <i className="bi bi-pencil me-1"></i>
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="products-mobile d-md-none">
                {stats.recentProducts.map((product) => (
                  <div key={product.id} className="product-mobile-card">
                    <div className="product-mobile-header">
                      <div>
                        <span className="product-id-mobile">#{product.id}</span>
                        <h4 className="product-name-mobile">{product.name}</h4>
                      </div>
                      <span className="product-price-mobile">
                        ₦{formatNumber(product.price)}
                      </span>
                    </div>
                    <div className="product-mobile-meta">
                      <span className="category-badge-mobile">
                        {getCategoryName(product.category_id)}
                      </span>
                      <span className="product-date-mobile">
                        {new Date(product.created_at).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" },
                        )}
                      </span>
                    </div>
                    <div className="product-mobile-actions">
                      <Link
                        to={`/admin/products/edit/${product.id}`}
                        className="btn btn-sm btn-success w-100"
                      >
                        <i className="bi bi-pencil me-1"></i>
                        Edit Product
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
