"use client";

import { useRouter } from "next/navigation";
import { authService } from "@/lib/authService";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      console.log("✅ Logout successful");
      router.push("/login");
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
