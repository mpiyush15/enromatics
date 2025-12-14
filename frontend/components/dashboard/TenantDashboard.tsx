'use client';

import { Users, BookOpen, DollarSign, Loader, AlertCircle } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import { useDashboardData } from '@/hooks/useDashboardData';

interface TenantAnalyticsData {
  stats: {
    totalStudents: number;
    activeBatches: number;
    totalRevenue: number;
    pendingPayments: number;
  };
}

/**
 * Tenant Admin Dashboard
 * Shows only their institute's data
 * Different data endpoints, tenant-specific metrics
 */
export default function TenantDashboard() {
  // ✅ Fetch tenant-specific dashboard data
  // This endpoint filters by tenantId from JWT token
  const { data: analytics, isLoading, error, mutate } = useDashboardData<TenantAnalyticsData>(
    '/api/tenant/dashboard'
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">Error loading dashboard</p>
            <p className="text-red-600 text-sm mt-1">{error.message}</p>
            <button
              onClick={() => mutate()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Tenant dashboard shows their institute data
  const stats = analytics?.stats || {
    totalStudents: 0,
    activeBatches: 0,
    totalRevenue: 0,
    pendingPayments: 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Institute Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Your institute analytics and metrics
          </p>
        </div>

        {/* Tenant-Specific KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={<Users />}
            color="blue"
          />
          <StatCard
            title="Active Batches"
            value={stats.activeBatches}
            icon={<BookOpen />}
            color="green"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            icon={<DollarSign />}
            color="purple"
          />
          <StatCard
            title="Pending Payments"
            value={stats.pendingPayments}
            icon={<AlertCircle />}
            color="orange"
          />
        </div>

        {/* Tenant-Specific Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Students */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Students
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Student list component will go here
            </p>
          </div>

          {/* Recent Payments */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Payments
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Payment history component will go here
            </p>
          </div>
        </div>

        {/* Batches Overview */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Active Batches
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Batches list component will go here
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Last updated: {new Date().toLocaleString('en-IN')}
          </p>
          <button
            onClick={() => mutate()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}
