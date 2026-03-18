// ==========================================
// FILE: src/pages/AdminDashboard/AddProduct.jsx
// ==========================================
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import { supabase } from "../../utils/supabaseClient";
import { uploadImage, compressImage } from "../../utils/uploadUtils";
import { CATEGORIES } from "../../utils/categories";
import { LOCATIONS } from "../../utils/locations";
import "./ProductForm.css";

const LISTING_TYPES = {
  items: {
    key: "items",
    title: "Items",
    icon: "bi-bag-heart",
    subtitle: "Physical products and goods",
    buttonLabel: "Post Item",
    priceLabel: "Price (Naira)",
    nameLabel: "Item Name",
    namePlaceholder: "e.g., iPhone 13 Pro Max",
    descriptionPlaceholder:
      "Describe the item condition, specs, and reason for sale...",
    conditionLabel: "Condition",
    conditionOptions: [
      "Brand New",
      "Used - Excellent",
      "Used - Good",
      "Used - Fair",
      "Refurbished",
    ],
    lockCategory: false,
  },
  houses: {
    key: "houses",
    title: "House",
    icon: "bi-house-door",
    subtitle: "Properties for rent or sale",
    buttonLabel: "Post House",
    priceLabel: "Price (Naira)",
    nameLabel: "Listing Title",
    namePlaceholder: "e.g., 2 Bedroom Apartment at Ugbowo",
    descriptionPlaceholder:
      "Highlight amenities, security, accessibility, and house rules...",
    conditionLabel: "Listing Status",
    conditionOptions: ["For Rent", "For Sale", "Short Let"],
    lockCategory: true,
    lockedCategoryId: "3",
  },
  jobs: {
    key: "jobs",
    title: "Jobs",
    icon: "bi-briefcase",
    subtitle: "Hiring and opportunities",
    buttonLabel: "Post Job",
    priceLabel: "Salary (Naira)",
    nameLabel: "Role Title",
    namePlaceholder: "e.g., Frontend Developer",
    descriptionPlaceholder:
      "Write responsibilities, required skills, and application process...",
    conditionLabel: "Hiring Status",
    conditionOptions: [
      "Open Position",
      "Urgent Hire",
      "Internship",
      "Contract",
    ],
    lockCategory: false,
  },
  events: {
    key: "events",
    title: "Events",
    icon: "bi-calendar-event",
    subtitle: "Concerts, meetups, workshops",
    buttonLabel: "Post Event",
    priceLabel: "Ticket Price (Naira)",
    nameLabel: "Event Title",
    namePlaceholder: "e.g., Benin Tech Meetup 2026",
    descriptionPlaceholder:
      "Share agenda, speakers, dress code, and registration details...",
    conditionLabel: "Event Status",
    conditionOptions: ["Upcoming", "Tickets Selling", "Limited Seats"],
    lockCategory: false,
  },
};

const CATEGORY_PRESETS = {
  houses: {
    propertyType: "Apartment",
    offerType: "For Rent",
    bedrooms: "",
    bathrooms: "",
    furnished: "No",
  },
  jobs: {
    companyName: "",
    jobType: "Full-time",
    workMode: "On-site",
    experienceLevel: "Entry",
  },
  events: {
    eventDate: "",
    eventTime: "",
    venue: "",
    organizer: "",
    ticketType: "Paid",
  },
};

const normalizeType = (value) => {
  if (!value) return "items";
  if (value === "house") return "houses";
  if (value === "job") return "jobs";
  if (value === "event") return "events";
  return LISTING_TYPES[value] ? value : "items";
};

const serializeMeta = (listingType, extraData) => {
  if (listingType === "houses") {
    return [
      "Listing Type: House",
      `Property Type: ${extraData.propertyType || "N/A"}`,
      `Offer Type: ${extraData.offerType || "N/A"}`,
      `Bedrooms: ${extraData.bedrooms || "N/A"}`,
      `Bathrooms: ${extraData.bathrooms || "N/A"}`,
      `Furnished: ${extraData.furnished || "N/A"}`,
      "Search Tags: house property rent sale apartment",
    ];
  }

  if (listingType === "jobs") {
    return [
      "Listing Type: Job",
      `Company: ${extraData.companyName || "N/A"}`,
      `Job Type: ${extraData.jobType || "N/A"}`,
      `Work Mode: ${extraData.workMode || "N/A"}`,
      `Experience Level: ${extraData.experienceLevel || "N/A"}`,
      "Search Tags: job hiring vacancy opportunity",
    ];
  }

  if (listingType === "events") {
    return [
      "Listing Type: Event",
      `Event Date: ${extraData.eventDate || "N/A"}`,
      `Event Time: ${extraData.eventTime || "N/A"}`,
      `Venue: ${extraData.venue || "N/A"}`,
      `Organizer: ${extraData.organizer || "N/A"}`,
      `Ticket Type: ${extraData.ticketType || "N/A"}`,
      "Search Tags: event ticket show concert meetup",
    ];
  }

  return ["Listing Type: Item", "Search Tags: item product sale"];
};

