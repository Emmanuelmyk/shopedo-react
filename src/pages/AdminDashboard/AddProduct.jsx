// ==========================================
// FILE: src/pages/AdminDashboard/AddProduct.jsx
// ==========================================
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import { supabase } from "../../utils/supabaseClient";
import { uploadImage, compressImage } from "../../utils/uploadUtils";
import { CATEGORIES } from "../../utils/categories";
import { LOCATIONS } from "../../utils/locations";
import {
  isPayPerPost,
  hasPostsLeft,
  getPostFeeKobo,
  getPostFeeLabel,
} from "../../utils/subscriptionUtils";
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
  services: {
    key: "services",
    title: "Services",
    icon: "bi-tools",
    subtitle: "Offer your skills and expertise",
    buttonLabel: "Post Service",
    priceLabel: "Rate (Naira)",
    nameLabel: "Service Title",
    namePlaceholder: "e.g., Professional Plumbing Repair",
    descriptionPlaceholder:
      "Describe what you offer, your experience, and tools you use...",
    conditionLabel: "Availability",
    conditionOptions: ["Available", "By Appointment", "Fully Booked"],
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
  services: {
    serviceType: "Plumbing",
    experience: "1-3 years",
    availability: "Weekdays",
  },
};

// Maps app listingType keys → DB listing_type values
const DB_LISTING_TYPE = {
  items: "item",
  houses: "house",
  jobs: "job",
  events: "event",
  services: "service",
};

