"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { api, safeApiCall } from "@/lib/apiClient";

interface DashboardStats {
  totalStudents: number;
  activeBatches: number;
  todayAttendance: number;
  pendingFees: number;
}

export default function TestDashboardPage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const tenantId = (params?.tenantId as string) || '';

  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeBatches: 0,
    todayAttendance: 0,
    pendingFees: 0,
  });

  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const today = new Date();
    const formatted = today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    setCurrentDate(formatted);
    fetchDashboardData();
  }, [user, tenantId]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const [data, err] = await safeApiCall(() =>
        api.get<any>('/api/dashboard/overview')
      );

      if (err) {
        console.error("Error fetching dashboard data:", err);
        setLoading(false);
        return;
      }

      if (data?.success && data?.stats) {
        setStats({
          totalStudents: data.stats.studentsCount || 0,
          activeBatches: data.stats.activeBatches || 0,
          todayAttendance: data.stats.todayAttendance || 0,
          pendingFees: data.stats.pendingFees || 0,
        });
      }

      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
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

  return (
    <div className="px-8 py-4 space-y-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* WELCOME + DATE HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {currentDate}
        </p>
      </div>

      {/* KPI ROW - 4 CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
          <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold">Total Students</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalStudents}</p>
        </div>

        {/* Active Batches */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
          <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold">Active Batches</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.activeBatches}</p>
        </div>

        {/* Today's Attendance */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
          <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold">Today's Attendance</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.todayAttendance}%</p>
        </div>

        {/* Pending Fees */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-5">
          <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold">Pending Fees</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">₹{(stats.pendingFees / 1000).toFixed(0)}k</p>
        </div>
      </div>

      {/* QUICK ACTIONS - 3 BUTTONS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => router.push(`/dashboard/client/${tenantId}/students/add`)}
          className="flex items-center justify-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md rounded-lg p-5 transition-all"
        >
          <span className="text-2xl">➕</span>
          <div className="text-left">
            <p className="font-semibold text-gray-900 dark:text-white text-sm">Enroll Student</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Add new enrollment</p>
          </div>
        </button>

        <button
          onClick={() => router.push(`/dashboard/client/${tenantId}/accounts/transactions`)}
          className="flex items-center justify-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md rounded-lg p-5 transition-all"
        >
          <span className="text-2xl">💰</span>
          <div className="text-left">
            <p className="font-semibold text-gray-900 dark:text-white text-sm">Collect Fees</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Process payments</p>
          </div>
        </button>

        <button
          onClick={() => router.push(`/dashboard/client/${tenantId}/students/attendance`)}
          className="flex items-center justify-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md rounded-lg p-5 transition-all"
        >
          <span className="text-2xl">✅</span>
          <div className="text-left">
            <p className="font-semibold text-gray-900 dark:text-white text-sm">Mark Attendance</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Daily attendance</p>
          </div>
        </button>
      </div>

      {/* TODAY SNAPSHOT - TEXT ONLY CARD */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Today's Snapshot 📸</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0">📋</span>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Attendance not marked</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">1 batch still pending</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0">💵</span>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">₹18,000 fees due today</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">From 12 students</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0">😴</span>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">6 students absent</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Total across all batches</p>
            </div>
          </div>
        </div>
      </div>

      {/* ALERTS - CONDITIONAL */}
      <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-400 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">⚠️</span>
          <div>
            <h3 className="font-bold text-orange-900 dark:text-orange-200">Pending fees overdue</h3>
            <p className="text-sm text-orange-800 dark:text-orange-300 mt-1">
              2 batches have overdue fees. Collect pending payments from 34 students totaling ₹2.5L+
            </p>
            <button className="mt-3 px-3 py-1 bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold rounded transition-colors">
              View Details →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
