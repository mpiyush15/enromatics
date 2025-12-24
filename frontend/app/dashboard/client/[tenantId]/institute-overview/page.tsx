"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { api, safeApiCall } from "@/lib/apiClient";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface DashboardStats {
  totalStudents: number;
  totalRevenue: number;
  totalTests: number;
  todayAttendance: number;
  pendingFees: number;
  activeBatches: number;
}

interface TopRanker {
  _id: string;
  name: string;
  rollNumber: string;
  percentage: number;
}

/**
 * 🔒 Institute Overview Page (STABILIZED)
 * 
 * Part of: stabilization/ssot-bff
 * Date: 21 Dec 2025
 * 
 * Features:
 * - ✅ Uses unified apiClient (SSOT compliant)
 * - ✅ BFF pattern (calls /api/dashboard/overview)
 * - ✅ No direct backend calls
 * - ✅ Clean error handling
 */
export default function InstituteOverviewPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const tenantId = (params?.tenantId as string) || '';
  
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalRevenue: 0,
    totalTests: 0,
    todayAttendance: 0,
    pendingFees: 0,
    activeBatches: 0,
  });
  const [topRankers, setTopRankers] = useState<TopRanker[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenueView, setRevenueView] = useState<'quarterly' | 'annual'>('quarterly');
  const [revenueLoading, setRevenueLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [user, tenantId]);

  useEffect(() => {
    if (user) {
      fetchRevenueData();
    }
  }, [revenueView, user]);

  const fetchRevenueData = async () => {
    if (!user) return;
    
    try {
      setRevenueLoading(true);
      
      console.log('📊 Fetching revenue data, view:', revenueView);
      
      const [data, err] = await safeApiCall(() => 
        api.get<any>(`/api/dashboard/revenue?view=${revenueView}`)
      );

      if (err) {
        console.error("❌ Error fetching revenue data:", err);
        setRevenueData([]);
        setRevenueLoading(false);
        return;
      }

      if (data?.success && data?.revenueData) {
        console.log('✅ Revenue data loaded:', data.revenueData);
        console.log('📊 Revenue data length:', data.revenueData.length);
        console.log('📊 Revenue data:', JSON.stringify(data.revenueData, null, 2));
        setRevenueData(data.revenueData);
      } else {
        console.warn('⚠️ No revenue data in response:', data);
        setRevenueData([]);
      }
      
      setRevenueLoading(false);
    } catch (error: any) {
      console.error("❌ Exception fetching revenue data:", error);
      setRevenueData([]);
      setRevenueLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // 🔒 SSOT: Use apiClient to call BFF route
      const [data, err] = await safeApiCall(() => 
        api.get<any>('/api/dashboard/overview')
      );

      if (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.message || "Failed to load dashboard data");
        setLoading(false);
        return;
      }

      if (data?.success && data?.stats) {
        setStats({
          totalStudents: data.stats.studentsCount || 0,
          totalRevenue: data.stats.totalRevenue || 0,
          totalTests: data.stats.totalTests || 0,
          todayAttendance: data.stats.todayAttendance || 0,
          pendingFees: data.stats.pendingFees || 0,
          activeBatches: data.stats.activeBatches || 0,
        });
      } else {
        setError(data?.message || "Invalid response format");
      }

      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      setError(error?.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <div className="text-lg text-gray-600 dark:text-gray-400">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 min-h-screen bg-gray-50 dark:bg-gray-950">
        <div className="max-w-2xl mx-auto mt-20">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">⚠️</span>
              <h2 className="text-xl font-bold text-red-800 dark:text-red-200">
                Failed to Load Dashboard
              </h2>
            </div>
            <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            📊 Institute Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening today.
          </p>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => router.push(`/dashboard/client/${tenantId}/students/add`)}
          className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg transition-all transform hover:scale-105"
        >
          <span className="text-2xl">➕</span>
          <div className="text-left">
            <div className="font-bold">Enroll Student</div>
            <div className="text-xs opacity-90">Add new admission</div>
          </div>
        </button>

        <button
          onClick={() => router.push(`/dashboard/client/${tenantId}/payments`)}
          className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl shadow-lg transition-all transform hover:scale-105"
        >
          <span className="text-2xl">💰</span>
          <div className="text-left">
            <div className="font-bold">Collect Fees</div>
            <div className="text-xs opacity-90">Payment entry</div>
          </div>
        </button>

        <button
          onClick={() => router.push(`/dashboard/client/${tenantId}/academics/batches`)}
          className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl shadow-lg transition-all transform hover:scale-105"
        >
          <span className="text-2xl">📚</span>
          <div className="text-left">
            <div className="font-bold">Manage Batches</div>
            <div className="text-xs opacity-90">Create & organize</div>
          </div>
        </button>

        <button
          onClick={() => router.push(`/dashboard/client/${tenantId}/students/attendance`)}
          className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl shadow-lg transition-all transform hover:scale-105"
        >
          <span className="text-2xl">✅</span>
          <div className="text-left">
            <div className="font-bold">Daily Attendance</div>
            <div className="text-xs opacity-90">Mark batch attendance</div>
          </div>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Students */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Students</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.totalStudents}
              </h3>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full">
              <span className="text-3xl">👥</span>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Revenue</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                ₹{stats.totalRevenue.toLocaleString()}
              </h3>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full">
              <span className="text-3xl">💰</span>
            </div>
          </div>
        </div>

        {/* Total Tests */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Total Tests</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.totalTests}
              </h3>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-full">
              <span className="text-3xl">📝</span>
            </div>
          </div>
        </div>

        {/* Today's Attendance */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Today's Attendance</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.todayAttendance}%
              </h3>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900 p-4 rounded-full">
              <span className="text-3xl">✅</span>
            </div>
          </div>
        </div>

        {/* Pending Fees */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Pending Fees</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                ₹{stats.pendingFees.toLocaleString()}
              </h3>
            </div>
            <div className="bg-red-100 dark:bg-red-900 p-4 rounded-full">
              <span className="text-3xl">⚠️</span>
            </div>
          </div>
        </div>

        {/* Active Batches */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Active Batches</p>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.activeBatches}
              </h3>
            </div>
            <div className="bg-indigo-100 dark:bg-indigo-900 p-4 rounded-full">
              <span className="text-3xl">📚</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Graph */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              💰 Revenue Overview
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setRevenueView('quarterly')}
                className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
                  revenueView === 'quarterly'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Quarterly
              </button>
              <button
                onClick={() => setRevenueView('annual')}
                className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
                  revenueView === 'annual'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Annual
              </button>
            </div>
          </div>
          
          <div className="h-64">
            {revenueLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : !revenueData || revenueData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <p>No revenue data available</p>
                  <p className="text-sm mt-2">Data will appear as payments are received</p>
                  <p className="text-xs mt-2 text-red-500">Debug: {JSON.stringify(revenueData)}</p>
                </div>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="period" 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      stroke="#9ca3af"
                    />
                    <YAxis 
                      tick={{ fill: '#6b7280', fontSize: 12 }}
                      stroke="#9ca3af"
                      tickFormatter={(value) => value === 0 ? '0' : `₹${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: 'none', 
                        borderRadius: '8px',
                        color: 'white',
                        padding: '8px 12px'
                      }}
                      formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Bar 
                      dataKey="revenue" 
                      fill="#3b82f6" 
                      name="Revenue"
                      radius={[8, 8, 0, 0]}
                      animationDuration={1000}
                    />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Data points: {revenueData.length}
                </p>
              </>
            )}
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-lg font-bold text-blue-600">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400">Pending Fees</p>
              <p className="text-lg font-bold text-green-600">₹{stats.pendingFees.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Attendance Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            ✅ Today's Attendance
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Present Students</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round((stats.todayAttendance / 100) * stats.totalStudents)}
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Absent Students</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.totalStudents - Math.round((stats.todayAttendance / 100) * stats.totalStudents)}
                </p>
              </div>
              <div className="text-4xl">❌</div>
            </div>

            <button
              onClick={() => router.push(`/dashboard/client/${tenantId}/students/attendance`)}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Mark Daily Attendance
            </button>
          </div>
        </div>
      </div>

      {/* Top Rankers Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            🏆 Top Rankers
          </h2>
          <button
            onClick={() => router.push(`/dashboard/client/${tenantId}/academics/reports`)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All →
          </button>
        </div>

        {topRankers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {topRankers.map((student, index) => (
                  <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4">
                      <span className="text-2xl">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">{student.rollNumber}</td>
                    <td className="px-6 py-4">{student.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-semibold">
                        {student.percentage}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-gray-500">No test results yet</p>
            <p className="text-sm text-gray-400 mt-2">Top performers will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}
