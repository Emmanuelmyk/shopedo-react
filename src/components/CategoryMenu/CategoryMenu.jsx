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

  useEffect(() => {
    const offcanvas = offcanvasRef.current;
    if (!offcanvas) return;

    if (show) {
      offcanvas.classList.add("show");
      offcanvas.classList.remove("hiding");
      document.body.style.overflow = "hidden";

      // SHOW BACKDROP
      if (!backdropRef.current) {
        const backdrop = document.createElement("div");
        backdrop.className = "offcanvas-backdrop fade show";
        backdrop.style.zIndex = "1040";
        document.body.appendChild(backdrop);
        backdropRef.current = backdrop;

        backdrop.addEventListener("click", onHide);
      }
    } else {
      // ADD SMOOTH CLOSE ANIMATION
      offcanvas.classList.add("hiding");
      offcanvas.classList.remove("show");
      document.body.style.overflow = "";

      // FADE OUT BACKDROP
      if (backdropRef.current) {
        backdropRef.current.classList.remove("show");

        setTimeout(() => {
          if (backdropRef.current) {
            backdropRef.current.remove();
            backdropRef.current = null;
          }
        }, 300); // must match CSS transition time
      }
    }

    return () => {
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
          aria-label="Close"
          onClick={onHide}
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
