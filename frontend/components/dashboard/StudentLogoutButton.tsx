"use client";

import { useState } from "react";

export default function StudentLogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Clear localStorage
      localStorage.removeItem("authToken");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("userId");
      
      // Clear token cookie
      document.cookie = "jwt=; path=/; max-age=0; SameSite=Lax";
      document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
      
      console.log("✅ Logout successful");
      // Use window.location for full page redirect to ensure /student/login path
      window.location.href = "/student/login";
    } catch (error) {
      console.error("❌ Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg shadow-sm transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
      title="Logout"
    >
      <span>🚪</span>
      <span className="hidden sm:inline">{isLoading ? "Logging out..." : "Logout"}</span>
    </button>
  );
}
