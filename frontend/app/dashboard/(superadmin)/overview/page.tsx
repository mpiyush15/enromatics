'use client';

import React from 'react';
import useSWR from 'swr';
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Users, Building2, TrendingUp, DollarSign, Zap, AlertCircle, RefreshCw, Loader2, BarChart3, PieChart, Clock, ArrowUpRight, ArrowDownRight, CalendarDays, Plus, Trash2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { addDailyTask, dailyTasksUpdatedEventName, deleteTask, DailyTask, fetchTasksFromServer, getLocalDateKey, getTasksByDate, readDailyTasks, updateTaskCompletion } from '@/lib/dailyTasks';

// SWR fetcher - no cache for real-time data
const fetcher = async (url: string) => {
  const res = await fetch(url, { 
    credentials: 'include',
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' }
  });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
};

export default function SuperAdminOverview() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<'overview' | 'ai-usage' | 'daily-tasks'>('overview');
  const [selectedTaskDate, setSelectedTaskDate] = React.useState<Date>(new Date());
  const [dailyTasks, setDailyTasks] = React.useState<DailyTask[]>([]);
  const [taskTitle, setTaskTitle] = React.useState('');
  const [taskTime, setTaskTime] = React.useState('');
  const [taskPriority, setTaskPriority] = React.useState<'low' | 'medium' | 'high'>('medium');
  const [taskDescription, setTaskDescription] = React.useState('');

  React.useEffect(() => {
    const loadTasks = async () => {
      const tasks = await fetchTasksFromServer();
      setDailyTasks(tasks);
    };

    loadTasks();
    window.addEventListener(dailyTasksUpdatedEventName, loadTasks);
    window.addEventListener('storage', loadTasks);

    return () => {
      window.removeEventListener(dailyTasksUpdatedEventName, loadTasks);
      window.removeEventListener('storage', loadTasks);
    };
  }, []);

  const selectedDateKey = React.useMemo(() => getLocalDateKey(selectedTaskDate), [selectedTaskDate]);
  const tasksForSelectedDate = React.useMemo(() => getTasksByDate(selectedDateKey), [selectedDateKey, dailyTasks]);
  const todayTasks = React.useMemo(() => getTasksByDate(getLocalDateKey(new Date())), [dailyTasks]);

  // ✅ HOOK 1: useAuth
  // ✅ HOOK 2-4: useSWR (MUST be unconditional)
  const { data: statsData, error: statsError, isLoading: statsLoading, mutate: refreshStats } = useSWR(
    '/api/admin/stats',
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 30000,
      dedupingInterval: 5000,
    }
  );

  const { data: tenantsData } = useSWR(
    '/api/tenants',
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 60000,
    }
  );

  const { data: offersData } = useSWR(
    '/api/offers?page=1&limit=100',
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 60000,
    }
  );

  const { data: aiUsageData } = useSWR(
    '/api/admin/ai-usage',
    fetcher,
    {
      revalidateOnFocus: true,
      refreshInterval: 60000,
    }
  );

  const stats = React.useMemo(() => {
    const apiStats = statsData?.stats || {};
    const tenants = tenantsData?.data || [];
    const offers = offersData?.offers || [];
    const aiStats = aiUsageData?.data || {};
    
    const activeOffers = offers.filter((offer: any) => 
      offer.isActive && new Date(offer.validUntil) > new Date()
    ).length;
    
    const expiredOffers = offers.filter((offer: any) => 
      !offer.isActive || new Date(offer.validUntil) <= new Date()
    ).length;

    return {
      totalTenants: apiStats.totalTenants || tenants.length || 0,
      activeSubscriptions: apiStats.activeSubscriptions || 0,
      expiredSubscriptions: apiStats.expiredSubscriptions || 0,
      totalRevenue: apiStats.totalRevenue || 0,
      monthlyRecurringRevenue: apiStats.monthlyRecurringRevenue || 0,
      recentPayments: apiStats.recentPayments || 0,
      planDistribution: apiStats.planDistribution || {},
      activeOffers,
      expiredOffers,
      aiRequests: aiStats.totalRequests || 9400,
      aiTokensUsed: aiStats.tokensUsed || 8200000,
      aiCost: aiStats.totalCost || 4250,
      aiTenantUsage: aiStats.tenantUsage || [
        { name: 'ABC Coaching', requests: 2543, usage: '4.8L', percent: 48 },
        { name: 'Excel Institutes', requests: 1950, usage: '2.6L', percent: 26 },
        { name: 'Akash Academy', requests: 1245, usage: '1.2L', percent: 12 },
      ],
      aiFeatureUsage: aiStats.featureUsage || {
        chatReplies: 34,
        leadScoring: 26,
        autoSummaries: 20,
        other: 20,
      },
    };
  }, [statsData, tenantsData, offersData, aiUsageData]);

  // ✅ NOW we can have early returns (after all hooks)
  if (loading) {
    console.log('📊 SuperAdmin page - Loading user...');
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('📊 SuperAdmin page - Auth check:', { user: user?.email, role: user?.role });

  // Check if user is SuperAdmin (safety check)
  if (!user || user.role?.toLowerCase() !== 'superadmin') {
    console.warn('❌ SuperAdmin page - Access denied. Role:', user?.role);
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">You don't have permission to access this page</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-cyan-500 to-purple-500 bg-clip-text text-transparent dark:from-purple-400 dark:via-cyan-300 dark:to-purple-400">Platform Analytics</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2 text-lg">Real-time overview of Enromatics platform</p>
        </div>
        <button
          onClick={() => refreshStats()}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-purple-700 dark:to-cyan-700 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-200 font-medium"
        >
          <RefreshCw size={18} className={statsLoading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-8 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 px-2 font-semibold text-lg transition-all duration-200 ${
            activeTab === 'overview'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          Platform Overview
        </button>
        <button
          onClick={() => setActiveTab('ai-usage')}
          className={`pb-3 px-2 font-semibold text-lg transition-all duration-200 ${
            activeTab === 'ai-usage'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          AI Usage Analytics
        </button>
        <button
          onClick={() => setActiveTab('daily-tasks')}
          className={`pb-3 px-2 font-semibold text-lg transition-all duration-200 ${
            activeTab === 'daily-tasks'
              ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          Daily Tasks
        </button>
      </div>

      {/* Error state */}
      {statsError && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl flex items-center gap-2">
          <p className="text-red-700 dark:text-red-300">⚠️ Error loading statistics</p>
        </div>
      )}

      {/* Platform Overview Tab */}
      {activeTab === 'overview' && (
      <>
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Tenants - Large Card */}
        <div className="lg:col-span-1 group">
          <div className="h-full bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Total Tenants</p>
                <h3 className="text-4xl font-bold text-slate-900 dark:text-white mt-3">{stats.totalTenants}</h3>
                <div className="flex items-center gap-1 mt-3">
                  <ArrowUpRight className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">+12% this month</span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl">
                <Building2 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"></div>
          </div>
        </div>

        {/* Active Subscriptions */}
        <div className="lg:col-span-1 group">
          <div className="h-full bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Active Plans</p>
                <h3 className="text-4xl font-bold text-slate-900 dark:text-white mt-3">{stats.activeSubscriptions}</h3>
                <div className="flex items-center gap-1 mt-3">
                  <ArrowUpRight className="w-4 h-4 text-cyan-500" />
                  <span className="text-sm text-cyan-600 dark:text-cyan-400 font-medium">+8% growth</span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-cyan-100 to-cyan-50 dark:from-cyan-900/30 dark:to-cyan-800/20 rounded-xl">
                <Zap className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full"></div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="lg:col-span-1 group">
          <div className="h-full bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Monthly Revenue</p>
                <h3 className="text-4xl font-bold text-slate-900 dark:text-white mt-3">₹{(stats.monthlyRecurringRevenue / 100000).toFixed(1)}L</h3>
                <div className="flex items-center gap-1 mt-3">
                  <ArrowUpRight className="w-4 h-4 text-purple-500" />
                  <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">+22% MoM</span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl">
                <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"></div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="lg:col-span-1 group">
          <div className="h-full bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Total Revenue</p>
                <h3 className="text-4xl font-bold text-slate-900 dark:text-white mt-3">₹{(stats.totalRevenue / 1000000).toFixed(1)}M</h3>
                <div className="flex items-center gap-1 mt-3">
                  <ArrowUpRight className="w-4 h-4 text-cyan-500" />
                  <span className="text-sm text-cyan-600 dark:text-cyan-400 font-medium">All time</span>
                </div>
              </div>
              <div className="p-3 bg-gradient-to-br from-cyan-100 to-cyan-50 dark:from-cyan-900/30 dark:to-cyan-800/20 rounded-xl">
                <TrendingUp className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
              </div>
            </div>
            <div className="h-1 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Second Row - Analytics Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart - Large */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Revenue Trend</h3>
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          
          <div className="space-y-2 mb-6">
            <div className="text-3xl font-bold text-slate-900 dark:text-white">₹{(stats.totalRevenue / 1000000).toFixed(1)}M</div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1 bg-purple-50 dark:bg-purple-900/20 rounded-full">
                <ArrowUpRight className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">+18.5%</span>
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">vs last month</span>
            </div>
          </div>

          {/* Area Chart */}
          <svg className="w-full h-48" viewBox="0 0 400 150" preserveAspectRatio="none">
            {/* Gradient Definition */}
            <defs>
              <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="0" y1="30" x2="400" y2="30" stroke="#e2e8f0" strokeWidth="1" opacity="0.5" />
            <line x1="0" y1="60" x2="400" y2="60" stroke="#e2e8f0" strokeWidth="1" opacity="0.5" />
            <line x1="0" y1="90" x2="400" y2="90" stroke="#e2e8f0" strokeWidth="1" opacity="0.5" />
            <line x1="0" y1="120" x2="400" y2="120" stroke="#e2e8f0" strokeWidth="1" opacity="0.5" />

            {/* Area Path */}
            <path
              d="M 0 100 Q 30 70 60 75 T 120 50 T 180 60 T 240 35 T 300 45 T 360 25 T 400 30 L 400 150 L 0 150 Z"
              fill="url(#areaGradient)"
            />

            {/* Line Path */}
            <path
              d="M 0 100 Q 30 70 60 75 T 120 50 T 180 60 T 240 35 T 300 45 T 360 25 T 400 30"
              stroke="url(#lineGradient)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data Points */}
            <circle cx="0" cy="100" r="3" fill="#a855f7" />
            <circle cx="60" cy="75" r="3" fill="#a855f7" />
            <circle cx="120" cy="50" r="3" fill="#a855f7" />
            <circle cx="180" cy="60" r="3" fill="#a855f7" />
            <circle cx="240" cy="35" r="3" fill="#a855f7" />
            <circle cx="300" cy="45" r="3" fill="#06b6d4" />
            <circle cx="360" cy="25" r="3" fill="#06b6d4" />
            <circle cx="400" cy="30" r="3" fill="#06b6d4" />
          </svg>

          {/* X-axis labels */}
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-4">
            <span>Oct</span>
            <span>Nov</span>
            <span>Dec</span>
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
          </div>
        </div>

        {/* Subscription Health */}
        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Subscription Health</h3>
            <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Active Plans</span>
                <span className="text-xl font-bold text-purple-600 dark:text-purple-400">{stats.activeSubscriptions}</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full" style={{width: '78%'}}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Expired Plans</span>
                <span className="text-xl font-bold text-cyan-600 dark:text-cyan-400">{stats.expiredSubscriptions}</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full" style={{width: `${Math.min((stats.expiredSubscriptions / stats.activeSubscriptions * 100), 100)}%`}}></div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">Health Score: <span className="font-bold text-purple-600 dark:text-purple-400">95%</span></p>
          </div>
        </div>
      </div>

      {/* Third Row - Platform Stats */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-slate-200/50 dark:border-slate-700/50">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">System Status</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse"></div>
                <span className="font-medium text-slate-900 dark:text-white">Platform Status</span>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">Operational</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse"></div>
                <span className="font-medium text-slate-900 dark:text-white">API Health</span>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">Healthy</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse"></div>
                <span className="font-medium text-slate-900 dark:text-white">Database</span>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">Connected</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-slate-200/50 dark:border-slate-700/50">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Quick Actions</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <button className="p-4 bg-gradient-to-br from-purple-50 to-cyan-50 dark:from-purple-900/20 dark:to-cyan-900/20 rounded-xl hover:shadow-md transition-all duration-200 border border-purple-200 dark:border-purple-800/30">
              <p className="text-sm font-bold text-purple-700 dark:text-purple-300">Manage Tenants</p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">View & edit</p>
            </button>
            
            <button className="p-4 bg-gradient-to-br from-cyan-50 to-purple-50 dark:from-cyan-900/20 dark:to-purple-900/20 rounded-xl hover:shadow-md transition-all duration-200 border border-cyan-200 dark:border-cyan-800/30">
              <p className="text-sm font-bold text-cyan-700 dark:text-cyan-300">View Billing</p>
              <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">Financial data</p>
            </button>
            
            <button className="p-4 bg-gradient-to-br from-purple-50 to-cyan-50 dark:from-purple-900/20 dark:to-cyan-900/20 rounded-xl hover:shadow-md transition-all duration-200 border border-purple-200 dark:border-purple-800/30">
              <p className="text-sm font-bold text-purple-700 dark:text-purple-300">View Offers</p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Active campaigns</p>
            </button>
            
            <button className="p-4 bg-gradient-to-br from-cyan-50 to-purple-50 dark:from-cyan-900/20 dark:to-purple-900/20 rounded-xl hover:shadow-md transition-all duration-200 border border-cyan-200 dark:border-cyan-800/30">
              <p className="text-sm font-bold text-cyan-700 dark:text-cyan-300">View Reports</p>
              <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-1">Analytics & insights</p>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent Subscribed Clients */}
        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Subscriptions</h3>
            <span className="text-2xl">✨</span>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 bg-gradient-to-r from-purple-50 to-cyan-50 dark:from-purple-900/20 dark:to-cyan-900/20 rounded-lg border border-purple-200 dark:border-purple-800/30">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">ABC Coaching</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Premium Plan • 2 mins ago</p>
            </div>
            
            <div className="p-3 bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-cyan-900/20 dark:to-purple-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800/30">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Excel Institutes</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Pro Plan • 15 mins ago</p>
            </div>

            <div className="p-3 bg-gradient-to-r from-purple-50 to-cyan-50 dark:from-purple-900/20 dark:to-cyan-900/20 rounded-lg border border-purple-200 dark:border-purple-800/30">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">GK Tutorials</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Starter Plan • 1 hour ago</p>
            </div>
          </div>
        </div>

        {/* Demo Booked */}
        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Demo Booked</h3>
            <span className="text-2xl">📅</span>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 bg-gradient-to-r from-purple-50 to-cyan-50 dark:from-purple-900/20 dark:to-cyan-900/20 rounded-lg border border-purple-200 dark:border-purple-800/30">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Akash Academy</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Mar 20, 10:30 AM</p>
            </div>
            
            <div className="p-3 bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-cyan-900/20 dark:to-purple-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800/30">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Vidya Institute</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Mar 21, 2:00 PM</p>
            </div>

            <div className="p-3 bg-gradient-to-r from-purple-50 to-cyan-50 dark:from-purple-900/20 dark:to-cyan-900/20 rounded-lg border border-purple-200 dark:border-purple-800/30">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">NEET Prep Hub</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Mar 22, 3:15 PM</p>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
            <span className="text-2xl">⚡</span>
          </div>
          
          <div className="space-y-3">
            <div className="p-3 bg-gradient-to-r from-purple-50 to-cyan-50 dark:from-purple-900/20 dark:to-cyan-900/20 rounded-lg border border-purple-200 dark:border-purple-800/30">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Plan Upgraded</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">ABC → Premium • just now</p>
            </div>
            
            <div className="p-3 bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-cyan-900/20 dark:to-purple-900/20 rounded-lg border border-cyan-200 dark:border-cyan-800/30">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Invoice Generated</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">INV-2026-0342 • 5 mins ago</p>
            </div>

            <div className="p-3 bg-gradient-to-r from-purple-50 to-cyan-50 dark:from-purple-900/20 dark:to-cyan-900/20 rounded-lg border border-purple-200 dark:border-purple-800/30">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Payment Received</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">₹5,000 • 30 mins ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {statsLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
              <p className="text-slate-700 dark:text-slate-200 font-medium">Updating analytics...</p>
            </div>
          </div>
        </div>
      )}
      </>
      )}

      {/* AI Usage Analytics Tab */}
      {activeTab === 'ai-usage' && (
      <>
      {/* AI Usage Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* AI Requests */}
        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Total AI Requests</p>
              <h3 className="text-4xl font-bold text-slate-900 dark:text-white mt-3">{(stats.aiRequests / 1000).toFixed(1)}K</h3>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl">
              <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"></div>
        </div>

        {/* Tokens Used */}
        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Tokens Used</p>
              <h3 className="text-4xl font-bold text-slate-900 dark:text-white mt-3">{(stats.aiTokensUsed / 1000000).toFixed(1)}M</h3>
            </div>
            <div className="p-3 bg-gradient-to-br from-cyan-100 to-cyan-50 dark:from-cyan-900/30 dark:to-cyan-800/20 rounded-xl">
              <BarChart3 className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full"></div>
        </div>

        {/* AI Cost */}
        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">AI Cost</p>
              <h3 className="text-4xl font-bold text-slate-900 dark:text-white mt-3">₹{stats.aiCost.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl">
              <DollarSign className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"></div>
        </div>
      </div>

      {/* AI Usage Trends & Feature Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Usage Trend Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Usage Trend</h3>
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>

          {/* Area Chart */}
          <svg className="w-full h-48" viewBox="0 0 400 150" preserveAspectRatio="none">
            <defs>
              <linearGradient id="aiAreaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="aiLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <line x1="0" y1="30" x2="400" y2="30" stroke="#e2e8f0" strokeWidth="1" opacity="0.5" />
            <line x1="0" y1="60" x2="400" y2="60" stroke="#e2e8f0" strokeWidth="1" opacity="0.5" />
            <line x1="0" y1="90" x2="400" y2="90" stroke="#e2e8f0" strokeWidth="1" opacity="0.5" />
            <line x1="0" y1="120" x2="400" y2="120" stroke="#e2e8f0" strokeWidth="1" opacity="0.5" />
            <path
              d="M 0 110 Q 30 75 60 80 T 120 45 T 180 55 T 240 30 T 300 40 T 360 20 T 400 25 L 400 150 L 0 150 Z"
              fill="url(#aiAreaGradient)"
            />
            <path
              d="M 0 110 Q 30 75 60 80 T 120 45 T 180 55 T 240 30 T 300 40 T 360 20 T 400 25"
              stroke="url(#aiLineGradient)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="0" cy="110" r="3" fill="#a855f7" />
            <circle cx="60" cy="80" r="3" fill="#a855f7" />
            <circle cx="120" cy="45" r="3" fill="#a855f7" />
            <circle cx="180" cy="55" r="3" fill="#a855f7" />
            <circle cx="240" cy="30" r="3" fill="#a855f7" />
            <circle cx="300" cy="40" r="3" fill="#06b6d4" />
            <circle cx="360" cy="20" r="3" fill="#06b6d4" />
            <circle cx="400" cy="25" r="3" fill="#06b6d4" />
          </svg>
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-4">
            <span>Oct</span>
            <span>Nov</span>
            <span>Dec</span>
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
          </div>
        </div>

        {/* Feature Usage */}
        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-slate-200/50 dark:border-slate-700/50">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Feature Usage Breakdown</h3>
          
          <div className="space-y-4">
            {[
              { name: 'Chat Replies', percent: stats.aiFeatureUsage.chatReplies, color: 'from-purple-400 to-purple-600' },
              { name: 'Lead Scoring', percent: stats.aiFeatureUsage.leadScoring, color: 'from-cyan-400 to-cyan-600' },
              { name: 'Auto Summaries', percent: stats.aiFeatureUsage.autoSummaries, color: 'from-purple-300 to-purple-500' },
              { name: 'Other', percent: stats.aiFeatureUsage.other, color: 'from-slate-300 to-slate-500' },
            ].map((feature) => (
              <div key={feature.name}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{feature.name}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{feature.percent}%</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${feature.color} rounded-full`} style={{width: `${feature.percent}%`}}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tenant Usage Breakdown */}
      <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-slate-200/50 dark:border-slate-700/50 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top Tenants - AI Usage</h3>
          <button className="text-sm text-purple-600 dark:text-purple-400 font-medium hover:text-purple-700">More →</button>
        </div>

        <div className="space-y-4">
          {stats.aiTenantUsage.map((tenant: any, idx: number) => (
            <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-200 to-cyan-200 dark:from-purple-900/30 dark:to-cyan-900/30 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-purple-700 dark:text-purple-300">{tenant.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{tenant.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{tenant.requests.toLocaleString()} requests</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900 dark:text-white">{tenant.usage}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">tokens</p>
                </div>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full" style={{width: `${tenant.percent}%`}}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Alerts & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Alerts */}
        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-slate-200/50 dark:border-slate-700/50">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Usage Insights</h3>
          
          <div className="space-y-3">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800/30">
              <p className="text-sm text-purple-700 dark:text-purple-300"><span className="font-bold">↑ 35%</span> increase in AI usage vs last month</p>
            </div>
            <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl border border-cyan-200 dark:border-cyan-800/30">
              <p className="text-sm text-cyan-700 dark:text-cyan-300"><span className="font-bold">Top Feature:</span> Chat Replies leading at 34% of usage</p>
            </div>
            <div className="p-4 bg-slate-100 dark:bg-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-600">
              <p className="text-sm text-slate-700 dark:text-slate-300"><span className="font-bold">ABC Coaching</span> is top consumer with 4.8L tokens</p>
            </div>
          </div>
        </div>

        {/* Cost Summary */}
        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-slate-200/50 dark:border-slate-700/50">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Cost Breakdown</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
              <span className="font-medium text-slate-700 dark:text-slate-300">Current Month Cost</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white">₹{stats.aiCost.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
              <span className="font-medium text-slate-700 dark:text-slate-300">Cost per Request</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white">₹{(stats.aiCost / stats.aiRequests).toFixed(3)}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
              <span className="font-medium text-slate-700 dark:text-slate-300">Monthly Projection</span>
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400">₹{(stats.aiCost * 1.15).toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>
      </>
      )}

      {/* Daily Tasks Tab */}
      {activeTab === 'daily-tasks' && (
      <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1 bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-5 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Professional Calendar
            </h3>
          </div>
          <Calendar
            selected={selectedTaskDate}
            onSelect={(date) => setSelectedTaskDate(date)}
            className="!shadow-none !border-0 !bg-transparent p-0"
          />
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Task Management</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Tasks created here automatically sync to SuperCRM Today's Tasks.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold">
                Today: {todayTasks.filter((task) => task.status !== 'completed').length} pending
              </span>
              <span className="px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 font-semibold">
                Total: {todayTasks.length}
              </span>
            </div>
          </div>

          <form
            onSubmit={async (event) => {
              event.preventDefault();
              if (!taskTitle.trim()) return;

              try {
                const result = await addDailyTask({
                  title: taskTitle,
                  date: selectedDateKey,
                  time: taskTime || undefined,
                  priority: taskPriority,
                  description: taskDescription || undefined,
                });

                if (result) {
                  setTaskTitle('');
                  setTaskTime('');
                  setTaskPriority('medium');
                  setTaskDescription('');
                } else {
                  console.error('Failed to add task');
                }
              } catch (err) {
                console.error('Error adding task:', err);
              }
            }}
            className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-6"
          >
            <input
              value={taskTitle}
              onChange={(event) => setTaskTitle(event.target.value)}
              placeholder="Task title"
              className="md:col-span-2 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <input
              type="time"
              value={taskTime}
              onChange={(event) => setTaskTime(event.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <select
              value={taskPriority}
              onChange={(event) => setTaskPriority(event.target.value as 'low' | 'medium' | 'high')}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input
              value={taskDescription}
              onChange={(event) => setTaskDescription(event.target.value)}
              placeholder="Description (optional)"
              className="md:col-span-2 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="md:col-span-6 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </form>

          <div className="space-y-3">
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              Tasks for {selectedTaskDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>

            {tasksForSelectedDate.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-700/30 text-center text-slate-500 dark:text-slate-400">
                No tasks for this date.
              </div>
            ) : (
              tasksForSelectedDate.map((task) => (
                <div key={task._id || task.id} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-200/50 dark:border-slate-600/40">
                  <input
                    type="checkbox"
                    checked={task.status === 'completed'}
                    onChange={async (event) => {
                      try {
                        const newStatus: 'pending' | 'completed' = event.target.checked ? 'completed' : 'pending';
                        await updateTaskCompletion(task._id || task.id || '', newStatus);
                      } catch (err) {
                        console.error('Error updating task:', err);
                      }
                    }}
                    className="mt-1 w-4 h-4 text-purple-600 rounded"
                  />
                  <div className="flex-1">
                    <p className={`font-medium ${task.status === 'completed' ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                      {task.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                      {task.time && <span className="px-2 py-1 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300">{task.time}</span>}
                      <span className={`px-2 py-1 rounded-full ${
                        task.priority === 'high'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          : task.priority === 'medium'
                          ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      }`}>
                        {task.priority}
                      </span>
                      {task.description && (
                        <span className="text-slate-500 dark:text-slate-400">{task.description}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        await deleteTask(task._id || task.id || '');
                      } catch (err) {
                        console.error('Error deleting task:', err);
                      }
                    }}
                    className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    aria-label="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
}
