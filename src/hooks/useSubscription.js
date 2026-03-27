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

      if (data) {
        setSubscription(data);
      } else {
        // Auto-create a free plan row on first access
        const { data: created, error: createError } = await supabase
          .from("user_subscriptions")
          .insert({
            user_id: user.id,
            plan: "free",
            status: "active",
            posts_used: 0,
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
