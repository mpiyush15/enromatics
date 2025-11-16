"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/apiConfig";

interface UseSessionTimeoutProps {
  timeout?: number; // in milliseconds
  warningTime?: number; // warning before timeout (in milliseconds)
  onTimeout?: () => void;
  onWarning?: () => void;
}

export const useSessionTimeout = ({
  timeout = 3 * 60 * 1000, // 3 minutes default
  warningTime = 30 * 1000, // 30 seconds warning
  onTimeout,
  onWarning,
}: UseSessionTimeoutProps = {}) => {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const alertShownRef = useRef(false);
  const [showWarning, setShowWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const logout = useCallback(async () => {
    try {
      // Call logout API
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${API_BASE_URL}`}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      // Clear any stored data
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }

      // Redirect to login
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      router.push("/login");
    }
  }, [router]);

  const handleTimeout = useCallback(() => {
    if (!alertShownRef.current) {
      alertShownRef.current = true;
      setShowWarning(false);
      alert("Your session has expired due to inactivity. You will be logged out.");
      if (onTimeout) {
        onTimeout();
      }
      logout();
    }
  }, [logout, onTimeout]);

  const handleWarning = useCallback(() => {
    setShowWarning(true);
    setRemainingTime(warningTime / 1000);
    if (onWarning) {
      onWarning();
    }

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [warningTime, onWarning]);

  const resetTimer = useCallback(() => {
    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Hide warning if showing
    setShowWarning(false);
    alertShownRef.current = false;

    // Set warning timeout
    warningTimeoutRef.current = setTimeout(() => {
      handleWarning();
    }, timeout - warningTime);

    // Set logout timeout
    timeoutRef.current = setTimeout(() => {
      handleTimeout();
    }, timeout);
  }, [timeout, warningTime, handleTimeout, handleWarning]);

  const extendSession = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    // Events that should reset the timer
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
      window.addEventListener(event, handleActivity);
    });

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [resetTimer]);

  return { resetTimer, extendSession, showWarning, remainingTime };
};
