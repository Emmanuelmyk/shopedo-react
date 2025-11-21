// ==========================================
// FILE: src/components/Wishlist/WishlistOffcanvas.jsx
// ==========================================
import React, { useEffect, useRef } from "react";
import WishlistItem from "./WishlistItem";
import "./Wishlist.css";

const WishlistOffcanvas = ({
  show,
  onHide,
  wishlistItems,
  onRemove,
  onShare,
  onStartShopping,
}) => {
  const offcanvasRef = useRef(null);
  const backdropRef = useRef(null);

  // Handle show/hide with simple uniform animation
  useEffect(() => {
    const offcanvasElement = offcanvasRef.current;
    if (!offcanvasElement) return;

    if (show) {
      // Show offcanvas
      offcanvasElement.classList.add("show");
      document.body.style.overflow = "hidden";

      // Create and show backdrop
      if (!backdropRef.current) {
        const backdrop = document.createElement("div");
        backdrop.className = "offcanvas-backdrop fade show";
        backdrop.style.zIndex = "1040";
        document.body.appendChild(backdrop);
        backdropRef.current = backdrop;

        // Close on backdrop click
        backdrop.addEventListener("click", onHide);
      }
    } else {
      // Hide offcanvas
      offcanvasElement.classList.remove("show");
      document.body.style.overflow = "";

      // Remove backdrop immediately
      if (backdropRef.current) {
        backdropRef.current.remove();
        backdropRef.current = null;
      }
    }

    return () => {
      // Cleanup on unmount
      if (backdropRef.current) {
        backdropRef.current.remove();
        backdropRef.current = null;
      }
      document.body.style.overflow = "";
    };
  }, [show, onHide]);

  return (
    <div
      ref={offcanvasRef}
      className="offcanvas offcanvas-end"
      tabIndex="-1"
      id="wishlistOffcanvas"
      aria-labelledby="wishlistOffcanvasLabel"
    >
      <div className="offcanvas-header">
        <h5 className="offcanvas-title" id="wishlistOffcanvasLabel">
          My Wishlist
        </h5>
        <button
          type="button"
          className="btn-close"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
          onClick={onHide}
        />
      </div>

      <div className="offcanvas-body">
        {wishlistItems.length === 0 ? (
          <div id="wishlist-empty-state" className="text-center py-5">
            <i className="bi bi-bookmark-heart display-4 text-muted mb-3"></i>
            <h5 className="text-muted">Your wishlist is empty</h5>
            <p className="text-muted">
              Discover amazing products and save your favorites for later.
            </p>
            <button
              className="btn btn-outline-success"
              onClick={onStartShopping}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div id="wishlist-items-container">
            {wishlistItems.map((item) => (
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
