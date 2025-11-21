// ==========================================
// FILE: src/pages/AdminDashboard/AddProduct.jsx
// ==========================================
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import { supabase } from "../../utils/supabaseClient";
import { uploadImage, compressImage } from "../../utils/uploadUtils";
import { CATEGORIES } from "../../utils/categories";
import { LOCATIONS } from "../../utils/locations";
import "./ProductForm.css";

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    condition: "Brand New",
    location: "",
    seller_name: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          image: "Please upload a valid image (JPEG, PNG, WebP)",
        }));
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image size must be less than 5MB",
        }));
        return;
      }

      setImageFile(file);
      setErrors((prev) => ({ ...prev, image: "" }));

      // Create preview
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

    setLoading(true);

    try {
      // CRITICAL: Check authentication before proceeding
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      console.log("🔐 Session check:");
      console.log("  - Session exists:", !!session);
      console.log("  - User:", session?.user?.email);
      console.log(
        "  - Access token:",
        session?.access_token ? "Present" : "Missing"
      );

      if (!session) {
        setErrors({
          submit: "You are not authenticated. Please log in again.",
        });
        setLoading(false);
        navigate("/admin/login");
        return;
      }

      let imgPath = null;

      // Upload image if provided
      if (imageFile) {
        console.log("📸 Uploading image...");
        const compressed = await compressImage(imageFile);
        const uploadResult = await uploadImage(compressed, "products");

        if (!uploadResult.success) {
          console.error("❌ Image upload failed:", uploadResult.error);
          setErrors({ image: uploadResult.error });
          setLoading(false);
          return;
        }

        imgPath = uploadResult.path;
        console.log("✅ Image uploaded:", imgPath);
      }

      // Insert product into database
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        category_id: parseInt(formData.category_id),
        condition: formData.condition,
        location: formData.location,
        seller_name: formData.seller_name.trim(),
        seller_id: session.user.id, // 🔐 Link product to current seller
        img_path: imgPath,
      };

      console.log("📤 Inserting product with data:", productData);
      console.log("🔑 Using session from user:", session.user.email);
      console.log("👤 Seller ID:", session.user.id);

      const { data, error } = await supabase
        .from("products")
        .insert([productData]);

      if (error) {
        console.error("❌ Insert error details:");
        console.error("  - Message:", error.message);
        console.error("  - Code:", error.code);
        console.error("  - Details:", error.details);
        console.error("  - Hint:", error.hint);
        throw error;
      }

      console.log("✅ Product inserted successfully!");
      console.log("  - Data:", data);

      // Success - redirect to products list
      navigate("/admin/products");
    } catch (error) {
      console.error("❌ Error adding product:", error);
      setErrors({
        submit: `Failed to add product: ${
          error.message || "Please try again."
        }`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="product-form-container">
        <div className="page-header">
          <div>
            <h1>Add New Product</h1>
            <p className="text-muted">
              Fill in the details to add a new product
            </p>
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

              <div className="row g-4">
                {/* Image Upload */}
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
                        Choose Image
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
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Adding Product...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Add Product
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate("/admin/products")}
                      disabled={loading}
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

export default AddProduct;
