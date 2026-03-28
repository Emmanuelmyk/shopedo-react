// ==========================================
// FILE: src/components/Sidebar/Sidebar.jsx
// ==========================================
import React from "react";
import { CATEGORIES } from "../../utils/categories";
import { SECTION_SUB_FILTERS } from "../../utils/sectionFilters";
import ReferralCard from "../ReferralCard/ReferralCard";
import "./Sidebar.css";

const Sidebar = ({
  activeCategory,
  onCategorySelect,
  section = "items",
  activeFilter = "",
  onFilterSelect,
}) => {
  const subFilters = SECTION_SUB_FILTERS[section] || [];
  const showCategories = section === "items" || !SECTION_SUB_FILTERS[section];

  return (
    <aside className="sidebar d-none d-lg-block">
      {showCategories ? (
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
      ) : (
        subFilters.map((group) => (
          <div key={group.key} className="sidebar-subfilter-group">
            <div className="sidebar-subfilter-label">{group.label}</div>
            <div className="list-group category-list">
              <button
                className={`list-group-item list-group-item-action ${activeFilter === "" ? "active" : ""}`}
                onClick={() => onFilterSelect("")}
              >
                <i className="bi bi-grid"></i>All
              </button>
              {group.options.map((opt) => (
                <button
                  key={opt.label}
                  className={`list-group-item list-group-item-action ${activeFilter.toLowerCase() === opt.label.toLowerCase() ? "active" : ""}`}
                  onClick={() => onFilterSelect(opt.label)}
                >
                  <i className={`bi ${opt.icon}`}></i>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))
      )}

      <ReferralCard />
    </aside>
  );
};

export default Sidebar;
