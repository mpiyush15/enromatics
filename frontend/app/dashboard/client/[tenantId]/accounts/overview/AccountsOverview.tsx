'use client';

import React, { useState, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { ChevronDown } from 'lucide-react';
import useSWR from 'swr';

// Types
interface RevenueData {
  month: string;
  revenue: number;
  students: number;
}

interface EnrollmentData {
  month: string;
  new: number;
  total: number;
}

interface PendingFeesData {
  month: string;
  amount: number;
  count: number;
}

interface TopPerformer {
  rank: number;
  name: string;
  tests: number;
  avgScore: number;
  attendance: number;
}

interface OverviewStats {
  totalRevenue: number;
  pendingFees: number;
  activeStudents: number;
  monthlyGrowth: number;
}

// Fetch data
const fetcher = (url: string) => fetch(url).then(r => r.json());

const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 0,
  focusThrottleInterval: 0,
  revalidateIfStale: true,
};

export default function AccountsOverview({ tenantId }: { tenantId: string }) {
  const [overviewPeriod, setOverviewPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [revenuePeriod, setRevenuePeriod] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [enrollmentPeriod, setEnrollmentPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [expensesPeriod, setExpensesPeriod] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch overview (total revenue, pending fees, etc) - uses overviewPeriod
  const { data: overviewData, isLoading: overviewLoading, mutate: mutateOverview } = useSWR(
    `/api/accounts/overview?period=${overviewPeriod}&refresh=${refreshKey}`,
    fetcher,
    swrConfig
  );

  // Fetch analytics data
  const { data: stats, isLoading: statsLoading } = useSWR(
    `/api/analytics/accounts/stats?tenantId=${tenantId}`,
    fetcher,
    swrConfig
  );

  const { data: revenueData, isLoading: revenueLoading, mutate: mutateRevenue } = useSWR(
    `/api/accounts/revenue-trend?period=${revenuePeriod}&months=${revenuePeriod === 'monthly' ? 6 : revenuePeriod === 'quarterly' ? 12 : 24}&refresh=${refreshKey}`,
    fetcher,
    swrConfig
  );

  const { data: enrollmentData, isLoading: enrollmentLoading, mutate: mutateEnrollment } = useSWR(
    `/api/accounts/enrollment-trend?period=${enrollmentPeriod}&months=${enrollmentPeriod === 'monthly' ? 6 : enrollmentPeriod === 'quarterly' ? 12 : 24}&refresh=${refreshKey}`,
    fetcher,
    swrConfig
  );

  const { data: enrollmentByBatchData, isLoading: batchLoading } = useSWR(
    `/api/accounts/enrollment-by-course`,
    fetcher,
    swrConfig
  );

  const { data: expensesData, isLoading: expensesLoading, mutate: mutateExpenses } = useSWR(
    `/api/accounts/expenses-trend?period=${expensesPeriod}&months=${expensesPeriod === 'monthly' ? 6 : expensesPeriod === 'quarterly' ? 12 : 24}&refresh=${refreshKey}`,
    fetcher,
    swrConfig
  );

  // Fetch pending fees from overview data
  const pendingFeesTotal = useMemo(() => {
    if (overviewData?.overview?.totalPending) {
      return overviewData.overview.totalPending;
    }
    return 0;
  }, [overviewData]);

  const { data: topPerformers, isLoading: performersLoading } = useSWR(
    `/api/analytics/accounts/top-performers?tenantId=${tenantId}&limit=5`,
    fetcher,
    swrConfig
  );

  // Auto-refresh revenue data when revenue period changes
  React.useEffect(() => {
    mutateRevenue();
  }, [revenuePeriod]);

  // Auto-refresh overview cards when overview period changes
  React.useEffect(() => {
    mutateOverview();
  }, [overviewPeriod]);

  // Auto-refresh enrollment data when enrollment period changes
  React.useEffect(() => {
    mutateEnrollment();
  }, [enrollmentPeriod]);

  // Default data for demo
  const defaultRevenueData: RevenueData[] = [
    { month: 'Jan', revenue: 45000, students: 120 },
    { month: 'Feb', revenue: 52000, students: 135 },
    { month: 'Mar', revenue: 48000, students: 128 },
    { month: 'Apr', revenue: 61000, students: 155 },
    { month: 'May', revenue: 55000, students: 142 },
    { month: 'Jun', revenue: 67000, students: 168 },
  ];

  const defaultEnrollmentData: EnrollmentData[] = [
    { month: 'Jan', new: 20, total: 120 },
    { month: 'Feb', new: 15, total: 135 },
    { month: 'Mar', new: 18, total: 128 },
    { month: 'Apr', new: 27, total: 155 },
    { month: 'May', new: 14, total: 142 },
    { month: 'Jun', new: 26, total: 168 },
  ];

  const defaultPendingFeesData: PendingFeesData[] = [
    { month: 'Jan', amount: 125000, count: 32 },
    { month: 'Feb', amount: 98000, count: 28 },
    { month: 'Mar', amount: 156000, count: 41 },
    { month: 'Apr', amount: 87000, count: 22 },
    { month: 'May', amount: 142000, count: 38 },
    { month: 'Jun', amount: 65000, count: 18 },
  ];

  const defaultTopPerformers: TopPerformer[] = [
    { rank: 1, name: 'Aarav Sharma', tests: 12, avgScore: 92, attendance: 95 },
    { rank: 2, name: 'Priya Patel', tests: 12, avgScore: 88, attendance: 92 },
    { rank: 3, name: 'Rohan Gupta', tests: 11, avgScore: 85, attendance: 88 },
    { rank: 4, name: 'Anushka Singh', tests: 11, avgScore: 83, attendance: 90 },
    { rank: 5, name: 'Vikram Reddy', tests: 10, avgScore: 79, attendance: 85 },
  ];

  // Use fetched data only - NO fallback to defaults
  // This ensures users see real data or "not enough data" message
  const chartRevenueData = revenueData?.data?.length > 0 ? revenueData.data : null;
  const chartEnrollmentData = enrollmentData?.data?.length > 0 ? enrollmentData.data : null;
  const chartBatchData = enrollmentByBatchData?.data?.length > 0 ? enrollmentByBatchData.data : null;
  const chartTopPerformers = topPerformers?.length > 0 ? topPerformers : null;

  // Calculate key metrics from real data
  const totalRevenue = useMemo(() => {
    if (overviewData?.overview?.totalFeesCollected) {
      return overviewData.overview.totalFeesCollected;
    }
    if (!chartRevenueData || chartRevenueData.length === 0) return 0;
    return (chartRevenueData as any[]).reduce((sum: number, item: any) => sum + (item.revenue || 0), 0);
  }, [overviewData, chartRevenueData]);

  const totalActiveStudents = useMemo(() => {
    if (enrollmentData?.totalStudents) {
      return enrollmentData.totalStudents;
    }
    return 0;
  }, [enrollmentData]);

  const colors = {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    secondary: '#8b5cf6',
  };

  const LoadingSkeleton = () => (
    <div className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg h-64"></div>
  );

  const NoDataMessage = ({ title }: { title: string }) => (
    <div className="flex flex-col items-center justify-center h-64 bg-slate-50 dark:bg-slate-900 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700">
      <p className="text-slate-500 dark:text-slate-400 font-medium mb-2">📊 Not Enough Data</p>
      <p className="text-slate-400 dark:text-slate-500 text-sm">{title} data will appear here once available</p>
    </div>
  );

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Accounts Overview</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Comprehensive analytics & insights</p>
        </div>
        <div className="flex gap-2">
          {(['monthly', 'quarterly', 'annual'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setOverviewPeriod(period)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                overviewPeriod === period
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Revenue',
            value: `₹${totalRevenue.toLocaleString()}`,
            subtext: '+12.5% from last period',
            color: 'from-blue-500 to-blue-600',
            icon: '💰',
          },
          {
            label: 'Pending Fees',
            value: `₹${pendingFeesTotal.toLocaleString()}`,
            subtext: '-8.2% reduction',
            color: 'from-orange-500 to-orange-600',
            icon: '⏳',
          },
          {
            label: 'Active Students',
            value: totalActiveStudents.toString(),
            subtext: '+40% YoY growth',
            color: 'from-green-500 to-green-600',
            icon: '👥',
          },
          {
            label: 'Monthly Growth',
            value: '+18.5%',
            subtext: 'Highest in Q2',
            color: 'from-purple-500 to-purple-600',
            icon: '📈',
          },
        ].map((metric, idx) => (
          <div
            key={idx}
            className={`bg-gradient-to-br ${metric.color} rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-shadow`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium opacity-90">{metric.label}</p>
                <p className="text-3xl font-bold mt-2">{metric.value}</p>
                <p className="text-xs opacity-75 mt-2">{metric.subtext}</p>
              </div>
              <span className="text-3xl">{metric.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg dark:shadow-2xl p-6 hover:shadow-xl dark:hover:shadow-2xl transition-shadow border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Revenue Trend</h2>
            <div className="flex gap-2">
              {(['monthly', 'quarterly', 'annual'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setRevenuePeriod(period)}
                  className={`px-3 py-1 text-sm rounded-lg font-medium transition-all ${
                    revenuePeriod === period
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {revenueLoading ? (
            <LoadingSkeleton />
          ) : !chartRevenueData ? (
            <NoDataMessage title="Revenue" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartRevenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: any) => `₹${(value as number).toLocaleString()}`}
                />
                <Bar
                  dataKey="revenue"
                  fill={colors.primary}
                  radius={[8, 8, 0, 0]}
                  name="Revenue"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Student Enrollments Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg dark:shadow-2xl p-6 hover:shadow-xl dark:hover:shadow-2xl transition-shadow border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Student Enrollments</h2>
            <div className="flex gap-2">
              {(['monthly', 'quarterly', 'annual'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setEnrollmentPeriod(period)}
                  className={`px-3 py-1 text-sm rounded-lg font-medium transition-all ${
                    enrollmentPeriod === period
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {enrollmentLoading ? (
            <LoadingSkeleton />
          ) : !chartEnrollmentData ? (
            <NoDataMessage title="Enrollment" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartEnrollmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Legend />
                <Bar dataKey="new" fill={colors.success} name="New Enrollments" radius={[8, 8, 0, 0]} />
                <Bar dataKey="total" fill={colors.primary} name="Total Students" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Admissions by Course Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg dark:shadow-2xl p-6 hover:shadow-xl dark:hover:shadow-2xl transition-shadow border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Admissions by Course</h2>
          </div>
          {batchLoading ? (
            <LoadingSkeleton />
          ) : !chartBatchData ? (
            <NoDataMessage title="Course Admissions" />
          ) : (
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartBatchData} margin={{ top: 40, bottom: 20, left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="course" 
                    stroke="#94a3b8"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                    formatter={(value) => [`${value} students`, 'Total']}
                  />
                  <Bar 
                    dataKey="students" 
                    fill={colors.primary} 
                    radius={[8, 8, 0, 0]}
                    label={{ position: 'top', fill: '#1e293b', fontSize: 12, fontWeight: 'bold' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top Performers Leaderboard */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg dark:shadow-2xl p-6 hover:shadow-xl dark:hover:shadow-2xl transition-shadow border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Expenses Trend</h2>
            <div className="flex gap-2">
              {(['monthly', 'quarterly', 'annual'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setExpensesPeriod(period)}
                  className={`px-3 py-1 text-sm rounded-lg font-medium transition-all ${
                    expensesPeriod === period
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {expensesLoading ? (
            <LoadingSkeleton />
          ) : !expensesData?.data ? (
            <NoDataMessage title="Expenses" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={expensesData.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value) => `₹${(value as number).toLocaleString()}`}
                />
                <Bar dataKey="expenses" fill={colors.warning} name="Expenses" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Fee Distribution Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg dark:shadow-2xl p-6 hover:shadow-xl dark:hover:shadow-2xl transition-shadow border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Revenue Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Regular Classes', value: 60 },
                  { name: 'Scholarship Tests', value: 20 },
                  { name: 'Workshops', value: 15 },
                  { name: 'Other', value: 5 },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {['#3b82f6', '#10b981', '#f59e0b', '#ef4444'].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Comparison */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg dark:shadow-2xl p-6 hover:shadow-xl dark:hover:shadow-2xl transition-shadow border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Key Metrics</h2>
          <div className="space-y-4">
            {[
              { label: 'Average Transaction Value', value: '₹4,250', change: '+5.2%' },
              { label: 'Collection Efficiency', value: '87.5%', change: '+2.1%' },
              { label: 'Student Lifetime Value', value: '₹45,000', change: '+8.3%' },
              { label: 'Monthly Retention Rate', value: '92.4%', change: '+1.8%' },
            ].map((metric, idx) => (
              <div key={idx} className="flex justify-between items-center p-3 border-b border-slate-200 dark:border-slate-700 last:border-0">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{metric.label}</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{metric.value}</p>
                </div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">{metric.change}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
