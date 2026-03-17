// ==========================================
// FILE: src/components/ProductCard/ProductCard.jsx
// ==========================================
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { escapeHtml, formatDate, formatNumber } from "../../utils/formatUtils";
import { getCategoryName } from "../../utils/categories";
import { getPublicUrlFromPath } from "../../utils/imageUtils";
import "./ProductCard.css";

const ProductCard = ({
  product,
  onSaveToggle,
  isInWishlist,
  imageObserver,
}) => {
  const navigate = useNavigate();
  const imgRef = useRef(null);

  useEffect(() => {
    if (imgRef.current && imageObserver) {
      imageObserver.observe(imgRef.current);
    }
  }, [imageObserver]);

  const handleCardClick = () => {
    // Scroll to top before navigating
    window.scrollTo({ top: 0, behavior: "instant" });
    navigate(`/product-detail?id=${product.id}`);
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onSaveToggle(product);
  };

  const imgPublicUrl = product.img_path
    ? getPublicUrlFromPath(product.img_path)
    : "";

  const categoryLabel = product.category_id
    ? getCategoryName(product.category_id)
    : "General";
  const sellerName = product.seller_name || "Edo Trusted Seller";
  const timePosted = product.created_at
    ? formatDate(product.created_at)
    : "Just now";

  return (
    <div className="col-6 col-md-3 col-lg-3">
      <article
        className="card product-card h-100"
        data-product={JSON.stringify(product)}
        onClick={handleCardClick}
      >
        <div className="product-image-container">
          <img
            ref={imgRef}
            data-src={imgPublicUrl}
            alt={escapeHtml(product.name)}
            className="product-image"
            loading="lazy"
          />

          <div className="image-fade" aria-hidden="true"></div>

          <span className="condition-pill">
            {escapeHtml(product.condition)}
          </span>

          <button
            className={`save-btn ${isInWishlist ? "added" : ""}`}
            onClick={handleSaveClick}
            aria-label={
              isInWishlist ? "Remove from wishlist" : "Add to wishlist"
            }
          >
            <i className="bi bi-bookmark"></i>
            <i className="bi bi-check"></i>
          </button>
        </div>

        <div className="card-body">
          <h6 className="card-title">{escapeHtml(product.name)}</h6>

          <div className="category-row">
            <span className="category-tag">{escapeHtml(categoryLabel)}</span>
          </div>

          <div className="product-price">₦{formatNumber(product.price)}</div>

          <div className="meta-line seller-line">
            <i className="bi bi-person"></i>
            <span>{escapeHtml(sellerName)}</span>
          </div>

          <div className="bottom-meta-row">
            <div className="product-meta">
              <i className="bi bi-geo-alt-fill"></i>
              <span>{escapeHtml(product.location)}</span>
            </div>

            <span className="posted-time">
              <i className="bi bi-clock"></i>
              {escapeHtml(timePosted)}
            </span>
          </div>
        </div>
      </article>
    </div>
  );
};

export default ProductCard;
