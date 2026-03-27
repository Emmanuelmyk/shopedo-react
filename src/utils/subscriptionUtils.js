// ==========================================
// FILE: src/utils/subscriptionUtils.js
// ==========================================

export const PLANS = {
  free: {
    key: "free",
    name: "Free",
    price: 0,
    limit: 3,
    label: "Free",
    description: "Get started with 3 posts",
    icon: "bi-gift",
  },
  basic: {
    key: "basic",
    name: "Basic",
    price: 300000, // kobo
    limit: 15,
    label: "₦3,000",
    description: "15 product listings",
    icon: "bi-star",
  },
  pro: {
    key: "pro",
    name: "Pro",
    price: 700000, // kobo
    limit: 50,
    label: "₦7,000",
    description: "50 product listings",
    icon: "bi-star-fill",
  },
  premium: {
    key: "premium",
    name: "Premium",
    price: 1500000, // kobo
    limit: -1,
    label: "₦15,000",
    description: "Unlimited listings",
    icon: "bi-gem",
  },
};

// Pay-per-post fees in kobo (₦1 = 100 kobo)
export const PAY_PER_POST_FEES = {
  services: 200000, // ₦2,000
  events: 500000,   // ₦5,000
  jobs: 150000,     // ₦1,500
};

export const PAY_PER_POST_LABELS = {
  services: "₦2,000",
  events: "₦5,000",
  jobs: "₦1,500",
};

export const isUnlimited = (sub) => sub?.posts_limit === -1;

export const hasPostsLeft = (sub) =>
  isUnlimited(sub) || (sub?.posts_used ?? 0) < (sub?.posts_limit ?? 3);

export const isPayPerPost = (listingType) =>
  listingType in PAY_PER_POST_FEES;

export const getPostFeeKobo = (listingType) =>
  PAY_PER_POST_FEES[listingType] ?? 0;

export const getPostFeeLabel = (listingType) =>
  PAY_PER_POST_LABELS[listingType] ?? "";

export const getPlanLimitLabel = (plan) => {
  const p = PLANS[plan] ?? PLANS.free;
  return p.limit === -1 ? "Unlimited" : `${p.limit} posts`;
};
