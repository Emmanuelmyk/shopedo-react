// ==========================================
// FILE: src/pages/Items/Items.jsx
// ==========================================
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import AppLayout from "../../components/AppLayout/AppLayout";
import SearchBar from "../../components/SearchBar/SearchBar";
import Sidebar from "../../components/Sidebar/Sidebar";
import AdsCarousel from "../../components/AdsCarousel/AdsCarousel";
import ProductCard from "../../components/ProductCard/ProductCard";
import ProductSkeleton from "../../components/Skeleton/ProductSkeleton";
import EmptyState from "../../components/EmptyState/EmptyState";
import Toast from "../../components/Toast/Toast";
import { supabase } from "../../utils/supabaseClient";
import { useWishlistContext } from "../../contexts/WishlistContext";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { useImageObserver } from "../../hooks/useImageObserver";
import { useAds } from "../../hooks/useAds";
import { getCategoryName } from "../../utils/categories";
import { LOCATIONS } from "../../utils/locations";
import SectionCards from "../../components/SectionCards/SectionCards";
import CustomSelect from "../../components/CustomSelect/CustomSelect";
import "../Home/Home.css";

const PAGE_SIZE = 12;

const LOCATION_OPTIONS = [
  { value: "all", label: "All locations" },
  ...LOCATIONS.map((l) => ({ value: l, label: l })),
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

const getSortConfig = (sortBy) => {
  if (sortBy === "oldest") return { column: "id", ascending: true };
  if (sortBy === "price-low") return { column: "price", ascending: true };
  if (sortBy === "price-high") return { column: "price", ascending: false };
  return { column: "id", ascending: false };
};

const Items = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [offset, setOffset] = useState(0);
  const [currentCategoryId, setCurrentCategoryId] = useState("all");
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [emptyStateConfig, setEmptyStateConfig] = useState(null);
  const [hasError, setHasError] = useState(false);

  const { toggleWishlist, isInWishlist } = useWishlistContext();
  const { observe: observeImage } = useImageObserver(true);
  const { ads } = useAds();

  const loadMoreProducts = useCallback(async () => {
    try {
      const sortConfig = getSortConfig(sortBy);

      let query = supabase
        .from("products")
        .select(
          "id, name, description, price, category_id, img_path, condition, location",
        )
        .eq("listing_type", "item")
        .order(sortConfig.column, { ascending: sortConfig.ascending })
        .range(offset, offset + PAGE_SIZE - 1);

      if (currentSearchTerm) {
        query = query.or(
          `name.ilike.%${currentSearchTerm}%,description.ilike.%${currentSearchTerm}%,location.ilike.%${currentSearchTerm}%`,
        );
      }

      if (currentCategoryId !== "all") {
        query = query.eq("category_id", Number(currentCategoryId));
      }

      if (selectedLocation !== "all") {
        query = query.eq("location", selectedLocation);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching items:", error);
        return false;
      }

      if (!data || data.length === 0) {
        if (offset === 0) {
          let title = "No items found";
          let message = "Try adjusting your search or filters.";

          if (currentSearchTerm) {
            title = "No results for your search";
            message = `No items match "${currentSearchTerm}". Try different keywords.`;
          } else if (selectedLocation !== "all") {
            title = `No items in ${selectedLocation}`;
            message = "Try a nearby location or remove location filter.";
          } else if (currentCategoryId !== "all") {
            const catName = getCategoryName(parseInt(currentCategoryId));
            title = `No items in ${catName}`;
            message = "This category is empty. Check back later for new listings.";
          } else {
            title = "No items available";
            message = "Stay tuned for exciting items coming soon!";
          }

          setEmptyStateConfig({ title, message });
        } else {
          setToastMessage("You've reached the end of our items! 🎉");
          setShowToast(true);
        }
        return false;
      }

      setProducts((prev) => [...prev, ...data]);
      setOffset((prev) => prev + data.length);
      setEmptyStateConfig(null);

      return data.length === PAGE_SIZE;
    } catch (err) {
      console.error("Error loading items:", err);
      if (offset === 0) setHasError(true);
      return false;
    }
  }, [offset, currentCategoryId, currentSearchTerm, selectedLocation, sortBy]);

  const { sentinelRef, loading, reset } = useInfiniteScroll(loadMoreProducts, {
    enabled: !emptyStateConfig,
  });

  useEffect(() => {
    const category = searchParams.get("category");
    if (category) {
      setCurrentCategoryId(category);
    }
  }, [searchParams]);

  const resetPagination = () => {
    setProducts([]);
    setOffset(0);
    setEmptyStateConfig(null);
    setHasError(false);
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

  const handleLocationChange = (value) => {
    setSelectedLocation(value);
    resetPagination();
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    resetPagination();
  };

  const handleClearFilters = () => {
    setCurrentSearchTerm("");
    setSelectedLocation("all");
    setSortBy("newest");
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
  const itemsTitle = categoryName || "Items";
  const itemsSubtitle = categoryName
    ? `Browse items in ${categoryName}`
    : "Browse all available items";

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
          <AdsCarousel ads={ads} isMobile />

          <SearchBar onSearch={handleSearch} initialValue={currentSearchTerm} />

          <SectionCards activeSection="items" />

          <div className="items-header">
            <div className="items-title-row">
              <h2 className="items-title">{itemsTitle}</h2>
              <span className="items-count">{products.length} listing(s)</span>
            </div>
            <p className="items-subtitle">{itemsSubtitle}</p>
          </div>

          <div className="items-filters">
            <div className="items-filter-field">
              <label>Location</label>
              <CustomSelect
                value={selectedLocation}
                onChange={handleLocationChange}
                options={LOCATION_OPTIONS}
                icon="bi-geo-alt"
              />
            </div>

            <div className="items-filter-field">
              <label>Sort by</label>
              <CustomSelect
                value={sortBy}
                onChange={handleSortChange}
                options={SORT_OPTIONS}
                icon="bi-sliders"
              />
            </div>

            <button
              type="button"
              className="items-clear-btn"
              onClick={handleClearFilters}
              disabled={
                !currentSearchTerm &&
                selectedLocation === "all" &&
                sortBy === "newest"
              }
            >
              Clear Filters
            </button>
          </div>

          {hasError ? (
            <EmptyState
              icon="bi-wifi-off"
              title="Something went wrong"
              message="We couldn't load items right now. Check your connection and try again."
            />
          ) : emptyStateConfig ? (
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

export default Items;
