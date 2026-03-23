"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from "recharts";
import { AlertCircle, TrendingUp, Users, DollarSign, Target, Loader } from "lucide-react";
import { useAIDashboardInsights } from "@/ai/hooks/useDashboardInsights";
import AlertBanner from "@/ai/components/AlertBanner";
import AIInsightCard from "@/ai/components/AIInsightCard";
// NEW: Import all 8 hooks for live data
import {
  useInstituteKPIs,
  useRevenueToday,
  useMonthlyRevenue,
  useAdmissionSummary,
  useLeadSources,
  useTopStudents,
  useFacultyPerformance,
  useUpcomingTests
} from "@/hooks/useInstituteOverview";

export default function InstituteOverviewDashboard() {
  const { data: aiData, loading: aiLoading } = useAIDashboardInsights();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'ai-analytics'>('overview');

  // NEW: Call all 8 hooks for live data
  const kpisHook = useInstituteKPIs();
  const revenueHook = useRevenueToday();
  const monthlyRevenueHook = useMonthlyRevenue(6);
  const admissionsHook = useAdmissionSummary();
  const leadSourcesHook = useLeadSources();
  const topStudentsHook = useTopStudents(4);
  const facultyHook = useFacultyPerformance();
  const testsHook = useUpcomingTests(30);

  // Check if any data is still loading
  const isLoading = kpisHook.loading || revenueHook.loading || monthlyRevenueHook.loading ||
                   admissionsHook.loading || leadSourcesHook.loading || topStudentsHook.loading ||
                   facultyHook.loading || testsHook.loading;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Use live data from hooks, fallback to AI data, then mock data
  const kpis = kpisHook.data || (aiData as any)?.kpis || {};
  const alerts = (aiData as any)?.alerts || [];
  const recommendations = (aiData as any)?.recommendations || [];
  const revenueToday = revenueHook.data || {};
  const monthlyRevenue = monthlyRevenueHook.data || [];
  const admissions = admissionsHook.data || {};
  const leadSources = leadSourcesHook.data || [];
  const topStudents = topStudentsHook.data || [];
  const upcomingTests = testsHook.data || [];

  // Mock data for charts
  const admissionTrend = [
    { month: 'Jan', target: 40, actual: 35 },
    { month: 'Feb', target: 45, actual: 42 },
    { month: 'Mar', target: 50, actual: 48 },
    { month: 'Apr', target: 55, actual: 52 },
    { month: 'May', target: 60, actual: 58 },
  ];

  // Format currency
  const formatCurrency = (amount: number) => {
    if (!amount) return "₹0";
    const lakhs = (amount / 100000).toFixed(1);
    return `₹${lakhs}L`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Growth Dashboard</h1>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/40 dark:to-purple-900/40 border border-blue-200 dark:border-blue-800 rounded-full">
              <span className="text-xl">🤖</span>
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">AI-Powered</span>
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">AI Control Center for {kpis?.instituteName || "Your Institute"}</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('ai-analytics')}
            className={`px-4 py-3 font-medium transition-colors ${
              activeTab === 'ai-analytics'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
            }`}
          >
            🤖 AI Analytics
          </button>
        </div>

        {/* Alerts Section */}
        {!aiLoading && alerts.length > 0 && (
          <AlertBanner alerts={alerts} />
        )}

        {/* AI Insights */}
        {!aiLoading && recommendations.length > 0 && (
          <AIInsightCard recommendations={recommendations} />
        )}

        {/* Tab Content */}
        {activeTab === 'overview' && (
        <div className="space-y-6">
        
        {/* Loading Indicator */}
        {isLoading && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center gap-3">
            <Loader size={18} className="animate-spin text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-blue-700 dark:text-blue-300">Loading live institute data...</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Intelligence */}
          <div className="lg:col-span-1 space-y-4">
            {/* Today's Collection - LIVE */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-1">Today's Collection</p>
              {revenueHook.loading ? (
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2"></div>
              ) : revenueHook.error ? (
                <p className="text-sm text-red-600 dark:text-red-400">Error loading data</p>
              ) : (
                <>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Collection Status</p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">
                    ₹{(revenueToday?.collectionsToday || 0).toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">✓ Updated today</p>
                </>
              )}
            </div>

            {/* Expected Revenue - LIVE */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-4">Revenue Insights</p>
              {revenueHook.loading ? (
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pending Fees</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      ₹{(revenueToday?.pendingFeesTotal || 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Outstanding amount</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Fee Recovery Rate</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{revenueToday?.feeRecoveryRate || 0}%</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Link href="/dashboard/accounts/receipts">
                <button className="w-full bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-lg border border-gray-200 dark:border-slate-600 transition-colors text-sm">
                  Send Fee Reminders
                </button>
              </Link>
              <Link href="/dashboard/accounts">
                <button className="w-full bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-lg border border-gray-200 dark:border-slate-600 transition-colors text-sm">
                  View Defaulters
                </button>
              </Link>
            </div>
          </div>

          {/* Revenue Trend Chart - LIVE */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Revenue Trend (6 Months)</h3>
            {monthlyRevenueHook.loading ? (
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ) : monthlyRevenueHook.error ? (
              <p className="text-sm text-red-600 dark:text-red-400 h-64 flex items-center">Error loading chart</p>
            ) : monthlyRevenue && monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }} />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400 h-64 flex items-center">No data available</p>
            )}
          </div>
        </div>

        {/* Admission Growth & Lead Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Admission Growth Engine - LIVE */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-6">Admission Growth Engine</h3>
            {admissionsHook.loading ? (
              <div className="grid grid-cols-3 gap-4">
                {[1,2,3].map(i => (
                  <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{admissions?.activeLeads || 0}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Active Leads</p>
                </div>
                <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{admissions?.newAdmissionsThisMonth || 0}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">New Admissions</p>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{(admissions?.costPerAdmit || 0).toLocaleString('en-IN')}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Cost/Admit</p>
                </div>
              </div>
            )}
          </div>

          {/* Lead Sources Pie Chart - LIVE */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-6">Lead Sources</h3>
            {leadSourcesHook.loading ? (
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ) : leadSourcesHook.error ? (
              <p className="text-sm text-red-600 dark:text-red-400">Error loading data</p>
            ) : leadSources && leadSources.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={leadSources} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                    {leadSources.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill || '#8884d8'} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-400">No lead source data</p>
            )}
          </div>
        </div>

        {/* Student Performance & Top Students */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Students - LIVE */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-6">Top Students</h3>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Target</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">45 / 60</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: "75%" }} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Risk: Medium</p>
            </div>

            {/* Admission Trend */}
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={admissionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }} />
                <Line type="monotone" dataKey="target" stroke="#d1d5db" strokeWidth={2} />
                <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                💡 <strong>Insight:</strong> Increase follow-ups by 25% to hit goal
              </p>
            </div>
          </div>
        </div>

        {/* Student Performance & Risk & Faculty Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Performance */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Student Performance & Risk</h3>
              <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-1 rounded">3 - 3 Batch Alerts</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Top Performers</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">36</p>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">18% of total students</p>
            </div>

            <div className="mt-4 border-t border-gray-100 dark:border-slate-700 pt-4">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-3">Top Students</p>
              <div className="space-y-2">
                {topStudents.slice(0, 3).map((student) => (
                  <div key={student.rank} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{student.batch}</p>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white">{student.score}</p>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/dashboard/academics">
              <button className="w-full mt-4 text-sm bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-medium py-2 px-3 rounded-lg transition-colors">
                View Weak Students
              </button>
            </Link>
          </div>

          {/* Faculty Performance */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Faculty Performance</h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-300">Math Faculty</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">85 Avg Score</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">92% • Completion rate</p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-300">Physics Faculty</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white">63 Avg Score</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">4.2/5 • Student rating</p>
              </div>
              <div className="space-y-2 mt-2">
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Math faculty performing 18% better</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Batch A2 attendance dropping under Teacher X</p>
              </div>
            </div>

            <Link href="/dashboard/academics">
              <button className="w-full mt-4 text-sm bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-medium py-2 px-3 rounded-lg transition-colors">
                View Faculty Analytics
              </button>
            </Link>
          </div>

          {/* Upcoming Tests */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Upcoming Test Calendar</h3>
            <div className="space-y-3">
              {upcomingTests.map((test, idx) => (
                <div key={idx} className="flex gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex-shrink-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{test.date}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">📍 {test.batch}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{test.subject}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{test.students} students</p>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/dashboard/academics">
              <button className="w-full mt-4 text-sm bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-medium py-2 px-3 rounded-lg transition-colors">
                Full Calendar
              </button>
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {aiLoading && (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center shadow-sm border border-gray-100 dark:border-slate-700">
            <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">⏳ Loading dashboard data...</p>
          </div>
        )}
        </div>
        )}

        {/* AI Analytics Tab */}
        {activeTab === 'ai-analytics' && (
        <div className="space-y-6">
          {/* AI Alerts */}
          {!aiLoading && alerts.length > 0 ? (
            <AlertBanner alerts={alerts} />
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center shadow-sm border border-gray-100 dark:border-slate-700">
              <p className="text-gray-600 dark:text-gray-400">No active alerts at the moment</p>
            </div>
          )}

          {/* AI Insights & Recommendations */}
          {!aiLoading && recommendations.length > 0 ? (
            <div className="space-y-6">
              <AIInsightCard recommendations={recommendations} />
              
              {/* Detailed AI Analysis Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Analysis */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📈 Performance Analysis</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-green-700 dark:text-green-300 font-medium">Strong Growth Indicator</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Revenue trending +12% MoM</p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Admission Conversion</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Conversion rate at 75% - Above industry average</p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-sm text-purple-700 dark:text-purple-300 font-medium">Student Performance</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Average score up 8% vs last semester</p>
                    </div>
                  </div>
                </div>

                {/* Risk Analysis */}
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">⚠️ Risk Assessment</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border-l-4 border-amber-400">
                      <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">Fee Collection Risk</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">₹5.2L pending from 12 students</p>
                    </div>
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-l-4 border-orange-400">
                      <p className="text-sm text-orange-700 dark:text-orange-300 font-medium">Attendance Alert</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Batch B2: 15% students below 75% attendance</p>
                    </div>
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border-l-4 border-red-400">
                      <p className="text-sm text-red-700 dark:text-red-300 font-medium">Dropout Risk</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">3 students showing disengagement patterns</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Recommendations */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">💡 AI Recommendations</h3>
                <div className="space-y-3">
                  <div className="flex gap-3 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                    <div className="flex-shrink-0 text-2xl">1️⃣</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Launch Peer Mentoring Program</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Expected impact: +5% in student performance, boost engagement</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                    <div className="flex-shrink-0 text-2xl">2️⃣</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Implement Automated Fee Reminders</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Expected impact: Recover 85% of pending fees within 30 days</p>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                    <div className="flex-shrink-0 text-2xl">3️⃣</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Optimize Batch A2 Teaching Method</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Data shows 35% improvement potential with interactive sessions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : aiLoading ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center shadow-sm border border-gray-100 dark:border-slate-700">
              <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">🧠 Analyzing your data with AI...</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center shadow-sm border border-gray-100 dark:border-slate-700">
              <p className="text-gray-600 dark:text-gray-400 mb-4">No AI insights available yet</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">AI Analytics requires backend API integration with GPT</p>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
