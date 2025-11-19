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

  // Sync Bootstrap's hide event → parent onHide
  useEffect(() => {
    const el = offcanvasRef.current;
    if (!el) return;

    const handleHidden = () => onHide?.();

    el.addEventListener("hidden.bs.offcanvas", handleHidden);
    return () => el.removeEventListener("hidden.bs.offcanvas", handleHidden);
  }, [onHide]);

  // Control visibility via data attributes (pure Bootstrap way)
  useEffect(() => {
    const el = offcanvasRef.current;
    if (!el) return;

    if (show) {
      el.classList.add("show");
      document.body.classList.add("offcanvas-open"); // optional: prevent scroll
    } else {
      el.classList.remove("show");
      document.body.classList.remove("offcanvas-open");
    }
  }, [show]);

  return (
    <div
      ref={offcanvasRef}
      className={`offcanvas offcanvas-end ${show ? "show" : ""}`}
      tabIndex="-1"
      id="wishlistOffcanvas"
      aria-labelledby="wishlistOffcanvasLabel"
      data-bs-backdrop="true"
      data-bs-scroll="false"
      data-bs-keyboard="true"
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
