
// ==========================================
// FILE: src/components/Skeleton/ProductSkeleton.jsx
// ==========================================
import React from 'react';
import './Skeleton.css';

const ProductSkeleton = ({ count = 12 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="col-6 col-md-3 col-lg-3">
          <div className="card product-card h-100">
            <div className="product-image-container">
              <div className="skeleton skeleton-image"></div>
            </div>
            <div className="card-body">
              <div className="fw-bold text-success mb-2">
                <div className="skeleton skeleton-price"></div>
              </div>
              <div className="card-title-skeleton mb-1">
                <div className="skeleton skeleton-title"></div>
              </div>
              <div className="small text-muted mb-2">
                <div className="skeleton skeleton-desc"></div>
              </div>
              <div className="small text-muted mt-auto">
                <div className="skeleton skeleton-location"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default ProductSkeleton;