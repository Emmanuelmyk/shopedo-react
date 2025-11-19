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
