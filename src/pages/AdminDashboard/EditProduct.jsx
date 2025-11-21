// ==========================================
// FILE: src/pages/AdminDashboard/EditProduct.jsx
// ==========================================
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import { supabase } from "../../utils/supabaseClient";
import {
  uploadImage,
  compressImage,
  deleteImage,
} from "../../utils/uploadUtils";
import { CATEGORIES } from "../../utils/categories";
import { LOCATIONS } from "../../utils/locations";
import { SkeletonProductForm } from "../../components/Skeleton/Skeleton";
import "./ProductForm.css";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [originalImgPath, setOriginalImgPath] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    condition: "Brand New",
    location: "",
    seller_name: "",
  });

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);

      // 🔐 Get current seller's ID
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setErrors({ fetch: "You must be logged in to edit products." });
        setLoading(false);
        navigate("/admin/login");
        return;
      }

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        // 🔐 Verify that this product belongs to the current seller
        if (data.seller_id !== session.user.id) {
          console.error("❌ Unauthorized: Product belongs to another seller");
          setErrors({
            fetch: "You don't have permission to edit this product.",
          });
          setLoading(false);
          navigate("/admin/products");
          return;
        }

        console.log("✅ Authorized to edit product:", data.name);

        setFormData({
          name: data.name || "",
          description: data.description || "",
          price: data.price || "",
          category_id: data.category_id || "",
          condition: data.condition || "Brand New",
          location: data.location || "",
          seller_name: data.seller_name || "",
        });

        setOriginalImgPath(data.img_path);

        if (data.img_path) {
          const imageUrl = `${
            import.meta.env.VITE_SUPABASE_URL
          }/storage/v1/object/public/products/${data.img_path}`;
          setImagePreview(imageUrl);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching product:", error);
      setErrors({ fetch: "Failed to load product. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          image: "Please upload a valid image (JPEG, PNG, WebP)",
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image size must be less than 5MB",
        }));
        return;
      }

      setImageFile(file);
      setErrors((prev) => ({ ...prev, image: "" }));

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Valid price is required";
    if (!formData.category_id) newErrors.category_id = "Category is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.seller_name.trim())
      newErrors.seller_name = "Seller name is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      let imgPath = originalImgPath;

      // Upload new image if provided
      if (imageFile) {
        // Delete old image if exists
        if (originalImgPath) {
          await deleteImage(originalImgPath);
        }

        const compressed = await compressImage(imageFile);
        const uploadResult = await uploadImage(compressed, "products");

        if (!uploadResult.success) {
          setErrors({ image: uploadResult.error });
          setSaving(false);
          return;
        }

        imgPath = uploadResult.path;
      }

      // Update product in database
      const { error } = await supabase
        .from("products")
        .update({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          price: parseFloat(formData.price),
          category_id: parseInt(formData.category_id),
          condition: formData.condition,
          location: formData.location.trim(),
          seller_name: formData.seller_name.trim(),
          img_path: imgPath,
        })
        .eq("id", id);

      if (error) throw error;

      // Success - redirect to products list
      navigate("/admin/products");
    } catch (error) {
      console.error("Error updating product:", error);
      setErrors({ submit: "Failed to update product. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <SkeletonProductForm />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="product-form-container">
        <div className="page-header">
          <div>
            <h1>Edit Product</h1>
            <p className="text-muted">Update product details</p>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              {errors.submit && (
                <div className="alert alert-danger" role="alert">
                  {errors.submit}
                </div>
              )}
              {errors.fetch && (
                <div className="alert alert-danger" role="alert">
                  {errors.fetch}
                </div>
              )}

              <div className="row g-4">
                {/* Image Upload - Same as AddProduct */}
                <div className="col-12">
                  <label className="form-label">Product Image</label>
                  <div className="image-upload-section">
                    <div className="image-preview-container">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="image-preview"
                        />
                      ) : (
                        <div className="image-placeholder">
                          <i className="bi bi-image"></i>
                          <p>No image selected</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        id="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="d-none"
                      />
                      <label
                        htmlFor="image"
                        className="btn btn-outline-primary"
                      >
                        <i className="bi bi-upload me-2"></i>
                        Change Image
                      </label>
                      <p className="text-muted small mt-2">
                        Recommended: 800x800px, Max 5MB (JPEG, PNG, WebP)
                      </p>
                      {errors.image && (
                        <div className="text-danger small">{errors.image}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Product Name */}
                <div className="col-md-6">
                  <label htmlFor="name" className="form-label">
                    Product Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`form-control ${
                      errors.name ? "is-invalid" : ""
                    }`}
                    placeholder="e.g., iPhone 13 Pro Max"
                  />
                  {errors.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
                </div>

                {/* Price */}
                <div className="col-md-6">
                  <label htmlFor="price" className="form-label">
                    Price (₦) <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={`form-control ${
                      errors.price ? "is-invalid" : ""
                    }`}
                    placeholder="e.g., 50000"
                    min="0"
                    step="0.01"
                  />
                  {errors.price && (
                    <div className="invalid-feedback">{errors.price}</div>
                  )}
                </div>

                {/* Category */}
                <div className="col-md-6">
                  <label htmlFor="category_id" className="form-label">
                    Category <span className="text-danger">*</span>
                  </label>
                  <select
                    id="category_id"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className={`form-select ${
                      errors.category_id ? "is-invalid" : ""
                    }`}
                  >
                    <option value="">Select a category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && (
                    <div className="invalid-feedback">{errors.category_id}</div>
                  )}
                </div>

                {/* Condition */}
                <div className="col-md-6">
                  <label htmlFor="condition" className="form-label">
                    Condition <span className="text-danger">*</span>
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="Brand New">Brand New</option>
                    <option value="Used - Excellent">Used - Excellent</option>
                    <option value="Used - Good">Used - Good</option>
                    <option value="Used - Fair">Used - Fair</option>
                    <option value="Refurbished">Refurbished</option>
                  </select>
                </div>

                {/* Location */}
                <div className="col-md-6">
                  <label htmlFor="location" className="form-label">
                    Location <span className="text-danger">*</span>
                  </label>
                  <select
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={`form-select ${
                      errors.location ? "is-invalid" : ""
                    }`}
                  >
                    <option value="">Select a location</option>
                    {LOCATIONS.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                  {errors.location && (
                    <div className="invalid-feedback">{errors.location}</div>
                  )}
                </div>

                {/* Seller Name */}
                <div className="col-md-6">
                  <label htmlFor="seller_name" className="form-label">
                    Seller Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    id="seller_name"
                    name="seller_name"
                    value={formData.seller_name}
                    onChange={handleInputChange}
                    className={`form-control ${
                      errors.seller_name ? "is-invalid" : ""
                    }`}
                    placeholder="e.g., John Doe"
                  />
                  {errors.seller_name && (
                    <div className="invalid-feedback">{errors.seller_name}</div>
                  )}
                </div>

                {/* Description */}
                <div className="col-12">
                  <label htmlFor="description" className="form-label">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-control"
                    rows="4"
                    placeholder="Describe the product in detail..."
                  ></textarea>
                </div>

                {/* Submit Buttons */}
                <div className="col-12">
                  <div className="d-flex gap-3">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Updating Product...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Update Product
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate("/admin/products")}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditProduct;
