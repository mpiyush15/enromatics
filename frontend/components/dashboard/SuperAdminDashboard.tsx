'use client';

import { TrendingUp, Users, CreditCard, BarChart3, Loader, AlertCircle } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import { RevenueChart, BarChartComponent, PieChartComponent, AreaChart } from '@/components/dashboard/Charts';
import TopTenantsTable from '@/components/dashboard/TopTenantsTable';
import RevenueBreakdown from '@/components/dashboard/RevenueBreakdown';
import { useDashboardData } from '@/hooks/useDashboardData';

interface AnalyticsData {
  kpis: {
    totalRevenue: number;
    activeSubscriptions: number;
    totalTenants: number;
    activeUsers: number;
    growthRate: number;
  };
  charts: {
    tenantsByPlan: any[];
    subscriptionStatus: any[];
    revenueTrend: any[];
    websiteVisitors: any[];
    monthlyRevenue: any[];
  };
}

/**
 * SuperAdmin Dashboard
 * Shows all tenants data, revenue analytics, and system-wide metrics
 */
export default function SuperAdminDashboard() {
  // ✅ SWR: Auto-caching, revalidation, deduplication
  const { data: analytics, isLoading, error, mutate } = useDashboardData<AnalyticsData>(
    '/api/analytics/dashboard'
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
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

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">No data available</p>
        </div>
      </div>
    );
  }

  const kpis = analytics.kpis;
  const charts = analytics.charts;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              System-wide Analytics & Business Metrics
            </p>
          </div>
        </div>

        {/* KPI Cards - SUPERADMIN ONLY */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={`₹${kpis.totalRevenue.toLocaleString()}`}
            icon={<CreditCard />}
            color="blue"
            change={kpis.growthRate}
            changeLabel="this month"
          />
          <StatCard
            title="Active Subscriptions"
            value={kpis.activeSubscriptions}
            icon={<TrendingUp />}
            color="green"
          />
          <StatCard
            title="Total Tenants"
            value={kpis.totalTenants}
            icon={<Users />}
            color="purple"
          />
          <StatCard
            title="Active Users"
            value={kpis.activeUsers}
            icon={<BarChart3 />}
            color="orange"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend */}
          <RevenueChart
            data={charts.revenueTrend}
            title="Revenue Trend (Last 30 Days)"
            height={300}
          />

          {/* Tenants by Plan */}
          <PieChartComponent
            data={charts.tenantsByPlan}
            title="Subscribers by Plan"
            height={300}
          />
        </div>

        {/* More Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Revenue */}
          <BarChartComponent
            data={charts.monthlyRevenue}
            title="Monthly Revenue (Last 12 Months)"
            dataKey="revenue"
            height={300}
          />

          {/* Website Visitors */}
          <AreaChart
            data={charts.websiteVisitors}
            title="New Tenants Sign-ups (Last 30 Days)"
            height={300}
          />
        </div>

        {/* Revenue Breakdown - SUPERADMIN ONLY */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <RevenueBreakdown />
        </div>

        {/* Subscription Status */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <PieChartComponent
            data={charts.subscriptionStatus}
            title="Subscription Status Distribution"
            height={300}
          />
        </div>

        {/* Top Tenants Table - SUPERADMIN ONLY */}
        <div className="mb-8">
          <TopTenantsTable limit={15} />
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
