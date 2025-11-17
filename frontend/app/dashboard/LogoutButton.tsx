"use client";

import { authService } from "@/lib/authService";
import { cache } from "@/lib/cache";

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      // Call logout API to clear cookie
      await authService.logout();
      
      // Clear all client-side storage
      localStorage.clear();
      sessionStorage.clear(); // Also clear session storage
      cache.clear();

      // Redirect to login with full page reload
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect even if API call fails
      localStorage.clear();
      sessionStorage.clear();
      cache.clear();
      window.location.href = "/login";
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium flex items-center justify-center gap-2 shadow-md"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
      </svg>
      Logout
    </button>
  );
}
