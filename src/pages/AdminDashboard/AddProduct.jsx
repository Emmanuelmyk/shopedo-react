// ==========================================
// FILE: src/pages/AdminDashboard/AddProduct.jsx
// ==========================================
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import CustomSelect from "../../components/CustomSelect/CustomSelect";
import { supabase } from "../../utils/supabaseClient";
import { uploadImage, compressImage } from "../../utils/uploadUtils";
import { CATEGORIES } from "../../utils/categories";
import { LOCATIONS } from "../../utils/locations";
import {
  isPayPerPost,
  getPostFeeKobo,
  getPostFeeLabel,
} from "../../utils/subscriptionUtils";
import "./ProductForm.css";

const formatPriceDisplay = (raw) => {
  if (raw === "" || raw == null) return "";
  const str = String(raw).replace(/,/g, "");
  const [integer, decimal] = str.split(".");
  const formatted = integer === "" ? "" : Number(integer).toLocaleString("en-NG");
  return decimal !== undefined ? `${formatted}.${decimal}` : formatted;
};

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

const STEPS = [
  { id: 1, label: "Listing Type",  icon: "bi-tag" },
  { id: 2, label: "Basic Details", icon: "bi-pencil-square" },
  { id: 3, label: "More Details",  icon: "bi-sliders" },
  { id: 4, label: "Review & Post", icon: "bi-send-check" },
];

