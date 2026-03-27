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
        { label: "Apartment",    match: "Property Type: Apartment" },
        { label: "Self Contain", match: "Property Type: Self Contain" },
        { label: "Duplex",       match: "Property Type: Duplex" },
        { label: "Bungalow",     match: "Property Type: Bungalow" },
        { label: "Land",         match: "Property Type: Land" },
        { label: "Office Space", match: "Property Type: Office Space" },
      ],
    },
    {
      key: "offerType",
      label: "Offer Type",
      options: [
        { label: "For Rent",  match: "Offer Type: For Rent" },
        { label: "For Sale",  match: "Offer Type: For Sale" },
        { label: "Short Let", match: "Offer Type: Short Let" },
      ],
    },
  ],
  jobs: [
    {
      key: "jobType",
      label: "Job Type",
      options: [
        { label: "Full-time",  match: "Job Type: Full-time" },
        { label: "Part-time",  match: "Job Type: Part-time" },
        { label: "Contract",   match: "Job Type: Contract" },
        { label: "Internship", match: "Job Type: Internship" },
      ],
    },
    {
      key: "workMode",
      label: "Work Mode",
      options: [
        { label: "On-site", match: "Work Mode: On-site" },
        { label: "Remote",  match: "Work Mode: Remote" },
        { label: "Hybrid",  match: "Work Mode: Hybrid" },
      ],
    },
  ],
  events: [
    {
      key: "ticketType",
      label: "Ticket Type",
      options: [
        { label: "Paid",        match: "Ticket Type: Paid" },
        { label: "Free",        match: "Ticket Type: Free" },
        { label: "Invite Only", match: "Ticket Type: Invite Only" },
      ],
    },
  ],
  services: [
    {
      key: "serviceType",
      label: "Service Type",
      options: [
        { label: "Plumbing",    match: "Service Type: Plumbing" },
        { label: "Electrical",  match: "Service Type: Electrical" },
        { label: "Cleaning",    match: "Service Type: Cleaning" },
        { label: "Carpentry",   match: "Service Type: Carpentry" },
        { label: "Painting",    match: "Service Type: Painting" },
        { label: "Catering",    match: "Service Type: Catering" },
        { label: "Photography", match: "Service Type: Photography" },
        { label: "Security",    match: "Service Type: Security" },
        { label: "Laundry",     match: "Service Type: Laundry" },
        { label: "Tutoring",    match: "Service Type: Tutoring" },
      ],
    },
  ],
};
