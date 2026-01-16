"use client";

import { authService } from "@/lib/authService";
import { cache } from "@/lib/cache";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if student portal based on pathname
  const isStudentPortal = pathname?.includes('/student/');

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Clear localStorage and session
      localStorage.clear();
      sessionStorage.clear();
      cache.clear();

      // Call logout API only for admin/tenant
      if (!isStudentPortal) {
        await authService.logout();
      }

      // Determine redirect URL based on portal type
      const redirectUrl = isStudentPortal ? "/student/login" : "/login";
      window.location.href = redirectUrl;
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect even if API call fails
      localStorage.clear();
      sessionStorage.clear();
      cache.clear();
      const redirectUrl = isStudentPortal ? "/student/login" : "/login";
      window.location.href = redirectUrl;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium flex items-center justify-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      {isLoading ? "Logging out..." : "Logout"}
    </button>
  );
}
