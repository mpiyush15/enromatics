"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/authService";

export default function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts

    const checkAuth = async () => {
      console.log("🔵 Checking authentication...");
      
      try {
        const currentUser = await authService.getCurrentUser();
        console.log("📦 getCurrentUser result:", currentUser);
        
        if (!isMounted) return;

        if (currentUser) {
          console.log("🟢 User authenticated:", currentUser.email, "| Role:", currentUser.role);
          setUser(currentUser);
          setLoading(false);
        } else {
          console.log("🔴 Not authenticated - will redirect to /login");
          setUser(null);
          setLoading(false);
          // Give a small delay before redirect to ensure state is updated
          setTimeout(() => {
            if (isMounted) {
              router.push("/login");
            }
          }, 100);
        }
      } catch (error) {
        console.error("❌ Auth check error:", error);
        if (isMounted) {
          setUser(null);
          setLoading(false);
          setTimeout(() => {
            if (isMounted) {
              router.push("/login");
            }
          }, 100);
        }
      }

        
      
    };

    checkAuth();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [router]);

  return { user, loading };
}
