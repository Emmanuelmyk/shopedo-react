// ==========================================
// FILE: src/pages/ProductDetail/ProductDetail.jsx
// ==========================================
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AppLayout from "../../components/AppLayout/AppLayout";
import SafeImage from "../../components/SafeImage/SafeImage";
import ProductCard from "../../components/ProductCard/ProductCard";
import ProductSkeleton from "../../components/Skeleton/ProductSkeleton";
import DetailSkeleton from "../../components/Skeleton/DetailSkeleton";
import EmptyState from "../../components/EmptyState/EmptyState";
import Button from "../../components/Button/Button";
import Toast from "../../components/Toast/Toast";
import { supabase } from "../../utils/supabaseClient";
import { useWishlistContext } from "../../contexts/WishlistContext";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { useImageObserver } from "../../hooks/useImageObserver";
import { escapeHtml, formatNumber, formatDate } from "../../utils/formatUtils";
import {
  getPublicUrlFromPath,
  getSellerProfileUrl,
  parseImgPaths,
} from "../../utils/imageUtils";
import { getCategoryName, getCategoryIcon } from "../../utils/categories";
import NotFound from "../NotFound/NotFound";
import "./ProductDetail.css";

const RELATED_PAGE_SIZE = 12;

// Parse embedded metadata appended to the description field.
// Format when description exists:  "[user text]\n\n---\nListing Type: X\nKey: Value\n..."
// Format when no description:       "Listing Type: X\nKey: Value\n..."
const parseListingMetadata = (description) => {
  if (!description) return { listingType: "Item", meta: {}, cleanDescription: "" };

  const parseMetaBlock = (block) => {
    const meta = {};
    block.split("\n").forEach((line) => {
      const colonIdx = line.indexOf(":");
      if (colonIdx > 0) {
        const key = line.substring(0, colonIdx).trim();
        const value = line.substring(colonIdx + 1).trim();
        if (key !== "Search Tags") meta[key] = value;
      }
    });
    return meta;
  };

  // Case 1: has separator "---"
  const separatorMarker = "\n\n---\n";
  const sepIdx = description.indexOf(separatorMarker);
  if (sepIdx !== -1) {
    const cleanDescription = description.substring(0, sepIdx).trim();
    const metaBlock = description.substring(sepIdx + separatorMarker.length);
    const meta = parseMetaBlock(metaBlock);
    return { listingType: meta["Listing Type"] || "Item", meta, cleanDescription };
  }

  // Case 2: no user description — metadata starts directly with "Listing Type:"
  if (description.trimStart().startsWith("Listing Type:")) {
    const meta = parseMetaBlock(description);
    return { listingType: meta["Listing Type"] || "Item", meta, cleanDescription: "" };
  }

  return { listingType: "Item", meta: {}, cleanDescription: description };
};

// Category-specific labels for UI elements
const getCategoryLabels = (listingType) => {
  switch (listingType) {
    case "Job":
      return {
        priceLabel: "Salary",
        contactBtn: "Contact Employer",
        sellerSection: "Employer Information",
        conditionLabel: "Status",
        detailsTitle: "Job Details",
      };
    case "House":
      return {
        priceLabel: "Price",
        contactBtn: "Contact Agent",
        sellerSection: "Agent / Landlord",
        conditionLabel: "Offer",
        detailsTitle: "Property Details",
      };
    case "Event":
      return {
        priceLabel: "Ticket Price",
        contactBtn: "Contact Organizer",
        sellerSection: "Organizer Information",
        conditionLabel: "Status",
        detailsTitle: "Event Details",
      };
    case "Service":
      return {
        priceLabel: "Rate",
        contactBtn: "Contact Provider",
        sellerSection: "Provider Information",
        conditionLabel: "Availability",
        detailsTitle: "Service Details",
      };
    default:
      return {
        priceLabel: null,
        contactBtn: "Contact Seller",
        sellerSection: "Seller Information",
        conditionLabel: "Condition",
        detailsTitle: "Product Details",
      };
  }
};

