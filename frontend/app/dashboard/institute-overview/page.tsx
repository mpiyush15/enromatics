"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface InstituteStats {
  studentsCount: number;
  totalRevenue: number;
  pendingFees: number;
  activeBatches: number;
  todayAttendance: number;
  totalTests: number;
}

export default function InstituteOverviewPage() {
  const [stats, setStats] = useState<InstituteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cacheStatus, setCacheStatus] = useState<'HIT' | 'MISS' | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use BFF route with caching
        // BFF layer handles 5-minute cache
        const res = await fetch("/api/dashboard/overview", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Check cache header from BFF
        const cacheHit = res.headers.get('X-Cache');
        if (cacheHit) {
          setCacheStatus(cacheHit as 'HIT' | 'MISS');
        }

        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.statusText}`);
        }

        const data = await res.json();
        if (data.success && data.stats) {
          setStats(data.stats);
        } else {
          setError(data.message || "Failed to load overview data");
        }
      } catch (err: any) {
        console.error("Failed to fetch institute overview:", err);
        setError(err.message || "An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              Loading institute overview...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900 rounded-2xl shadow-lg p-8 border-l-4 border-red-600">
            <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">
              Error Loading Data
            </h2>
            <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              📊 Institute Overview
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Complete institute statistics and key metrics
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard/students">
              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium shadow-md hover:shadow-lg transition-all">
                👥 View Students
              </button>
            </Link>
            <Link href="/dashboard/client/[tenantId]/accounts/overview">
              <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 font-medium shadow-md hover:shadow-lg transition-all">
                💰 Accounts
              </button>
            </Link>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Students Count */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <span className="text-4xl">👥</span>
              <span className="text-sm bg-white/20 px-2 py-1 rounded">Students</span>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.studentsCount}</div>
            <div className="text-sm opacity-90">Total Active Students</div>
          </div>

          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <span className="text-4xl">💵</span>
              <span className="text-sm bg-white/20 px-2 py-1 rounded">Revenue</span>
            </div>
            <div className="text-3xl font-bold mb-1">{formatCurrency(stats.totalRevenue)}</div>
            <div className="text-sm opacity-90">Total Revenue Collected</div>
          </div>

          {/* Pending Fees */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 shadow-lg text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <span className="text-4xl">⏳</span>
              <span className="text-sm bg-white/20 px-2 py-1 rounded">Pending</span>
            </div>
            <div className="text-3xl font-bold mb-1">{formatCurrency(stats.pendingFees)}</div>
            <div className="text-sm opacity-90">Fees Pending</div>
          </div>

          {/* Active Batches */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <span className="text-4xl">📚</span>
              <span className="text-sm bg-white/20 px-2 py-1 rounded">Batches</span>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.activeBatches}</div>
            <div className="text-sm opacity-90">Active Batches</div>
          </div>

          {/* Today's Attendance */}
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 shadow-lg text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <span className="text-4xl">📍</span>
              <span className="text-sm bg-white/20 px-2 py-1 rounded">Attendance</span>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.todayAttendance}%</div>
            <div className="text-sm opacity-90">Today's Attendance Rate</div>
          </div>

          {/* Total Tests */}
          <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 shadow-lg text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-2">
              <span className="text-4xl">📝</span>
              <span className="text-sm bg-white/20 px-2 py-1 rounded">Tests</span>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.totalTests}</div>
            <div className="text-sm opacity-90">Total Tests Created</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            🚀 Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/students/add">
              <button className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition">
                ➕ Add Student
              </button>
            </Link>
            <Link href="/dashboard/academics/batches">
              <button className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 font-medium transition">
                📚 Manage Batches
              </button>
            </Link>
            <Link href="/dashboard/students/attendance">
              <button className="w-full px-4 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 font-medium transition">
                📍 Mark Attendance
              </button>
            </Link>
            <Link href="/dashboard/client/[tenantId]/accounts/overview">
              <button className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition">
                💰 View Accounts
              </button>
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Metrics */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              📈 Key Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Average Revenue per Student</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatCurrency(stats.studentsCount > 0 ? stats.totalRevenue / stats.studentsCount : 0)}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Collection Rate</span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  {stats.totalRevenue + stats.pendingFees > 0
                    ? Math.round(
                        (stats.totalRevenue / (stats.totalRevenue + stats.pendingFees)) * 100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Students per Batch</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {stats.activeBatches > 0 ? Math.round(stats.studentsCount / stats.activeBatches) : 0}
                </span>
              </div>
            </div>
          </div>

          {/* Institute Health */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              ❤️ Institute Health
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Attendance Rate</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {stats.todayAttendance}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-teal-500 h-2 rounded-full transition-all"
                    style={{ width: `${stats.todayAttendance}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Collection Rate</span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {stats.totalRevenue + stats.pendingFees > 0
                      ? Math.round(
                          (stats.totalRevenue / (stats.totalRevenue + stats.pendingFees)) * 100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{
                      width:
                        stats.totalRevenue + stats.pendingFees > 0
                          ? Math.round(
                              (stats.totalRevenue / (stats.totalRevenue + stats.pendingFees)) * 100
                            )
                          : 0,
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Students Growth</span>
                  <span className="font-bold text-gray-900 dark:text-white">100%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
