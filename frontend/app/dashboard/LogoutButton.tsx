"use client";

import { authService } from "@/lib/authService";
import { cache } from "@/lib/cache";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { FaSignOutAlt } from "react-icons/fa";

export default function LogoutButton() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Check if student portal based on pathname
  const isStudentPortal = pathname?.includes('/student/');

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

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

  if (!mounted) return null;

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      title="Logout"
      className={`px-2 py-1 text-xs rounded transition-all font-medium flex items-center justify-center ${
        isDark
          ? 'bg-blue-600/20 hover:bg-blue-600/40 text-blue-400'
          : 'bg-blue-100 hover:bg-blue-200 text-blue-600'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <FaSignOutAlt className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
    </button>
  );
}
