"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { TrendingUp, Users, BookOpen, DollarSign, Calendar, AlertCircle, CheckCircle } from "lucide-react";

/**
 * 🎨 UI TEST LAB - MINIMAL PROFESSIONAL DESIGN
 * 
 * Purpose: Test new minimal UI design with smaller boxes/cards
 * Once validated, apply to actual pages (institute-overview, etc)
 * 
 * Features:
 * - Minimal spacing and compact cards
 * - Professional color scheme (blue/slate)
 * - Small metric boxes
 * - Clean typography
 * - Responsive grid layout
 */
export default function UITestLabPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  // Sample metric data
  const metrics = [
    { icon: Users, label: "Total Students", value: "2,458", change: "+12%", color: "from-blue-500 to-blue-600" },
    { icon: BookOpen, label: "Active Batches", value: "24", change: "+3", color: "from-emerald-500 to-emerald-600" },
    { icon: DollarSign, label: "Monthly Revenue", value: "₹8,45,000", change: "+8%", color: "from-amber-500 to-amber-600" },
    { icon: Calendar, label: "Today Attendance", value: "87%", change: "+5%", color: "from-purple-500 to-purple-600" },
  ];

  const recentActivity = [
    { type: "enrollment", name: "Raj Kumar", batch: "JEE Mains Batch A", time: "2 hours ago" },
    { type: "payment", name: "₹15,000 received", description: "From Priya Singh", time: "5 hours ago" },
    { type: "test", name: "Physics Test", batch: "Class 12 Advanced", time: "1 day ago" },
    { type: "alert", name: "Fee pending", description: "5 students have overdue fees", time: "1 day ago" },
  ];

  const batchStats = [
    { name: "JEE Mains A", students: 45, revenue: "₹3,60,000", status: "Active" },
    { name: "JEE Mains B", students: 38, revenue: "₹3,04,000", status: "Active" },
    { name: "NEET Biology", students: 52, revenue: "₹4,16,000", status: "Active" },
    { name: "CBSE Class 12", students: 67, revenue: "₹5,36,000", status: "Active" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* HEADER */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Institute Overview</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Dashboard Test Lab • Minimal UI Design</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950 rounded-md border border-emerald-200 dark:border-emerald-800">
                <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">LIVE DATA</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* METRICS GRID - 4 CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div key={idx} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className={`text-xs font-semibold ${metric.change.includes("+") ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                    {metric.change}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-xs font-medium mb-1">{metric.label}</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{metric.value}</p>
              </div>
            );
          })}
        </div>

        {/* TWO COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* LEFT: BATCH OVERVIEW TABLE */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Active Batches</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-slate-300">Batch Name</th>
                    <th className="px-4 py-2 text-center font-medium text-slate-700 dark:text-slate-300">Students</th>
                    <th className="px-4 py-2 text-right font-medium text-slate-700 dark:text-slate-300">Revenue</th>
                    <th className="px-4 py-2 text-center font-medium text-slate-700 dark:text-slate-300">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {batchStats.map((batch, idx) => (
                    <tr key={idx} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-2.5 text-slate-900 dark:text-white font-medium">{batch.name}</td>
                      <td className="px-4 py-2.5 text-center text-slate-600 dark:text-slate-400">{batch.students}</td>
                      <td className="px-4 py-2.5 text-right text-slate-900 dark:text-white font-semibold">{batch.revenue}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="inline-block px-2 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded text-xs font-semibold">
                          {batch.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT: RECENT ACTIVITY */}
          <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Activity Feed</h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full mt-2 bg-blue-500"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-900 dark:text-white truncate">
                        {activity.name}
                      </p>
                      {activity.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {activity.description}
                        </p>
                      )}
                      {activity.batch && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {activity.batch}
                        </p>
                      )}
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ALERTS & INSIGHTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg border border-blue-200 dark:border-blue-800 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm text-blue-900 dark:text-blue-100">Upcoming Events</h3>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">JEE Mock Test on Jan 20 • Physics Workshop on Jan 25</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 rounded-lg border border-emerald-200 dark:border-emerald-800 p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm text-emerald-900 dark:text-emerald-100">System Health</h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">All systems operational • Last backup: 2 hours ago</p>
            </div>
          </div>
        </div>

        {/* FOOTER NOTE */}
        <div className="text-center py-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ✨ This is a UI test design. Once approved, this layout will be applied to actual dashboard pages.
          </p>
        </div>
      </div>
    </div>
  );
}
