// ==========================================
// FILE: src/components/Skeleton/ProductSkeleton.jsx
// ==========================================
import React from "react";
import "./Skeleton.css";

const ProductSkeleton = ({ count = 12 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="col-6 col-md-3 col-lg-3">
        <div className="product-card-skeleton">
          {/* image — matches .product-image-container height */}
          <div className="sk pcs-image"></div>

          <div className="pcs-body">
            {/* category pill row */}
            <div className="sk sk-pill" style={{ width: "52%", height: "18px" }}></div>
            {/* price */}
            <div className="sk" style={{ width: "58%", height: "22px" }}></div>
            {/* title — 2 lines */}
            <div className="sk" style={{ width: "92%", height: "14px" }}></div>
            <div className="sk" style={{ width: "70%", height: "14px" }}></div>
            {/* location / meta */}
            <div style={{ marginTop: "auto", paddingTop: "0.4rem" }}>
              <div className="sk sk-pill" style={{ width: "64%", height: "20px" }}></div>
            </div>
          </div>
        </div>
      </div>
    ))}
  </>
);

export default ProductSkeleton;
