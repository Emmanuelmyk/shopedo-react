// ==========================================
// FILE: src/components/Sidebar/Sidebar.jsx
// ==========================================
import React from "react";
import { CATEGORIES } from "../../utils/categories";
import ReferralCard from "../ReferralCard/ReferralCard";
import "./Sidebar.css";

const Sidebar = ({ activeCategory, onCategorySelect }) => {
  return (
    <aside className="sidebar d-none d-lg-block">
      <div className="list-group category-list">
        <button
          className={`list-group-item list-group-item-action ${activeCategory === "all" ? "active" : ""}`}
          onClick={() => onCategorySelect("all")}
        >
          <i className="bi bi-house-door"></i>All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`list-group-item list-group-item-action ${activeCategory === cat.id.toString() ? "active" : ""}`}
            onClick={() => onCategorySelect(cat.id.toString())}
          >
            <i className={`bi bi-${cat.icon}`}></i>
            {cat.name}
          </button>
        ))}
      </div>
      <ReferralCard />
    </aside>
  );
};

export default Sidebar;
