"use client";

import { useEffect, useState } from "react";

interface LiveStats {
  liveCount: number;
  activePages: { page: string; count: number }[];
  timestamp: string;
}

interface AnalyticsStats {
  today: { views: number; visitors: number };
  week: { views: number; visitors: number };
  month: { views: number; visitors: number };
  topPages: { page: string; views: number; visitors: number }[];
  sources: { source: string; count: number }[];
  devices: { device: string; count: number }[];
  hourly: { hour: number; views: number; visitors: number }[];
  generatedAt: string;
}

export default function WebsiteAnalyticsPage() {
  const [liveStats, setLiveStats] = useState<LiveStats | null>(null);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchAllStats();
    
    // Refresh live stats every 30 seconds
    const liveInterval = setInterval(fetchLiveStats, 30000);
    // Refresh full stats every 5 minutes
    const statsInterval = setInterval(fetchStats, 300000);
    
    return () => {
      clearInterval(liveInterval);
      clearInterval(statsInterval);
    };
  }, []);

  const fetchAllStats = async () => {
    await Promise.all([fetchLiveStats(), fetchStats()]);
    setLoading(false);
  };

  const fetchLiveStats = async () => {
    try {
      const res = await fetch("/api/analytics/live", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setLiveStats(data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Error fetching live stats:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/analytics/stats", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching analytics stats:", err);
    }
  };

  const getSourceIcon = (source: string) => {
    const icons: Record<string, string> = {
      direct: "🔗",
      google: "🔍",
      facebook: "📘",
      instagram: "📸",
      linkedin: "💼",
      twitter: "🐦",
      email: "📧",
      other: "🌐",
    };
    return icons[source] || "🌐";
  };

  const getDeviceIcon = (device: string) => {
    const icons: Record<string, string> = {
      desktop: "🖥️",
      mobile: "📱",
      tablet: "📱",
      unknown: "❓",
    };
    return icons[device] || "❓";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            📈 Website Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Live visitor tracking for your website (Vercel frontend)
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Last updated: {lastUpdated?.toLocaleTimeString() || "—"}
        </div>
      </div>

      {/* Live Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Live Visitors */}
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-5 text-white relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <span className="flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Live Now</p>
              <p className="text-4xl font-bold mt-1">{liveStats?.liveCount || 0}</p>
            </div>
            <span className="text-5xl">👁️</span>
          </div>
          <div className="mt-3 text-sm text-emerald-100">
            Active visitors right now
          </div>
        </div>

        {/* Today */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Today</p>
              <p className="text-4xl font-bold mt-1">{stats?.today.visitors || 0}</p>
            </div>
            <span className="text-5xl">📊</span>
          </div>
          <div className="mt-3 text-sm text-blue-100">
            {stats?.today.views || 0} page views
          </div>
        </div>

        {/* This Week */}
        <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">This Week</p>
              <p className="text-4xl font-bold mt-1">{stats?.week.visitors || 0}</p>
            </div>
            <span className="text-5xl">📈</span>
          </div>
          <div className="mt-3 text-sm text-purple-100">
            {stats?.week.views || 0} page views
          </div>
        </div>

        {/* This Month */}
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">This Month</p>
              <p className="text-4xl font-bold mt-1">{stats?.month.visitors || 0}</p>
            </div>
            <span className="text-5xl">📅</span>
          </div>
          <div className="mt-3 text-sm text-orange-100">
            {stats?.month.views || 0} page views
          </div>
        </div>
      </div>

      {/* Active Pages Right Now */}
      {liveStats?.activePages && liveStats.activePages.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Pages Being Viewed Right Now
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {liveStats.activePages.map((page, idx) => (
              <div key={idx} className="px-5 py-3 flex justify-between items-center">
                <span className="text-gray-900 dark:text-white font-medium">{page.page}</span>
                <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                  {page.count} viewing
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Pages */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">🔥 Top Pages (This Week)</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {!stats?.topPages?.length ? (
              <div className="px-5 py-8 text-center text-gray-500">No data yet</div>
            ) : (
              stats.topPages.slice(0, 10).map((page, idx) => (
                <div key={idx} className="px-5 py-3 flex justify-between items-center">
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">{page.page}</p>
                    <p className="text-xs text-gray-500">{page.visitors} unique visitors</p>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    {page.views} views
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">🌐 Traffic Sources</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {!stats?.sources?.length ? (
              <div className="px-5 py-8 text-center text-gray-500">No data yet</div>
            ) : (
              stats.sources.map((source, idx) => (
                <div key={idx} className="px-5 py-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getSourceIcon(source.source)}</span>
                    <span className="text-gray-900 dark:text-white font-medium capitalize">
                      {source.source}
                    </span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    {source.count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Devices */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">📱 Devices</h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {!stats?.devices?.length ? (
              <div className="px-5 py-8 text-center text-gray-500">No data yet</div>
            ) : (
              stats.devices.map((device, idx) => {
                const total = stats.devices.reduce((sum, d) => sum + d.count, 0);
                const percentage = total > 0 ? Math.round((device.count / total) * 100) : 0;
                return (
                  <div key={idx} className="px-5 py-3">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getDeviceIcon(device.device)}</span>
                        <span className="text-gray-900 dark:text-white font-medium capitalize">
                          {device.device}
                        </span>
                      </div>
                      <span className="text-gray-600 dark:text-gray-400 font-medium">
                        {percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Hourly Traffic Chart (Simple) */}
      {stats?.hourly && stats.hourly.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">⏰ Today's Hourly Traffic</h2>
          </div>
          <div className="p-5">
            <div className="flex items-end justify-between gap-1 h-40">
              {Array.from({ length: 24 }, (_, hour) => {
                const hourData = stats.hourly.find(h => h.hour === hour);
                const views = hourData?.views || 0;
                const maxViews = Math.max(...stats.hourly.map(h => h.views), 1);
                const height = (views / maxViews) * 100;
                const isCurrentHour = new Date().getHours() === hour;
                
                return (
                  <div key={hour} className="flex-1 flex flex-col items-center">
                    <div 
                      className={`w-full rounded-t transition-all duration-300 ${
                        isCurrentHour 
                          ? "bg-green-500" 
                          : views > 0 
                            ? "bg-blue-500" 
                            : "bg-gray-200 dark:bg-gray-700"
                      }`}
                      style={{ height: `${Math.max(height, 4)}%` }}
                      title={`${hour}:00 - ${views} views`}
                    ></div>
                    {hour % 4 === 0 && (
                      <span className="text-xs text-gray-500 mt-1">{hour}</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>12 AM</span>
              <span>6 AM</span>
              <span>12 PM</span>
              <span>6 PM</span>
              <span>11 PM</span>
            </div>
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>ℹ️ Note:</strong> This tracks visitors on your Vercel frontend (landing pages: /, /try, /login, /register). 
          Data is stored for 90 days and auto-refreshes every 30 seconds.
        </p>
      </div>
    </div>
  );
}
