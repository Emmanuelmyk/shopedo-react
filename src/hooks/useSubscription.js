// ==========================================
// FILE: src/hooks/useSubscription.js
// ==========================================
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../utils/supabaseClient";
import { PLAN_KEY_FROM_ID, PLANS, PLAN_ID } from "../utils/subscriptionUtils";

export const useSubscription = () => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const fetchSubscription = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      setUserId(user.id);

      // Get the active subscription row
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("id, user_id, plan_id, status, paystack_reference, start_date, end_date, created_at, updated_at")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;

      // Count actual quota posts from DB (source of truth)
      const { count: actualCount } = await supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("seller_id", user.id)
        .not("listing_type", "in", "(job,event,service)");

      const postsUsed = actualCount ?? 0;

      if (data) {
        // Map plan_id → plan key → limit
        const planKey = PLAN_KEY_FROM_ID[data.plan_id] ?? "free";
        const planConfig = PLANS[planKey];
        setSubscription({
          ...data,
          plan: planKey,
          posts_used: postsUsed,
          posts_limit: planConfig.limit,
        });
      } else {
        // No row yet — insert free plan row
        const { error: insertErr } = await supabase
          .from("user_subscriptions")
          .insert({
            user_id: user.id,
            plan_id: PLAN_ID.free,
            status: "active",
          });

        if (insertErr) {
          console.warn("Could not create subscription row:", insertErr.message);
        }

        setSubscription({
          user_id: user.id,
          plan_id: PLAN_ID.free,
          plan: "free",
          status: "active",
          posts_used: postsUsed,
          posts_limit: 3,
        });
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
