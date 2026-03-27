// ==========================================
// FILE: src/pages/AdminDashboard/Billing.jsx
// ==========================================
import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout/AdminLayout";
import { supabase } from "../../utils/supabaseClient";
import { useSubscription } from "../../hooks/useSubscription";
import {
  PLANS,
  PAY_PER_POST_LABELS,
  isUnlimited,
  getPlanLimitLabel,
} from "../../utils/subscriptionUtils";
import "./Billing.css";

const PLAN_ORDER = ["free", "basic", "pro", "premium"];

const PLAN_FEATURES = {
  free:    ["3 product listings", "Basic seller profile", "Standard support"],
  basic:   ["15 product listings", "Basic seller profile", "Standard support"],
  pro:     ["50 product listings", "Featured seller profile", "Priority support"],
  premium: ["Unlimited listings", "Top seller badge", "Dedicated support", "Featured placement"],
};

const PAY_PER_POST_META = {
  service: { icon: "bi-tools",          color: "#7c3aed", bg: "rgba(124,58,237,0.08)",  label: "Service" },
  event:   { icon: "bi-calendar-event", color: "#0891b2", bg: "rgba(8,145,178,0.08)",   label: "Event" },
  job:     { icon: "bi-briefcase",      color: "#d97706", bg: "rgba(217,119,6,0.08)",   label: "Job" },
};


