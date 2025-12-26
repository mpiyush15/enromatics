"use client";

import { useEffect, useState } from "react";
import DarkModeToggle from "../DarkModeToggle";
import Link from "next/link";
import NotificationCenter from "./NotificationCenter";
import { useParams, usePathname } from "next/navigation";

interface TopbarProps {
  userName: string;
  onToggleSidebar: () => void;
  isAdmin?: boolean;
}

export default function Topbar({ userName, onToggleSidebar, isAdmin }: TopbarProps) {
  const [dateTime, setDateTime] = useState("");
  const pathname = usePathname();
  const params = useParams();
  
  // Only get tenantId if we're in a dashboard route with [tenantId]
  const tenantId = pathname?.includes('/client/') ? (params?.tenantId as string) : undefined;

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
        
        {/* Notification Bell - Only show for tenant dashboards (not superadmin) */}
        {tenantId && <NotificationCenter tenantId={tenantId} />}
        
        {/* Dark Mode Toggle */}
        <div className="px-2 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition">
          <DarkModeToggle />
        </div>
        
        {/* Logout Button */}
        
      </div>
    </div>
  );
}