const ReviewRow = ({ label, value }) => (
  <div className="review-row">
    <span className="review-label">{label}</span>
    <span className="review-value">{value || <em className="text-muted">—</em>}</span>
  </div>
);

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
  const [currentStep, setCurrentStep] = useState(1);
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

  // items skips step 3 (no extra fields)
  const getNextStep = (from) => {
    if (from === 2 && listingType === "items") return 4;
    return Math.min(from + 1, 4);
  };
  const getPrevStep = (from) => {
    if (from === 4 && listingType === "items") return 2;
    return Math.max(from - 1, 1);
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = `${typeConfig.nameLabel} is required`;
    if (!formData.price || formData.price <= 0) newErrors.price = "Enter a valid amount";
    if (!typeConfig.lockCategory && !formData.category_id) newErrors.category_id = "Category is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors = {};
    if (listingType === "houses") {
      if (!extraData.propertyType.trim()) newErrors.propertyType = "Property type is required";
      if (!extraData.offerType.trim()) newErrors.offerType = "Offer type is required";
    }
    if (listingType === "jobs") {
      if (!extraData.companyName.trim()) newErrors.companyName = "Company name is required";
      if (!extraData.jobType.trim()) newErrors.jobType = "Job type is required";
    }
    if (listingType === "events") {
      if (!extraData.eventDate) newErrors.eventDate = "Event date is required";
      if (!extraData.venue.trim()) newErrors.venue = "Venue is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    setCurrentStep((s) => getNextStep(s));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setCurrentStep((s) => getPrevStep(s));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleListingTypeChange = (type) => {
    setListingType(type);
    setErrors({});
    setPaidPostRef(null);
    setPaymentLoading(false);
    setSearchParams(type === "items" ? {} : { type });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const clean = name === "price" ? value.replace(/,/g, "") : value;
    setFormData((prev) => ({ ...prev, [name]: clean }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Adapter so CustomSelect (value-only) can set formData fields
  const makeFormSetter = (name) => (val) => {
    setFormData((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Adapter for extraData fields
  const makeExtraSetter = (name) => (val) => {
    setExtraData((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
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

    if (!validateStep2() || !validateStep3()) {
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
          .eq("status", "active")
          .maybeSingle();

        // Count actual quota posts — exclude pay-per-post types, include nulls
        const { count: actualCount } = await supabase
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("seller_id", session.user.id)
          .not("listing_type", "in", "(job,event,service)");

        const postsUsed = actualCount ?? 0;
        const postsLimit = sub?.posts_limit ?? 3;
        const unlimited = sub?.posts_limit === -1;

        if (!unlimited && postsUsed >= postsLimit) {
          setErrors({
            submit: "PLAN_LIMIT_REACHED",
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
          .eq("status", "active")
          .maybeSingle();
        if (sub) {
          await supabase
            .from("user_subscriptions")
            .update({ posts_used: (sub.posts_used ?? 0) + 1 })
            .eq("user_id", session.user.id)
            .eq("status", "active");
        } else {
          // No subscription row exists yet — create the free plan row
          // with posts_used already at 1 for this post
          await supabase.from("user_subscriptions").insert({
            user_id: session.user.id,
            plan: "free",
            status: "active",
            posts_used: 1,
            posts_limit: 3,
          });
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

  // Step status helper
  const stepStatus = (stepId) => {
    if (stepId === currentStep) return "active";
    if (stepId < currentStep) return "completed";
    // step 3 is skipped for items
    if (stepId === 3 && listingType === "items") return "skipped";
    return "";
  };

  return (
    <AdminLayout pageTitle="Post Listing">
      <div className="product-form-container">

        {/* ── Wizard Bar ── */}
        <div className="wizard-bar">
          {STEPS.map((step, idx) => {
            const status = stepStatus(step.id);
            const isSkipped = status === "skipped";
            return (
              <div key={step.id} className="wizard-step-wrap">
                {idx > 0 && (
                  <div className={`wizard-connector${step.id <= currentStep && !isSkipped ? " wizard-connector--done" : ""}`} />
                )}
                <div className={`wizard-step wizard-step--${status || "pending"}`}>
                  <div className="wizard-step-circle">
                    {status === "completed"
                      ? <i className="bi bi-check-lg"></i>
                      : <i className={`bi ${step.icon}`}></i>}
                  </div>
                  <span className="wizard-step-label">{step.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubmit}>
          {/* ── Step 1: Listing Type ── */}
          {currentStep === 1 && (
            <div className="wizard-pane">
              <section className="listing-type-section">
                <div className="listing-type-head">
                  <h2>What do you want to post?</h2>
                  <p>Select a flow tailored for that listing category.</p>
                </div>
                <div className="listing-type-grid">
                  {Object.values(LISTING_TYPES).map((type) => (
                    <button
                      key={type.key}
                      type="button"
                      className={`listing-type-card${listingType === type.key ? " active" : ""} ${type.key}-type`}
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
            </div>
          )}

          {/* ── Step 2: Basic Details ── */}
          {currentStep === 2 && (
            <div className="wizard-pane">
              <div className="card">
                <div className="card-body">
                  <div className="row g-4">
                    {/* Image Upload */}
                    <div className="col-12">
                      <label className="form-label-txt">
                        <i className="bi bi-images"></i>
                        Product Photos
                        <span className="form-label-hint">(up to 3 · first is the main photo)</span>
                      </label>
                      <div className="image-slots-grid">
                        {imageSlots.map((slot, idx) => (
                          <div key={idx} className={`image-slot ${slot ? "image-slot--filled" : "image-slot--empty"}`}>
                            {slot ? (
                              <>
                                <img src={slot.preview} alt={`Photo ${idx + 1}`} className="image-slot-preview" />
                                {idx === 0 && <span className="image-slot-main-badge">Main</span>}
                                <button type="button" className="image-slot-remove" onClick={() => handleSlotRemove(idx)} aria-label="Remove photo">
                                  <i className="bi bi-x-lg"></i>
                                </button>
                              </>
                            ) : (
                              <>
                                <input type="file" id={`image-slot-${idx}`} accept="image/*" onChange={(e) => handleSlotAdd(e, idx)} className="d-none" />
                                <label htmlFor={`image-slot-${idx}`} className="image-slot-add-label">
                                  <i className="bi bi-plus-lg"></i>
                                  <span>{idx === 0 ? "Main photo" : "Add photo"}</span>
                                </label>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                      {errors.image && <div className="invalid-feedback d-block mt-2">{errors.image}</div>}
                      <p className="form-helper-text mt-2">
                        <i className="bi bi-info-circle"></i> Max 5MB each · JPEG, PNG, or WebP
                      </p>
                    </div>

                    {/* Name */}
                    <div className="col-md-6">
                      <label htmlFor="name" className="form-label-txt">
                        {typeConfig.nameLabel} <span className="text-danger">*</span>
                      </label>
                      <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange}
                        className={`form-control ${errors.name ? "is-invalid" : ""}`} placeholder={typeConfig.namePlaceholder} />
                      {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                    </div>

                    {/* Price */}
                    <div className="col-md-6">
                      <label htmlFor="price" className="form-label-txt">
                        {typeConfig.priceLabel} <span className="text-danger">*</span>
                      </label>
                      <div className="price-input-wrap">
                        <span className="price-input-prefix">₦</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          id="price"
                          name="price"
                          value={formatPriceDisplay(formData.price)}
                          onChange={handleInputChange}
                          className={`form-control price-input ${errors.price ? "is-invalid" : ""}`}
                          placeholder="e.g., 50,000"
                        />
                      </div>
                      {errors.price && <div className="invalid-feedback d-block">{errors.price}</div>}
                    </div>

                    {/* Category */}
                    <div className="col-md-6">
                      <label className="form-label-txt">
                        Category <span className="text-danger">*</span>
                      </label>
                      <CustomSelect
                        value={String(formData.category_id)}
                        onChange={makeFormSetter("category_id")}
                        icon="bi-grid"
                        options={[
                          { value: "", label: "Select a category" },
                          ...CATEGORIES.map((c) => ({ value: String(c.id), label: c.name })),
                        ]}
                      />
                      {errors.category_id && <div className="invalid-feedback d-block">{errors.category_id}</div>}
                    </div>

                    {/* Condition */}
                    <div className="col-md-6">
                      <label className="form-label-txt">
                        {typeConfig.conditionLabel} <span className="text-danger">*</span>
                      </label>
                      <CustomSelect
                        value={formData.condition}
                        onChange={makeFormSetter("condition")}
                        icon="bi-tag"
                        options={typeConfig.conditionOptions.map((o) => ({ value: o, label: o }))}
                      />
                    </div>

                    {/* Location */}
                    <div className="col-md-6">
                      <label className="form-label-txt">
                        Location <span className="text-danger">*</span>
                      </label>
                      <CustomSelect
                        value={formData.location}
                        onChange={makeFormSetter("location")}
                        icon="bi-geo-alt"
                        options={[
                          { value: "", label: "Select a location" },
                          ...LOCATIONS.map((l) => ({ value: l, label: l })),
                        ]}
                      />
                      {errors.location && <div className="invalid-feedback d-block">{errors.location}</div>}
                    </div>

                    {/* Description */}
                    <div className="col-12">
                      <label htmlFor="description" className="form-label-txt">Description</label>
                      <textarea id="description" name="description" value={formData.description} onChange={handleInputChange}
                        className="form-control" rows="4" placeholder={typeConfig.descriptionPlaceholder}></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: More Details (skipped for items) ── */}
          {currentStep === 3 && listingType !== "items" && (
            <div className="wizard-pane">
              <div className="card">
                <div className="card-body">
                  <div className="row g-4">
                    {listingType === "houses" && (
                      <>
                        <div className="col-md-6">
                          <label className="form-label-txt">Property Type <span className="text-danger">*</span></label>
                          <CustomSelect value={extraData.propertyType} onChange={makeExtraSetter("propertyType")} icon="bi-building"
                            options={["Apartment","Self Contain","Duplex","Bungalow","Land","Office Space"].map((o) => ({ value: o, label: o }))} />
                          {errors.propertyType && <div className="invalid-feedback d-block">{errors.propertyType}</div>}
                        </div>
                        <div className="col-md-6">
                          <label className="form-label-txt">Offer Type <span className="text-danger">*</span></label>
                          <CustomSelect value={extraData.offerType} onChange={makeExtraSetter("offerType")} icon="bi-house-check"
                            options={["For Rent","For Sale","Short Let"].map((o) => ({ value: o, label: o }))} />
                          {errors.offerType && <div className="invalid-feedback d-block">{errors.offerType}</div>}
                        </div>
                        <div className="col-md-4">
                          <label htmlFor="bedrooms" className="form-label-txt">Bedrooms</label>
                          <input id="bedrooms" name="bedrooms" type="number" min="0" className="form-control" value={extraData.bedrooms} onChange={handleExtraChange} placeholder="e.g., 3" />
                        </div>
                        <div className="col-md-4">
                          <label htmlFor="bathrooms" className="form-label-txt">Bathrooms</label>
                          <input id="bathrooms" name="bathrooms" type="number" min="0" className="form-control" value={extraData.bathrooms} onChange={handleExtraChange} placeholder="e.g., 2" />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label-txt">Furnished</label>
                          <CustomSelect value={extraData.furnished} onChange={makeExtraSetter("furnished")} icon="bi-house-gear"
                            options={["Yes","No"].map((o) => ({ value: o, label: o }))} />
                        </div>
                      </>
                    )}

                    {listingType === "jobs" && (
                      <>
                        <div className="col-md-6">
                          <label htmlFor="companyName" className="form-label-txt">Company Name <span className="text-danger">*</span></label>
                          <input id="companyName" name="companyName" type="text" value={extraData.companyName} onChange={handleExtraChange}
                            className={`form-control ${errors.companyName ? "is-invalid" : ""}`} placeholder="e.g., Edo Tech Ltd" />
                          {errors.companyName && <div className="invalid-feedback">{errors.companyName}</div>}
                        </div>
                        <div className="col-md-6">
                          <label className="form-label-txt">Job Type <span className="text-danger">*</span></label>
                          <CustomSelect value={extraData.jobType} onChange={makeExtraSetter("jobType")} icon="bi-briefcase"
                            options={["Full-time","Part-time","Contract","Internship"].map((o) => ({ value: o, label: o }))} />
                          {errors.jobType && <div className="invalid-feedback d-block">{errors.jobType}</div>}
                        </div>
                        <div className="col-md-6">
                          <label className="form-label-txt">Work Mode</label>
                          <CustomSelect value={extraData.workMode} onChange={makeExtraSetter("workMode")} icon="bi-laptop"
                            options={["On-site","Remote","Hybrid"].map((o) => ({ value: o, label: o }))} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label-txt">Experience Level</label>
                          <CustomSelect value={extraData.experienceLevel} onChange={makeExtraSetter("experienceLevel")} icon="bi-bar-chart"
                            options={["Entry","Mid","Senior"].map((o) => ({ value: o, label: o }))} />
                        </div>
                      </>
                    )}

                    {listingType === "events" && (
                      <>
                        <div className="col-md-6">
                          <label htmlFor="eventDate" className="form-label-txt">Event Date <span className="text-danger">*</span></label>
                          <input id="eventDate" name="eventDate" type="date" value={extraData.eventDate} onChange={handleExtraChange}
                            className={`form-control ${errors.eventDate ? "is-invalid" : ""}`} />
                          {errors.eventDate && <div className="invalid-feedback">{errors.eventDate}</div>}
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="eventTime" className="form-label-txt">Event Time</label>
                          <input id="eventTime" name="eventTime" type="time" value={extraData.eventTime} onChange={handleExtraChange} className="form-control" />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="venue" className="form-label-txt">Venue <span className="text-danger">*</span></label>
                          <input id="venue" name="venue" type="text" value={extraData.venue} onChange={handleExtraChange}
                            className={`form-control ${errors.venue ? "is-invalid" : ""}`} placeholder="e.g., Ring Road Hall" />
                          {errors.venue && <div className="invalid-feedback">{errors.venue}</div>}
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="organizer" className="form-label-txt">Organizer</label>
                          <input id="organizer" name="organizer" type="text" value={extraData.organizer} onChange={handleExtraChange} className="form-control" placeholder="e.g., Nearbuy Events" />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label-txt">Ticket Type</label>
                          <CustomSelect value={extraData.ticketType} onChange={makeExtraSetter("ticketType")} icon="bi-ticket-perforated"
                            options={["Paid","Free","Invite Only"].map((o) => ({ value: o, label: o }))} />
                        </div>
                      </>
                    )}

                    {listingType === "services" && (
                      <>
                        <div className="col-md-6">
                          <label className="form-label-txt">Service Type</label>
                          <CustomSelect value={extraData.serviceType} onChange={makeExtraSetter("serviceType")} icon="bi-tools"
                            options={["Plumbing","Electrical","Cleaning","Carpentry","Painting","Catering","Photography","Security","Laundry","Tutoring","Other"].map((o) => ({ value: o, label: o }))} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label-txt">Experience</label>
                          <CustomSelect value={extraData.experience} onChange={makeExtraSetter("experience")} icon="bi-clock-history"
                            options={["Under 1 year","1-3 years","3-5 years","5+ years"].map((o) => ({ value: o, label: o }))} />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label-txt">Availability</label>
                          <CustomSelect value={extraData.availability} onChange={makeExtraSetter("availability")} icon="bi-calendar-check"
                            options={["Weekdays","Weekends","Both","24/7"].map((o) => ({ value: o, label: o }))} />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Review & Post ── */}
          {currentStep === 4 && (
            <div className="wizard-pane">
              <div className="review-card">
                <div className="review-header">
                  <i className={`bi ${typeConfig.icon}`}></i>
                  <div>
                    <h3>{typeConfig.title} Listing</h3>
                    <p>Review your details before submitting</p>
                  </div>
                </div>
                <div className="review-grid">
                  <ReviewRow label="Title" value={formData.name} />
                  <ReviewRow label={typeConfig.priceLabel} value={formData.price ? `₦${Number(formData.price).toLocaleString()}` : ""} />
                  <ReviewRow label={typeConfig.conditionLabel} value={formData.condition} />
                  <ReviewRow label="Location" value={formData.location} />
                  {formData.description && <ReviewRow label="Description" value={formData.description} />}

                  {listingType === "houses" && (
                    <>
                      <ReviewRow label="Property Type" value={extraData.propertyType} />
                      <ReviewRow label="Offer Type" value={extraData.offerType} />
                      {extraData.bedrooms && <ReviewRow label="Bedrooms" value={extraData.bedrooms} />}
                      {extraData.bathrooms && <ReviewRow label="Bathrooms" value={extraData.bathrooms} />}
                      <ReviewRow label="Furnished" value={extraData.furnished} />
                    </>
                  )}
                  {listingType === "jobs" && (
                    <>
                      <ReviewRow label="Company" value={extraData.companyName} />
                      <ReviewRow label="Job Type" value={extraData.jobType} />
                      <ReviewRow label="Work Mode" value={extraData.workMode} />
                      <ReviewRow label="Experience Level" value={extraData.experienceLevel} />
                    </>
                  )}
                  {listingType === "events" && (
                    <>
                      <ReviewRow label="Event Date" value={extraData.eventDate} />
                      <ReviewRow label="Event Time" value={extraData.eventTime} />
                      <ReviewRow label="Venue" value={extraData.venue} />
                      <ReviewRow label="Organizer" value={extraData.organizer} />
                      <ReviewRow label="Ticket Type" value={extraData.ticketType} />
                    </>
                  )}
                  {listingType === "services" && (
                    <>
                      <ReviewRow label="Service Type" value={extraData.serviceType} />
                      <ReviewRow label="Experience" value={extraData.experience} />
                      <ReviewRow label="Availability" value={extraData.availability} />
                    </>
                  )}
                </div>

                {/* Image previews */}
                {imageSlots.some(Boolean) && (
                  <div className="review-photos">
                    {imageSlots.map((slot, idx) =>
                      slot ? <img key={idx} src={slot.preview} alt={`Photo ${idx + 1}`} className="review-thumb" /> : null
                    )}
                  </div>
                )}
              </div>

              {/* Pay-per-post banner */}
              {isPayPerPost(listingType) && (
                <div className="mt-3">
                  {paidPostRef ? (
                    <div className="alert alert-success d-flex align-items-center gap-2 mb-0">
                      <i className="bi bi-check-circle-fill"></i>
                      <span>Payment confirmed ({getPostFeeLabel(listingType)}). You can now submit your listing.</span>
                    </div>
                  ) : (
                    <div className="pay-banner">
                      <div className="pay-banner-info">
                        <i className="bi bi-credit-card-fill"></i>
                        <div>
                          <strong>Payment required to post</strong>
                          <p className="mb-0">
                            {listingType.charAt(0).toUpperCase() + listingType.slice(1)} listings cost{" "}
                            <strong>{getPostFeeLabel(listingType)}</strong> per post.{" "}
                            <Link to="/admin/billing" className="pay-banner-link">View plans</Link>
                          </p>
                        </div>
                      </div>
                      <button type="button" className="btn btn-warning pay-banner-btn" onClick={handlePaystackPayment} disabled={paymentLoading}>
                        {paymentLoading ? (
                          <><span className="spinner-border spinner-border-sm me-1" role="status"></span>Processing…</>
                        ) : (
                          <><i className="bi bi-lock-fill me-1"></i>Pay {getPostFeeLabel(listingType)}</>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {errors.submit && (
                <div className="alert alert-danger mt-3" role="alert">
                  {errors.submit === "PLAN_LIMIT_REACHED" ? (
                    <>
                      You&apos;ve reached your plan&apos;s post limit.{" "}
                      <Link to="/admin/billing" className="alert-link">
                        Upgrade your plan
                      </Link>{" "}
                      to keep listing.
                    </>
                  ) : errors.submit}
                </div>
              )}
            </div>
          )}

          {/* ── Wizard Nav ── */}
          <div className="wizard-nav">
            {currentStep > 1 ? (
              <button type="button" className="wizard-btn-back" onClick={handleBack} disabled={loading}>
                <i className="bi bi-arrow-left me-1"></i> Back
              </button>
            ) : (
              <button type="button" className="wizard-btn-back" onClick={() => navigate("/admin/products")} disabled={loading}>
                <i className="bi bi-x me-1"></i> Cancel
              </button>
            )}

            {currentStep < 4 ? (
              <button type="button" className="wizard-btn-next" onClick={handleNext}>
                Next <i className="bi bi-arrow-right ms-1"></i>
              </button>
            ) : (
              <button type="submit" className="wizard-btn-submit" disabled={loading || (isPayPerPost(listingType) && !paidPostRef)}>
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-1" role="status"></span>Submitting…</>
                ) : (
                  <><i className="bi bi-check-circle me-1"></i>{typeConfig.buttonLabel}</>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddProduct;
