// ==========================================
// FILE: src/components/Skeleton/DetailSkeleton.jsx
// ==========================================
import React from "react";
import "./Skeleton.css";

const DetailSkeleton = () => (
  <div className="detail-skeleton-wrap">
    {/* topbar */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
      <div className="sk sk-pill" style={{ width: "80px", height: "36px" }}></div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <div className="sk sk-pill" style={{ width: "90px", height: "28px" }}></div>
        <div className="sk sk-pill" style={{ width: "110px", height: "28px" }}></div>
      </div>
    </div>

    <div className="row g-4">
      {/* ── Left column ── */}
      <div className="col-lg-7 mb-4">
        <div className="ds-media-card">
          {/* main image — matches fixed 420px */}
          <div className="sk ds-main-image"></div>
          {/* thumbnails */}
          <div className="ds-thumbs">
            <div className="sk ds-thumb"></div>
            <div className="sk ds-thumb"></div>
            <div className="sk ds-thumb"></div>
          </div>
        </div>
      </div>

      {/* ── Right column ── */}
      <div className="col-lg-5">
        {/* product info card */}
        <div className="ds-info-card">
          {/* category pill */}
          <div className="sk sk-pill" style={{ width: "80px", height: "22px" }}></div>
          {/* price */}
          <div className="sk" style={{ width: "55%", height: "40px", marginTop: "0.7rem", borderRadius: "8px" }}></div>
          {/* title */}
          <div className="sk" style={{ width: "95%", height: "28px", marginTop: "0.65rem", borderRadius: "8px" }}></div>
          <div className="sk" style={{ width: "70%", height: "22px", marginTop: "0.4rem", borderRadius: "8px" }}></div>

          {/* meta pills (location + condition) */}
          <div style={{ display: "flex", gap: "0.6rem", marginTop: "1rem" }}>
            <div className="sk sk-pill" style={{ width: "110px", height: "32px" }}></div>
            <div className="sk sk-pill" style={{ width: "90px", height: "32px" }}></div>
          </div>

          {/* description block */}
          <div style={{ marginTop: "1rem", borderRadius: "12px", border: "1px solid var(--border-color,#e5e7eb)", padding: "0.95rem", background: "#f8fafc" }}>
            <div className="sk" style={{ width: "60px", height: "12px", marginBottom: "0.6rem" }}></div>
            <div className="sk" style={{ width: "100%", height: "11px", marginBottom: "0.4rem" }}></div>
            <div className="sk" style={{ width: "100%", height: "11px", marginBottom: "0.4rem" }}></div>
            <div className="sk" style={{ width: "80%", height: "11px" }}></div>
          </div>

          {/* product details block */}
          <div style={{ marginTop: "1rem", borderRadius: "12px", border: "1px solid var(--border-color,#e5e7eb)", padding: "0.95rem", background: "#f8fafc" }}>
            <div className="sk" style={{ width: "80px", height: "12px", marginBottom: "0.6rem" }}></div>
            {[1, 2, 3].map(n => (
              <div key={n} style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <div className="sk" style={{ width: "30%", height: "13px" }}></div>
                <div className="sk" style={{ width: "40%", height: "13px" }}></div>
              </div>
            ))}
          </div>

          {/* action buttons */}
          <div className="ds-action-row">
            <div className="sk" style={{ flex: 1, height: "46px", borderRadius: "12px" }}></div>
            <div className="sk" style={{ flex: 1, height: "46px", borderRadius: "12px" }}></div>
          </div>
        </div>

        {/* seller card */}
        <div className="ds-seller-card">
          {/* header row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.9rem" }}>
            <div className="sk" style={{ width: "140px", height: "20px" }}></div>
            <div className="sk sk-pill" style={{ width: "72px", height: "24px" }}></div>
          </div>

          {/* avatar + info */}
          <div className="ds-seller-row">
            <div className="sk sk-circle" style={{ width: "52px", height: "52px", flexShrink: 0 }}></div>
            <div className="ds-seller-lines">
              <div className="sk" style={{ width: "65%", height: "16px" }}></div>
              <div className="sk" style={{ width: "48%", height: "13px" }}></div>
              <div className="sk" style={{ width: "85px", height: "13px" }}></div>
            </div>
          </div>

          {/* stats 2-col grid */}
          <div className="ds-stats-grid">
            <div className="sk ds-stat-box"></div>
            <div className="sk ds-stat-box"></div>
          </div>

          {/* trust items */}
          <div style={{ marginTop: "0.85rem", display: "flex", flexDirection: "column", gap: "0.45rem" }}>
            <div className="sk" style={{ width: "80%", height: "14px" }}></div>
            <div className="sk" style={{ width: "70%", height: "14px" }}></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default DetailSkeleton;
