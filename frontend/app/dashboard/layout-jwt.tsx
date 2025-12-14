"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClientDashboard from "@/components/dashboard/ClientDashboard";
import TrialBanner from "@/components/dashboard/TrialBanner";
import useAuth from "@/hooks/useAuth";
import useTenantAuth from "@/hooks/useTenantAuth";

/**
 * Dashboard Layout - Hybrid Auth
 * 
 * This layout supports BOTH:
 * 1. SuperAdmin (cookie-based auth via useAuth)
 * 2. Tenant users on subdomains (JWT-based auth via useTenantAuth)
 * 
 * It detects which auth method to use based on domain/subdomain
 */

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isSubdomain, setIsSubdomain] = useState(false);
  
  // Try both auth methods
  const superAdminAuth = useAuth(); // Cookie-based for enromatics.com
  const tenantAuth = useTenantAuth(); // JWT-based for subdomains
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect if we're on a subdomain
    const host = window.location.host;
    const parts = host.split('.');
    const subdomain = parts.length > 2 ? parts[0] : null;
    const isOnSubdomain = !!(subdomain && subdomain !== 'www' && subdomain !== 'localhost');
    
    setIsSubdomain(isOnSubdomain);

    console.log(`[Dashboard] Host: ${host}, Subdomain: ${subdomain}, IsSubdomain: ${isOnSubdomain}`);

    // Use appropriate auth method based on domain
    if (isOnSubdomain) {
      // Tenant on subdomain - use JWT auth
      console.log('[Dashboard] Using Tenant JWT auth');
      setUser(tenantAuth.user);
      setLoading(tenantAuth.loading);
    } else {
      // Main domain - use cookie-based auth (SuperAdmin)
      console.log('[Dashboard] Using SuperAdmin cookie auth');
      setUser(superAdminAuth.user);
      setLoading(superAdminAuth.loading);
    }
  }, [superAdminAuth.user, superAdminAuth.loading, tenantAuth.user, tenantAuth.loading]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Checking session...
      </div>
    );
  }

  if (!loading && !user) {
    return null; // Auth hook will redirect
  }

  return (
    <>
      {/* Trial Banner - Shows at top of dashboard (hidden for SuperAdmin) */}
      {user?.trialEndDate && user?.role !== "SuperAdmin" && (
        <TrialBanner 
          trialEndDate={user.trialEndDate}
          plan={user.plan}
          subscriptionStatus={user.subscriptionStatus}
        />
      )}
      
      <ClientDashboard 
        userName={user?.tenant?.instituteName || user?.name || "User"}
        userRole={user?.role}
        isAdmin={user?.role === "SuperAdmin"}
        user={user}
      >
        {children}
      </ClientDashboard>
    </>
  );
}
