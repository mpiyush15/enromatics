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
  status: 'pending' | 'contacted' | 'interested' | 'enrolled';
  date: string;
  amount: number;
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
    }
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
      // Fetch leads from students API endpoint
      const [data, err] = await safeApiCall(() =>
        api.get<any>('/api/students?limit=5&status=prospective')
      );

      if (!err && data?.students) {
        // Transform student data to leads format
        const transformedLeads = data.students.map((student: any) => ({
          id: student._id,
          name: student.name,
          email: student.email,
          phone: student.phone || 'N/A',
          course: student.course || 'Not specified',
          status: student.enrollmentStatus || 'pending',
          date: student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A',
          amount: student.feeAmount || 0,
        }));
        setLeads(transformedLeads);
      } else {
        console.log("No leads data available yet");
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
    <div className="px-8 py-4 space-y-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* TRIAL BADGE */}
      {user?.subscription?.trialStartedAt && (
        <div>
          <TrialBadge trialStartISO={user.subscription.trialStartedAt} />
        </div>
      )}

      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Professional dashboard with analytics and leads management
        </p>
      </div>

      {/* KPI CARDS WITH TRENDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold">Total Students</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalStudents}</p>
            </div>
            <span className="text-2xl">👥</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📈</span>
            <p className="text-sm text-green-600 dark:text-green-400 font-semibold">+12% from last month</p>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">₹{(stats.totalRevenue / 1000).toFixed(0)}k</p>
            </div>
            <span className="text-2xl">💵</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📈</span>
            <p className="text-sm text-green-600 dark:text-green-400 font-semibold">+8.5% from last month</p>
          </div>
        </div>

        {/* Active Batches */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold">Active Batches</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.activeBatches}</p>
            </div>
            <span className="text-2xl">📚</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">➡️</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">No change</p>
          </div>
        </div>

        {/* Pending Fees */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold">Pending Fees</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">₹{(stats.pendingFees / 1000).toFixed(0)}k</p>
            </div>
            <span className="text-2xl">⚠️</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg">📉</span>
            <p className="text-sm text-red-600 dark:text-red-400 font-semibold">-5% from last month</p>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button onClick={() => router.push(`/dashboard/client/${tenantId}/students`)} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all text-left cursor-pointer">
          <div className="text-2xl mb-2">👥</div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">Manage Students</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">View & edit student records</p>
        </button>
        <button onClick={() => router.push(`/dashboard/client/${tenantId}/accounts/transactions`)} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all text-left cursor-pointer">
          <div className="text-2xl mb-2">💰</div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">Collect Fees</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Process payments & receipts</p>
        </button>
        <button onClick={() => router.push(`/dashboard/client/${tenantId}/students/add`)} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all text-left cursor-pointer">
          <div className="text-2xl mb-2">🎓</div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">Enroll Student</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Add new student to institute</p>
        </button>
        <button onClick={() => router.push(`/dashboard/client/${tenantId}/whatsapp/settings`)} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all text-left cursor-pointer">
          <div className="text-2xl mb-2">💬</div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">WhatsApp</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Configure messaging & automation</p>
        </button>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Fees Collection Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Monthly Fees Collection</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Last 6 months collection summary</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="fees" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} name="Fees Collected" />
              <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} name="Pending Fees" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Course Distribution */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Students by Course</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Enrollment distribution</p>
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
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {deviceData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.name}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.value} students</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ENROLLMENT LEADS SECTION */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              📋 Enrollment Pipeline
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Prospective students and their enrollment status</p>
          </div>
          <button
            onClick={() => router.push(`/dashboard/client/${tenantId}/students/add`)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm"
          >
            + New Lead
          </button>
        </div>

        {/* Leads Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-900 dark:text-white">Name</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-900 dark:text-white">Contact</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-900 dark:text-white">Course</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-900 dark:text-white">Fee</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-900 dark:text-white">Date</th>
                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-900 dark:text-white">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="py-4 px-4">
                    <p className="font-semibold text-gray-900 dark:text-white">{lead.name}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm">
                      <p className="text-gray-900 dark:text-white">{lead.email}</p>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">{lead.phone}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-gray-900 dark:text-white">{lead.course}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(lead.status)}`}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">₹{lead.amount.toLocaleString()}</p>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{lead.date}</p>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-semibold"
                    >
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">Showing {leads.length} of {leads.length} leads</p>
          <div className="flex gap-2">
            <button className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              ← Previous
            </button>
            <button className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
