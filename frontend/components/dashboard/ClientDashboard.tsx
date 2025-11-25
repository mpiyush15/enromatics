"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function ClientDashboard({
  children,
  userName,
  userRole,
  isAdmin = false,
  sidebarLinks,
  user,
}: {
  children: React.ReactNode;
  userName: string;
  userRole?: string;
  isAdmin?: boolean;
  sidebarLinks?: any[];
  user?: any;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [sidebarOpen]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Sidebar - Fixed on desktop, overlay on mobile */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} links={sidebarLinks} user={user} />

      {/* Main content area */}
      <div className="flex flex-col flex-1 h-screen overflow-hidden">
        <Topbar
          userName={userName}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          isAdmin={isAdmin}
        />
        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
}