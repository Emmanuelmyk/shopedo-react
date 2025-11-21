// ==========================================
// FILE: src/components/Skeleton/Skeleton.jsx
// Reusable Skeleton Loader Components
// ==========================================
import "./Skeleton.css";

// Basic Skeleton Line
export const SkeletonLine = ({ width = "100%", height = "16px", className = "" }) => (
  <div
    className={`skeleton-line ${className}`}
    style={{ width, height }}
  ></div>
);

// Skeleton Circle (for avatars, icons)
export const SkeletonCircle = ({ size = "40px", className = "" }) => (
  <div
    className={`skeleton-circle ${className}`}
    style={{ width: size, height: size }}
  ></div>
);

// Skeleton Rectangle (for images, cards)
export const SkeletonRect = ({ width = "100%", height = "200px", className = "" }) => (
  <div
    className={`skeleton-rect ${className}`}
    style={{ width, height }}
  ></div>
);

// Skeleton Card
export const SkeletonCard = ({ className = "" }) => (
  <div className={`skeleton-card ${className}`}>
    <SkeletonRect height="150px" />
    <div className="skeleton-card-body">
      <SkeletonLine width="80%" height="20px" />
      <SkeletonLine width="60%" height="16px" />
      <SkeletonLine width="40%" height="16px" />
    </div>
  </div>
);

// Skeleton Table Row
export const SkeletonTableRow = ({ columns = 5 }) => (
  <tr className="skeleton-table-row">
    {Array.from({ length: columns }).map((_, index) => (
      <td key={index}>
        <SkeletonLine height="20px" />
      </td>
    ))}
  </tr>
);

// Skeleton Table
export const SkeletonTable = ({ rows = 5, columns = 5 }) => (
  <div className="table-responsive">
    <table className="table">
      <thead>
        <tr>
          {Array.from({ length: columns }).map((_, index) => (
            <th key={index}>
              <SkeletonLine height="20px" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, index) => (
          <SkeletonTableRow key={index} columns={columns} />
        ))}
      </tbody>
    </table>
  </div>
);

// Skeleton Product Card (Mobile)
export const SkeletonProductCard = () => (
  <div className="skeleton-product-card">
    <div className="skeleton-product-header">
      <SkeletonRect width="80px" height="80px" className="skeleton-product-image" />
      <div className="skeleton-product-info">
        <SkeletonLine width="70%" height="18px" />
        <SkeletonLine width="50%" height="24px" />
      </div>
    </div>
    <div className="skeleton-product-body">
      <SkeletonLine width="30%" height="16px" />
      <SkeletonLine width="40%" height="16px" />
      <SkeletonLine width="35%" height="16px" />
    </div>
    <div className="skeleton-product-actions">
      <SkeletonRect width="48%" height="36px" />
      <SkeletonRect width="48%" height="36px" />
    </div>
  </div>
);

// Skeleton Products List Page
export const SkeletonProductsList = () => (
  <div className="products-list-container">
    <div className="page-header">
      <div>
        <SkeletonLine width="200px" height="32px" />
        <SkeletonLine width="150px" height="16px" />
      </div>
      <SkeletonRect width="150px" height="40px" />
    </div>

    <div className="search-section mb-4">
      <SkeletonRect width="100%" height="48px" />
    </div>

    <div className="card">
      <div className="card-body">
        {/* Desktop Table View */}
        <div className="d-none d-md-block">
          <SkeletonTable rows={5} columns={8} />
        </div>

        {/* Mobile Card View */}
        <div className="d-md-none">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonProductCard key={index} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Skeleton Dashboard Stats
export const SkeletonDashboard = () => (
  <div className="dashboard-container">
    {/* Welcome Header */}
    <SkeletonRect width="100%" height="120px" className="mb-4" />

    {/* Stats Grid */}
    <div className="stats-grid mb-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>

    {/* Quick Actions */}
    <div className="quick-actions-grid mb-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>

    {/* Recent Products */}
    <SkeletonRect width="100%" height="300px" />
  </div>
);

// Skeleton Product Form
export const SkeletonProductForm = () => (
  <div className="product-form-container">
    <div className="page-header">
      <SkeletonLine width="250px" height="32px" />
      <SkeletonLine width="180px" height="16px" />
    </div>

    <div className="card">
      <div className="card-body">
        <SkeletonRect width="100%" height="200px" className="mb-4" />
        <SkeletonLine width="100%" height="48px" className="mb-3" />
        <SkeletonLine width="100%" height="120px" className="mb-3" />
        <SkeletonLine width="100%" height="48px" className="mb-3" />
        <SkeletonLine width="100%" height="48px" className="mb-3" />
        <div className="d-flex gap-3">
          <SkeletonRect width="150px" height="48px" />
          <SkeletonRect width="100px" height="48px" />
        </div>
      </div>
    </div>
  </div>
);

