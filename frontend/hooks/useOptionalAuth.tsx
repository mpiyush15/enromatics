"use client";
import { useEffect, useState } from "react";
import { authService } from "@/lib/authService";

// A non-redirecting auth hook for UI components that should not force navigation
export default function useOptionalAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const u = await authService.getCurrentUser();
        if (!isMounted) return;
        if (u) setUser(u);
      } catch (err) {
        // ignore errors for optional auth
        console.error("useOptionalAuth error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return { user, loading };
}
