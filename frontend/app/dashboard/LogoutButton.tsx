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
      cache.clear();

      // Redirect to login with full page reload
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect even if API call fails
      window.location.href = "/login";
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full px-4 py-2 mt-6 bg-red-600 rounded hover:bg-red-700 transition"
    >
      🚪 Logout
    </button>
  );
}
