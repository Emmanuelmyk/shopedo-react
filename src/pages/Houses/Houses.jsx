import React, { useState, useEffect, useCallback } from "react";
import AppLayout from "../../components/AppLayout/AppLayout";
import SearchBar from "../../components/SearchBar/SearchBar";
import Sidebar from "../../components/Sidebar/Sidebar";
import AdsCarousel from "../../components/AdsCarousel/AdsCarousel";
import ProductCard from "../../components/ProductCard/ProductCard";
import ProductSkeleton from "../../components/Skeleton/ProductSkeleton";
import EmptyState from "../../components/EmptyState/EmptyState";
import Toast from "../../components/Toast/Toast";
import SectionCards from "../../components/SectionCards/SectionCards";
import { supabase } from "../../utils/supabaseClient";
import { useWishlistContext } from "../../contexts/WishlistContext";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { useImageObserver } from "../../hooks/useImageObserver";
import { useAds } from "../../hooks/useAds";
import "./Houses.css";

const PAGE_SIZE = 12;
const HOUSE_CATEGORY_IDS = [3];

const Houses = () => {
  const [houses, setHouses] = useState([]);
  const [offset, setOffset] = useState(0);
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [emptyStateConfig, setEmptyStateConfig] = useState(null);

  const { toggleWishlist, isInWishlist } = useWishlistContext();
  const { observe: observeImage } = useImageObserver(true);
  const { ads } = useAds();

  const loadMoreHouses = useCallback(async () => {
    try {
      let query = supabase
        .from("products")
        .select(
          "id, name, description, price, category_id, img_path, condition, location",
        )
        .in("category_id", HOUSE_CATEGORY_IDS)
        .order("id", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (currentSearchTerm) {
        query = query.or(
          `name.ilike.%${currentSearchTerm}%,description.ilike.%${currentSearchTerm}%,location.ilike.%${currentSearchTerm}%`,
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching houses:", error);
        return false;
      }

      if (!data || data.length === 0) {
        if (offset === 0) {
          setEmptyStateConfig({
            title: "No house listings found",
            message: currentSearchTerm
              ? `No houses match \"${currentSearchTerm}\". Try a different search.`
              : "There are no house listings yet. Check back soon.",
          });
        } else {
          setToastMessage("You've reached the end of house listings! 🏠");
          setShowToast(true);
        }
        return false;
      }

      setHouses((prev) => [...prev, ...data]);
      setOffset((prev) => prev + data.length);
      setEmptyStateConfig(null);

      return data.length === PAGE_SIZE;
    } catch (err) {
      console.error("Error loading houses:", err);
      return false;
    }
  }, [offset, currentSearchTerm]);

  const { sentinelRef, loading, reset } = useInfiniteScroll(loadMoreHouses, {
    enabled: !emptyStateConfig,
  });

  const resetPagination = () => {
    setHouses([]);
    setOffset(0);
    setEmptyStateConfig(null);
    reset();
  };

  const handleSearch = (searchTerm) => {
    setCurrentSearchTerm(searchTerm);
    resetPagination();
  };

  const handleToggleWishlist = (product) => {
    const wasAdded = toggleWishlist(product);
    setToastMessage(
      wasAdded ? "✓ Added to wishlist!" : "✓ Removed from wishlist",
    );
    setShowToast(true);
  };

  return (
    <AppLayout activeCategory="all" onCategorySelect={() => {}}>
      <div className="layout-container container">
        <Sidebar activeCategory="all" onCategorySelect={() => {}} ads={ads} />

        <main className="product-grid">
          <AdsCarousel ads={ads} isMobile />

          <SearchBar onSearch={handleSearch} initialValue={currentSearchTerm} />

          <SectionCards activeSection="houses" />

          <div className="houses-header">
            <h2 className="houses-title">Houses</h2>
            <p className="houses-subtitle">
              Browse homes available for rent and sale
            </p>
          </div>

          {emptyStateConfig ? (
            <EmptyState
              icon="bi-house"
              title={emptyStateConfig.title}
              message={emptyStateConfig.message}
            />
          ) : (
            <div className="row g-3" id="houses-grid">
              {houses.map((house) => (
                <ProductCard
                  key={house.id}
                  product={house}
                  onSaveToggle={handleToggleWishlist}
                  isInWishlist={isInWishlist(house.id)}
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

export default Houses;
