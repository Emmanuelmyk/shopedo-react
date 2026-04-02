import { useEffect, useRef } from "react";
import { supabase } from "../utils/supabaseClient";

/**
 * Polls the products table and calls onNewProduct() when the max id grows.
 * Also fires immediately when the tab becomes visible again.
 *
 * Uses the global max id (no listing_type filter) so it works regardless
 * of whether listing_type is populated on existing rows.
 */
export const useProductsRealtime = (_listingType, onNewProduct) => {
  const callbackRef = useRef(onNewProduct);
  useEffect(() => {
    callbackRef.current = onNewProduct;
  });

  // Start at 0 — guaranteed to be less than any real id
  const latestIdRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id")
          .order("id", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (cancelled || error || !data) return;

        if (latestIdRef.current === 0) {
          // First run — just record the baseline, don't refresh
          latestIdRef.current = data.id;
          return;
        }

        if (data.id > latestIdRef.current) {
          latestIdRef.current = data.id;
          callbackRef.current?.();
        }
      } catch (_) {
        // silently ignore network errors
      }
    };

    // Baseline check immediately on mount
    check();

    // Poll every 15 seconds
    const interval = setInterval(check, 15_000);

    // Also check when the tab becomes visible
    const handleVisibility = () => {
      if (document.visibilityState === "visible") check();
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);
};
