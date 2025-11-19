"use client";

import Navbar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { usePathname } from "next/navigation";
import { useSessionTimeout } from "@/hooks/useSessionTimeout";

function SessionTimeoutWrapper({ children }: { children: React.ReactNode }) {
  const { showWarning, remainingTime, extendSession } = useSessionTimeout({
    timeout: 3 * 60 * 1000, // 3 minutes
    warningTime: 30 * 1000, // 30 seconds warning
    onTimeout: () => {
      console.log("Session expired due to inactivity");
    },
  });

  return (
    <>
      {children}
      {showWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md mx-4 animate-bounce">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Session Timeout Warning
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Your session will expire in <span className="text-red-600 font-bold text-2xl">{remainingTime}</span> seconds due to inactivity.
              </p>
              <button
                onClick={extendSession}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-lg transition-colors"
              >
                Stay Logged In
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if user is in authenticated area (dashboard or student portal)
  // Exclude login pages from authenticated areas
  const isAuthenticatedArea =
    (pathname?.startsWith("/dashboard") && !pathname?.startsWith("/dashboard/login")) ||
    (pathname?.startsWith("/student") && !pathname?.startsWith("/student/login"));

  // Hide NavBar and Footer on login, dashboard area, and exam registration pages
  const hideNavAndFooter =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/student") ||
    pathname?.startsWith("/exam/");

  // For authenticated areas, wrap with session timeout
  if (isAuthenticatedArea) {
    return <SessionTimeoutWrapper>{children}</SessionTimeoutWrapper>;
  }

  // For dashboard pages, render without wrapper to allow full height control
  if (hideNavAndFooter) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
        {children}
      </main>
      <Footer />
    </>
  );
}