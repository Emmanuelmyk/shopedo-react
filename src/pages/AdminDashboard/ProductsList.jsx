// ==========================================
// FILE: src/pages/AdminDashboard/ProductsList.jsx
// ==========================================
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import { supabase } from "../../utils/supabaseClient";
import { deleteImage } from "../../utils/uploadUtils";
import { formatNumber } from "../../utils/formatUtils";
import { getCategoryName } from "../../utils/categories";
import { SkeletonProductsList } from "../../components/Skeleton/Skeleton";
import "./ProductsList.css";

const ProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    product: null,
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // 🔐 Get current seller's ID
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        console.error("No session found");
        setProducts([]);
        setLoading(false);
        return;
      }

      // 🔐 Only fetch products belonging to current seller
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", session.user.id) // Filter by seller_id
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProducts(data || []);
    } catch (error) {
      console.error("❌ Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.product) return;

    try {
      setDeleting(true);

      // Delete image from storage if exists
      if (deleteModal.product.img_path) {
        await deleteImage(deleteModal.product.img_path);
      }

      // Delete product from database
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", deleteModal.product.id);

      if (error) throw error;

      // Update local state
      setProducts(products.filter((p) => p.id !== deleteModal.product.id));
      setDeleteModal({ show: false, product: null });
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout pageTitle="My Listings">
        <SkeletonProductsList />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout pageTitle="My Listings">
      <div className="products-list-container">

        {/* Header */}
        <div className="pl-header">
          <div className="pl-header-left">
            <div className="pl-header-icon">
              <i className="bi bi-box-seam"></i>
            </div>
            <div>
              <h1 className="pl-title">My Listings</h1>
              <p className="pl-subtitle">{products.length} listing{products.length !== 1 ? "s" : ""} in your account</p>
            </div>
          </div>
          <Link to="/admin/products/add" className="pl-add-btn">
            <i className="bi bi-plus-circle me-2"></i>
            New Listing
          </Link>
        </div>

        {/* Search toolbar */}
        <div className="pl-toolbar">
          <div className="pl-search-wrap">
            <i className="bi bi-search pl-search-icon"></i>
            <input
              type="text"
              placeholder="Search listings…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-search-input"
            />
            {searchTerm && (
              <button className="pl-search-clear" onClick={() => setSearchTerm("")} aria-label="Clear search">
                <i className="bi bi-x-lg"></i>
              </button>
            )}
          </div>
          {searchTerm && (
            <span className="pl-result-count">{filteredProducts.length} result{filteredProducts.length !== 1 ? "s" : ""}</span>
          )}
        </div>

        {/* Products Table */}
        <div className="card">
          <div className="card-body p-0">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-5 px-3">
                <i className="bi bi-inbox display-1 text-muted"></i>
                <h4 className="mt-3">No listings found</h4>
                <p className="text-muted">
                  {searchTerm ? "Try a different search term" : "Add your first listing to get started"}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="table-responsive d-none d-md-block">
                  <table className="pl-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Condition</th>
                        <th>Location</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product.id}>
                          <td>
                            <img
                              src={
                                product.img_path
                                  ? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/products/${product.img_path}`
                                  : "/assets/emptypics.png"
                              }
                              alt={product.name}
                              className="product-thumbnail"
                            />
                          </td>
                          <td className="fw-semibold">{product.name}</td>
                          <td>{getCategoryName(product.category_id)}</td>
                          <td>₦{formatNumber(product.price)}</td>
                          <td><span className="pl-condition-badge">{product.condition}</span></td>
                          <td>{product.location}</td>
                          <td>{new Date(product.created_at).toLocaleDateString()}</td>
                          <td>
                            <div className="action-buttons">
                              <Link to={`/admin/products/edit/${product.id}`} className="btn btn-sm btn-outline-success" title="Edit">
                                <i className="bi bi-pencil"></i>
                              </Link>
                              <button onClick={() => setDeleteModal({ show: true, product })} className="btn btn-sm btn-outline-danger" title="Delete">
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="products-mobile d-md-none">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="product-card-mobile">
                      <div className="product-card-header">
                        <img
                          src={
                            product.img_path
                              ? `${
                                  import.meta.env.VITE_SUPABASE_URL
                                }/storage/v1/object/public/products/${
                                  product.img_path
                                }`
                              : "/assets/emptypics.png"
                          }
                          alt={product.name}
                          className="product-image-mobile"
                        />
                        <div className="product-info-mobile">
                          <h3>{product.name}</h3>
                          <p className="product-price-mobile">
                            ₦{formatNumber(product.price)}
                          </p>
                        </div>
                      </div>
                      <div className="product-card-body">
                        <span className="product-condition">
                          {product.condition}
                        </span>
                        <span className="product-category">
                          {getCategoryName(product.category_id)}
                        </span>
                        <span className="product-location">
                          <i className="bi bi-geo-alt me-1"></i>
                          {product.location}
                        </span>
                        <span className="product-date">
                          {new Date(product.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="product-card-actions">
                        <Link
                          to={`/admin/products/edit/${product.id}`}
                          className="btn btn-sm btn-success"
                        >
                          <i className="bi bi-pencil me-1"></i>
                          Edit
                        </Link>
                        <button
                          onClick={() =>
                            setDeleteModal({ show: true, product })
                          }
                          className="btn btn-sm btn-danger"
                        >
                          <i className="bi bi-trash me-1"></i>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="modal-overlay" onClick={() => !deleting && setDeleteModal({ show: false, product: null })}>
          <div className="pl-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="pl-modal-icon-wrap">
              <i className="bi bi-trash3-fill"></i>
            </div>
            <h5 className="pl-modal-title">Delete Listing?</h5>
            <p className="pl-modal-body">
              <strong>"{deleteModal.product?.name}"</strong> will be permanently removed. This cannot be undone.
            </p>
            <div className="pl-modal-footer">
              <button onClick={() => setDeleteModal({ show: false, product: null })} className="pl-modal-cancel" disabled={deleting}>
                Cancel
              </button>
              <button onClick={handleDelete} className="pl-modal-delete" disabled={deleting}>
                {deleting ? <><span className="spinner-border spinner-border-sm me-1" role="status"></span>Deleting…</> : <><i className="bi bi-trash me-1"></i>Delete</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ProductsList;
