// ==========================================
// FILE: src/components/ProtectedRoute/ProtectedRoute.jsx
// ==========================================
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";

const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("❌ Auth check error:", error);
          setAuthenticated(false);
        } else {
          setAuthenticated(!!session);

          // Debug logging
          if (session) {
            console.log("✅ User authenticated:", session.user.email);
            console.log("🔑 Access token present:", !!session.access_token);
          } else {
            console.log("❌ No active session found");
          }
        }
      } catch (err) {
        console.error("❌ Auth check error:", err);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session);
      setLoading(false);

      // Debug logging
      if (session) {
        console.log("🔄 Auth state changed - User:", session.user.email);
      } else {
        console.log("🔄 Auth state changed - Logged out");
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
