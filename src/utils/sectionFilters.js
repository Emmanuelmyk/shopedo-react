// ==========================================
// FILE: src/utils/sectionFilters.js
// ==========================================

export const SECTIONS = [
  { key: "all",      label: "All",      icon: "bi-grid-fill" },
  { key: "items",    label: "Items",    icon: "bi-bag-heart" },
  { key: "houses",   label: "Houses",   icon: "bi-house-door" },
  { key: "jobs",     label: "Jobs",     icon: "bi-briefcase" },
  { key: "events",   label: "Events",   icon: "bi-calendar-event" },
  { key: "services", label: "Services", icon: "bi-tools" },
];

// Maps app section key → DB listing_type value
export const SECTION_DB_TYPE = {
  items:    "item",
  houses:   "house",
  jobs:     "job",
  events:   "event",
  services: "service",
};

// Sub-filter groups per section.
// Each option's `match` value is used in a description ILIKE query.
export const SECTION_SUB_FILTERS = {
  houses: [
    {
      key: "propertyType",
      label: "Property Type",
      options: [
        { label: "Apartment",    icon: "bi-building",       match: "Property Type: Apartment" },
        { label: "Self Contain", icon: "bi-house",          match: "Property Type: Self Contain" },
        { label: "Duplex",       icon: "bi-houses",         match: "Property Type: Duplex" },
        { label: "Bungalow",     icon: "bi-house-door",     match: "Property Type: Bungalow" },
        { label: "Land",         icon: "bi-map",            match: "Property Type: Land" },
        { label: "Office Space", icon: "bi-building-fill",  match: "Property Type: Office Space" },
      ],
    },
    {
      key: "offerType",
      label: "Offer Type",
      options: [
        { label: "For Rent",  icon: "bi-key",  match: "Offer Type: For Rent" },
        { label: "For Sale",  icon: "bi-tag",  match: "Offer Type: For Sale" },
        { label: "Short Let", icon: "bi-clock", match: "Offer Type: Short Let" },
      ],
    },
  ],
  jobs: [
    {
      key: "jobType",
      label: "Job Type",
      options: [
        { label: "Full-time",  icon: "bi-briefcase-fill",      match: "Job Type: Full-time" },
        { label: "Part-time",  icon: "bi-briefcase",           match: "Job Type: Part-time" },
        { label: "Contract",   icon: "bi-file-earmark-text",   match: "Job Type: Contract" },
        { label: "Internship", icon: "bi-person-workspace",    match: "Job Type: Internship" },
      ],
    },
    {
      key: "workMode",
      label: "Work Mode",
      options: [
        { label: "On-site", icon: "bi-building",  match: "Work Mode: On-site" },
        { label: "Remote",  icon: "bi-laptop",    match: "Work Mode: Remote" },
        { label: "Hybrid",  icon: "bi-diagram-2", match: "Work Mode: Hybrid" },
      ],
    },
  ],
  events: [
    {
      key: "ticketType",
      label: "Ticket Type",
      options: [
        { label: "Paid",        icon: "bi-ticket-perforated-fill", match: "Ticket Type: Paid" },
        { label: "Free",        icon: "bi-gift",                   match: "Ticket Type: Free" },
        { label: "Invite Only", icon: "bi-envelope",               match: "Ticket Type: Invite Only" },
      ],
    },
  ],
  services: [
    {
      key: "serviceType",
      label: "Service Type",
      options: [
        { label: "Plumbing",    icon: "bi-droplet",      match: "Service Type: Plumbing" },
        { label: "Electrical",  icon: "bi-lightning",    match: "Service Type: Electrical" },
        { label: "Cleaning",    icon: "bi-brush",        match: "Service Type: Cleaning" },
        { label: "Carpentry",   icon: "bi-hammer",       match: "Service Type: Carpentry" },
        { label: "Painting",    icon: "bi-palette",      match: "Service Type: Painting" },
        { label: "Catering",    icon: "bi-cup-hot",      match: "Service Type: Catering" },
        { label: "Photography", icon: "bi-camera",       match: "Service Type: Photography" },
        { label: "Security",    icon: "bi-shield-check", match: "Service Type: Security" },
        { label: "Laundry",     icon: "bi-water",        match: "Service Type: Laundry" },
        { label: "Tutoring",    icon: "bi-book",         match: "Service Type: Tutoring" },
      ],
    },
  ],
};
