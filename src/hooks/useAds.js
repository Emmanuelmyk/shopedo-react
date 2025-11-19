// ==========================================
// FILE: src/hooks/useAds.js
// ==========================================
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";

/**
 * Custom hook to fetch and manage ads data
 * @returns {Object} { ads: Array, loading: Boolean, error: Error|null }
 */
export const useAds = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("ads")
          .select("id, image_path, link")
          .order("id", { ascending: true });

        if (error) {
          console.error("Ads fetch error:", error);
          setError(error);
          setAds([]);
          return;
        }

        setAds(data || []);
        setError(null);
      } catch (e) {
        console.error("Ads fetch error:", e);
        setError(e);
        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  return { ads, loading, error };
};

