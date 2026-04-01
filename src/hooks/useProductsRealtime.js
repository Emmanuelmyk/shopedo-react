import { useEffect, useRef } from "react";
import { supabase } from "../utils/supabaseClient";

/**
 * Subscribes to Supabase Realtime INSERT events on the products table.
 * Calls onInsert() whenever a new product matching listingType is added.
 *
 * Requires Supabase Realtime to be enabled for the products table.
 */
export const useProductsRealtime = (listingType, onInsert) => {
  // Keep a ref so the subscription never needs to be torn down just because
  // the parent re-rendered with a new callback function reference.
  const callbackRef = useRef(onInsert);
  useEffect(() => {
    callbackRef.current = onInsert;
  });

  useEffect(() => {
    const channel = supabase
      .channel(`products-inserts-${listingType}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "products",
          filter: `listing_type=eq.${listingType}`,
        },
        () => {
          callbackRef.current?.();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [listingType]);
};
