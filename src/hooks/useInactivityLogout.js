import { useEffect, useRef, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

/**
 * Custom hook to automatically logout user after a period of inactivity
 * @param {number} timeout - Inactivity timeout in milliseconds (default: 10 minutes)
 * @param {number} warningTime - Time before logout to show warning in milliseconds (default: 2 minutes)
 */
export const useInactivityLogout = (
  timeout = 10 * 60 * 1000,
  warningTime = 2 * 60 * 1000
) => {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const [showWarning, setShowWarning] = useState(false);

  const handleLogout = useCallback(async () => {
    console.log("⏰ Session expired due to inactivity");

    // Clear the timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Hide warning
    setShowWarning(false);

    // Sign out from Supabase
    await supabase.auth.signOut();

    // Redirect to login page
    navigate("/admin/login", {
      state: {
        message: "Session expired due to inactivity. Please login again.",
      },
    });
  }, [navigate]);

  const resetTimer = useCallback(() => {
    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Hide warning if it was showing
    setShowWarning(false);

    // Set warning timeout (show warning before logout)
    const warningDelay = timeout - warningTime;
    if (warningDelay > 0) {
      warningTimeoutRef.current = setTimeout(() => {
        console.log("⚠️ Showing inactivity warning");
        setShowWarning(true);
      }, warningDelay);
    }

    // Set logout timeout
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, timeout);
  }, [timeout, warningTime, handleLogout]);

  useEffect(() => {
    // List of events that indicate user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Reset timer on any user activity
    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    // Start the initial timer
    resetTimer();

    // Cleanup function
    return () => {
      // Remove event listeners
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });

      // Clear timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [resetTimer]);

  return { showWarning, resetTimer };
};
