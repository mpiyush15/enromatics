"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface TrialBannerProps {
  trialEndDate: string | Date;
  plan?: string;
  subscriptionStatus?: string;
}

export default function TrialBanner({ trialEndDate, plan = "trial", subscriptionStatus = "trial" }: TrialBannerProps) {
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [hoursRemaining, setHoursRemaining] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const end = new Date(trialEndDate).getTime();
      const difference = end - now;

      if (difference <= 0) {
        setIsExpired(true);
        setDaysRemaining(0);
        setHoursRemaining(0);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setDaysRemaining(days);
        setHoursRemaining(hours);
        setIsExpired(false);
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000 * 60); // Update every minute

    return () => clearInterval(interval);
  }, [trialEndDate]);

  // Don't show if not on trial or dismissed
  if (subscriptionStatus !== "trial" || plan !== "trial" || dismissed) {
    return null;
  }

  // Trial expired banner
  if (isExpired) {
    return (
      <div className="bg-red-50 dark:bg-red-900/10 border-b border-red-200 dark:border-red-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <svg className="w-4 h-4 flex-shrink-0 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-xs sm:text-sm font-medium text-red-800 dark:text-red-200 truncate">
                Trial ended • <span className="hidden sm:inline">Upgrade to continue</span>
              </p>
            </div>
            <Link
              href="/plans"
              className="px-3 py-1 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors whitespace-nowrap"
            >
              Upgrade
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active trial banner with light colors
  const urgency = daysRemaining <= 3 ? "urgent" : daysRemaining <= 7 ? "warning" : "normal";
  const styles = {
    urgent: {
      bg: "bg-orange-50 dark:bg-orange-900/10",
      border: "border-orange-200 dark:border-orange-800/30",
      text: "text-orange-800 dark:text-orange-200",
      icon: "text-orange-600 dark:text-orange-400",
      button: "bg-orange-600 hover:bg-orange-700 text-white"
    },
    warning: {
      bg: "bg-yellow-50 dark:bg-yellow-900/10",
      border: "border-yellow-200 dark:border-yellow-800/30",
      text: "text-yellow-800 dark:text-yellow-200",
      icon: "text-yellow-600 dark:text-yellow-400",
      button: "bg-yellow-600 hover:bg-yellow-700 text-white"
    },
    normal: {
      bg: "bg-blue-50 dark:bg-blue-900/10",
      border: "border-blue-200 dark:border-blue-800/30",
      text: "text-blue-800 dark:text-blue-200",
      icon: "text-blue-600 dark:text-blue-400",
      button: "bg-blue-600 hover:bg-blue-700 text-white"
    }
  }[urgency];

  return (
    <div className={`${styles.bg} border-b ${styles.border}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <svg className={`w-4 h-4 flex-shrink-0 ${styles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {urgency === "urgent" ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              )}
            </svg>
            <p className={`text-xs sm:text-sm font-medium ${styles.text} truncate`}>
              {urgency === "urgent" 
                ? `⚠️ ${daysRemaining}d ${hoursRemaining}h left` 
                : urgency === "warning"
                ? `⏰ ${daysRemaining} days left`
                : `🎉 Trial: ${daysRemaining} days left`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/plans"
              className={`px-3 py-1 text-xs font-medium ${styles.button} rounded-md transition-colors whitespace-nowrap`}
            >
              Upgrade
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className={`p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors ${styles.text}`}
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
