/**
 * Premium Dashboard Header with AI Analytics
 * Glassy metrics, light blue accent, dark/light mode
 */

import React from 'react';
import { TrendingUp, AlertCircle, Zap, Target } from 'lucide-react';

interface DashboardStats {
  totalLeads: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  conversionRate: number;
  avgScore: number;
  overdueTasks: number;
}

interface PremiumHeaderProps {
  stats: DashboardStats;
  onViewAnalytics?: () => void;
}

export default function PremiumDashboardHeader({ stats, onViewAnalytics }: PremiumHeaderProps) {
  return (
    <div className="mb-8">
      {/* Main Header with AI Badge */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-300">
            Lead Management
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            AI-Powered Enquiry Dashboard • {stats.totalLeads} Active Leads
          </p>
        </div>

        {/* AI Powered Badge */}
        <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-100 to-blue-50 px-4 py-2 dark:from-blue-900/30 dark:to-blue-900/20 border border-blue-200 dark:border-blue-800">
          <Zap className="h-5 w-5 text-blue-600 dark:text-blue-300" />
          <span className="text-sm font-bold text-blue-600 dark:text-blue-300">AI POWERED</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Total Leads */}
        <div className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-900/5 backdrop-blur-xl" />
          <div className="absolute inset-0 rounded-2xl border-2 border-blue-200 dark:border-blue-800/50" />
          <div className="relative z-10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
                  Total Leads
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
                  {stats.totalLeads}
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-500 dark:text-blue-400 opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Hot Leads */}
        <div className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/10 dark:to-red-900/5 backdrop-blur-xl" />
          <div className="absolute inset-0 rounded-2xl border-2 border-red-200 dark:border-red-800/50" />
          <div className="relative z-10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
                  🔥 Hot Leads
                </p>
                <p className="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.hotLeads}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-red-500 dark:bg-red-600 opacity-20 group-hover:opacity-40 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Warm Leads */}
        <div className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/10 dark:to-amber-900/5 backdrop-blur-xl" />
          <div className="absolute inset-0 rounded-2xl border-2 border-amber-200 dark:border-amber-800/50" />
          <div className="relative z-10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
                  🟡 Warm Leads
                </p>
                <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {stats.warmLeads}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-amber-500 dark:bg-amber-600 opacity-20 group-hover:opacity-40 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/10 dark:to-green-900/5 backdrop-blur-xl" />
          <div className="absolute inset-0 rounded-2xl border-2 border-green-200 dark:border-green-800/50" />
          <div className="relative z-10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
                  Conversion Rate
                </p>
                <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.conversionRate}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500 dark:text-green-400 opacity-50 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Overdue Tasks Alert */}
        <div className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:scale-105">
          <div
            className={`absolute inset-0 bg-gradient-to-br ${
              stats.overdueTasks > 0
                ? 'from-orange-50 to-orange-100 dark:from-orange-900/10 dark:to-orange-900/5'
                : 'from-slate-50 to-slate-100 dark:from-slate-900/10 dark:to-slate-900/5'
            } backdrop-blur-xl`}
          />
          <div
            className={`absolute inset-0 rounded-2xl border-2 ${
              stats.overdueTasks > 0
                ? 'border-orange-200 dark:border-orange-800/50'
                : 'border-slate-200 dark:border-slate-800/50'
            }`}
          />
          <div className="relative z-10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-600 dark:text-slate-400">
                  Overdue Tasks
                </p>
                <p
                  className={`mt-1 text-2xl font-bold ${
                    stats.overdueTasks > 0
                      ? 'text-orange-600 dark:text-orange-400'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {stats.overdueTasks}
                </p>
              </div>
              {stats.overdueTasks > 0 && (
                <AlertCircle className="h-8 w-8 text-orange-500 dark:text-orange-400 opacity-50 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="mt-6 flex gap-3 flex-wrap">
        <button
          onClick={onViewAnalytics}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-4 py-2 text-sm font-semibold text-white transition-all shadow-md hover:shadow-lg dark:from-blue-600 dark:to-blue-700"
        >
          <Zap className="h-4 w-4" />
          View AI Analytics
        </button>
        <button className="inline-flex items-center gap-2 rounded-lg border-2 border-blue-300 bg-white/50 hover:bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition-all dark:border-blue-800 dark:bg-slate-800/50 dark:hover:bg-slate-700 dark:text-blue-300">
          📊 Export Report
        </button>
        <button className="inline-flex items-center gap-2 rounded-lg border-2 border-slate-200 bg-white/50 hover:bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 transition-all dark:border-slate-700 dark:bg-slate-800/50 dark:hover:bg-slate-700 dark:text-slate-300">
          ⚙️ Settings
        </button>
      </div>
    </div>
  );
}
