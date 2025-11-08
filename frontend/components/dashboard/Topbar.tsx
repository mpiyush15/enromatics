"use client";

import { useEffect, useState } from "react";
import DarkModeToggle from "../DarkModeToggle";

interface TopbarProps {
  userName: string;
  onToggleSidebar: () => void; // NEW: toggle sidebar
}

export default function Topbar({ userName, onToggleSidebar }: TopbarProps) {
  const [dateTime, setDateTime] = useState("");

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
    <div className="w-full bg-white dark:bg-gray-800 text-black dark:text-white shadow-lg px-4 py-3 flex justify-between items-center border-b border-gray-200 dark:border-gray-700 backdrop-blur-md">
      {/* Hamburger - Mobile Only */}
      <button
        onClick={onToggleSidebar}
        className="md:hidden text-2xl mr-2"
        aria-label="Toggle Sidebar"
      >
        ☰
      </button>

      {/* Welcome */}
      <p className="text-sm ">👋 Welcome, {userName}</p>
      <div className="flex items-center gap-2 ml-auto">

      
      {/* Dark Mode Toggle */}
      <DarkModeToggle />
      {/* Time */}
      <p className="hidden sm:inline text-sm font-medium ">{dateTime}</p>
    </div>
    </div>
  );
}