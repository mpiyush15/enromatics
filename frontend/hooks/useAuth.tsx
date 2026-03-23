"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/lib/authService";

export default function useAuth() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    // Don't redirect if already on login pages
    const isLoginPage = pathname?.includes("/login") || pathname?.includes("/tenant/login");

    const checkAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        
        if (isCancelled) return;

        if (currentUser) {
          console.log("✅ useAuth: User loaded", currentUser.email, currentUser.role, currentUser.tenantId);
          setUser(currentUser);
          setLoading(false);
        } else {
          console.log("❌ useAuth: No user found (null returned)");
          setUser(null);
          setLoading(false);
          
          // Only redirect to login if NOT already on a login page
          if (!isLoginPage) {
            console.log("🔄 useAuth: Redirecting to login");
            router.push("/login");
          }
        }
      } catch (error) {
        console.error("❌ Auth check error:", error);
        if (!isCancelled) {
          setUser(null);
          setLoading(false);
          
          // Only redirect to login if NOT already on a login page
          if (!isLoginPage) {
            router.push("/login");
          }
        }
      }
    };

    checkAuth();

    return () => {
      isCancelled = true;
    };
  }, [pathname, router]);

  return { user, loading };
}
