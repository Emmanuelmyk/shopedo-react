// ==========================================
// FILE: src/pages/Home/Home.jsx
// ==========================================
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import AppLayout from "../../components/AppLayout/AppLayout";
import SearchBar from "../../components/SearchBar/SearchBar";
import Sidebar from "../../components/Sidebar/Sidebar";
import ProductCard from "../../components/ProductCard/ProductCard";
import ProductSkeleton from "../../components/Skeleton/ProductSkeleton";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import EmptyState from "../../components/EmptyState/EmptyState";
import Toast from "../../components/Toast/Toast";
import { supabase } from "../../utils/supabaseClient";
import { useWishlistContext } from "../../contexts/WishlistContext";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { useImageObserver } from "../../hooks/useImageObserver";
import { useAds } from "../../hooks/useAds";
import { getCategoryName } from "../../utils/categories";
import "./Home.css";

const PAGE_SIZE = 12;

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [offset, setOffset] = useState(0);
  const [currentCategoryId, setCurrentCategoryId] = useState("all");
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [emptyStateConfig, setEmptyStateConfig] = useState(null);

  const { toggleWishlist, isInWishlist } = useWishlistContext();
  const { observe: observeImage } = useImageObserver(true);
  const { ads } = useAds();

  const loadMoreProducts = useCallback(async () => {
    try {
      let query = supabase
        .from("products")
        .select(
          "id, name, description, price, category_id, img_path, condition, location"
        )
        .order("id", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (currentSearchTerm) {
        query = query.or(
          `name.ilike.%${currentSearchTerm}%,description.ilike.%${currentSearchTerm}%`
        );
      }

      if (currentCategoryId !== "all") {
        query = query.eq("category_id", Number(currentCategoryId));
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching products:", error);
        return false;
      }

      if (!data || data.length === 0) {
        if (offset === 0) {
          // Set empty state
          let title = "No products found";
          let message = "Try adjusting your search or filters.";

          if (currentSearchTerm) {
            title = "No results for your search";
            message = `No products match "${currentSearchTerm}". Try different keywords.`;
          } else if (currentCategoryId !== "all") {
            const catName = getCategoryName(parseInt(currentCategoryId));
            title = `No products in ${catName}`;
            message =
              "This category is empty. Check back later for new listings.";
          } else {
            title = "No products available";
            message = "Stay tuned for exciting products coming soon!";
          }

          setEmptyStateConfig({ title, message });
        } else {
          // Show end toast
          setToastMessage("You've reached the end of our products! 🎉");
          setShowToast(true);
        }
        return false;
      }

      setProducts((prev) => [...prev, ...data]);
      setOffset((prev) => prev + data.length);
      setEmptyStateConfig(null);

      return data.length === PAGE_SIZE;
    } catch (err) {
      console.error("Error loading products:", err);
      return false;
    }
  }, [offset, currentCategoryId, currentSearchTerm]);

  const { sentinelRef, loading, reset } = useInfiniteScroll(loadMoreProducts, {
    enabled: !emptyStateConfig,
  });

  // Handle category from URL params
  useEffect(() => {
    const category = searchParams.get("category");
    if (category) {
      setCurrentCategoryId(category);
    }
  }, [searchParams]);

  // Reset pagination when category or search changes
  const resetPagination = () => {
    setProducts([]);
    setOffset(0);
    setEmptyStateConfig(null);
    reset();
  };

  const handleCategorySelect = (categoryId) => {
    setCurrentCategoryId(categoryId);
    if (categoryId === "all") {
      setSearchParams({});
    } else {
      setSearchParams({ category: categoryId });
    }
    resetPagination();
  };

  const handleSearch = (searchTerm) => {
    setCurrentSearchTerm(searchTerm);
    resetPagination();
  };

  const handleToggleWishlist = (product) => {
    const wasAdded = toggleWishlist(product);
    if (wasAdded) {
      setToastMessage("✓ Added to wishlist!");
    } else {
      setToastMessage("✓ Removed from wishlist");
    }
    setShowToast(true);
  };

  const categoryName =
    currentCategoryId !== "all"
      ? getCategoryName(parseInt(currentCategoryId))
      : null;

  return (
    <AppLayout
      activeCategory={currentCategoryId}
      onCategorySelect={handleCategorySelect}
    >
      <div className="layout-container container">
        <Sidebar
          activeCategory={currentCategoryId}
          onCategorySelect={handleCategorySelect}
          ads={ads}
        />

        <main className="product-grid">
          <SearchBar onSearch={handleSearch} initialValue={currentSearchTerm} />

          <Breadcrumb
            categoryName={categoryName}
            onHomeClick={() => handleCategorySelect("all")}
          />

          {emptyStateConfig ? (
            <EmptyState
              icon="bi-inbox"
              title={emptyStateConfig.title}
              message={emptyStateConfig.message}
            />
          ) : (
            <div className="row g-3" id="products-grid">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSaveToggle={handleToggleWishlist}
                  isInWishlist={isInWishlist(product.id)}
                  imageObserver={{ observe: observeImage }}
                />
              ))}
              {loading && <ProductSkeleton count={PAGE_SIZE} />}
            </div>
          )}

          <div
            ref={sentinelRef}
            id="scroll-sentinel"
            style={{ height: "1px" }}
          ></div>
        </main>
      </div>

      <Toast
        show={showToast}
        message={toastMessage}
        onClose={() => setShowToast(false)}
      />
    </AppLayout>
  );
};

export default Home;
