// ==========================================
// FILE: src/pages/ProductDetail/ProductDetail.jsx
// ==========================================
import React, { useState, useEffect, useCallback } from "react";
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
import { shareProduct } from "../../utils/wishlistUtils";
import { escapeHtml, formatNumber, formatDate } from "../../utils/formatUtils";
import {
  getPublicUrlFromPath,
  getSellerProfileUrl,
} from "../../utils/imageUtils";
import { getCategoryName } from "../../utils/categories";
import "./ProductDetail.css";

const RELATED_PAGE_SIZE = 12;

const ProductDetail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const productId = searchParams.get("id");

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedOffset, setRelatedOffset] = useState(0);
  const [showSellerPhone, setShowSellerPhone] = useState(false);
  const [contactButtonLabel, setContactButtonLabel] =
    useState("Contact Seller");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const { toggleWishlist, isInWishlist } = useWishlistContext();
  const { observe: observeImage } = useImageObserver(true);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }

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

  // Load related products
  const loadMoreRelatedProducts = useCallback(async () => {
    if (!product) return false;

    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          "id, name, description, price, category_id, img_path, condition, location"
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

  const { sentinelRef: relatedSentinelRef, loading: relatedLoading } =
    useInfiniteScroll(loadMoreRelatedProducts, {
      enabled: !!product,
    });

  const handleContactSeller = () => {
    if (!showSellerPhone) {
      setShowSellerPhone(true);
      setContactButtonLabel("Call Now");
    } else {
      window.location.href = "tel:+2348123456789";
    }
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
      <AppLayout activeCategory="all">
        <main>
          <div className="container px-3" id="product-detail-container">
            <div className="alert alert-danger">Product not found.</div>
          </div>
        </main>
      </AppLayout>
    );
  }

  const mainImageUrl = product.img_path
    ? getPublicUrlFromPath(product.img_path)
    : "/assets/emptypics.png";
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

  return (
    <AppLayout
      activeCategory={product.category_id.toString()}
      onCategorySelect={handleCategorySelect}
    >
      <main>
        <div className="container px-3" id="product-detail-container">
          <div className="d-flex justify-content-start mb-3">
            <Button variant="outline" onClick={handleBack}>
              <i className="bi bi-arrow-left"></i>
            </Button>
          </div>

          <div className="row">
            <div className="col-lg-7 mb-4">
              <SafeImage
                id="main-product-image"
                src={mainImageUrl}
                alt={escapeHtml(product.name)}
                className="product-detail-image mb-3"
              />
              <div className="thumbnail-container">
                <SafeImage
                  src={mainImageUrl}
                  alt="Thumbnail 1"
                  className="thumbnail-img active"
                />
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
                  <div className="product-price">
                    ₦{formatNumber(product.price)}
                  </div>
                  <h1 className="product-title">{escapeHtml(product.name)}</h1>
                  <div className="product-location">
                    <i className="bi bi-geo-alt-fill"></i>{" "}
                    {escapeHtml(product.location)}
                  </div>

                  <div className="description-section">
                    <h6>Description</h6>
                    <p>
                      {escapeHtml(
                        product.description || "No description available."
                      )}
                    </p>
                  </div>

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

                  <div className="action-buttons">
                    <Button
                      variant={productInWishlist ? "primary" : "secondary"}
                      onClick={() => handleToggleWishlist(product)}
                      className="flex-fill"
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
                      className="flex-fill"
                    >
                      <i className="bi bi-telephone"></i> {contactButtonLabel}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="seller-card">
                <div className="card-body">
                  <h4 className="card-title mb-3">Seller Information</h4>
                  <div className="seller-info">
                    <SafeImage
                      src={sellerProfileUrl}
                      className="seller-avatar"
                      alt="Seller Profile"
                      fallbackSrc="/assets/profilepics.png"
                    />
                    <div>
                      <div style={{ marginBottom: "0.5rem" }}>
                        <div className="seller-name">
                          {escapeHtml(
                            product.seller_name || "Anonymous Seller"
                          )}
                          <span
                            className="verified-badge"
                            title="Verified Seller"
                          >
                            <i className="bi bi-patch-check me-1"></i>Verified
                          </span>
                        </div>
                      </div>
                      <div className="seller-location">
                        <i className="bi bi-geo-alt-fill me-1 text-muted"></i>
                        {escapeHtml(product.location)}
                      </div>
                      <div className="seller-rating">
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                        <span className="text-muted small ms-1">(5.0)</span>
                      </div>
                    </div>
                  </div>
                  {showSellerPhone && (
                    <div className="seller-phone show">
                      <i className="bi bi-telephone-fill me-2"></i> +234 812 345
                      6789
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

        {/* Related Products Section */}
        <div className="container px-3 related-products-section">
          <h3 className="section-title">Related Products</h3>
          {relatedProducts.length === 0 && !relatedLoading ? (
            <EmptyState
              icon="bi-inbox"
              title="No related products found"
              message="Check back later for more products in this category."
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
