// ==========================================
// FILE: src/components/CategoryMenu/CategoryMenu.jsx
// ==========================================
import React, { useEffect } from "react";
import { CATEGORIES } from "../../utils/categories";
import ReferralCard from "../ReferralCard/ReferralCard";
import "./CategoryMenu.css";

const CategoryMenu = ({ show, onHide, activeCategory, onCategorySelect }) => {
  // lock body scroll when open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [show]);

  const handleCategoryClick = (categoryId) => {
    onCategorySelect(categoryId);
    onHide();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`cm-backdrop ${show ? "cm-backdrop--visible" : ""}`}
        onClick={onHide}
      />

      {/* Panel */}
      <div className={`cm-panel ${show ? "cm-panel--open" : ""}`}>
        <div className="cm-header">
          <h5 className="cm-title">Categories</h5>
          <button className="cm-close" onClick={onHide} aria-label="Close">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="cm-body">
          <div className="list-group category-list">
            <button
              className={`list-group-item list-group-item-action ${activeCategory === "all" ? "active" : ""}`}
              onClick={() => handleCategoryClick("all")}
            >
              <i className="bi bi-house-door"></i>All
            </button>

            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`list-group-item list-group-item-action ${activeCategory === cat.id.toString() ? "active" : ""}`}
                onClick={() => handleCategoryClick(cat.id.toString())}
              >
                <i className={`bi bi-${cat.icon}`}></i>
                {cat.name}
              </button>
            ))}
          </div>

          <ReferralCard />
        </div>
      </div>
    </>
  );
};

export default CategoryMenu;
