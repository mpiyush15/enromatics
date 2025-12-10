"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DarkModeToggle from "../DarkModeToggle";
import Link from "next/link";

interface TopbarProps {
  userName: string;
  onToggleSidebar: () => void;
  isAdmin?: boolean;
  user?: any;
  tenantId?: string;
}

export default function Topbar({ userName, onToggleSidebar, isAdmin, user, tenantId }: TopbarProps) {
  const router = useRouter();
  const [dateTime, setDateTime] = useState("");

  // Check if user is on trial/free plan
  const isTrialUser = user?.plan === "trial" || !user?.paid_status;
  
  // Check if user is SuperAdmin
  const isSuperAdmin = user?.role === "SuperAdmin";

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setDateTime(
        now.toLocaleString("en-IN", {
          weekday: "short",
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 text-black dark:text-white shadow-md px-6 py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Hamburger - Mobile Only */}
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-2xl mr-2 hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-lg transition"
          aria-label="Toggle Sidebar"
        >
          ☰
        </button>

        {/* Welcome Message */}
        <div className="hidden sm:block">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Welcome back</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{userName}</p>
        </div>
        <p className="sm:hidden text-sm font-semibold">👋 {userName.split("@")[0]}</p>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Time Display */}
        <p className="hidden lg:inline text-xs text-gray-500 dark:text-gray-400 font-medium px-3 py-2 bg-white dark:bg-gray-800 rounded-lg">
          {dateTime}
        </p>

        {/* Social Media Dashboard Button */}
        {isAdmin && (
          <Link
            href="/dashboard/social"
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 rounded-lg shadow-sm transition-all hover:shadow-md"
          >
            <span>📱</span>
            <span className="hidden sm:inline">Social</span>
          </Link>
        )}

        {/* UPGRADE BUTTON - Show for trial/free users (HIDE from SuperAdmin) */}
        {isTrialUser && !isSuperAdmin && tenantId && (
          <button
            onClick={() => router.push(`/dashboard/client/${tenantId}/my-subscription`)}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 rounded-lg shadow-md transition-all hover:shadow-lg animate-pulse"
            title="Upgrade to activate white-label & unlimited features"
          >
            <span>⭐</span>
            <span className="hidden sm:inline">Upgrade Now</span>
            <span className="sm:hidden">Go Pro</span>
          </button>
        )}
        
        {/* Dark Mode Toggle */}
        <div className="px-2 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition">
          <DarkModeToggle />
        </div>
        
        {/* Logout Button */}
        
      </div>
    </div>
  );
}