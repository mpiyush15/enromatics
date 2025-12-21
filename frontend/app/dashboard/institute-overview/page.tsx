"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";

/**
 * 🔀 REDIRECT PAGE (STABILIZATION FIX)
 * 
 * This page redirects old `/dashboard/institute-overview` URLs
 * to the correct tenant-specific URL: `/dashboard/client/[tenantId]/institute-overview`
 * 
 * Part of: stabilization/ssot-bff
 * Date: 21 Dec 2025
 */
export default function InstituteOverviewRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected) return;
    
    // Wait for auth to complete
    if (loading) return;
    
    // Timeout fallback - if auth takes too long, go to dashboard
    const timeout = setTimeout(() => {
      if (!hasRedirected) {
        console.log("⏱️ Auth timeout, redirecting to dashboard");
        setHasRedirected(true);
        router.replace("/dashboard/home");
      }
    }, 3000);
    
    if (!user) {
      // Not logged in, redirect to login
      console.log("🔒 No user, redirecting to login");
      setHasRedirected(true);
      clearTimeout(timeout);
      router.replace("/login");
      return;
    }

    // Check if user is a tenant user
    const TENANT_ROLES = ["tenantAdmin", "teacher", "staff", "accountant", "counsellor"];
    
    console.log("👤 User found:", user.role, "TenantID:", user.tenantId);
    
    if (user.tenantId && TENANT_ROLES.includes(user.role)) {
      // Redirect to tenant-specific page
      console.log(`🔄 Redirecting to: /dashboard/client/${user.tenantId}/institute-overview`);
      setHasRedirected(true);
      clearTimeout(timeout);
      router.replace(`/dashboard/client/${user.tenantId}/institute-overview`);
    } else if (user.role === "SuperAdmin") {
      // SuperAdmin should go to main dashboard
      console.log("👑 SuperAdmin, redirecting to home");
      setHasRedirected(true);
      clearTimeout(timeout);
      router.replace("/dashboard/home");
    } else {
      // Fallback
      console.log("❓ Unknown role, redirecting to home");
      setHasRedirected(true);
      clearTimeout(timeout);
      router.replace("/dashboard/home");
    }

    return () => clearTimeout(timeout);
  }, [user, loading, router, hasRedirected]);

  // Show loading state
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
        <p className="text-sm text-gray-500 mt-2">
          {loading ? "Loading user data..." : "Determining destination..."}
        </p>
      </div>
    </div>
  );
}
