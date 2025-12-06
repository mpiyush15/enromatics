'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Users, CreditCard, BarChart3, Loader } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import { RevenueChart, BarChartComponent, PieChartComponent, AreaChart } from '@/components/dashboard/Charts';

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

export default function OverviewPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://endearing-blessing-production-c61f.up.railway.app'}/api/analytics/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Analytics error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error loading analytics</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
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

  const { kpis, charts } = analytics;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome to your analytics dashboard. Monitor your business metrics in real-time.
          </p>
        </div>

        {/* KPI Cards */}
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

        {/* Subscription Status */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <PieChartComponent
            data={charts.subscriptionStatus}
            title="Subscription Status Distribution"
            height={300}
          />
        </div>

        {/* Footer */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Last updated: {new Date().toLocaleString('en-IN')}
          </p>
          <button
            onClick={fetchAnalytics}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}
