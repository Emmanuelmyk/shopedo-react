// ==========================================
// FILE: src/components/CategoryMenu/CategoryMenu.jsx
// ==========================================
import React, { useEffect, useRef } from "react";
import { CATEGORIES } from "../../utils/categories";
import AdsCarousel from "../AdsCarousel/AdsCarousel";
import "./CategoryMenu.css";

const CategoryMenu = ({
  show,
  onHide,
  activeCategory,
  onCategorySelect,
  ads,
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
        <h5 className="offcanvas-title" id="offcanvasMenuLabel">
          Categories
        </h5>
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
            className={`list-group-item list-group-item-action ${
              activeCategory === "all" ? "active" : ""
            }`}
            onClick={() => handleCategoryClick("all")}
          >
            <i className="bi bi-house-door"></i>All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`list-group-item list-group-item-action ${
                activeCategory === cat.id.toString() ? "active" : ""
              }`}
              onClick={() => handleCategoryClick(cat.id.toString())}
            >
              <i className={`bi bi-${cat.icon}`}></i>
              {cat.name}
            </button>
          ))}
        </div>
        <AdsCarousel ads={ads} isMobile={true} />
      </div>
    </div>
  );
};

export default CategoryMenu;
