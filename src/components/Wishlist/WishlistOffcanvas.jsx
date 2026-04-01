// ==========================================
// FILE: src/components/Wishlist/WishlistOffcanvas.jsx
// ==========================================
import { useEffect } from "react";
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
  useEffect(() => {
    if (show) {
      const sw = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty("--scroll-lock-pad", `${sw}px`);
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${sw}px`;
    } else {
      document.documentElement.style.setProperty("--scroll-lock-pad", "0px");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.documentElement.style.setProperty("--scroll-lock-pad", "0px");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [show]);

  const count = wishlistItems.length;

  return (
    <>
      <div
        className={`wl-backdrop${show ? " wl-backdrop--visible" : ""}`}
        onClick={onHide}
        aria-hidden="true"
      />

      <div
        className={`wl-panel${show ? " wl-panel--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wl-title"
      >
        <div className="wl-header">
          <div className="wl-header-left">
            <h2 className="wl-title" id="wl-title">Saved Items</h2>
            {count > 0 && (
              <span className="wl-count-badge">{count}</span>
            )}
          </div>
          <button className="wl-close" onClick={onHide} aria-label="Close wishlist">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="wl-body">
          {count === 0 ? (
            <div className="wl-empty">
              <div className="wl-empty-icon">
                <i className="bi bi-bookmark-heart" />
              </div>
              <h3 className="wl-empty-title">Nothing saved yet</h3>
              <p className="wl-empty-text">
                Browse listings and tap the bookmark to save items here.
              </p>
              <button className="wl-empty-cta" onClick={onStartShopping}>
                Browse Listings
              </button>
            </div>
          ) : (
            <div className="wl-list">
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

        {count > 0 && (
          <div className="wl-footer">
            <span className="wl-footer-text">
              {count} {count === 1 ? "item" : "items"} saved
            </span>
            <button className="wl-browse-btn" onClick={onStartShopping}>
              Browse More
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default WishlistOffcanvas;
