// ==========================================
// FILE: src/utils/formatUtils.js
// ==========================================
export const escapeHtml = (str) => {
  if (str == null) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
};

export const formatNumber = (n) => {
  if (n == null) return "0";
  try {
    return Number(n).toLocaleString();
  } catch {
    return n;
  }
};

export const formatDate = (dateString) => {
  if (!dateString) return "Unknown";
  return new Date(dateString).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
