// ==========================================
// FILE: src/components/AppLayout/AppLayout.jsx
// ==========================================
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import Navbar from "../Navbar/Navbar";
import WishlistOffcanvas from "../Wishlist/WishlistOffcanvas";
import CategoryMenu from "../CategoryMenu/CategoryMenu";
import Footer from "../Footer/Footer";
import { useWishlistContext } from "../../contexts/WishlistContext";
import { useAds } from "../../hooks/useAds";
import { shareProduct } from "../../utils/wishlistUtils";

/**
 * AppLayout component - Provides consistent layout structure across pages
 * Manages shared state for wishlist, category menu, and navigation
 *
 * @param {ReactNode} children - Page content to render
 * @param {string} activeCategory - Currently active category ID
 * @param {Function} onCategorySelect - Callback when category is selected
 * @param {boolean} showFooter - Whether to show footer (default: true)
 */
const AppLayout = ({
  children,
  activeCategory = "all",
  onCategorySelect,
  showFooter = true,
}) => {
  const navigate = useNavigate();
  const [showWishlist, setShowWishlist] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  const { wishlistItems, wishlistCount, removeFromWishlist } =
    useWishlistContext();

  const { ads } = useAds();

  const handleMenuToggle = () => {
    // Close wishlist if it's open
    if (showWishlist) {
      setShowWishlist(false);
    }
    // Toggle category menu
    setShowCategoryMenu((prev) => !prev);
  };

  const handleWishlistToggle = () => {
    // Close category menu if it's open
    if (showCategoryMenu) {
      setShowCategoryMenu(false);
    }
    // Toggle wishlist (open if closed, close if open)
    setShowWishlist((prev) => !prev);
  };

  const handleStartShopping = () => {
    setShowWishlist(false);
    if (window.location.pathname !== "/") {
      navigate("/");
    }
  };

  const handleCategorySelectInternal = (categoryId) => {
    setShowCategoryMenu(false);
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    } else {
      // Default behavior: navigate to home with category
      if (categoryId === "all") {
        navigate("/");
      } else {
        navigate(`/?category=${categoryId}`);
      }
    }
  };

  return (
    <>
      <Navbar
        wishlistCount={wishlistCount}
        onWishlistClick={handleWishlistToggle}
        onMenuToggle={handleMenuToggle}
        menuActive={showCategoryMenu}
        wishlistActive={showWishlist}
      />

      <WishlistOffcanvas
        show={showWishlist}
        onHide={() => setShowWishlist(false)}
        wishlistItems={wishlistItems}
        onRemove={removeFromWishlist}
        onShare={shareProduct}
        onStartShopping={handleStartShopping}
      />

      <CategoryMenu
        show={showCategoryMenu}
        onHide={() => setShowCategoryMenu(false)}
        activeCategory={activeCategory}
        onCategorySelect={handleCategorySelectInternal}
        ads={ads}
      />

      {children}

      {showFooter && <Footer />}
    </>
  );
};

AppLayout.propTypes = {
  children: PropTypes.node.isRequired,
  activeCategory: PropTypes.string,
  onCategorySelect: PropTypes.func,
  showFooter: PropTypes.bool,
};

export default AppLayout;
