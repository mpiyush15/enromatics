"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import { useSWRFetch } from "@/lib/hooks/use-swr-fetch";

export default function TenantHomePage() {
  const { user } = useAuth();
  const { data: tenant } = useSWRFetch<any>(
    user?.tenantId ? `/api/tenants/${user.tenantId}` : null
  );

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRevenue: 0,
    pendingFees: 0,
    activeLeads: 0,
    loading: true,
  });

  const instituteName = tenant?.instituteName?.split(" ")[0] || 
                       user?.tenant?.instituteName?.split(" ")[0] || 
                       user?.name?.split(" ")[0] || "Admin";

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats(prev => ({ ...prev, loading: true }));
        
        // Get overview stats (students, revenue, pending fees)
        const overviewRes = await fetch("/api/dashboard/overview", {
          credentials: "include",
        });
        const overviewData = await overviewRes.json();

        // Get active leads count
        const leadsRes = await fetch("/api/leads?status=interested,follow-up,negotiation&limit=1", {
          credentials: "include",
        });
        const leadsData = await leadsRes.json();

        if (overviewData.success && overviewData.stats) {
          setStats({
            totalStudents: overviewData.stats.studentsCount || 0,
            totalRevenue: overviewData.stats.totalRevenue || 0,
            pendingFees: overviewData.stats.pendingFees || 0,
            activeLeads: leadsData.count || 0,
            loading: false,
          });
        } else {
          setStats(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    if (user?.tenantId) {
      fetchStats();
    }
  }, [user?.tenantId]);

  const quickActions = [
    { title: "👥 Students", href: "/dashboard/students" },
    { title: "💰 Collect Fees", href: "/dashboard/accounts/receipts" },
    { title: "📋 Attendance", href: "/dashboard/students/attendance" },
    { title: "📊 Accounts", href: "/dashboard/accounts/overview" },
    { title: "📞 Leads", href: "/dashboard/leads" },
    { title: "📅 Tests", href: "/dashboard/academics/tests" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {instituteName}! 👋
          </h1>
          <p className="text-gray-600 dark:text-slate-400 text-lg">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          
          {/* Students Card */}
          <div className="bg-purple-200/30 dark:bg-purple-500/20 border border-purple-300/50 dark:border-purple-400/30 rounded-lg p-6 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all">
            <p className="text-gray-700 dark:text-slate-300 text-sm mb-2 font-medium">Total Students</p>
            <p className="text-4xl font-bold text-purple-700 dark:text-purple-300 mb-2">{stats.loading ? "..." : stats.totalStudents}</p>
            <p className="text-xs text-gray-600 dark:text-slate-400">Active enrollment</p>
          </div>

          {/* Revenue Card */}
          <div className="bg-purple-200/30 dark:bg-purple-500/20 border border-purple-300/50 dark:border-purple-400/30 rounded-lg p-6 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all">
            <p className="text-gray-700 dark:text-slate-300 text-sm mb-2 font-medium">Monthly Revenue</p>
            <p className="text-4xl font-bold text-purple-700 dark:text-purple-300 mb-2">₹{stats.loading ? "..." : (stats.totalRevenue / 100000).toFixed(1)}L</p>
            <p className="text-xs text-gray-600 dark:text-slate-400">This month</p>
          </div>

          {/* Pending Fees Card */}
          <div className="bg-purple-200/30 dark:bg-purple-500/20 border border-purple-300/50 dark:border-purple-400/30 rounded-lg p-6 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all">
            <p className="text-gray-700 dark:text-slate-300 text-sm mb-2 font-medium">Pending Fees</p>
            <p className="text-4xl font-bold text-purple-700 dark:text-purple-300 mb-2">₹{stats.loading ? "..." : (stats.pendingFees / 100000).toFixed(1)}L</p>
            <p className="text-xs text-gray-600 dark:text-slate-400">From students</p>
          </div>

          {/* Active Leads Card */}
          <div className="bg-purple-200/30 dark:bg-purple-500/20 border border-purple-300/50 dark:border-purple-400/30 rounded-lg p-6 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all">
            <p className="text-gray-700 dark:text-slate-300 text-sm mb-2 font-medium">Active Leads</p>
            <p className="text-4xl font-bold text-purple-700 dark:text-purple-300 mb-2">{stats.loading ? "..." : stats.activeLeads}</p>
            <p className="text-xs text-gray-600 dark:text-slate-400">Awaiting follow-up</p>
          </div>

        </div>

        {/* Quick Access Buttons */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <div className="bg-purple-200/25 dark:bg-purple-500/15 border border-purple-300/40 dark:border-purple-400/20 rounded-lg p-4 hover:bg-purple-300/30 dark:hover:bg-purple-500/25 hover:border-purple-300/60 dark:hover:border-purple-400/40 hover:shadow-lg transition-all cursor-pointer text-center backdrop-blur-lg">
                  <p className="text-gray-900 dark:text-white font-semibold text-sm">{action.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Empty State Message */}
        <div className="bg-purple-200/30 dark:bg-purple-500/20 border border-purple-300/50 dark:border-purple-400/30 rounded-lg p-8 text-center backdrop-blur-xl shadow-lg">
          <p className="text-gray-700 dark:text-slate-300 text-lg font-medium">
            ✅ All systems running smoothly. Ready to manage your institute?
          </p>
          <p className="text-gray-600 dark:text-slate-400 text-sm mt-2">
            Use the quick access buttons above to navigate to different sections
          </p>
        </div>

      </div>
    </div>
  );
}