const Billing = () => {
  const { subscription, loading, userId, refresh } = useSubscription();
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(null);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserEmail(user.email);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;
    const fetchPayments = async () => {
      setPaymentsLoading(true);
      const { data } = await supabase
        .from("post_payments")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      setPayments(data ?? []);
      setPaymentsLoading(false);
    };
    fetchPayments();
  }, [userId]);

  const handleUpgrade = (planKey) => {
    const plan = PLANS[planKey];
    if (plan.price === 0) return;
    if (!window.PaystackPop) {
      alert("Payment system is loading. Please try again in a moment.");
      return;
    }

    setUpgrading(planKey);

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: userEmail,
      amount: plan.price,
      currency: "NGN",
      ref: `sub_${planKey}_${Date.now()}`,
      metadata: { type: "subscription", plan: planKey, user_id: userId },
      callback: async (response) => {
        try {
          const { error } = await supabase
            .from("user_subscriptions")
            .update({
              plan: planKey,
              status: "active",
              posts_limit: plan.limit,
              paystack_ref: response.reference,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", userId)
            .eq("status", "active");

          if (error) {
            alert("Payment received but failed to update plan. Contact support with ref: " + response.reference);
          } else {
            await refresh();
          }
        } catch (err) {
          console.error("Upgrade error:", err);
        } finally {
          setUpgrading(null);
        }
      },
      onClose: () => setUpgrading(null),
    });

    handler.openIframe();
  };

  const currentPlan   = PLANS[subscription?.plan ?? "free"];
  const postsUsed     = subscription?.posts_used  ?? 0;
  const postsLimit    = subscription?.posts_limit ?? 3;
  const usagePercent  = isUnlimited(subscription)
    ? 100
    : Math.min(100, Math.round((postsUsed / postsLimit) * 100));

  const usageColor =
    usagePercent >= 90 ? "#ef4444"
    : usagePercent >= 60 ? "#f59e0b"
    : "var(--primary-accent)";

  const formatDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-NG", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    if (status === "paid")    return <span className="b-badge b-badge--paid"><i className="bi bi-check-circle-fill me-1"></i>Paid</span>;
    if (status === "pending") return <span className="b-badge b-badge--pending"><i className="bi bi-clock-fill me-1"></i>Pending</span>;
    return <span className="b-badge b-badge--failed"><i className="bi bi-x-circle-fill me-1"></i>Failed</span>;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="billing-wrap">
          <div className="billing-skeleton-hero"></div>
          <div className="billing-skeleton-grid">
            {[1,2,3,4].map(i => <div key={i} className="billing-skeleton-card"></div>)}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="billing-wrap">

        {/* ── Page Header ── */}
        <div className="billing-page-header">
          <div>
            <h1 className="billing-page-title">Billing &amp; Plans</h1>
            <p className="billing-page-sub">Manage your subscription and pay-per-post credits</p>
          </div>
        </div>

        {/* ── Hero Plan Card ── */}
        <div className={`hero-plan-card hero-plan-card--${subscription?.plan ?? "free"}`}>
          <div className="hero-plan-inner">
            <div className="hero-plan-left">
              <div className="hero-plan-eyebrow">Current Plan</div>
              <div className="hero-plan-name">
                <i className={`bi ${currentPlan.icon}`}></i>
                {currentPlan.name}
                <span className="hero-plan-badge">Active</span>
              </div>
              <div className="hero-plan-price">{currentPlan.label}</div>
              <p className="hero-plan-note">
                <i className="bi bi-info-circle me-1"></i>
                One-time purchase · No expiry · Services, Events &amp; Jobs billed per post
              </p>
            </div>

            <div className="hero-plan-right">
              <div className="hero-usage-label">
                <span>Posts used</span>
                <strong>
                  {isUnlimited(subscription)
                    ? `${postsUsed} · Unlimited`
                    : `${postsUsed} / ${postsLimit}`}
                </strong>
              </div>
              <div className="hero-usage-track">
                <div
                  className="hero-usage-fill"
                  style={{ width: `${usagePercent}%`, background: usageColor }}
                ></div>
              </div>
              {!isUnlimited(subscription) && postsUsed >= postsLimit && (
                <p className="hero-usage-warning">
                  <i className="bi bi-exclamation-triangle-fill me-1"></i>
                  Post limit reached — upgrade to keep listing
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Plan Grid ── */}
        <div className="billing-section-head">
          <h2 className="billing-section-title">Choose a Plan</h2>
        </div>

        <div className="plan-grid">
          {PLAN_ORDER.map((key) => {
            const plan      = PLANS[key];
            const isCurrent = subscription?.plan === key;
            const isPopular = key === "pro";
            const isDowngrade =
              PLAN_ORDER.indexOf(key) < PLAN_ORDER.indexOf(subscription?.plan ?? "free");

            return (
              <div
                key={key}
                className={`plan-tile ${isCurrent ? "plan-tile--active" : ""} plan-tile--${key}`}
              >
                {isPopular && !isCurrent && (
                  <div className="plan-tile-popular">Most Popular</div>
                )}
                {isCurrent && (
                  <div className="plan-tile-current">Current</div>
                )}

                <div className="plan-tile-icon">
                  <i className={`bi ${plan.icon}`}></i>
                </div>
                <div className="plan-tile-name">{plan.name}</div>
                <div className="plan-tile-price">{plan.label}</div>
                <div className="plan-tile-limit">
                  <i className="bi bi-layers-fill me-1"></i>
                  {getPlanLimitLabel(key)}
                </div>

                <ul className="plan-tile-features">
                  {PLAN_FEATURES[key].map((f) => (
                    <li key={f}><i className="bi bi-check2"></i>{f}</li>
                  ))}
                </ul>

                {plan.price === 0 || isCurrent ? (
                  <button className="plan-tile-btn plan-tile-btn--disabled" disabled>
                    {isCurrent ? "Current Plan" : "Free"}
                  </button>
                ) : (
                  <button
                    className={`plan-tile-btn ${isDowngrade ? "plan-tile-btn--outline" : "plan-tile-btn--primary"}`}
                    onClick={() => handleUpgrade(key)}
                    disabled={upgrading !== null}
                  >
                    {upgrading === key ? (
                      <><span className="spinner-border spinner-border-sm me-1" role="status"></span>Processing…</>
                    ) : isDowngrade ? (
                      `Switch to ${plan.name}`
                    ) : (
                      `Upgrade · ${plan.label}`
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Pay-Per-Post ── */}
        <div className="ppp-section">
          <div className="ppp-header">
            <div className="ppp-header-icon"><i className="bi bi-receipt-cutoff"></i></div>
            <div>
              <h3 className="ppp-title">Pay-Per-Post</h3>
              <p className="ppp-sub">Charged per listing · Not counted against your plan</p>
            </div>
          </div>
          <div className="ppp-cards">
            {Object.entries(PAY_PER_POST_META).map(([type, meta]) => (
              <div key={type} className="ppp-card" style={{ "--ppp-color": meta.color, "--ppp-bg": meta.bg }}>
                <div className="ppp-card-icon"><i className={`bi ${meta.icon}`}></i></div>
                <div className="ppp-card-label">{meta.label}</div>
                <div className="ppp-card-price">{PAY_PER_POST_LABELS[`${type}s`] ?? PAY_PER_POST_LABELS[type]}</div>
                <div className="ppp-card-note">per post</div>
              </div>
            ))}
          </div>
          <p className="ppp-footer-note">
            <i className="bi bi-shield-check me-1"></i>
            Payment collected before listing goes live · Powered by Paystack
          </p>
        </div>

        {/* ── Payment History ── */}
        <div className="billing-section-head" style={{ marginTop: "0.25rem" }}>
          <h2 className="billing-section-title">Payment History</h2>
        </div>

        <div className="history-card">
          {paymentsLoading ? (
            <div className="history-loading">
              <span className="spinner-border spinner-border-sm text-success me-2" role="status"></span>
              Loading history…
            </div>
          ) : payments.length === 0 ? (
            <div className="history-empty">
              <div className="history-empty-icon"><i className="bi bi-receipt"></i></div>
              <p>No pay-per-post payments yet</p>
              <span>Your transactions will appear here once you start posting.</span>
            </div>
          ) : (
            <div className="history-table-wrap">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Reference</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td>{formatDate(p.created_at)}</td>
                      <td>
                        <span className="history-type">
                          {p.listing_type?.charAt(0).toUpperCase() + p.listing_type?.slice(1)}
                        </span>
                      </td>
                      <td className="history-amount">₦{((p.amount ?? 0) / 100).toLocaleString()}</td>
                      <td><code className="history-ref">{p.paystack_ref ?? "—"}</code></td>
                      <td>{getStatusBadge(p.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  );
};

export default Billing;
