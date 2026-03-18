import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import SafeImage from "../SafeImage/SafeImage";
import { escapeHtml, formatNumber } from "../../utils/formatUtils";
import { getPublicUrlFromPath } from "../../utils/imageUtils";
import "./Wishlist.css";

const WishlistItem = ({ item, onRemove, onShare }) => {
  const navigate = useNavigate();
  const itemRef = useRef(null);
  const imgPublicUrl = item.img_path
    ? getPublicUrlFromPath(item.img_path)
    : "/assets/emptypics.png";

  const handleProductClick = () => {
    navigate(`/product-detail?id=${item.id}`);
  };

  const handleRemove = () => {
    if (itemRef.current) {
      itemRef.current.classList.add("removing");
      setTimeout(() => {
        onRemove(item.id);
      }, 250);
    }
  };

  return (
    <div className="wishlist-item position-relative" ref={itemRef}>
      <div className="wishlist-thumb">
        <SafeImage
          src={imgPublicUrl}
          alt={escapeHtml(item.name)}
          loading="lazy"
        />
      </div>

      <div className="wishlist-item-info">
        <div className="wishlist-price">₦{formatNumber(item.price)}</div>
        <h5>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleProductClick();
            }}
            className="text-decoration-none text-reset"
          >
            {escapeHtml(item.name)}
          </a>
        </h5>

        <div className="location">
          <i className="bi bi-geo-alt-fill me-1"></i>
          <span>{escapeHtml(item.location)}</span>
        </div>
      </div>

      <div className="wishlist-actions">
        <button
          className="wishlist-action-btn wishlist-share-btn"
          onClick={() => onShare(item.id, item.name, item.price)}
          title="Share this product"
        >
          <i className="bi bi-share-fill"></i>
        </button>

        <button
          className="wishlist-action-btn wishlist-remove-btn"
          onClick={handleRemove}
          title="Remove from saved"
        >
          <i className="bi bi-trash3-fill"></i>
        </button>
      </div>
    </div>
  );
};

export default WishlistItem;