// Build the info items array for the category-specific grid
const buildInfoItems = (listingType, meta, condition, location) => {
  const items = [];

  if (listingType === "House") {
    if (meta["Property Type"])
      items.push({ icon: "bi-house-door", label: "Property Type", value: meta["Property Type"] });
    if (meta["Offer Type"] || condition)
      items.push({ icon: "bi-tag", label: "Offer", value: meta["Offer Type"] || condition });
    if (meta["Bedrooms"])
      items.push({ icon: "bi-door-closed", label: "Bedrooms", value: meta["Bedrooms"] });
    if (meta["Bathrooms"])
      items.push({ icon: "bi-droplet", label: "Bathrooms", value: meta["Bathrooms"] });
    if (meta["Furnished"])
      items.push({ icon: "bi-lamp", label: "Furnished", value: meta["Furnished"] });
    if (location)
      items.push({ icon: "bi-geo-alt", label: "Location", value: location });
  } else if (listingType === "Job") {
    if (meta["Company"])
      items.push({ icon: "bi-building", label: "Company", value: meta["Company"] });
    if (meta["Job Type"])
      items.push({ icon: "bi-briefcase", label: "Job Type", value: meta["Job Type"] });
    if (meta["Work Mode"])
      items.push({ icon: "bi-laptop", label: "Work Mode", value: meta["Work Mode"] });
    if (meta["Experience Level"])
      items.push({ icon: "bi-bar-chart-steps", label: "Experience", value: meta["Experience Level"] });
    if (condition)
      items.push({ icon: "bi-hourglass-split", label: "Status", value: condition });
    if (location)
      items.push({ icon: "bi-geo-alt", label: "Location", value: location });
  } else if (listingType === "Event") {
    if (meta["Event Date"])
      items.push({ icon: "bi-calendar-event", label: "Date", value: meta["Event Date"] });
    if (meta["Event Time"])
      items.push({ icon: "bi-clock", label: "Time", value: meta["Event Time"] });
    if (meta["Venue"])
      items.push({ icon: "bi-pin-map", label: "Venue", value: meta["Venue"] });
    if (meta["Organizer"])
      items.push({ icon: "bi-person-badge", label: "Organizer", value: meta["Organizer"] });
    if (meta["Ticket Type"])
      items.push({ icon: "bi-ticket-perforated", label: "Ticket", value: meta["Ticket Type"] });
    if (condition)
      items.push({ icon: "bi-broadcast", label: "Status", value: condition });
  } else if (listingType === "Service") {
    if (meta["Service Type"])
      items.push({ icon: "bi-tools", label: "Service Type", value: meta["Service Type"] });
    if (meta["Experience"])
      items.push({ icon: "bi-award", label: "Experience", value: meta["Experience"] });
    if (meta["Availability"])
      items.push({ icon: "bi-calendar-check", label: "Availability", value: meta["Availability"] });
    if (condition)
      items.push({ icon: "bi-circle-fill", label: "Status", value: condition });
    if (location)
      items.push({ icon: "bi-geo-alt", label: "Location", value: location });
  }

  return items;
};

