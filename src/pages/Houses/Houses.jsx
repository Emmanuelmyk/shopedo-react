import React, { useState, useCallback } from "react";
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
import { LOCATIONS } from "../../utils/locations";
import "./Houses.css";

const PAGE_SIZE = 12;
const HOUSE_CATEGORY_IDS = [3];
const HOUSE_QUICK_FILTERS = [
  "Apartment",
  "Self Contain",
  "Duplex",
  "Land",
  "Office",
];

const getSortConfig = (sortBy) => {
  if (sortBy === "oldest") return { column: "id", ascending: true };
  if (sortBy === "price-low") return { column: "price", ascending: true };
  if (sortBy === "price-high") return { column: "price", ascending: false };
  return { column: "id", ascending: false };
};

const Houses = () => {
  const [houses, setHouses] = useState([]);
  const [offset, setOffset] = useState(0);
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

  const loadMoreHouses = useCallback(async () => {
    try {
      const sortConfig = getSortConfig(sortBy);

      let query = supabase
        .from("products")
        .select(
          "id, name, description, price, category_id, img_path, condition, location",
        )
        .in("category_id", HOUSE_CATEGORY_IDS)
        .order(sortConfig.column, { ascending: sortConfig.ascending })
        .range(offset, offset + PAGE_SIZE - 1);

      if (currentSearchTerm) {
        query = query.or(
          `name.ilike.%${currentSearchTerm}%,description.ilike.%${currentSearchTerm}%,location.ilike.%${currentSearchTerm}%`,
        );
      }

      if (selectedLocation !== "all") {
        query = query.eq("location", selectedLocation);
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
              : selectedLocation !== "all"
                ? `No house listings found in ${selectedLocation}.`
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
      if (offset === 0) setHasError(true);
      return false;
    }
  }, [offset, currentSearchTerm, selectedLocation, sortBy]);

  const { sentinelRef, loading, reset } = useInfiniteScroll(loadMoreHouses, {
    enabled: !emptyStateConfig,
  });

  const resetPagination = () => {
    setHouses([]);
    setOffset(0);
    setEmptyStateConfig(null);
    setHasError(false);
    reset();
  };

  const handleSearch = (searchTerm) => {
    setCurrentSearchTerm(searchTerm);
    resetPagination();
  };

  const handleQuickFilter = (label) => {
    setCurrentSearchTerm(label);
    resetPagination();
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    resetPagination();
  };

  const handleLocationChange = (e) => {
    setSelectedLocation(e.target.value);
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
    setToastMessage(
      wasAdded ? "✓ Added to wishlist!" : "✓ Removed from wishlist",
    );
    setShowToast(true);
  };

  return (
    <AppLayout section="houses" activeFilter={currentSearchTerm} onFilterSelect={handleQuickFilter}>
      <div className="layout-container container">
        <Sidebar
          section="houses"
          activeFilter={currentSearchTerm}
          onFilterSelect={handleQuickFilter}
          ads={ads}
        />

        <main className="product-grid">
          <AdsCarousel ads={ads} isMobile />

          <SearchBar onSearch={handleSearch} initialValue={currentSearchTerm} />

          <SectionCards activeSection="houses" />

          <div className="houses-header">
            <div className="houses-title-row">
              <h2 className="houses-title">Houses</h2>
              <span className="houses-count">{houses.length} listing(s)</span>
            </div>
            <p className="houses-subtitle">
              Browse homes available for rent and sale
            </p>
          </div>

          <div className="houses-filters">
            <div className="houses-filter-field">
              <label htmlFor="houses-location">Location</label>
              <div className="houses-select-wrap">
                <i
                  className="bi bi-geo-alt houses-select-icon"
                  aria-hidden="true"
                ></i>
                <select
                  id="houses-location"
                  className="houses-select"
                  value={selectedLocation}
                  onChange={handleLocationChange}
                >
                  <option value="all">All locations</option>
                  {LOCATIONS.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
                <i
                  className="bi bi-chevron-down houses-select-caret"
                  aria-hidden="true"
                ></i>
              </div>
            </div>

            <div className="houses-filter-field">
              <label htmlFor="houses-sort">Sort by</label>
              <div className="houses-select-wrap">
                <i
                  className="bi bi-sliders houses-select-icon"
                  aria-hidden="true"
                ></i>
                <select
                  id="houses-sort"
                  className="houses-select"
                  value={sortBy}
                  onChange={handleSortChange}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
                <i
                  className="bi bi-chevron-down houses-select-caret"
                  aria-hidden="true"
                ></i>
              </div>
            </div>

            <button
              type="button"
              className="houses-clear-btn"
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

          <div className="houses-quick-filters">
            {HOUSE_QUICK_FILTERS.map((label) => (
              <button
                key={label}
                type="button"
                className={`houses-chip${
                  currentSearchTerm.toLowerCase() === label.toLowerCase()
                    ? " active"
                    : ""
                }`}
                onClick={() => handleQuickFilter(label)}
              >
                {label}
              </button>
            ))}
          </div>

          {hasError ? (
            <EmptyState
              icon="bi-wifi-off"
              title="Something went wrong"
              message="We couldn't load listings right now. Check your connection and try again."
            />
          ) : emptyStateConfig ? (
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
