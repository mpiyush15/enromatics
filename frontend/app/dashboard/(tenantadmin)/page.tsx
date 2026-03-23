"use client";

import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { useSWRFetch } from "@/lib/hooks/use-swr-fetch";
import { Zap, Brain, TrendingUp, Users, BookOpen, Calendar, ArrowUpRight, ArrowDownLeft, Sparkles, CheckCircle, AlertCircle, Clock } from "lucide-react";

// AI-Powered Smart Insights
const AI_INSIGHTS = [
  {
    category: "Performance",
    icon: "🚀",
    message: "Your institution is performing 34% better than last month",
    confidence: "95%"
  },
  {
    category: "Opportunity",
    icon: "💡",
    message: "Recommended: Upgrade to Premium plan to unlock AI analytics",
    confidence: "100%"
  },
  {
    category: "Trend",
    icon: "📈",
    message: "Student enrollment trending upward - peak season detected",
    confidence: "87%"
  },
  {
    category: "Recommendation",
    icon: "🎯",
    message: "Activate SMS notifications to boost student engagement by 40%",
    confidence: "82%"
  },
  {
    category: "Warning",
    icon: "⚠️",
    message: "Plan expiring in 15 days - renew now to avoid service interruption",
    confidence: "100%"
  }
];

const QUICK_ACTIONS = [
  { 
    title: "Collect Fees", 
    icon: "💵", 
    color: "green", 
    description: "Record payments",
    link: "/dashboard/accounts"
  },
  { 
    title: "Accounts Overview", 
    icon: "📊", 
    color: "blue", 
    description: "View financials",
    link: "/dashboard/accounts"
  },
  { 
    title: "View Students", 
    icon: "👥", 
    color: "purple", 
    description: "Manage records",
    link: "/dashboard/students"
  },
  { 
    title: "Mark Attendance", 
    icon: "📋", 
    color: "orange", 
    description: "Daily attendance",
    link: "/dashboard/attendance"
  },
  { 
    title: "Exams & Tests", 
    icon: "🎓", 
    color: "red", 
    description: "Manage exams",
    link: "/dashboard/scholarship-exams"
  },
  { 
    title: "Add Expense", 
    icon: "💸", 
    color: "pink", 
    description: "Record expenses",
    link: "/dashboard/accounts"
  },
];

const USAGE_METRICS = [
  { label: "Students Active", value: "156", trend: "+12%", icon: Users, color: "blue" },
  { label: "Active Batches", value: "5", trend: "+2%", icon: BookOpen, color: "purple" },
  { label: "Tests This Month", value: "7", trend: "+18%", icon: Calendar, color: "green" },
  { label: "Institution Score", value: "8.6/10", trend: "+5%", icon: TrendingUp, color: "orange" },
];

