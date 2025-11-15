// ==========================================
// FILE: src/hooks/useInfiniteScroll.js
// ==========================================
import { useState, useEffect, useRef, useCallback } from "react";

export const useInfiniteScroll = (loadMoreCallback, options = {}) => {
  const { threshold = 0.01, rootMargin = "600px", enabled = true } = options;

  const [loading, setLoading] = useState(false);
  const [exhausted, setExhausted] = useState(false);
  const sentinelRef = useRef(null);
  const observerRef = useRef(null);

  const loadMore = useCallback(async () => {
    if (loading || exhausted || !enabled) return;

    setLoading(true);
    try {
      const hasMore = await loadMoreCallback();
      if (!hasMore) {
        setExhausted(true);
      }
    } catch (error) {
      console.error("Error loading more items:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, exhausted, enabled, loadMoreCallback]);

  useEffect(() => {
    if (!sentinelRef.current || !enabled) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !loading && !exhausted) {
            loadMore();
          }
        });
      },
      {
        root: null,
        rootMargin,
        threshold,
      }
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled, loading, exhausted, loadMore, rootMargin, threshold]);

  const reset = () => {
    setExhausted(false);
    setLoading(false);
  };

  return {
    sentinelRef,
    loading,
    exhausted,
    reset,
    setExhausted,
  };
};
