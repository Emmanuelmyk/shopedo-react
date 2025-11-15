// ==========================================
// FILE: src/hooks/useWishlist.js
// ==========================================
import { useState, useEffect } from "react";
import {
  getWishlistItems,
  addToWishlist as addItem,
  removeFromWishlist as removeItem,
  isInWishlist as checkInWishlist,
  getWishlistCount,
} from "../utils/wishlistUtils";

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);

  const loadWishlist = () => {
    const items = getWishlistItems();
    setWishlistItems(items);
    setWishlistCount(items.length);
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const toggleWishlist = (product) => {
    if (checkInWishlist(product.id)) {
      removeItem(product.id);
    } else {
      addItem(product);
    }
    loadWishlist();
  };

  const removeFromWishlist = (productId) => {
    removeItem(productId);
    loadWishlist();
  };

  const isInWishlist = (productId) => {
    return checkInWishlist(productId);
  };

  return {
    wishlistItems,
    wishlistCount,
    toggleWishlist,
    removeFromWishlist,
    isInWishlist,
    refreshWishlist: loadWishlist,
  };
};
