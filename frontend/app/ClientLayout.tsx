"use client";

import Navbar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";

function SessionTimeoutWrapper({ children }: { children: React.ReactNode }) {
  // Session timeout: 30 minutes idle, warning at 28 minutes
  // Activity tracking prevents logout during active use
  useSessionTimeout({
    timeout: 30 * 60 * 1000, // 30 minutes idle before logout
    warningTime: 2 * 60 * 1000, // Show warning at 28 minutes (30 - 2 = 28 min before logout)
    onTimeout: () => {
      console.log("🔴 Session expired due to 30 minutes of inactivity");
    },
  });

  return <>{children}</>;
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if user is in authenticated area (dashboard or student portal)
  // Exclude login pages from authenticated areas
  const isAuthenticatedArea =
    (pathname?.startsWith("/dashboard") && !pathname?.startsWith("/dashboard/login")) ||
    (pathname?.startsWith("/student") && !pathname?.startsWith("/student/login"));

  // Hide NavBar and Footer on login, landing, dashboard area, exam registration pages, and results page
  const hideNavAndFooter =
    pathname === "/" ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/tenant/login") ||
    pathname?.startsWith("/landing") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/student") ||
    pathname?.startsWith("/exam/") ||
    pathname?.startsWith("/results");

  // For authenticated areas, wrap with session timeout
  if (isAuthenticatedArea) {
    return <SessionTimeoutWrapper>{children}</SessionTimeoutWrapper>;
  }

  // For dashboard pages, render without wrapper to allow full height control
  if (hideNavAndFooter) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
        {children}
      </main>
      <Footer />
    </>
  );
}