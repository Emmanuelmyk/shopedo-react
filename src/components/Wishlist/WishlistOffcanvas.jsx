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

  // Handle show/hide with manual DOM manipulation
  useEffect(() => {
    const offcanvasElement = offcanvasRef.current;
    if (!offcanvasElement) return;

    if (show) {
      // Show offcanvas
      offcanvasElement.classList.add("show");
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "0px";

      // Create and show backdrop
      if (!backdropRef.current) {
        const backdrop = document.createElement("div");
        backdrop.className = "offcanvas-backdrop fade";
        backdrop.style.zIndex = "1040";
        document.body.appendChild(backdrop);
        backdropRef.current = backdrop;

        // Trigger fade-in with smoother timing
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            backdrop.classList.add("show");
          });
        });

        // Close on backdrop click
        backdrop.addEventListener("click", onHide);
      }
    } else {
      // Hide offcanvas
      offcanvasElement.classList.remove("show");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";

      // Remove backdrop with smooth fade-out
      if (backdropRef.current) {
        backdropRef.current.classList.remove("show");
        setTimeout(() => {
          if (backdropRef.current) {
            backdropRef.current.remove();
            backdropRef.current = null;
          }
        }, 350); // Slightly longer for smoother fade
      }
    }

    return () => {
      // Cleanup on unmount
      if (backdropRef.current) {
        backdropRef.current.remove();
        backdropRef.current = null;
      }
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
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
