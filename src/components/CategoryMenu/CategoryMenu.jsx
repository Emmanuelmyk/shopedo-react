// ==========================================
// FILE: src/components/CategoryMenu/CategoryMenu.jsx
// ==========================================
import React, { useEffect, useRef } from 'react';
import { CATEGORIES } from '../../utils/categories';
import AdsCarousel from '../AdsCarousel/AdsCarousel';
import './CategoryMenu.css';

const CategoryMenu = ({ 
  show, 
  onHide, 
  activeCategory, 
  onCategorySelect,
  ads 
}) => {
  const offcanvasRef = useRef(null);
  const bsOffcanvasRef = useRef(null);

  useEffect(() => {
    const offcanvasElement = offcanvasRef.current;
    if (!offcanvasElement) return;

    // Wait for Bootstrap to be available
    const initOffcanvas = () => {
      if (window.bootstrap && window.bootstrap.Offcanvas) {
        if (!bsOffcanvasRef.current) {
          bsOffcanvasRef.current = new window.bootstrap.Offcanvas(offcanvasElement, {
            backdrop: true,
            keyboard: true,
            scroll: false
          });

          offcanvasElement.addEventListener('hidden.bs.offcanvas', () => {
            if (onHide) onHide();
          });
        }
      }
    };

    if (window.bootstrap) {
      initOffcanvas();
    } else {
      // Wait for Bootstrap to load
      setTimeout(initOffcanvas, 100);
    }

    return () => {
      if (bsOffcanvasRef.current) {
        try {
          bsOffcanvasRef.current.dispose();
        } catch (e) {
          console.warn('Error disposing offcanvas:', e);
        }
        bsOffcanvasRef.current = null;
      }
    };
  }, [onHide]);

  useEffect(() => {
    if (!bsOffcanvasRef.current) return;

    try {
      if (show) {
        bsOffcanvasRef.current.show();
      } else {
        bsOffcanvasRef.current.hide();
      }
    } catch (e) {
      console.warn('Error toggling offcanvas:', e);
    }
  }, [show]);

  const handleCategoryClick = (categoryId) => {
    onCategorySelect(categoryId);
  };

  return (
    <div 
      ref={offcanvasRef}
      className="offcanvas offcanvas-end" 
      tabIndex="-1" 
      id="offcanvasMenu"
      aria-labelledby="offcanvasMenuLabel"
    >
      <div className="offcanvas-header">
        <h5 className="offcanvas-title" id="offcanvasMenuLabel">Categories</h5>
        <button 
          type="button" 
          className="btn-close" 
          data-bs-dismiss="offcanvas" 
          aria-label="Close"
        ></button>
      </div>
      <div className="offcanvas-body">
        <div className="list-group category-list" id="mobile-categories-list">
          <button
            className={`list-group-item list-group-item-action ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => handleCategoryClick('all')}
          >
            <i className="bi bi-house-door"></i>All
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`list-group-item list-group-item-action ${activeCategory === cat.id.toString() ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat.id.toString())}
            >
              <i className={`bi bi-${cat.icon}`}></i>{cat.name}
            </button>
          ))}
        </div>
        <AdsCarousel ads={ads} isMobile={true} />
      </div>
    </div>
  );
};

export default CategoryMenu;