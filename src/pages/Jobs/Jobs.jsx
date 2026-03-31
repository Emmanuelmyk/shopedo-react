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
import "./Jobs.css";

const PAGE_SIZE = 12;
const JOB_QUICK_FILTERS = [
  "Remote",
  "Part-time",
  "Full-time",
  "Internship",
  "Contract",
];

const getSortConfig = (sortBy) => {
  if (sortBy === "oldest") return { column: "id", ascending: true };
  if (sortBy === "price-low") return { column: "price", ascending: true };
  if (sortBy === "price-high") return { column: "price", ascending: false };
  return { column: "id", ascending: false };
};

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
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

  const loadMoreJobs = useCallback(async () => {
    try {
      const sortConfig = getSortConfig(sortBy);

      let query = supabase
        .from("products")
        .select(
          "id, name, description, price, category_id, img_path, condition, location, created_at",
        )
        .or(
          "name.ilike.%job%,description.ilike.%job%,name.ilike.%hiring%,description.ilike.%hiring%,name.ilike.%vacancy%,description.ilike.%vacancy%",
        )
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
        console.error("Error fetching jobs:", error);
        return false;
      }

      if (!data || data.length === 0) {
        if (offset === 0) {
          setEmptyStateConfig({
            title: "No job listings found",
            message: currentSearchTerm
              ? `No jobs match \"${currentSearchTerm}\". Try a different keyword.`
              : selectedLocation !== "all"
                ? `No job listings found in ${selectedLocation}.`
                : "No job listings are available right now. Please check back later.",
          });
        } else {
          setToastMessage("You've reached the end of job listings! 💼");
          setShowToast(true);
        }
        return false;
      }

      setJobs((prev) => [...prev, ...data]);
      setOffset((prev) => prev + data.length);
      setEmptyStateConfig(null);

      return data.length === PAGE_SIZE;
    } catch (err) {
      console.error("Error loading jobs:", err);
      if (offset === 0) setHasError(true);
      return false;
    }
  }, [offset, currentSearchTerm, selectedLocation, sortBy]);

  const { sentinelRef, loading, reset } = useInfiniteScroll(loadMoreJobs, {
    enabled: !emptyStateConfig,
  });

  const resetPagination = () => {
    setJobs([]);
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
    <AppLayout section="jobs" activeFilter={currentSearchTerm} onFilterSelect={handleQuickFilter}>
      <div className="layout-container container">
        <Sidebar
          section="jobs"
          activeFilter={currentSearchTerm}
          onFilterSelect={handleQuickFilter}
          ads={ads}
        />

        <main className="product-grid">
          <AdsCarousel ads={ads} isMobile />

          <SearchBar onSearch={handleSearch} initialValue={currentSearchTerm} />

          <SectionCards activeSection="jobs" />

          <div className="jobs-header">
            <div className="jobs-title-row">
              <h2 className="jobs-title">Jobs</h2>
              <span className="jobs-count">{jobs.length} listing(s)</span>
            </div>
            <p className="jobs-subtitle">
              Discover open roles and hiring opportunities
            </p>
          </div>

          <div className="jobs-filters">
            <div className="jobs-filter-field">
              <label htmlFor="jobs-location">Location</label>
              <div className="jobs-select-wrap">
                <i
                  className="bi bi-geo-alt jobs-select-icon"
                  aria-hidden="true"
                ></i>
                <select
                  id="jobs-location"
                  className="jobs-select"
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
                  className="bi bi-chevron-down jobs-select-caret"
                  aria-hidden="true"
                ></i>
              </div>
            </div>

            <div className="jobs-filter-field">
              <label htmlFor="jobs-sort">Sort by</label>
              <div className="jobs-select-wrap">
                <i
                  className="bi bi-sliders jobs-select-icon"
                  aria-hidden="true"
                ></i>
                <select
                  id="jobs-sort"
                  className="jobs-select"
                  value={sortBy}
                  onChange={handleSortChange}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="price-low">Salary: Low to High</option>
                  <option value="price-high">Salary: High to Low</option>
                </select>
                <i
                  className="bi bi-chevron-down jobs-select-caret"
                  aria-hidden="true"
                ></i>
              </div>
            </div>

            <button
              type="button"
              className="jobs-clear-btn"
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

          <div className="jobs-quick-filters">
            {JOB_QUICK_FILTERS.map((label) => (
              <button
                key={label}
                type="button"
                className={`jobs-chip${
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
              icon="bi-briefcase"
              title={emptyStateConfig.title}
              message={emptyStateConfig.message}
            />
          ) : (
            <div className="row g-3" id="jobs-grid">
              {jobs.map((job) => (
                <ProductCard
                  key={job.id}
                  product={job}
                  onSaveToggle={handleToggleWishlist}
                  isInWishlist={isInWishlist(job.id)}
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

export default Jobs;