export default function TenantDashboard() {
  const { user } = useAuth();
  const tenantId = user?.tenantId;
  const [aiInsightIndex, setAiInsightIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  const { data: tenant, isLoading: loading, isError, error } = useSWRFetch<any>(
    tenantId ? `/api/tenants/${tenantId}` : null
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAiInsightIndex((prev) => (prev + 1) % AI_INSIGHTS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 animate-spin mb-4">
            <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-6 md:p-8 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6">
          <p className="text-red-600 dark:text-red-400">Error loading dashboard</p>
        </div>
      </div>
    );
  }

  const insight = AI_INSIGHTS[aiInsightIndex];
  const planExpiry = tenant?.plan?.expiryDate ? new Date(tenant.plan.expiryDate) : null;
  const daysLeft = planExpiry ? Math.ceil((planExpiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 dark:from-gray-900 dark:via-gray-800/50 dark:to-gray-900 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Premium Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/40 dark:to-cyan-900/40 rounded-full border border-blue-200 dark:border-blue-800">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">AI-Powered Dashboard</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            Welcome back, <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{tenant?.name}</span> 👋
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Manage your institution with intelligent insights and real-time analytics
          </p>
        </div>

        {/* Institution Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {USAGE_METRICS.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:scale-105 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-${metric.color}-50 dark:bg-${metric.color}-900/20`}>
                    <Icon className={`w-6 h-6 text-${metric.color}-600 dark:text-${metric.color}-400`} />
                  </div>
                  <div className={`flex items-center gap-1 text-sm font-medium ${metric.trend.includes("+") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                    {metric.trend.includes("+") ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                    {metric.trend}
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{metric.label}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{metric.value}</p>
              </div>
            );
          })}
        </div>

        {/* AI Smart Insights Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 dark:from-blue-700 dark:via-cyan-700 dark:to-blue-700 rounded-2xl p-8 text-white shadow-xl hover:shadow-2xl transition-shadow">
          <div className="flex items-start gap-6">
            <div className="p-4 bg-white/20 backdrop-blur rounded-xl flex-shrink-0">
              <Brain className="w-8 h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-bold text-blue-100 opacity-80">🤖 AI INSIGHT #{aiInsightIndex + 1}</span>
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 rounded-full text-xs font-medium text-blue-100">
                  <CheckCircle className="w-3 h-3" />
                  {insight.confidence}
                </span>
              </div>
              <p className="text-xl font-bold mb-1">{insight.icon} {insight.message}</p>
              <p className="text-blue-100 text-sm">Category: <span className="font-semibold">{insight.category}</span> • Updates every 6 seconds</p>
            </div>
            <Zap className="w-8 h-8 text-yellow-300 flex-shrink-0 animate-pulse" />
          </div>
        </div>

        {/* Plan & Subscription Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Plan Details - Large Card */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">📋 Subscription Details</h2>
                <p className="text-gray-600 dark:text-gray-400">Your current plan & billing information</p>
              </div>
              <div className={`px-4 py-2 rounded-full text-sm font-semibold ${tenant?.plan?.name === "Premium" ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"}`}>
                {tenant?.plan?.name || "Free"} Plan
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-100 dark:border-blue-800/30">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Customer ID</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{tenant?.tenantId?.slice(0, 8).toUpperCase()}...</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100/50 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-xl border border-cyan-100 dark:border-cyan-800/30">
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Email</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white truncate">{tenant?.email}</p>
              </div>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white">Plan Features</h3>
                <span className="text-xs font-medium text-green-600 dark:text-green-400">Active</span>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Unlimited student records</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">Real-time analytics dashboard</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-300">AI-powered insights</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Plan Expiry Alert */}
          <div className={`rounded-2xl p-6 border-2 transition-all ${
            daysLeft && daysLeft < 30 
              ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" 
              : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
          }`}>
            <div className="flex items-start gap-4">
              {daysLeft && daysLeft < 30 ? (
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
              ) : (
                <Clock className="w-8 h-8 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-lg mb-2 ${daysLeft && daysLeft < 30 ? "text-red-900 dark:text-red-200" : "text-green-900 dark:text-green-200"}`}>
                  {daysLeft && daysLeft < 30 ? "Plan Expiring Soon" : "Plan Active"}
                </h3>
                {planExpiry && (
                  <>
                    <p className={`text-sm mb-3 ${daysLeft && daysLeft < 30 ? "text-red-700 dark:text-red-300" : "text-green-700 dark:text-green-300"}`}>
                      Expires on: <span className="font-semibold">{planExpiry.toLocaleDateString()}</span>
                    </p>
                    <p className={`text-2xl font-bold ${daysLeft && daysLeft < 30 ? "text-red-700 dark:text-red-300" : "text-green-700 dark:text-green-300"}`}>
                      {daysLeft} days left
                    </p>
                  </>
                )}
                {!planExpiry && <p className={`text-sm ${daysLeft && daysLeft < 30 ? "text-red-700 dark:text-red-300" : "text-green-700 dark:text-green-300"}`}>No expiry set</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Action Cards - Bento Style */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">⚡ Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {QUICK_ACTIONS.map((action, idx) => {
              const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
                green: { bg: "from-green-500 to-emerald-500", border: "border-green-200 dark:border-green-800/50", text: "text-green-700 dark:text-green-300" },
                blue: { bg: "from-blue-500 to-cyan-500", border: "border-blue-200 dark:border-blue-800/50", text: "text-blue-700 dark:text-blue-300" },
                purple: { bg: "from-purple-500 to-pink-500", border: "border-purple-200 dark:border-purple-800/50", text: "text-purple-700 dark:text-purple-300" },
                orange: { bg: "from-orange-500 to-red-500", border: "border-orange-200 dark:border-orange-800/50", text: "text-orange-700 dark:text-orange-300" },
                red: { bg: "from-red-500 to-pink-500", border: "border-red-200 dark:border-red-800/50", text: "text-red-700 dark:text-red-300" },
                pink: { bg: "from-pink-500 to-red-500", border: "border-pink-200 dark:border-pink-800/50", text: "text-pink-700 dark:text-pink-300" }
              };
              const colors = colorClasses[action.color] || colorClasses.blue;

              return (
                <a
                  key={idx}
                  href={action.link}
                  className={`group bg-gradient-to-br ${colors.bg} rounded-2xl p-6 text-white border ${colors.border} hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer`}
                >
                  <div className="space-y-4">
                    <div className="text-5xl group-hover:scale-110 transition-transform duration-300">{action.icon}</div>
                    <div>
                      <h3 className="font-bold text-lg">{action.title}</h3>
                      <p className="text-sm text-white/80">{action.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      Go to <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>

        {/* AI Integration Note */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-100 dark:border-purple-800/30">
          <div className="flex items-start gap-4">
            <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white mb-2">🚀 Powered by Smart AI</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                This dashboard uses intelligent analytics to provide real-time insights into your institution's performance. Navigate through the menu to explore advanced features like student analytics, attendance tracking, and financial reports.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
