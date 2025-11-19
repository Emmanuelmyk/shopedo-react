// ==========================================
// FILE: src/components/Breadcrumb/Breadcrumb.jsx
// ==========================================
import React from "react";
import "./Breadcrumb.css";

const Breadcrumb = ({ categoryName, onHomeClick }) => {
  return (
    <div className="category-header">
      <nav aria-label="breadcrumb" className="d-flex">
        <ol className="breadcrumb mb-0">
          {categoryName ? (
            <>
              <li className="breadcrumb-item">
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onHomeClick();
                  }}
                >
                  All Products
                </a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {categoryName}
              </li>
            </>
          ) : (
            <li className="breadcrumb-item active" aria-current="page">
              All Products
            </li>
          )}
        </ol>
      </nav>
    </div>
  );
};

export default Breadcrumb;
