import React from "react";
import { useNavigate } from "react-router-dom";
import SafeImage from "../SafeImage/SafeImage";
import { escapeHtml, formatNumber } from "../../utils/formatUtils";
import { getPublicUrlFromPath } from "../../utils/imageUtils";
import "./Wishlist.css";

const WishlistItem = ({ item, onRemove, onShare }) => {
  const navigate = useNavigate();
  const imgPublicUrl = item.img_path
    ? getPublicUrlFromPath(item.img_path)
    : "/assets/emptypics.png";

  const handleProductClick = () => {
    navigate(`/product-detail?id=${item.id}`);
  };

  return (
    <div className="wishlist-item position-relative">
      <SafeImage
        src={imgPublicUrl}
        alt={escapeHtml(item.name)}
        loading="lazy"
      />
      <div className="wishlist-item-info">
        <h6>
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
        </h6>
        <div className="price">₦{formatNumber(item.price)}</div>
        <div className="location">
          <i className="bi bi-geo-alt-fill me-1"></i>
          {escapeHtml(item.location)}
        </div>
      </div>
      <div className="wishlist-actions">
        <i
          className="bi bi-trash-fill wishlist-delete"
          onClick={() => onRemove(item.id)}
          title="Remove from saved"
        ></i>
        <button
          className="share-btn"
          onClick={() => onShare(item.id, item.name, item.price)}
          title="Share this product"
        >
          <i className="bi bi-share-fill"></i>
        </button>
      </div>
    </div>
  );
};

export default WishlistItem;
