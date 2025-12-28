"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CRMStats {
  formLeads: {
    total: number;
    new: number;
    contacted: number;
    converted: number;
  };
  demoRequests: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
  };
  thisWeek: {
    newLeads: number;
    conversions: number;
    demos: number;
  };
  sources: Record<string, number>;
}

interface LiveStats {
  liveCount: number;
  activePages: { page: string; count: number }[];
}

interface AnalyticsStats {
  today: { views: number; visitors: number };
  week: { views: number; visitors: number };
}

export default function SuperCRMDashboard() {
  const [stats, setStats] = useState<CRMStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [recentDemos, setRecentDemos] = useState<any[]>([]);
  const [liveStats, setLiveStats] = useState<LiveStats | null>(null);
  const [analyticsStats, setAnalyticsStats] = useState<AnalyticsStats | null>(null);

  useEffect(() => {
    fetchStats();
    fetchRecentData();
    fetchLiveStats();
    fetchAnalyticsStats();
    
    // Refresh live stats every 30 seconds
    const interval = setInterval(fetchLiveStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/supercrm/stats", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Error fetching CRM stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveStats = async () => {
    try {
      const res = await fetch("/api/analytics/live", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setLiveStats(data);
      }
    } catch (err) {
      console.debug("Error fetching live stats:", err);
    }
  };

  const fetchAnalyticsStats = async () => {
    try {
      const res = await fetch("/api/analytics/stats", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setAnalyticsStats(data);
      }
    } catch (err) {
      console.debug("Error fetching analytics stats:", err);
    }
  };

  const fetchRecentData = async () => {
    try {
      // Fetch recent leads
      const leadsRes = await fetch("/api/form-leads?limit=5", { credentials: "include" });
      if (leadsRes.ok) {
        const data = await leadsRes.json();
        setRecentLeads(data.leads || []);
      }

      // Fetch recent demo requests
      const demosRes = await fetch("/api/demo-requests?limit=5", { credentials: "include" });
      if (demosRes.ok) {
        const data = await demosRes.json();
        setRecentDemos(data.demoRequests || []);
      }
    } catch (err) {
      console.error("Error fetching recent data:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            🚀 SuperCRM Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage all your sales leads and demo requests
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/supercrm/all-leads"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            View All Leads
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Form Leads */}
        <Link href="/dashboard/supercrm/form-leads" className="block">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Form Leads</p>
                <p className="text-3xl font-bold mt-1">{stats?.formLeads.total || 0}</p>
              </div>
              <span className="text-4xl">📝</span>
            </div>
            <div className="mt-3 text-sm text-blue-100">
              {stats?.formLeads.new || 0} new • {stats?.formLeads.contacted || 0} contacted
            </div>
          </div>
        </Link>

        {/* Demo Requests */}
        <Link href="/dashboard/supercrm/demo-requests" className="block">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Demo Requests</p>
                <p className="text-3xl font-bold mt-1">{stats?.demoRequests.total || 0}</p>
              </div>
              <span className="text-4xl">📅</span>
            </div>
            <div className="mt-3 text-sm text-green-100">
              {stats?.demoRequests.pending || 0} pending • {stats?.demoRequests.confirmed || 0} confirmed
            </div>
          </div>
        </Link>

        {/* This Week */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">This Week</p>
              <p className="text-3xl font-bold mt-1">{stats?.thisWeek.newLeads || 0}</p>
            </div>
            <span className="text-4xl">📈</span>
          </div>
          <div className="mt-3 text-sm text-orange-100">
            New leads this week
          </div>
        </div>

        {/* Conversions */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Conversions</p>
              <p className="text-3xl font-bold mt-1">{stats?.formLeads.converted || 0}</p>
            </div>
            <span className="text-4xl">🎯</span>
          </div>
          <div className="mt-3 text-sm text-purple-100">
            Total converted leads
          </div>
        </div>
      </div>

      {/* Live Website Analytics */}
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
              <p className="text-3xl font-bold mt-1">{liveStats?.liveCount || 0}</p>
            </div>
            <span className="text-4xl">👁️</span>
          </div>
          <div className="mt-3 text-sm text-emerald-100">
            Visitors on website
          </div>
        </div>

        {/* Today's Visitors */}
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100 text-sm">Today</p>
              <p className="text-3xl font-bold mt-1">{analyticsStats?.today.visitors || 0}</p>
            </div>
            <span className="text-4xl">📊</span>
          </div>
          <div className="mt-3 text-sm text-cyan-100">
            {analyticsStats?.today.views || 0} page views
          </div>
        </div>

        {/* This Week Visitors */}
        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100 text-sm">This Week</p>
              <p className="text-3xl font-bold mt-1">{analyticsStats?.week.visitors || 0}</p>
            </div>
            <span className="text-4xl">📈</span>
          </div>
          <div className="mt-3 text-sm text-indigo-100">
            {analyticsStats?.week.views || 0} page views
          </div>
        </div>

        {/* Active Pages */}
        <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm">Top Page Now</p>
              <p className="text-xl font-bold mt-1 truncate">
                {liveStats?.activePages?.[0]?.page || "—"}
              </p>
            </div>
            <span className="text-4xl">🔥</span>
          </div>
          <div className="mt-3 text-sm text-pink-100">
            {liveStats?.activePages?.[0]?.count || 0} active viewers
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Form Leads */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900 dark:text-white">📝 Recent Form Leads</h2>
            <Link href="/dashboard/supercrm/form-leads" className="text-sm text-purple-600 hover:text-purple-700">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentLeads.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-500">No leads yet</div>
            ) : (
              recentLeads.map((lead) => (
                <div key={lead._id} className="px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{lead.name}</p>
                      <p className="text-sm text-gray-500">{lead.email || lead.phone || "-"}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        lead.status === "new" ? "bg-blue-100 text-blue-700" :
                        lead.status === "contacted" ? "bg-yellow-100 text-yellow-700" :
                        lead.status === "converted" ? "bg-green-100 text-green-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {lead.status || "new"}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Demo Requests */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900 dark:text-white">📅 Recent Demo Requests</h2>
            <Link href="/dashboard/supercrm/demo-requests" className="text-sm text-purple-600 hover:text-purple-700">
              View All →
            </Link>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentDemos.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-500">No demo requests yet</div>
            ) : (
              recentDemos.map((demo) => (
                <div key={demo._id} className="px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{demo.name}</p>
                      <p className="text-sm text-gray-500">{demo.company || demo.email || "-"}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        demo.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                        demo.status === "confirmed" ? "bg-blue-100 text-blue-700" :
                        demo.status === "completed" ? "bg-green-100 text-green-700" :
                        demo.status === "cancelled" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {demo.status || "pending"}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {demo.date ? new Date(demo.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Lead Sources */}
      {stats?.sources && Object.keys(stats.sources).length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">📊 Lead Sources</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(stats.sources).map(([source, count]) => (
              <div key={source} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{count}</p>
                <p className="text-sm text-gray-500 capitalize">{source.replace(/-/g, " ")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">⚡ Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/dashboard/supercrm/form-leads"
            className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
          >
            <span className="text-2xl mb-2">📝</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Form Leads</span>
          </Link>
          <Link
            href="/dashboard/supercrm/demo-requests"
            className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition"
          >
            <span className="text-2xl mb-2">📅</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Demo Requests</span>
          </Link>
          <Link
            href="/dashboard/supercrm/all-leads"
            className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition"
          >
            <span className="text-2xl mb-2">📋</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">All Leads</span>
          </Link>
          <Link
            href="/dashboard/tenants"
            className="flex flex-col items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition"
          >
            <span className="text-2xl mb-2">🏢</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tenants</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
