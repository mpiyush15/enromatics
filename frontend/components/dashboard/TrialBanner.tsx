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
      <div className="sticky top-0 z-50 bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-medium">Your trial has ended</p>
                <p className="text-sm text-red-100">Upgrade now to continue using all features</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/plans"
                className="px-6 py-2 bg-white text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors shadow-lg"
              >
                Upgrade Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Active trial banner
  const urgency = daysRemaining <= 3 ? "urgent" : daysRemaining <= 7 ? "warning" : "normal";
  const bgColor = {
    urgent: "from-orange-600 to-red-600",
    warning: "from-yellow-600 to-orange-600",
    normal: "from-blue-600 to-indigo-600"
  }[urgency];

  return (
    <div className={`sticky top-0 z-50 bg-gradient-to-r ${bgColor} text-white shadow-lg`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm">
              {urgency === "urgent" ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-medium text-sm sm:text-base">
                {urgency === "urgent" 
                  ? "⚠️ Trial ending soon!" 
                  : urgency === "warning"
                  ? "⏰ Trial expires in a week"
                  : "🎉 Free trial active"}
              </p>
              <p className="text-xs sm:text-sm opacity-90">
                {daysRemaining > 0 ? (
                  <>
                    <span className="font-semibold">{daysRemaining}</span> day{daysRemaining !== 1 ? 's' : ''} {hoursRemaining > 0 && (
                      <>, <span className="font-semibold">{hoursRemaining}</span> hour{hoursRemaining !== 1 ? 's' : ''}</>
                    )} remaining
                  </>
                ) : (
                  <>
                    <span className="font-semibold">{hoursRemaining}</span> hour{hoursRemaining !== 1 ? 's' : ''} remaining
                  </>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href="/plans"
              className="px-4 sm:px-6 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-sm font-medium transition-colors border border-white/20"
            >
              View Plans
            </Link>
            <Link
              href="/plans"
              className="px-4 sm:px-6 py-2 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-lg"
            >
              Upgrade Now
            </Link>
            <button
              onClick={() => setDismissed(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Dismiss"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
