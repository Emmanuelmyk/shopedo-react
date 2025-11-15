// ==========================================
// FILE: src/utils/categories.js
// ==========================================
export const CATEGORIES = [
  { id: 1, name: "Electronics", icon: "tv" },
  { id: 2, name: "Fashion", icon: "person" },
  { id: 3, name: "Home & Kitchen", icon: "house" },
  { id: 4, name: "Beauty & Health", icon: "heart" },
  { id: 5, name: "Sports & Outdoors", icon: "basket" },
  { id: 6, name: "Books & Stationery", icon: "book" },
  { id: 7, name: "Automotive", icon: "car-front" },
  { id: 8, name: "Toys & Baby", icon: "puzzle" },
  { id: 9, name: "Groceries", icon: "basket2" },
  { id: 10, name: "Electronics Accessories", icon: "plug" },
];

export const getCategoryName = (categoryId) => {
  const category = CATEGORIES.find((c) => c.id === categoryId);
  return category ? category.name : "";
};

export const getCategoryIcon = (categoryId) => {
  const category = CATEGORIES.find((c) => c.id === categoryId);
  return category ? category.icon : "";
};