const ProductDetail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get("id");

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedOffset, setRelatedOffset] = useState(0);
  const [showSellerPhone, setShowSellerPhone] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setActiveImgIndex(0);
  }, [productId]);

  const { toggleWishlist, isInWishlist } = useWishlistContext();
  const { observe: observeImage } = useImageObserver(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setShowSellerPhone(false);
      setRelatedProducts([]);
      setRelatedOffset(0);

      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .single();

        if (error || !data) {
          console.error("Error fetching product:", error);
          setProduct(null);
        } else {
          setProduct(data);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const loadMoreRelatedProducts = useCallback(async () => {
    if (!product) return false;

    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, description, price, category_id, img_path, condition, location, created_at",
        )
        .eq("category_id", product.category_id)
        .neq("id", product.id)
        .order("id", { ascending: false })
        .range(relatedOffset, relatedOffset + RELATED_PAGE_SIZE - 1);

      if (error) {
        console.error("Error fetching related products:", error);
        return false;
      }

      if (!data || data.length === 0) {
        return false;
      }

      setRelatedProducts((prev) => [...prev, ...data]);
      setRelatedOffset((prev) => prev + data.length);

      return data.length === RELATED_PAGE_SIZE;
    } catch (err) {
      console.error("Error loading related products:", err);
      return false;
    }
  }, [product, relatedOffset]);

  useEffect(() => {
    if (!product) return;
    setRelatedProducts([]);
    setRelatedOffset(0);
  }, [product?.id]);

  const { sentinelRef: relatedSentinelRef, loading: relatedLoading } =
    useInfiniteScroll(loadMoreRelatedProducts, {
      enabled: !!product,
    });

  const handleContactSeller = () => {
    setShowSellerPhone(true);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleToggleWishlist = (product) => {
    const wasAdded = toggleWishlist(product);
    if (wasAdded) {
      setToastMessage("✓ Added to wishlist!");
    } else {
      setToastMessage("✓ Removed from wishlist");
    }
    setShowToast(true);
  };

  if (loading) {
    return (
      <AppLayout activeCategory="all">
        <main>
          <div className="container px-3" id="product-detail-container">
            <DetailSkeleton />
          </div>
        </main>
      </AppLayout>
    );
  }

  if (!product) {
    return (
      <NotFound
        message={
          productId
            ? "This listing doesn't exist or may have been removed by the seller."
            : "No product ID was provided. Please go back and try again."
        }
      />
    );
  }

  const imagePaths = parseImgPaths(product.img_path);
  const activeImageUrl = imagePaths[activeImgIndex]
    ? getPublicUrlFromPath(imagePaths[activeImgIndex])
    : null;

  const { listingType, meta, cleanDescription } = parseListingMetadata(product.description);
  const labels = getCategoryLabels(listingType);
  const infoItems = buildInfoItems(listingType, meta, product.condition, product.location);

  const fallbackIcon = (() => {
    if (listingType === "House") return "bi-house-door-fill";
    if (listingType === "Job") return "bi-briefcase-fill";
    if (listingType === "Event") return "bi-calendar-event-fill";
    if (listingType === "Service") return "bi-tools";
    const cat = getCategoryIcon(product.category_id);
    return cat ? `bi-${cat}` : "bi-bag-fill";
  })();

  const sellerProfileUrl = getSellerProfileUrl(product.seller_profile_path);
  const categoryName = getCategoryName(product.category_id);
  const timePosted = formatDate(product.created_at);
  const productInWishlist = isInWishlist(product.id);

  const handleCategorySelect = (categoryId) => {
    if (categoryId === "all") {
      navigate("/");
    } else {
      navigate(`/?category=${categoryId}`);
    }
  };

  const isNonItem = listingType !== "Item";

  return (
    <AppLayout
      activeCategory={product.category_id.toString()}
      onCategorySelect={handleCategorySelect}
    >
      <main>
        <div
          className="container px-3 product-detail-page"
          id="product-detail-container"
        >
          <div className="detail-topbar">
            <Button
              variant="outline"
              onClick={handleBack}
              className="detail-back-btn"
            >
              <i className="bi bi-arrow-left"></i> Back
            </Button>
            <div className="detail-topbar-meta">
              <span className="detail-tag">{escapeHtml(listingType === "Item" ? categoryName : listingType)}</span>
              <span className="detail-tag detail-tag-muted">
                <i className="bi bi-clock-history"></i> {escapeHtml(timePosted)}
              </span>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-lg-7 mb-4">
              <div className="product-media-card">
                {activeImageUrl ? (
                  <SafeImage
                    id="main-product-image"
                    src={activeImageUrl}
                    alt={escapeHtml(product.name)}
                    className="product-detail-image"
                  />
                ) : (
                  <div className="product-detail-placeholder">
                    <i className={`bi ${fallbackIcon}`}></i>
                  </div>
                )}
                <div className="media-overlay">
                  <span className="media-chip">
                    {escapeHtml(product.condition)}
                  </span>
                  <span className="media-chip media-chip-accent">
                    Verified Listing
                  </span>
                </div>
                {imagePaths.length > 1 && (
                  <div className="thumbnail-container">
                    {imagePaths.map((path, idx) => (
                      <SafeImage
                        key={idx}
                        src={getPublicUrlFromPath(path)}
                        alt={`Photo ${idx + 1}`}
                        className={`thumbnail-img${idx === activeImgIndex ? " active" : ""}`}
                        onClick={() => setActiveImgIndex(idx)}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="safety-tips-card d-none d-lg-block">
                <div className="card-body">
                  <h5>
                    <i className="bi bi-exclamation-triangle"></i>Safety Tips
                  </h5>
                  <ul className="list-unstyled">
                    <li>
                      <i className="bi bi-check-circle"></i> Meet for public
                      place with plenty people
                    </li>
                    <li>
                      <i className="bi bi-check-circle"></i> Check the item well
                      before you pay
                    </li>
                    <li>
                      <i className="bi bi-check-circle"></i> No send money
                      before you see the item
                    </li>
                    <li>
                      <i className="bi bi-check-circle"></i> Bring somebody wey
                      you trust follow you
                    </li>
                    <li>
                      <i className="bi bi-check-circle"></i> If price too good,
                      e fit be fake
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="product-info-card mb-4">
                <div className="card-body">
                  <div className="price-row">
                    <div className="product-category">
                      {escapeHtml(listingType === "Item" ? categoryName : listingType)}
                    </div>
                  </div>

                  <div className="product-price-row">
                    {labels.priceLabel && (
                      <span className="price-prefix-label">{labels.priceLabel}</span>
                    )}
                    <div className="product-price">
                      ₦{formatNumber(product.price)}
                      {listingType === "House" && meta["Offer Type"] === "For Rent" && (
                        <span className="price-suffix">/yr</span>
                      )}
                      {listingType === "Service" && (
                        <span className="price-suffix">/job</span>
                      )}
                    </div>
                  </div>

                  <h1 className="product-title">{escapeHtml(product.name)}</h1>

                  {/* Location pill for non-category-specific items */}
                  {!isNonItem && (
                    <div className="meta-pills">
                      <div className="product-location">
                        <i className="bi bi-geo-alt-fill"></i>
                        {escapeHtml(product.location)}
                      </div>
                      <div className="product-condition">
                        <i className="bi bi-patch-check-fill"></i>
                        {escapeHtml(product.condition)}
                      </div>
                    </div>
                  )}

                  {/* Category-specific info grid */}
                  {isNonItem && infoItems.length > 0 && (
                    <div className="listing-details-section">
                      <h6 className="listing-details-title">
                        <i className={`bi ${
                          listingType === "House" ? "bi-house-door" :
                          listingType === "Job" ? "bi-briefcase" :
                          listingType === "Event" ? "bi-calendar-event" :
                          "bi-tools"
                        }`}></i>
                        {labels.detailsTitle}
                      </h6>
                      <div className="listing-info-grid">
                        {infoItems.map((item, idx) => (
                          <div key={idx} className="listing-info-item">
                            <div className="info-icon-wrap">
                              <i className={`bi ${item.icon}`}></i>
                            </div>
                            <div className="info-text">
                              <span className="info-label">{item.label}</span>
                              <span className="info-value">{escapeHtml(item.value)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <div className="description-section">
                    <h6>Description</h6>
                    <p>
                      {escapeHtml(
                        cleanDescription || product.description || "No description available.",
                      )}
                    </p>
                  </div>

                  {/* Standard details for regular items */}
                  {!isNonItem && (
                    <div className="product-details">
                      <h6>Product Details</h6>
                      <div className="detail-row">
                        <span className="detail-label">Condition:</span>
                        <span>{escapeHtml(product.condition)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Category:</span>
                        <span>{escapeHtml(categoryName)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Posted:</span>
                        <span>{escapeHtml(timePosted)}</span>
                      </div>
                    </div>
                  )}

                  <div className="action-buttons">
                    <Button
                      variant={productInWishlist ? "primary" : "secondary"}
                      onClick={() => handleToggleWishlist(product)}
                      className="flex-fill detail-action-btn"
                    >
                      <i
                        className={`bi ${
                          productInWishlist ? "bi-check" : "bi-bookmark"
                        }`}
                      ></i>
                      {productInWishlist ? "Saved" : "Save"}
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleContactSeller}
                      className="flex-fill detail-action-btn"
                    >
                      <i className="bi bi-telephone"></i> {labels.contactBtn}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="seller-card">
                <div className="card-body">
                  <div className="seller-card-head">
                    <h4 className="card-title mb-0">{labels.sellerSection}</h4>
                    <span className="verified-badge" title="Verified">
                      <i className="bi bi-patch-check me-1"></i>Verified
                    </span>
                  </div>

                  <div className="seller-profile-row">
                    <SafeImage
                      src={sellerProfileUrl}
                      className="seller-avatar"
                      alt="Profile"
                      fallbackSrc="/assets/profilepics.png"
                    />
                    <div className="seller-profile-main">
                      <div className="seller-name">
                        {escapeHtml(product.seller_name || "Anonymous")}
                      </div>
                      <div className="seller-location">
                        <i className="bi bi-geo-alt-fill me-1 text-muted"></i>
                        <span>{escapeHtml(product.location)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="seller-trust-list">
                    <div className="seller-trust-item">
                      <i className="bi bi-shield-check"></i>
                      Identity and profile reviewed
                    </div>
                    <div className="seller-trust-item">
                      <i className="bi bi-chat-dots"></i>
                      Use in-app chat before payment
                    </div>
                  </div>

                  {showSellerPhone && (
                    <div className="seller-phone show">
                      <i className="bi bi-chat-dots-fill me-2"></i>
                      To get the contact, reach out via the listing details.
                    </div>
                  )}
                </div>
              </div>

              <div className="safety-tips-card d-block d-lg-none">
                <div className="card-body">
                  <h5>
                    <i className="bi bi-exclamation-triangle"></i>Safety Tips
                  </h5>
                  <ul className="list-unstyled">
                    <li>
                      <i className="bi bi-check-circle"></i> Meet for public
                      place with plenty people
                    </li>
                    <li>
                      <i className="bi bi-check-circle"></i> Check the item well
                      before you pay
                    </li>
                    <li>
                      <i className="bi bi-check-circle"></i> No send money
                      before you see the item
                    </li>
                    <li>
                      <i className="bi bi-check-circle"></i> Bring somebody wey
                      you trust follow you
                    </li>
                    <li>
                      <i className="bi bi-check-circle"></i> If price too good,
                      e fit be fake
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container px-3 related-products-section">
          <h3 className="section-title">Related Listings</h3>
          {relatedProducts.length === 0 && !relatedLoading ? (
            <EmptyState
              icon="bi-inbox"
              title="No related listings found"
              message="Check back later for more listings in this category."
            />
          ) : (
            <div className="row g-3" id="related-products-grid">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  onSaveToggle={toggleWishlist}
                  isInWishlist={isInWishlist(relatedProduct.id)}
                  imageObserver={{ observe: observeImage }}
                />
              ))}
              {relatedLoading && <ProductSkeleton count={RELATED_PAGE_SIZE} />}
            </div>
          )}
          <div
            ref={relatedSentinelRef}
            id="related-scroll-sentinel"
            style={{ height: "1px" }}
          ></div>
        </div>
      </main>

      <Toast
        show={showToast}
        message={toastMessage}
        onClose={() => setShowToast(false)}
      />
    </AppLayout>
  );
};

export default ProductDetail;