const composeDescription = (baseDescription, listingType, extraData) => {
  const trimmed = (baseDescription || "").trim();
  const metadata = serializeMeta(listingType, extraData).join("\n");
  if (!trimmed) return metadata;
  return `${trimmed}\n\n---\n${metadata}`;
};

const AddProduct = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [listingType, setListingType] = useState(() =>
    normalizeType(searchParams.get("type")),
  );

  const [extraData, setExtraData] = useState({
    ...CATEGORY_PRESETS.houses,
    ...CATEGORY_PRESETS.jobs,
    ...CATEGORY_PRESETS.events,
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    condition: "Brand New",
    location: "",
    seller_name: "",
  });

  const [dragActive, setDragActive] = useState(false);

  const typeConfig = useMemo(() => LISTING_TYPES[listingType], [listingType]);

  useEffect(() => {
    const nextType = normalizeType(searchParams.get("type"));
    setListingType(nextType);
  }, [searchParams]);

  useEffect(() => {
    if (typeConfig.lockCategory && typeConfig.lockedCategoryId) {
      setFormData((prev) => ({
        ...prev,
        category_id: typeConfig.lockedCategoryId,
        condition: typeConfig.conditionOptions.includes(prev.condition)
          ? prev.condition
          : typeConfig.conditionOptions[0],
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      condition: typeConfig.conditionOptions.includes(prev.condition)
        ? prev.condition
        : typeConfig.conditionOptions[0],
    }));
  }, [typeConfig]);

  const handleListingTypeChange = (type) => {
    setListingType(type);
    setErrors({});
    setSearchParams(type === "items" ? {} : { type });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleExtraChange = (e) => {
    const { name, value } = e.target;
    setExtraData((prev) => ({ ...prev, [name]: value }));
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

  // Drag and drop handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
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

    if (!formData.name.trim())
      newErrors.name = `${typeConfig.nameLabel} is required`;
    if (!formData.price || formData.price <= 0)
      newErrors.price = "Enter a valid amount";

    if (!typeConfig.lockCategory && !formData.category_id) {
      newErrors.category_id = "Category is required";
    }

    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.seller_name.trim())
      newErrors.seller_name = "Seller name is required";

    if (listingType === "houses") {
      if (!extraData.propertyType.trim()) {
        newErrors.propertyType = "Property type is required";
      }
      if (!extraData.offerType.trim()) {
        newErrors.offerType = "Offer type is required";
      }
    }

    if (listingType === "jobs") {
      if (!extraData.companyName.trim()) {
        newErrors.companyName = "Company name is required";
      }
      if (!extraData.jobType.trim()) {
        newErrors.jobType = "Job type is required";
      }
    }

    if (listingType === "events") {
      if (!extraData.eventDate) {
        newErrors.eventDate = "Event date is required";
      }
      if (!extraData.venue.trim()) {
        newErrors.venue = "Venue is required";
      }
    }

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
        session?.access_token ? "Present" : "Missing",
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
        description: composeDescription(
          formData.description,
          listingType,
          extraData,
        ),
        price: parseFloat(formData.price),
        category_id: parseInt(
          typeConfig.lockCategory
            ? typeConfig.lockedCategoryId
            : formData.category_id,
          10,
        ),
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
            <h1>Create Listing</h1>
            <p className="text-muted">
              Choose a listing type and fill in the details buyers need
            </p>
          </div>
        </div>

        <section className="listing-type-section mb-4">
          <div className="listing-type-head">
            <h2>What do you want to post?</h2>
            <p>Select a flow tailored for that listing category.</p>
          </div>
          <div className="listing-type-grid">
            {Object.values(LISTING_TYPES).map((type) => (
              <button
                key={type.key}
                type="button"
                className={`listing-type-card${
                  listingType === type.key ? " active" : ""
                } ${type.key}-type`}
                data-type={type.key}
                onClick={() => handleListingTypeChange(type.key)}
              >
                <div className="listing-type-icon">
                  <i className={`bi ${type.icon}`}></i>
                </div>
                <div className="listing-type-content">
                  <h3>{type.title}</h3>
                  <p>{type.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

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
                  <label className="form-label-txt">
                    <i className="bi bi-image"></i>
                    Product Image
                  </label>
                  <div
                    className={`image-upload-section${dragActive ? " drag-active" : ""}`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <div className="image-preview-container">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="image-preview"
                        />
                      ) : (
                        <div className="image-placeholder">
                          <i className="bi bi-cloud-arrow-up"></i>
                          <p>Drag image here or click to browse</p>
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
                        className="btn btn-outline-success"
                      >
                        <i className="bi bi-upload"></i>
                        Choose Image
                      </label>
                      <p className="form-helper-text">
                        <i className="bi bi-info-circle"></i>
                        Recommended: 800x800px, Max 5MB (JPEG, PNG, WebP)
                      </p>
                      {errors.image && (
                        <div className="invalid-feedback">{errors.image}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Product Name */}
                <div className="col-md-6">
                  <label htmlFor="name" className="form-label-txt">
                    {typeConfig.nameLabel}{" "}
                    <span className="text-danger">*</span>
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
                    placeholder={typeConfig.namePlaceholder}
                  />
                  {errors.name && (
                    <div className="invalid-feedback">{errors.name}</div>
                  )}
                </div>

                {/* Price */}
                <div className="col-md-6">
                  <label htmlFor="price" className="form-label-txt">
                    {typeConfig.priceLabel}{" "}
                    <span className="text-danger">*</span>
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
                  <label htmlFor="category_id" className="form-label-txt">
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
                    disabled={typeConfig.lockCategory}
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
                  <label htmlFor="condition" className="form-label-txt">
                    {typeConfig.conditionLabel}{" "}
                    <span className="text-danger">*</span>
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    {typeConfig.conditionOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Type-specific fields */}
                {listingType === "houses" && (
                  <>
                    <div className="col-md-6">
                      <label htmlFor="propertyType" className="form-label-txt">
                        Property Type <span className="text-danger">*</span>
                      </label>
                      <select
                        id="propertyType"
                        name="propertyType"
                        value={extraData.propertyType}
                        onChange={handleExtraChange}
                        className={`form-select ${errors.propertyType ? "is-invalid" : ""}`}
                      >
                        <option value="Apartment">Apartment</option>
                        <option value="Self Contain">Self Contain</option>
                        <option value="Duplex">Duplex</option>
                        <option value="Bungalow">Bungalow</option>
                        <option value="Land">Land</option>
                        <option value="Office Space">Office Space</option>
                      </select>
                      {errors.propertyType && (
                        <div className="invalid-feedback">
                          {errors.propertyType}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="offerType" className="form-label-txt">
                        Offer Type <span className="text-danger">*</span>
                      </label>
                      <select
                        id="offerType"
                        name="offerType"
                        value={extraData.offerType}
                        onChange={handleExtraChange}
                        className={`form-select ${errors.offerType ? "is-invalid" : ""}`}
                      >
                        <option value="For Rent">For Rent</option>
                        <option value="For Sale">For Sale</option>
                        <option value="Short Let">Short Let</option>
                      </select>
                      {errors.offerType && (
                        <div className="invalid-feedback">
                          {errors.offerType}
                        </div>
                      )}
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="bedrooms" className="form-label-txt">
                        Bedrooms
                      </label>
                      <input
                        id="bedrooms"
                        name="bedrooms"
                        type="number"
                        min="0"
                        className="form-control"
                        value={extraData.bedrooms}
                        onChange={handleExtraChange}
                        placeholder="e.g., 3"
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="bathrooms" className="form-label-txt">
                        Bathrooms
                      </label>
                      <input
                        id="bathrooms"
                        name="bathrooms"
                        type="number"
                        min="0"
                        className="form-control"
                        value={extraData.bathrooms}
                        onChange={handleExtraChange}
                        placeholder="e.g., 2"
                      />
                    </div>

                    <div className="col-md-4">
                      <label htmlFor="furnished" className="form-label-txt">
                        Furnished
                      </label>
                      <select
                        id="furnished"
                        name="furnished"
                        value={extraData.furnished}
                        onChange={handleExtraChange}
                        className="form-select"
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>
                  </>
                )}

                {listingType === "jobs" && (
                  <>
                    <div className="col-md-6">
                      <label htmlFor="companyName" className="form-label-txt">
                        Company Name <span className="text-danger">*</span>
                      </label>
                      <input
                        id="companyName"
                        name="companyName"
                        type="text"
                        value={extraData.companyName}
                        onChange={handleExtraChange}
                        className={`form-control ${errors.companyName ? "is-invalid" : ""}`}
                        placeholder="e.g., Edo Tech Ltd"
                      />
                      {errors.companyName && (
                        <div className="invalid-feedback">
                          {errors.companyName}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="jobType" className="form-label-txt">
                        Job Type <span className="text-danger">*</span>
                      </label>
                      <select
                        id="jobType"
                        name="jobType"
                        value={extraData.jobType}
                        onChange={handleExtraChange}
                        className={`form-select ${errors.jobType ? "is-invalid" : ""}`}
                      >
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Internship">Internship</option>
                      </select>
                      {errors.jobType && (
                        <div className="invalid-feedback">{errors.jobType}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="workMode" className="form-label-txt">
                        Work Mode
                      </label>
                      <select
                        id="workMode"
                        name="workMode"
                        value={extraData.workMode}
                        onChange={handleExtraChange}
                        className="form-select"
                      >
                        <option value="On-site">On-site</option>
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label
                        htmlFor="experienceLevel"
                        className="form-label-txt"
                      >
                        Experience Level
                      </label>
                      <select
                        id="experienceLevel"
                        name="experienceLevel"
                        value={extraData.experienceLevel}
                        onChange={handleExtraChange}
                        className="form-select"
                      >
                        <option value="Entry">Entry</option>
                        <option value="Mid">Mid</option>
                        <option value="Senior">Senior</option>
                      </select>
                    </div>
                  </>
                )}

                {listingType === "events" && (
                  <>
                    <div className="col-md-6">
                      <label htmlFor="eventDate" className="form-label-txt">
                        Event Date <span className="text-danger">*</span>
                      </label>
                      <input
                        id="eventDate"
                        name="eventDate"
                        type="date"
                        value={extraData.eventDate}
                        onChange={handleExtraChange}
                        className={`form-control ${errors.eventDate ? "is-invalid" : ""}`}
                      />
                      {errors.eventDate && (
                        <div className="invalid-feedback">
                          {errors.eventDate}
                        </div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="eventTime" className="form-label-txt">
                        Event Time
                      </label>
                      <input
                        id="eventTime"
                        name="eventTime"
                        type="time"
                        value={extraData.eventTime}
                        onChange={handleExtraChange}
                        className="form-control"
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="venue" className="form-label-txt">
                        Venue <span className="text-danger">*</span>
                      </label>
                      <input
                        id="venue"
                        name="venue"
                        type="text"
                        value={extraData.venue}
                        onChange={handleExtraChange}
                        className={`form-control ${errors.venue ? "is-invalid" : ""}`}
                        placeholder="e.g., Ring Road Hall"
                      />
                      {errors.venue && (
                        <div className="invalid-feedback">{errors.venue}</div>
                      )}
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="organizer" className="form-label-txt">
                        Organizer
                      </label>
                      <input
                        id="organizer"
                        name="organizer"
                        type="text"
                        value={extraData.organizer}
                        onChange={handleExtraChange}
                        className="form-control"
                        placeholder="e.g., EdoFinds Events"
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="ticketType" className="form-label-txt">
                        Ticket Type
                      </label>
                      <select
                        id="ticketType"
                        name="ticketType"
                        value={extraData.ticketType}
                        onChange={handleExtraChange}
                        className="form-select"
                      >
                        <option value="Paid">Paid</option>
                        <option value="Free">Free</option>
                        <option value="Invite Only">Invite Only</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Location */}
                <div className="col-md-6">
                  <label htmlFor="location" className="form-label-txt">
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
                  <label htmlFor="seller_name" className="form-label-txt">
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
                  <label htmlFor="description" className="form-label-txt">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-control"
                    rows="4"
                    placeholder={typeConfig.descriptionPlaceholder}
                  ></textarea>
                </div>

                {/* Submit Buttons */}
                <div className="col-12">
                  <div className="d-flex gap-3">
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Adding Product...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle"></i>
                          {typeConfig.buttonLabel}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => navigate("/admin/products")}
                      disabled={loading}
                    >
                      <i className="bi bi-x-circle"></i>
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
