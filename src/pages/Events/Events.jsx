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
import "./Events.css";

const PAGE_SIZE = 12;

const Events = () => {
  const [events, setEvents] = useState([]);
  const [offset, setOffset] = useState(0);
  const [currentSearchTerm, setCurrentSearchTerm] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [emptyStateConfig, setEmptyStateConfig] = useState(null);

  const { toggleWishlist, isInWishlist } = useWishlistContext();
  const { observe: observeImage } = useImageObserver(true);
  const { ads } = useAds();

  const loadMoreEvents = useCallback(async () => {
    try {
      let query = supabase
        .from("products")
        .select(
          "id, name, description, price, category_id, img_path, condition, location",
        )
        .or(
          "name.ilike.%event%,description.ilike.%event%,name.ilike.%ticket%,description.ilike.%ticket%,name.ilike.%show%,description.ilike.%show%",
        )
        .order("id", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);

      if (currentSearchTerm) {
        query = query.or(
          `name.ilike.%${currentSearchTerm}%,description.ilike.%${currentSearchTerm}%,location.ilike.%${currentSearchTerm}%`,
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching events:", error);
        return false;
      }

      if (!data || data.length === 0) {
        if (offset === 0) {
          setEmptyStateConfig({
            title: "No event listings found",
            message: currentSearchTerm
              ? `No events match \"${currentSearchTerm}\". Try a different keyword.`
              : "No events are available right now. Please check back later.",
          });
        } else {
          setToastMessage("You've reached the end of event listings! 🎟️");
          setShowToast(true);
        }
        return false;
      }

      setEvents((prev) => [...prev, ...data]);
      setOffset((prev) => prev + data.length);
      setEmptyStateConfig(null);

      return data.length === PAGE_SIZE;
    } catch (err) {
      console.error("Error loading events:", err);
      return false;
    }
  }, [offset, currentSearchTerm]);

  const { sentinelRef, loading, reset } = useInfiniteScroll(loadMoreEvents, {
    enabled: !emptyStateConfig,
  });

  const resetPagination = () => {
    setEvents([]);
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

          <SectionCards activeSection="events" />

          <div className="events-header">
            <h2 className="events-title">Events</h2>
            <p className="events-subtitle">
              Find concerts, meetups, and local happenings
            </p>
          </div>

          {emptyStateConfig ? (
            <EmptyState
              icon="bi-calendar-event"
              title={emptyStateConfig.title}
              message={emptyStateConfig.message}
            />
          ) : (
            <div className="row g-3" id="events-grid">
              {events.map((eventItem) => (
                <ProductCard
                  key={eventItem.id}
                  product={eventItem}
                  onSaveToggle={handleToggleWishlist}
                  isInWishlist={isInWishlist(eventItem.id)}
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

export default Events;
