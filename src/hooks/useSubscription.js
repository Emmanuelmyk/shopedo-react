// ==========================================
// FILE: src/hooks/useSubscription.js
// ==========================================
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../utils/supabaseClient";


export const useSubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const fetchSubscription = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUserId(user.id);

      // Get the active subscription row
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;

      // Count actual quota posts — exclude pay-per-post types (job/event/service).
      // Nulls (old products without listing_type) are included intentionally.
      const { count: actualCount } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("seller_id", user.id)
        .not("listing_type", "in", "(job,event,service)");

      const postsUsed = actualCount ?? 0;

      if (data) {
        // Sync posts_used with the real count if it drifted
        if (data.posts_used !== postsUsed) {
          await supabase
            .from("user_subscriptions")
            .update({ posts_used: postsUsed })
            .eq("user_id", user.id)
            .eq("status", "active");
        }
        setSubscription({ ...data, posts_used: postsUsed });
      } else {
        // No row yet — create the free plan row with the real count
        const { data: created, error: createError } = await supabase
          .from("user_subscriptions")
          .insert({
            user_id: user.id,
            plan: "free",
            status: "active",
            posts_used: postsUsed,
            posts_limit: 3,
          })
          .select()
          .single();

        if (!createError) setSubscription(created);
      }
    } catch (err) {
      console.error("useSubscription error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return { subscription, loading, userId, refresh: fetchSubscription };
};
