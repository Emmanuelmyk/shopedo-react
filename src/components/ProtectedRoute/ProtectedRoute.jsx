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
    const validateSession = async (session) => {
      if (!session?.access_token) {
        setAuthenticated(false);
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser(session.access_token);

      if (userError || !user) {
        console.error("❌ Invalid/expired token:", userError);
        setAuthenticated(false);
        return;
      }

      setAuthenticated(true);
    };

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
          await validateSession(session);
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
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.access_token) {
        await validateSession(session);
        setLoading(false);
        return;
      }

      setAuthenticated(false);
      setLoading(false);
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
