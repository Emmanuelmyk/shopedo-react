import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import SafeImage from "../SafeImage/SafeImage";
import { escapeHtml, formatNumber } from "../../utils/formatUtils";
import { getPublicUrlFromPath, parseImgPaths } from "../../utils/imageUtils";
import "./Wishlist.css";

const WishlistItem = ({ item, onRemove, onShare }) => {
  const navigate = useNavigate();
  const itemRef = useRef(null);

  const imgPaths = parseImgPaths(item.img_path);
  const imgUrl = imgPaths.length > 0
    ? getPublicUrlFromPath(imgPaths[0])
    : null;

  const handleCardClick = () => {
    navigate(`/product-detail?id=${item.id}`);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (itemRef.current) {
      itemRef.current.classList.add("removing");
      setTimeout(() => onRemove(item.id), 230);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    onShare(item.id, item.name, item.price);
  };

  return (
    <div className="wl-item" ref={itemRef} onClick={handleCardClick}>
      <div className="wl-item-img">
        <SafeImage
          src={imgUrl}
          alt={escapeHtml(item.name)}
          loading="lazy"
          fallbackSrc="/assets/emptypics.png"
        />
      </div>

      <div className="wl-item-body">
        <div>
          <div className="wl-item-price">₦{formatNumber(item.price)}</div>
          <div className="wl-item-name">{escapeHtml(item.name)}</div>
        </div>
        <div className="wl-item-foot">
          {item.location && (
            <span className="wl-item-location">
              <i className="bi bi-geo-alt-fill" />
              {escapeHtml(item.location)}
            </span>
          )}
          {item.condition && (
            <span className="wl-item-condition">{escapeHtml(item.condition)}</span>
          )}
        </div>
      </div>

      <div className="wl-item-actions">
        <button
          className="wl-action-btn"
          onClick={handleShare}
          title="Share"
        >
          <i className="bi bi-share-fill" />
        </button>
        <button
          className="wl-action-btn wl-remove-btn"
          onClick={handleRemove}
          title="Remove"
        >
          <i className="bi bi-trash3" />
        </button>
      </div>
    </div>
  );
};

export default WishlistItem;
