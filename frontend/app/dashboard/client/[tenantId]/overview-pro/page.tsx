"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { api, safeApiCall } from "@/lib/apiClient";
import { TrialBadge } from "@/components/PlanGating";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

interface DashboardStats {
  totalStudents: number;
  totalRevenue: number;
  totalTests: number;
  todayAttendance: number;
  pendingFees: number;
  activeBatches: number;
}

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  status: 'pending' | 'contacted' | 'interested' | 'enrolled' | 'new' | 'follow-up' | 'negotiation' | 'converted' | 'lost';
  date: string;
  amount: number;
  score?: number;
  scoreTier?: 'cold' | 'warm' | 'hot';
}

interface TrendData {
  month: string;
  revenue: number;
  students: number;
  fees: number;
  pending: number;
}

export default function OverviewProPage() {
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

  const [leads, setLeads] = useState<Lead[]>([]);

  const [monthlyFeesData, setMonthlyFeesData] = useState<TrendData[]>([]);

  const [trendData, setTrendData] = useState<TrendData[]>([
    { month: 'Jul', revenue: 45000, students: 120, fees: 38000, pending: 7000 },
    { month: 'Aug', revenue: 52000, students: 135, fees: 42000, pending: 10000 },
    { month: 'Sep', revenue: 48000, students: 128, fees: 40000, pending: 8000 },
    { month: 'Oct', revenue: 61000, students: 155, fees: 48000, pending: 13000 },
    { month: 'Nov', revenue: 55000, students: 142, fees: 45000, pending: 10000 },
    { month: 'Dec', revenue: 72000, students: 178, fees: 58000, pending: 14000 },
  ]);

  const [deviceData] = useState([
    { name: 'JEE Mains', value: 45, color: '#3b82f6' },
    { name: 'NEET', value: 30, color: '#10b981' },
    { name: 'CBSE Class 12', value: 15, color: '#f59e0b' },
    { name: 'GATE Prep', value: 10, color: '#8b5cf6' },
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      fetchLeadsData();
      fetchMonthlyFeesData();
    }
  }, [user, tenantId]);

  const fetchMonthlyFeesData = async () => {
    try {
      const [data, err] = await safeApiCall(() =>
        api.get<any>('/api/dashboard/monthly-fees?months=6')
      );

      if (!err && data?.success && data?.data) {
        // Transform backend data to chart format
        const chartData = data.data.map((item: any) => ({
          month: item.month,
          revenue: 0, // Not needed for fees graph
          students: 0, // Not needed for fees graph
          fees: item.fees || 0,
          pending: item.pending || 0,
        }));
        setMonthlyFeesData(chartData);
      } else {
        console.log("No monthly fees data available");
      }
    } catch (error: any) {
      console.error("Error fetching monthly fees data:", error);
    }
  };

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
          totalRevenue: data.stats.totalRevenue || 0,
          totalTests: data.stats.totalTests || 0,
          todayAttendance: data.stats.todayAttendance || 0,
          pendingFees: data.stats.pendingFees || 0,
          activeBatches: data.stats.activeBatches || 0,
        });
      }

      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      setLoading(false);
    }
  };

  const fetchLeadsData = async () => {
    try {
      // Fetch HIGH-POTENTIAL leads only - score > 75 (hot/warm leads ready to convert)
      const [data, err] = await safeApiCall(() =>
        api.get<any>('/api/leads?status=interested,follow-up,negotiation&sort=-score&limit=50')
      );

      if (!err && data?.leads) {
        // Filter for score > 75 and take top 5
        const transformedLeads = data.leads
          .filter((lead: any) => 
            lead.status !== 'converted' && 
            lead.status !== 'lost' && 
            (lead.score || 0) > 75 // Only show leads with score > 75%
          )
          .slice(0, 5) // Top 5
          .map((lead: any) => ({
            id: lead._id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone || 'N/A',
            course: lead.interestedCourse || 'Not specified',
            status: lead.status || 'new',
            date: lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A',
            amount: 0,
            score: lead.score || 0,
            scoreTier: lead.scoreTier || 'cold',
          }));
        setLeads(transformedLeads);
      } else {
        console.log("No high-potential leads (score > 75%) available");
      }
    } catch (error: any) {
      console.error("Error fetching leads data:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
      contacted: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
      interested: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
      enrolled: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
    };
    return statusStyles[status as keyof typeof statusStyles] || statusStyles.pending;
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return '📈';
    if (current < previous) return '📉';
    return '➡️';
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
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* TRIAL BADGE */}
      {user?.subscription?.trialStartedAt && (
        <div className="sticky top-0 z-30 backdrop-blur-md bg-stone-50/80 dark:bg-gray-900/80 border-b border-stone-200/50 dark:border-gray-800/50">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <TrialBadge trialStartISO={user.subscription.trialStartedAt} />
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-8">
        {/* PREMIUM HEADER */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200/50 dark:border-blue-500/20">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">INSTITUTE DASHBOARD</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-gray-200 bg-clip-text text-transparent">
            Overview
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium max-w-2xl">
            Comprehensive analytics and enrollment insights
          </p>
        </div>

        {/* KPI CARDS - PREMIUM GLASS MORPHISM */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Students */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 opacity-0 group-hover:opacity-10 rounded-2xl blur-lg transition-opacity duration-300"></div>
            <div className="relative bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-2xl border border-stone-200/50 dark:border-gray-700/50 p-5 hover:border-stone-300 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs uppercase tracking-widest font-bold text-stone-500 dark:text-gray-400">Total Students</p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white mt-2">{stats.totalStudents}</p>
                </div>
                <div className="text-3xl">👥</div>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-stone-100/50 dark:border-gray-700/30">
                <span className="text-xs font-bold text-green-600 dark:text-green-400">+12% ↑</span>
                <p className="text-xs text-gray-600 dark:text-gray-400">from last month</p>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-10 rounded-2xl blur-lg transition-opacity duration-300"></div>
            <div className="relative bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-2xl border border-stone-200/50 dark:border-gray-700/50 p-5 hover:border-stone-300 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs uppercase tracking-widest font-bold text-stone-500 dark:text-gray-400">Total Revenue</p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white mt-2">₹{(stats.totalRevenue / 1000).toFixed(0)}k</p>
                </div>
                <div className="text-3xl">💵</div>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-stone-100/50 dark:border-gray-700/30">
                <span className="text-xs font-bold text-green-600 dark:text-green-400">+8.5% ↑</span>
                <p className="text-xs text-gray-600 dark:text-gray-400">from last month</p>
              </div>
            </div>
          </div>

          {/* Active Batches */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-400 opacity-0 group-hover:opacity-10 rounded-2xl blur-lg transition-opacity duration-300"></div>
            <div className="relative bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-2xl border border-stone-200/50 dark:border-gray-700/50 p-5 hover:border-stone-300 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs uppercase tracking-widest font-bold text-stone-500 dark:text-gray-400">Active Batches</p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white mt-2">{stats.activeBatches}</p>
                </div>
                <div className="text-3xl">📚</div>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-stone-100/50 dark:border-gray-700/30">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">→</span>
                <p className="text-xs text-gray-600 dark:text-gray-400">No change</p>
              </div>
            </div>
          </div>

          {/* Pending Fees */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-rose-400 opacity-0 group-hover:opacity-10 rounded-2xl blur-lg transition-opacity duration-300"></div>
            <div className="relative bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-2xl border border-stone-200/50 dark:border-gray-700/50 p-5 hover:border-stone-300 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-xl hover:shadow-red-500/10">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs uppercase tracking-widest font-bold text-stone-500 dark:text-gray-400">Pending Fees</p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white mt-2">₹{(stats.pendingFees / 1000).toFixed(0)}k</p>
                </div>
                <div className="text-3xl">⚠️</div>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-stone-100/50 dark:border-gray-700/30">
                <span className="text-xs font-bold text-red-600 dark:text-red-400">-5% ↓</span>
                <p className="text-xs text-gray-600 dark:text-gray-400">from last month</p>
              </div>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS - PREMIUM BUTTONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: '👥', title: 'Manage Students', desc: 'View & edit records', path: `/dashboard/client/${tenantId}/students` },
            { icon: '💰', title: 'Collect Fees', desc: 'Process payments', path: `/dashboard/client/${tenantId}/accounts/transactions` },
            { icon: '🎓', title: 'Enroll Student', desc: 'Add new students', path: `/dashboard/client/${tenantId}/students/add` },
            { icon: '💬', title: 'WhatsApp', desc: 'Configure messaging', path: `/dashboard/client/${tenantId}/whatsapp/settings` },
          ].map((action, i) => (
            <button
              key={i}
              onClick={() => router.push(action.path)}
              className="group relative overflow-hidden rounded-xl bg-white/50 dark:bg-gray-800/30 backdrop-blur-md border border-stone-200/50 dark:border-gray-700/50 p-5 hover:border-stone-300 dark:hover:border-gray-600 transition-all duration-300 hover:shadow-lg text-left active:scale-95"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent dark:from-blue-500/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="text-2xl mb-2">{action.icon}</div>
                <p className="font-bold text-gray-900 dark:text-white text-xs">{action.title}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{action.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* CHARTS SECTION - PREMIUM GLASS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Monthly Fees Chart */}
          <div className="lg:col-span-2 bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-2xl border border-stone-200/50 dark:border-gray-700/50 p-6 hover:border-stone-300 dark:hover:border-gray-600 transition-all duration-300">
            <div className="mb-6">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Monthly Fees Collection</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">6-month trend analysis</p>
            </div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={monthlyFeesData.length > 0 ? monthlyFeesData : trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" dark-stroke="#2d2d2d" />
                <XAxis dataKey="month" stroke="#78716c" />
                <YAxis stroke="#78716c" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                  formatter={(value: any) => `₹${(value as number).toLocaleString()}`}
                />
                <Legend />
                <Line type="monotone" dataKey="fees" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} name="Fees Collected" />
                <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 5 }} name="Pending Fees" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Course Distribution */}
          <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-2xl border border-stone-200/50 dark:border-gray-700/50 p-6 hover:border-stone-300 dark:hover:border-gray-600 transition-all duration-300">
            <div className="mb-6">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Students by Course</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Enrollment breakdown</p>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '12px',
                    color: '#fff',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 mt-6">
              {deviceData.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-stone-100/50 dark:hover:bg-gray-700/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{item.name}</p>
                  </div>
                  <p className="text-sm font-black text-gray-900 dark:text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ENROLLMENT PIPELINE - PREMIUM */}
        <div className="bg-white/60 dark:bg-gray-800/40 backdrop-blur-xl rounded-2xl border border-stone-200/50 dark:border-gray-700/50 p-6 hover:border-stone-300 dark:hover:border-gray-600 transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Enrollment Pipeline</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">High-potential leads (Score &gt; 75%)</p>
            </div>
            <button
              onClick={() => router.push(`/dashboard/client/${tenantId}/enquiry-dashboard`)}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/50 transition-all active:scale-95"
            >
              + New Lead
            </button>
          </div>

          {/* Leads Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-200/50 dark:border-gray-700/50">
                  <th className="text-left py-3 px-4 text-xs font-bold text-stone-600 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-stone-600 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-stone-600 dark:text-gray-400 uppercase tracking-wider">Course</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-stone-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-stone-600 dark:text-gray-400 uppercase tracking-wider">Score</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-stone-600 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-stone-600 dark:text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100/50 dark:divide-gray-700/30">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-stone-50/50 dark:hover:bg-gray-700/20 transition-colors">
                    <td className="py-4 px-4">
                      <p className="font-bold text-gray-900 dark:text-white">{lead.name}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <p className="text-gray-900 dark:text-white font-medium">{lead.email}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-xs">{lead.phone}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-900 dark:text-white font-medium">{lead.course}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getStatusBadge(lead.status)}`}>
                        {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      {lead.score !== undefined ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-gray-900 dark:text-white">{lead.score}/100</span>
                          <span className="text-base">
                            {lead.scoreTier === 'hot' && '🔥🔥'}
                            {lead.scoreTier === 'warm' && '🔥'}
                            {lead.scoreTier === 'cold' && '❄️'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">{lead.date}</p>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => router.push(`/dashboard/client/${tenantId}/enquiry-dashboard`)}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-bold hover:underline transition-colors"
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-stone-200/50 dark:border-gray-700/50">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              ✨ Top {leads.length} leads (Score &gt; 75%)
            </p>
            <button 
              onClick={() => router.push(`/dashboard/client/${tenantId}/enquiry-dashboard`)}
              className="px-5 py-2.5 bg-stone-100 dark:bg-gray-700/50 hover:bg-stone-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-bold text-sm transition-all active:scale-95"
            >
              View All Leads →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
