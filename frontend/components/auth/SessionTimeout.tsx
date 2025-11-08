"use client";

import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";

const AUTO_LOGOUT_MINUTES = 5;

export default function SessionTimeout() {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      console.log("User inactive for 5 minutes. Logging out...");
      signOut({ callbackUrl: "/login" });
    }, AUTO_LOGOUT_MINUTES * 60 * 1000); // 5 minutes
  };

  useEffect(() => {
    // Events that count as "activity"
    const events = ["mousemove", "keydown", "scroll", "click"];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    // Start timer initially
    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return null;
}