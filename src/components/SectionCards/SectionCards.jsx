import React from "react";
import { useNavigate } from "react-router-dom";
import "./SectionCards.css";

const SECTIONS = [
  {
    key: "items",
    label: "Items",
    sub: "Buy & sell anything",
    icon: "bi-bag-heart-fill",
    path: "/",
    colorClass: "section-items",
  },
  {
    key: "houses",
    label: "Houses",
    sub: "Rent or buy property",
    icon: "bi-house-fill",
    path: "/houses",
    colorClass: "section-houses",
  },
  {
    key: "jobs",
    label: "Jobs",
    sub: "Find opportunities",
    icon: "bi-briefcase-fill",
    path: "/jobs",
    colorClass: "section-jobs",
  },
  {
    key: "events",
    label: "Events",
    sub: "What's happening",
    icon: "bi-calendar-event-fill",
    path: "/events",
    colorClass: "section-events",
  },
];

const SectionCards = ({ activeSection = "items" }) => {
  const navigate = useNavigate();

  return (
    <div className="section-cards-row">
      {SECTIONS.map(({ key, label, sub, icon, path, colorClass }) => (
        <button
          key={key}
          className={`section-card ${colorClass}${activeSection === key ? " section-card--active" : ""}`}
          onClick={() => navigate(path)}
          aria-label={`Browse ${label}`}
        >
          <span className="section-card__icon-wrap">
            <i className={`bi ${icon}`}></i>
          </span>
          <span className="section-card__body">
            <span className="section-card__label">{label}</span>
            <span className="section-card__sub">{sub}</span>
          </span>
          <i
            className="bi bi-chevron-right section-card__arrow"
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  );
};

export default SectionCards;
