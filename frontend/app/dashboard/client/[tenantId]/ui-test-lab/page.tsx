"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { AlertCircle, CheckCircle, Plus, DollarSign, CheckSquare, BarChart3, ArrowRight } from "lucide-react";

/**
 * 🎨 INSTITUTE OVERVIEW - CONTROL ROOM UI TEST LAB
 * 
 * 🧠 CORE RULE: "What should the owner know in 10 seconds?"
 * 
 * ONLY 5 SECTIONS (STRICTLY LIMITED):
 * 1️⃣ TOP ACTION BAR - 4 quick actions
 * 2️⃣ KPI CARDS - 4 critical metrics only
 * 3️⃣ TODAY SNAPSHOT - What needs attention today
 * 4️⃣ ALERTS - Red flags or "all good"
 * 5️⃣ QUICK LINKS - Navigation (text only)
 * 
 * ❌ REMOVED: Graphs, tables, secondary info, rainbow colors
 * ✅ ADDED: Interactive actions, instant feedback, minimal design
 */
export default function InstituteOverviewUITest() {
  const { user, loading } = useAuth();
  const params = useParams();
  const tenantId = (params?.tenantId as string) || '';
  const [isMounted, setIsMounted] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [showToastMessage, setShowToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Simulate action clicks
  const handleAction = (action: string) => {
    setSelectedAction(action);
    setShowToastMessage(`${action} modal would open`);
    setTimeout(() => setShowToastMessage(null), 2000);
  };

  if (!isMounted || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: "Total Students", value: "2,458", icon: "👥" },
    { label: "Active Batches", value: "24", icon: "📚" },
    { label: "Today Attendance", value: "87%", icon: "✓" },
    { label: "Pending Fees", value: "₹1,24,500", icon: "⚠️" },
  ];

  const todayEvents = [
    "Attendance not marked for 2 batches",
    "₹42,000 fees pending today"
  ];

  const alerts = [
    { type: "warning", text: "Attendance not marked for JEE Batch A", icon: "⚠️" },
    { type: "warning", text: "5 students absent for 3+ days", icon: "⚠️" },
  ];

  const quickLinks = [
    { label: "View Students", path: "/dashboard/client/" + tenantId + "/students" },
    { label: "View Batches", path: "/dashboard/client/" + tenantId + "/academics" },
    { label: "Accounts", path: "/dashboard/client/" + tenantId + "/accounts" },
    { label: "WhatsApp", path: "/dashboard/client/" + tenantId + "/whatsapp/inbox" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      
      {/* TOAST NOTIFICATION */}
      {showToastMessage && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-fade-in-out">
          {showToastMessage}
        </div>
      )}

      {/* HEADER */}
      <div className="border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Institute Overview</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here's your 10-second snapshot</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Control Room Design • TailAdmin Style</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECTION 1️⃣: ACTION BAR */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: Plus, label: "Enroll Student", color: "blue" },
            { icon: DollarSign, label: "Collect Fees", color: "green" },
            { icon: CheckSquare, label: "Mark Attendance", color: "purple" },
            { icon: BarChart3, label: "View Batches", color: "orange" },
          ].map((action, idx) => {
            const Icon = action.icon;
            const colorMap: any = {
              blue: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900",
              green: "bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900",
              purple: "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900",
              orange: "bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-900",
            };

            return (
              <button
                key={idx}
                onClick={() => handleAction(action.label)}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${colorMap[action.color as keyof typeof colorMap]}`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-semibold text-sm">{action.label}</span>
              </button>
            );
          })}
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECTION 2️⃣: KPI CARDS (4 ONLY) */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
          {kpis.map((kpi, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-600 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">{kpi.label}</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{kpi.value}</p>
                </div>
                <span className="text-3xl">{kpi.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECTION 3️⃣: TODAY SNAPSHOT */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-5">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">📅 Today's Snapshot</h2>
          <div className="space-y-2">
            {todayEvents.map((event, idx) => (
              <div key={idx} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-slate-800 last:border-0">
                <span className="text-lg">•</span>
                <span className="text-gray-700 dark:text-gray-300 text-sm">{event}</span>
              </div>
            ))}
            {todayEvents.length === 0 && (
              <p className="text-gray-500 dark:text-gray-400 text-sm">All systems running smoothly today</p>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECTION 4️⃣: ALERTS & ATTENTION REQUIRED */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="bg-red-50 dark:bg-red-950 border-2 border-red-200 dark:border-red-800 rounded-lg p-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="font-bold text-red-900 dark:text-red-100 text-sm mb-3">⚠️ Attention Required</h2>
              <div className="space-y-2">
                {alerts.length > 0 ? (
                  alerts.map((alert, idx) => (
                    <div key={idx} className="text-red-800 dark:text-red-200 text-sm flex items-center gap-2">
                      <span className="text-lg">{alert.icon}</span>
                      <span>{alert.text}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">All systems running smoothly</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* SECTION 5️⃣: QUICK NAVIGATION */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-5">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Quick Navigation</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.path}
                className="group flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{link.label}</span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors" />
              </a>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-xs">
          <p>✨ Control Room Design • Interactive Test Lab • Real data coming soon</p>
        </div>

      </div>
    </div>
  );
}
