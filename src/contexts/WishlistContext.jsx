// ==========================================
// FILE: src/contexts/WishlistContext.jsx
// ==========================================
import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getWishlistItems,
  addToWishlist as addItem,
  removeFromWishlist as removeItem,
  isInWishlist as checkInWishlist,
} from "../utils/wishlistUtils";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);

  const loadWishlist = () => {
    const items = getWishlistItems();
    setWishlistItems(items);
    setWishlistCount(items.length);
  };

  useEffect(() => {
    loadWishlist();

    // Listen for storage changes (in case user opens multiple tabs)
    const handleStorageChange = (e) => {
      if (e.key === "wishlistItems") {
        loadWishlist();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const toggleWishlist = (product) => {
    const wasAdded = !checkInWishlist(product.id);
    
    if (checkInWishlist(product.id)) {
      removeItem(product.id);
    } else {
      addItem(product);
    }
    
    loadWishlist();
    return wasAdded; // Return true if added, false if removed
  };

  const removeFromWishlist = (productId) => {
    removeItem(productId);
    loadWishlist();
  };

  const isInWishlist = (productId) => {
    return checkInWishlist(productId);
  };

  const value = {
    wishlistItems,
    wishlistCount,
    toggleWishlist,
    removeFromWishlist,
    isInWishlist,
    refreshWishlist: loadWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlistContext = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlistContext must be used within WishlistProvider");
  }
  return context;
};

