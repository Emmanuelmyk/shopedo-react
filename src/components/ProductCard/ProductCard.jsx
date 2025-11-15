// ==========================================
// FILE: src/components/ProductCard/ProductCard.jsx
// ==========================================
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { escapeHtml, formatNumber } from '../../utils/formatUtils';
import { getPublicUrlFromPath } from '../../utils/imageUtils';
import './ProductCard.css';

const ProductCard = ({ product, onSaveToggle, isInWishlist, imageObserver }) => {
  const navigate = useNavigate();
  const imgRef = useRef(null);

  useEffect(() => {
    if (imgRef.current && imageObserver) {
      imageObserver.observe(imgRef.current);
    }
  }, [imageObserver]);

  const handleCardClick = () => {
    // Scroll to top before navigating
    window.scrollTo({ top: 0, behavior: 'instant' });
    navigate(`/product-detail?id=${product.id}`);
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onSaveToggle(product);
  };

  const imgPublicUrl = product.img_path ? getPublicUrlFromPath(product.img_path) : '';

  return (
    <div className="col-6 col-md-3 col-lg-3">
      <div 
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
        </div>
        <button 
          className={`save-btn ${isInWishlist ? 'added' : ''}`}
          onClick={handleSaveClick}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <i className="bi bi-bookmark"></i>
          <i className="bi bi-check"></i>
        </button>
        <div className="card-body">
          <div className="product-price">
            ₦{formatNumber(product.price)}
          </div>
          <h6 className="card-title">{escapeHtml(product.name)}</h6>
          <div className="small">
            <i className="bi bi-geo-alt-fill"></i>
            <span>{escapeHtml(product.location)}</span>
          </div>
          <span className="condition">{escapeHtml(product.condition)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;