// ==========================================
// FILE: src/components/AdsCarousel/AdsCarousel.jsx
// ==========================================
import React, { useEffect } from 'react';
import { getAdPublicUrl } from '../../utils/imageUtils';
import { escapeHtml } from '../../utils/formatUtils';
import './AdsCarousel.css';

const AdsCarousel = ({ ads, isMobile = false }) => {
  const carouselId = isMobile ? 'mobileAdsCarousel' : 'adsCarousel';

  useEffect(() => {
    if (ads && ads.length > 0) {
      const carouselElement = document.getElementById(carouselId);
      if (carouselElement && window.bootstrap) {
        new window.bootstrap.Carousel(carouselElement, {
          interval: 3000,
          wrap: true
        });
      }
    }
  }, [ads, carouselId]);

  if (!ads || ads.length === 0) {
    return (
      <div className={`mt-4 ${isMobile ? 'mobile-ads-carousel' : 'ads-carousel'}`}>
        <div className="alert alert-info text-center py-2 mb-0 small">
          No ads uploaded yet. Stay tuned!
        </div>
      </div>
    );
  }

  return (
    <div className={`mt-4 ${isMobile ? 'mobile-ads-carousel' : 'ads-carousel'}`}>
      <div 
        id={carouselId} 
        className="carousel slide carousel-fade" 
        data-bs-ride="carousel" 
        data-bs-interval="3000"
      >
        <div className="carousel-inner">
          {ads.map((ad, index) => {
            const imgUrl = getAdPublicUrl(ad.image_path);
            return (
              <div key={ad.id} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                <a href={escapeHtml(ad.link || '#')} target="_blank" rel="noopener noreferrer">
                  <img 
                    src={escapeHtml(imgUrl)} 
                    className="d-block w-100" 
                    alt={`Advertisement ${index + 1}`} 
                    loading="lazy" 
                  />
                </a>
              </div>
            );
          })}
        </div>
        {!isMobile && (
          <>
            <button 
              className="carousel-control-prev" 
              type="button" 
              data-bs-target={`#${carouselId}`} 
              data-bs-slide="prev"
            >
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button 
              className="carousel-control-next" 
              type="button" 
              data-bs-target={`#${carouselId}`} 
              data-bs-slide="next"
            >
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Next</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AdsCarousel;
