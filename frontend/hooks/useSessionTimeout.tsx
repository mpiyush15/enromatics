"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/authService";
import { cache } from "@/lib/cache";

interface UseSessionTimeoutProps {
  timeout?: number; // in milliseconds (default: 30 minutes)
  warningTime?: number; // warning before timeout (in milliseconds, default: 2 minutes)
  onTimeout?: () => void;
  onWarning?: () => void;
}

export const useSessionTimeout = ({
  timeout = 30 * 60 * 1000, // 30 minutes idle timeout
  warningTime = 2 * 60 * 1000, // 2 minutes warning before logout
  onTimeout,
  onWarning,
}: UseSessionTimeoutProps = {}) => {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Perform logout with proper cleanup
  const logout = useCallback(async () => {
    try {
      console.log("🔴 LOGOUT: Session timeout - Clearing cache and logging out");
      
      // Clear all caches first
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
        cache.clear();
      }

      // Call logout API
      await authService.logout();

      // Redirect to login
      router.push("/login");
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Force redirect even if API call fails
      router.push("/login");
    }
  }, [router]);

  // Handle warning timeout - show alert and countdown
  const handleWarning = useCallback(() => {
    console.log("⚠️ WARNING: Session will expire in 2 minutes");
    setShowWarning(true);
    setRemainingTime(Math.ceil(warningTime / 1000)); // Convert to seconds
    
    if (onWarning) {
      onWarning();
    }

    // Show browser alert
    alert(
      "⚠️ SESSION TIMEOUT WARNING\n\n" +
      "Your session will expire in 2 minutes due to inactivity.\n\n" +
      "Click anywhere on the page or move your mouse to stay logged in."
    );

    // Countdown timer (update every second)
    countdownIntervalRef.current = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [warningTime, onWarning]);

  // Handle actual logout timeout
  const handleTimeout = useCallback(() => {
    console.log("🔴 TIMEOUT: Session expired");
    setShowWarning(false);
    
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    if (onTimeout) {
      onTimeout();
    }

    logout();
  }, [logout, onTimeout]);

  // Reset all timers and restart countdown
  const resetTimer = useCallback(() => {
    // Clear all existing timeouts and intervals
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    // Hide warning if showing
    setShowWarning(false);

    console.log("🔄 RESET: Activity detected - session timer reset to 30 minutes");

    // Set warning timeout first (when remaining time = warningTime)
    // For 30 min timeout with 2 min warning: warn at 28 min mark
    warningTimeoutRef.current = setTimeout(() => {
      handleWarning();
    }, timeout - warningTime);

    // Set logout timeout (actual logout at 30 min)
    timeoutRef.current = setTimeout(() => {
      handleTimeout();
    }, timeout);
  }, [timeout, warningTime, handleWarning, handleTimeout]);

  // Extend session manually (when user clicks "Stay Logged In")
  const extendSession = useCallback(() => {
    console.log("✅ EXTEND: User clicked Stay Logged In - session extended");
    resetTimer();
  }, [resetTimer]);

  // Activity event handler
  useEffect(() => {
    // Events that indicate user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Reset timer on activity (only if warning is NOT showing)
    const handleActivity = () => {
      if (!showWarning) {
        resetTimer();
      }
    };

    // Add event listeners for activity detection
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Initialize timer on component mount
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [resetTimer, showWarning]);

  return { resetTimer, extendSession, showWarning, remainingTime };
};
