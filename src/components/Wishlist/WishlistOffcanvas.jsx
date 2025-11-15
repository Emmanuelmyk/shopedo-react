// ==========================================
// FILE: src/components/Wishlist/WishlistOffcanvas.jsx
// ==========================================
import React, { useEffect, useRef } from 'react';
import WishlistItem from './WishlistItem';
import './Wishlist.css';

const WishlistOffcanvas = ({ 
  show, 
  onHide, 
  wishlistItems, 
  onRemove, 
  onShare, 
  onStartShopping 
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

  return (
    <div 
      ref={offcanvasRef}
      className="offcanvas offcanvas-end" 
      tabIndex="-1" 
      id="wishlistOffcanvas"
      aria-labelledby="wishlistOffcanvasLabel"
    >
      <div className="offcanvas-header">
        <h5 className="offcanvas-title" id="wishlistOffcanvasLabel">My Wishlist</h5>
        <button 
          type="button" 
          className="btn-close" 
          data-bs-dismiss="offcanvas" 
          aria-label="Close"
        ></button>
      </div>
      <div className="offcanvas-body">
        {wishlistItems.length === 0 ? (
          <div id="wishlist-empty-state" className="text-center py-5">
            <i className="bi bi-bookmark-heart display-4 text-muted mb-3"></i>
            <h5 className="text-muted">Your wishlist is empty</h5>
            <p className="text-muted">
              Discover amazing products and save your favorites for later.
            </p>
            <button className="btn btn-outline-success" onClick={onStartShopping}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div id="wishlist-items-container">
            {wishlistItems.map(item => (
              <WishlistItem
                key={item.id}
                item={item}
                onRemove={onRemove}
                onShare={onShare}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistOffcanvas;
