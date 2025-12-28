"use client";

import { useEffect, useRef } from "react";

/**
 * Hook to track page views for analytics
 * Production-ready: Works with Railway backend + Vercel frontend
 */
export function usePageTracking(pageName: string) {
  const tracked = useRef(false);

  useEffect(() => {
    // Only track once per page load
    if (tracked.current) return;
    tracked.current = true;

    const trackPageView = async () => {
      try {
        // Generate or get session ID
        let sessionId = sessionStorage.getItem("_enro_session");
        if (!sessionId) {
          sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          sessionStorage.setItem("_enro_session", sessionId);
        }

        // Get UTM params from URL
        const params = new URLSearchParams(window.location.search);
        const utmSource = params.get("utm_source") || undefined;
        const utmMedium = params.get("utm_medium") || undefined;
        const utmCampaign = params.get("utm_campaign") || undefined;

        const trackingData = {
          page: pageName,
          path: window.location.pathname,
          sessionId,
          referrer: document.referrer || undefined,
          utmSource,
          utmMedium,
          utmCampaign,
        };

        console.log(`📊 [Analytics] Tracking page: ${pageName}`, trackingData);

        // Send tracking data
        const response = await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(trackingData),
        });

        const result = await response.json();
        console.log(`📊 [Analytics] Track response (${response.status}):`, result);
      } catch (error) {
        // Silent fail - don't break the page if tracking fails
        console.error("❌ [Analytics] Tracking failed:", error);
      }
    };

    // Small delay to not block page render
    setTimeout(trackPageView, 100);
  }, [pageName]);
}
