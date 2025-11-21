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

      console.log("👤 Fetching products for seller:", session.user.email);
      console.log("🆔 Seller ID:", session.user.id);

      // 🔐 Only fetch products belonging to current seller
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", session.user.id) // Filter by seller_id
        .order("created_at", { ascending: false });

      if (error) throw error;

      console.log(`✅ Found ${data?.length || 0} products for this seller`);
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
      <AdminLayout>
        <SkeletonProductsList />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="products-list-container">
        <div className="page-header">
          <div>
            <h1>Products</h1>
            <p className="text-muted">Manage all your products</p>
          </div>
          <Link to="/admin/products/add" className="btn btn-success">
            <i className="bi bi-plus-circle me-2"></i>
            Add Product
          </Link>
        </div>

        {/* Search Bar */}
        <div className="search-section mb-4">
          <div className="search-box">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="card">
          <div className="card-body">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-inbox display-1 text-muted"></i>
                <h4 className="mt-3">No products found</h4>
                <p className="text-muted">
                  {searchTerm
                    ? "Try a different search term"
                    : "Add your first product to get started"}
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="table-responsive d-none d-md-block">
                  <table className="table table-hover">
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
                                  ? `${
                                      import.meta.env.VITE_SUPABASE_URL
                                    }/storage/v1/object/public/products/${
                                      product.img_path
                                    }`
                                  : "/assets/emptypics.png"
                              }
                              alt={product.name}
                              className="product-thumbnail"
                            />
                          </td>
                          <td className="fw-semibold">{product.name}</td>
                          <td>{getCategoryName(product.category_id)}</td>
                          <td>₦{formatNumber(product.price)}</td>
                          <td>
                            <span className="product-condition">
                              {product.condition}
                            </span>
                          </td>
                          <td>{product.location}</td>
                          <td>
                            {new Date(product.created_at).toLocaleDateString()}
                          </td>
                          <td>
                            <div className="action-buttons">
                              <Link
                                to={`/admin/products/edit/${product.id}`}
                                className="btn btn-sm btn-outline-success"
                                title="Edit"
                              >
                                <i className="bi bi-pencil"></i>
                              </Link>
                              <button
                                onClick={() =>
                                  setDeleteModal({ show: true, product })
                                }
                                className="btn btn-sm btn-outline-danger"
                                title="Delete"
                              >
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
        <div
          className="modal-overlay"
          onClick={() =>
            !deleting && setDeleteModal({ show: false, product: null })
          }
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h5>Delete Product</h5>
            <p>
              Are you sure you want to delete "{deleteModal.product?.name}"?
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                onClick={() => setDeleteModal({ show: false, product: null })}
                className="btn btn-secondary"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="btn btn-danger"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ProductsList;
