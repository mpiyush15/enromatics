"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/authService";

export default function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        
        if (isCancelled) return;

        if (currentUser) {
          console.log("✅ useAuth: User loaded", currentUser.email, currentUser.role, currentUser.tenantId);
          setUser(currentUser);
          setLoading(false);
        } else {
          console.log("❌ useAuth: No user found, redirecting to login");
          setUser(null);
          setLoading(false);
          router.push("/login");
        }
      } catch (error) {
        console.error("❌ Auth check error:", error);
        if (!isCancelled) {
          setUser(null);
          setLoading(false);
          router.push("/login");
        }
      }
    };

    checkAuth();

    return () => {
      isCancelled = true;
    };
  }, []); // Empty dependency array - only run once

  return { user, loading };
}