const normalizeType = (value) => {
  if (!value) return "items";
  if (value === "house") return "houses";
  if (value === "job") return "jobs";
  if (value === "event") return "events";
  if (value === "service") return "services";
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

  if (listingType === "services") {
    return [
      "Listing Type: Service",
      `Service Type: ${extraData.serviceType || "N/A"}`,
      `Experience: ${extraData.experience || "N/A"}`,
      `Availability: ${extraData.availability || "N/A"}`,
      "Search Tags: service plumber electrician cleaning repair carpenter painter",
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
  // imageSlots: array of 3, each null | { file: File, preview: string }
  const [imageSlots, setImageSlots] = useState([null, null, null]);
  const [errors, setErrors] = useState({});
  const [listingType, setListingType] = useState(() =>
    normalizeType(searchParams.get("type")),
  );
  // Pay-per-post state
  const [paidPostRef, setPaidPostRef] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [extraData, setExtraData] = useState({
    ...CATEGORY_PRESETS.houses,
    ...CATEGORY_PRESETS.jobs,
    ...CATEGORY_PRESETS.events,
    ...CATEGORY_PRESETS.services,
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    condition: "Brand New",
    location: "",
  });


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
    setPaidPostRef(null);
    setPaymentLoading(false);
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

  const handleSlotAdd = (e, slotIndex) => {
    const file = e.target.files[0];
    if (!file) return;
    e.target.value = "";

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

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSlots((prev) => {
        const next = [...prev];
        next[slotIndex] = { file, preview: reader.result };
        return next;
      });
      setErrors((prev) => ({ ...prev, image: "" }));
    };
    reader.readAsDataURL(file);
  };

  const handleSlotRemove = (slotIndex) => {
    setImageSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
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

  const handlePaystackPayment = async () => {
    if (!window.PaystackPop) {
      setErrors({ submit: "Payment system is loading. Please try again." });
      return;
    }

    setPaymentLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setErrors({ submit: "Please log in again." });
        setPaymentLoading(false);
        return;
      }

      const feeKobo = getPostFeeKobo(listingType);
      const email = session.user.email;
      const ref = `post_${listingType}_${Date.now()}`;
      const dbListingType = DB_LISTING_TYPE[listingType] ?? listingType;

      // Create a pending post_payment record (use singular DB type to satisfy CHECK constraint)
      const { error: insertError } = await supabase
        .from("post_payments")
        .insert({
          user_id: session.user.id,
          listing_type: dbListingType,
          amount: feeKobo,
          status: "pending",
          paystack_ref: ref,
        });

      if (insertError) {
        setErrors({ submit: `Payment setup failed: ${insertError.message}` });
        setPaymentLoading(false);
        return;
      }

      const handler = window.PaystackPop.setup({
        key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
        email,
        amount: feeKobo,
        currency: "NGN",
        ref,
        callback: (response) => {
          // TODO: Replace with Edge Function verify-payment for production security
          supabase
            .from("post_payments")
            .update({ status: "paid" })
            .eq("paystack_ref", response.reference)
            .then(() => {
              setPaidPostRef(response.reference);
              setErrors((prev) => ({ ...prev, payment: "" }));
              setPaymentLoading(false);
            });
        },
        onClose: () => {
          setPaymentLoading(false);
        },
      });
      handler.openIframe();
    } catch (err) {
      console.error("Paystack payment error:", err);
      setErrors({ submit: `Payment error: ${err?.message || String(err)}` });
      setPaymentLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Pay-per-post: require payment before proceeding
    if (isPayPerPost(listingType) && !paidPostRef) {
      setErrors({
        submit: `A payment of ${getPostFeeLabel(listingType)} is required to post this ${listingType} listing.`,
      });
      return;
    }

    setLoading(true);

    try {
      // CRITICAL: Check authentication before proceeding
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setErrors({
          submit: "You are not authenticated. Please log in again.",
        });
        setLoading(false);
        navigate("/admin/login");
        return;
      }

      // Subscription gate for non-pay-per-post listings
      if (!isPayPerPost(listingType)) {
        const { data: sub } = await supabase
          .from("user_subscriptions")
          .select("*")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (!hasPostsLeft(sub)) {
          setErrors({
            submit: "You've reached your plan's post limit. Upgrade your plan on the Billing page.",
          });
          setLoading(false);
          return;
        }
      }

      // Verify pay-per-post payment record in DB before proceeding
      if (isPayPerPost(listingType)) {
        const { data: payment, error: payErr } = await supabase
          .from("post_payments")
          .select("id, listing_type, product_id")
          .eq("paystack_ref", paidPostRef)
          .eq("user_id", session.user.id)
          .eq("status", "paid")
          .is("product_id", null)
          .maybeSingle();

        if (payErr || !payment) {
          setErrors({
            submit:
              "Payment could not be verified. Please complete the payment and try again.",
          });
          setPaidPostRef(null);
          setLoading(false);
          return;
        }

        if (payment.listing_type !== (DB_LISTING_TYPE[listingType] ?? listingType)) {
          setErrors({
            submit:
              "Payment type mismatch. Please complete a new payment for this listing type.",
          });
          setPaidPostRef(null);
          setLoading(false);
          return;
        }
      }

      // Upload all filled image slots
      const uploadedPaths = [];
      for (const slot of imageSlots) {
        if (!slot) continue;
        const compressed = await compressImage(slot.file);
        const uploadResult = await uploadImage(compressed, "products");
        if (!uploadResult.success) {
          setErrors({ image: uploadResult.error });
          setLoading(false);
          return;
        }
        uploadedPaths.push(uploadResult.path);
      }
      const imgPath =
        uploadedPaths.length > 0 ? JSON.stringify(uploadedPaths) : null;

      const sellerName =
        session.user.user_metadata?.full_name ||
        session.user.user_metadata?.name ||
        session.user.email?.split("@")[0] ||
        "Seller";

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
        listing_type: DB_LISTING_TYPE[listingType] ?? "item",
        seller_name: sellerName,
        seller_id: session.user.id,
        img_path: imgPath,
      };

      const { data, error } = await supabase
        .from("products")
        .insert([productData])
        .select();

      if (error) throw error;

      // Increment posts_used for subscription-gated listings
      if (!isPayPerPost(listingType)) {
        const { data: sub } = await supabase
          .from("user_subscriptions")
          .select("posts_used")
          .eq("user_id", session.user.id)
          .maybeSingle();
        if (sub) {
          await supabase
            .from("user_subscriptions")
            .update({ posts_used: (sub.posts_used ?? 0) + 1 })
            .eq("user_id", session.user.id);
        }
      }

      // Link pay-per-post payment to the inserted product
      if (isPayPerPost(listingType) && paidPostRef && data?.[0]?.id) {
        await supabase
          .from("post_payments")
          .update({ product_id: data[0].id })
          .eq("paystack_ref", paidPostRef);
      }

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
                {/* Image Upload — up to 3 photos */}
                <div className="col-12">
                  <label className="form-label-txt">
                    <i className="bi bi-images"></i>
                    Product Photos
                    <span className="form-label-hint">
                      (up to 3 · first is the main photo)
                    </span>
                  </label>
                  <div className="image-slots-grid">
                    {imageSlots.map((slot, idx) => (
                      <div
                        key={idx}
                        className={`image-slot ${slot ? "image-slot--filled" : "image-slot--empty"}`}
                      >
                        {slot ? (
                          <>
                            <img
                              src={slot.preview}
                              alt={`Photo ${idx + 1}`}
                              className="image-slot-preview"
                            />
                            {idx === 0 && (
                              <span className="image-slot-main-badge">
                                Main
                              </span>
                            )}
                            <button
                              type="button"
                              className="image-slot-remove"
                              onClick={() => handleSlotRemove(idx)}
                              aria-label="Remove photo"
                            >
                              <i className="bi bi-x-lg"></i>
                            </button>
                          </>
                        ) : (
                          <>
                            <input
                              type="file"
                              id={`image-slot-${idx}`}
                              accept="image/*"
                              onChange={(e) => handleSlotAdd(e, idx)}
                              className="d-none"
                            />
                            <label
                              htmlFor={`image-slot-${idx}`}
                              className="image-slot-add-label"
                            >
                              <i className="bi bi-plus-lg"></i>
                              <span>
                                {idx === 0 ? "Main photo" : "Add photo"}
                              </span>
                            </label>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  {errors.image && (
                    <div className="invalid-feedback d-block mt-2">
                      {errors.image}
                    </div>
                  )}
                  <p className="form-helper-text mt-2">
                    <i className="bi bi-info-circle"></i>
                    Max 5MB each · JPEG, PNG, or WebP
                  </p>
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
                        placeholder="e.g., Nearbuy Events"
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

                {listingType === "services" && (
                  <>
                    <div className="col-md-6">
                      <label htmlFor="serviceType" className="form-label-txt">
                        Service Type
                      </label>
                      <select
                        id="serviceType"
                        name="serviceType"
                        value={extraData.serviceType}
                        onChange={handleExtraChange}
                        className="form-select"
                      >
                        <option value="Plumbing">Plumbing</option>
                        <option value="Electrical">Electrical</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Carpentry">Carpentry</option>
                        <option value="Painting">Painting</option>
                        <option value="Catering">Catering</option>
                        <option value="Photography">Photography</option>
                        <option value="Security">Security</option>
                        <option value="Laundry">Laundry</option>
                        <option value="Tutoring">Tutoring</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="experience" className="form-label-txt">
                        Experience
                      </label>
                      <select
                        id="experience"
                        name="experience"
                        value={extraData.experience}
                        onChange={handleExtraChange}
                        className="form-select"
                      >
                        <option value="Under 1 year">Under 1 year</option>
                        <option value="1-3 years">1-3 years</option>
                        <option value="3-5 years">3-5 years</option>
                        <option value="5+ years">5+ years</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="availability" className="form-label-txt">
                        Availability
                      </label>
                      <select
                        id="availability"
                        name="availability"
                        value={extraData.availability}
                        onChange={handleExtraChange}
                        className="form-select"
                      >
                        <option value="Weekdays">Weekdays</option>
                        <option value="Weekends">Weekends</option>
                        <option value="Both">Both</option>
                        <option value="24/7">24/7</option>
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

                {/* Pay-Per-Post Payment Banner */}
                {isPayPerPost(listingType) && (
                  <div className="col-12">
                    {paidPostRef ? (
                      <div className="alert alert-success d-flex align-items-center gap-2 mb-0">
                        <i className="bi bi-check-circle-fill"></i>
                        <span>
                          Payment confirmed ({getPostFeeLabel(listingType)}). You can now submit your listing.
                        </span>
                      </div>
                    ) : (
                      <div className="pay-banner">
                        <div className="pay-banner-info">
                          <i className="bi bi-credit-card-fill"></i>
                          <div>
                            <strong>Payment required to post</strong>
                            <p className="mb-0">
                              {listingType.charAt(0).toUpperCase() + listingType.slice(1)} listings
                              cost <strong>{getPostFeeLabel(listingType)}</strong> per post.{" "}
                              <Link to="/admin/billing" className="pay-banner-link">
                                View plans
                              </Link>
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-warning pay-banner-btn"
                          onClick={handlePaystackPayment}
                          disabled={paymentLoading}
                        >
                          {paymentLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                              Processing…
                            </>
                          ) : (
                            <>
                              <i className="bi bi-lock-fill me-1"></i>
                              Pay {getPostFeeLabel(listingType)}
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="col-12">
                  <div className="d-flex gap-3">
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={loading || (isPayPerPost(listingType) && !paidPostRef)}
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
