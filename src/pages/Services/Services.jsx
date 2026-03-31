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
import "./Services.css";

const PAGE_SIZE = 12;
const SERVICE_QUICK_FILTERS = [
  "Plumbing",
  "Electrical",
  "Cleaning",
  "Carpentry",
  "Painting",
  "Catering",
  "Photography",
];

const getSortConfig = (sortBy) => {
  if (sortBy === "oldest") return { column: "id", ascending: true };
  if (sortBy === "price-low") return { column: "price", ascending: true };
  if (sortBy === "price-high") return { column: "price", ascending: false };
  return { column: "id", ascending: false };
};

const Services = () => {
  const [services, setServices] = useState([]);
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

  const loadMoreServices = useCallback(async () => {
    try {
      const sortConfig = getSortConfig(sortBy);

      let query = supabase
        .from("products")
        .select(
          "id, name, description, price, category_id, img_path, condition, location, created_at",
        )
        .ilike("description", "%Listing Type: Service%")
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
        console.error("Error fetching services:", error);
        return false;
      }

      if (!data || data.length === 0) {
        if (offset === 0) {
          setEmptyStateConfig({
            title: "No services found",
            message: currentSearchTerm
              ? `No services match "${currentSearchTerm}". Try a different keyword.`
              : selectedLocation !== "all"
                ? `No services found in ${selectedLocation}.`
                : "No services are available right now. Please check back later.",
          });
        } else {
          setToastMessage("You've reached the end of service listings! 🔧");
          setShowToast(true);
        }
        return false;
      }

      setServices((prev) => [...prev, ...data]);
      setOffset((prev) => prev + data.length);
      setEmptyStateConfig(null);

      return data.length === PAGE_SIZE;
    } catch (err) {
      console.error("Error loading services:", err);
      if (offset === 0) setHasError(true);
      return false;
    }
  }, [offset, currentSearchTerm, selectedLocation, sortBy]);

  const { sentinelRef, loading, reset } = useInfiniteScroll(loadMoreServices, {
    enabled: !emptyStateConfig,
  });

  const resetPagination = () => {
    setServices([]);
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
    <AppLayout section="services" activeFilter={currentSearchTerm} onFilterSelect={handleQuickFilter}>
      <div className="layout-container container">
        <Sidebar
          section="services"
          activeFilter={currentSearchTerm}
          onFilterSelect={handleQuickFilter}
          ads={ads}
        />

        <main className="product-grid">
          <AdsCarousel ads={ads} isMobile />

          <SearchBar onSearch={handleSearch} initialValue={currentSearchTerm} />

          <SectionCards activeSection="services" />

          <div className="services-header">
            <div className="services-title-row">
              <h2 className="services-title">Services</h2>
              <span className="services-count">{services.length} listing(s)</span>
            </div>
            <p className="services-subtitle">
              Find skilled professionals for any job
            </p>
          </div>

          <div className="services-filters">
            <div className="services-filter-field">
              <label htmlFor="services-location">Location</label>
              <div className="services-select-wrap">
                <i
                  className="bi bi-geo-alt services-select-icon"
                  aria-hidden="true"
                ></i>
                <select
                  id="services-location"
                  className="services-select"
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
                  className="bi bi-chevron-down services-select-caret"
                  aria-hidden="true"
                ></i>
              </div>
            </div>

            <div className="services-filter-field">
              <label htmlFor="services-sort">Sort by</label>
              <div className="services-select-wrap">
                <i
                  className="bi bi-sliders services-select-icon"
                  aria-hidden="true"
                ></i>
                <select
                  id="services-sort"
                  className="services-select"
                  value={sortBy}
                  onChange={handleSortChange}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="price-low">Rate: Low to High</option>
                  <option value="price-high">Rate: High to Low</option>
                </select>
                <i
                  className="bi bi-chevron-down services-select-caret"
                  aria-hidden="true"
                ></i>
              </div>
            </div>

            <button
              type="button"
              className="services-clear-btn"
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

          <div className="services-quick-filters">
            {SERVICE_QUICK_FILTERS.map((label) => (
              <button
                key={label}
                type="button"
                className={`services-chip${
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
              icon="bi-tools"
              title={emptyStateConfig.title}
              message={emptyStateConfig.message}
            />
          ) : (
            <div className="row g-3" id="services-grid">
              {services.map((service) => (
                <ProductCard
                  key={service.id}
                  product={service}
                  onSaveToggle={handleToggleWishlist}
                  isInWishlist={isInWishlist(service.id)}
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

export default Services;