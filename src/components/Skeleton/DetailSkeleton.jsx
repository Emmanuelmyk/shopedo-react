// ==========================================
// FILE: src/components/Skeleton/DetailSkeleton.jsx
// ==========================================
import React from 'react';
import './Skeleton.css';

const DetailSkeleton = () => {
  return (
    <div className="row">
      <div className="col-lg-7 mb-4">
        <div className="skeleton skeleton-image mb-3"></div>
        <div className="thumbnail-container">
          <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '8px', flexShrink: 0 }}></div>
          <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '8px', flexShrink: 0 }}></div>
          <div className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '8px', flexShrink: 0 }}></div>
        </div>
      </div>
      <div className="col-lg-5">
        <div className="product-info-card mb-4">
          <div className="card-body">
            <div className="skeleton skeleton-price mb-3"></div>
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-location mb-3"></div>
            <div className="skeleton skeleton-description"></div>
            <div className="product-details mt-3">
              <div className="skeleton" style={{ height: '16px', width: '100px', marginBottom: '4px' }}></div>
              <div className="skeleton" style={{ height: '12px', width: '100%', marginBottom: '2px' }}></div>
              <div className="skeleton" style={{ height: '12px', width: '100%', marginBottom: '2px' }}></div>
              <div className="skeleton" style={{ height: '12px', width: '100%' }}></div>
            </div>
            <div className="action-buttons">
              <div className="skeleton skeleton-button flex-fill"></div>
              <div className="skeleton skeleton-button flex-fill"></div>
            </div>
          </div>
        </div>
        <div className="seller-card">
          <div className="card-body">
            <h4 className="card-title mb-3">Seller Information</h4>
            <div className="seller-info">
              <div className="skeleton skeleton-avatar"></div>
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <div className="skeleton skeleton-seller-name"></div>
                </div>
                <div className="skeleton skeleton-seller-location"></div>
                <div className="skeleton skeleton-rating"></div>
              </div>
            </div>
            <div className="skeleton skeleton-phone"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailSkeleton;