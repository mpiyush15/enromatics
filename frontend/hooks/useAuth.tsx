"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/authService";

export default function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isMounted = useRef(true);
  const hasChecked = useRef(false);

  useEffect(() => {
    // Prevent multiple auth checks
    if (hasChecked.current) return;
    hasChecked.current = true;

    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        
        if (!isMounted.current) return;

        if (currentUser) {
          setUser(currentUser);
        } else {
          setUser(null);
          router.push("/login");
        }
      } catch (error) {
        console.error("❌ Auth check error:", error);
        if (isMounted.current) {
          setUser(null);
          router.push("/login");
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, []); // Empty dependency array - only run once

  return { user, loading };
}
