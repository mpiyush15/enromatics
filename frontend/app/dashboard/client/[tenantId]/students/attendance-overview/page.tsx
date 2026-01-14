"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface AttendanceStats {
  totalDays: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
}

interface StudentAttendance {
  _id: string;
  name: string;
  rollNumber: string;
  batch: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  excusedDays: number;
  percentage: number;
}

export default function AttendanceOverviewPage() {
  const params = useParams();
  const tenantId = params?.tenantId as string;

  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1);
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [batch, setBatch] = useState("");
  const [batches, setBatches] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [studentStats, setStudentStats] = useState<StudentAttendance[]>([]);
  const [dailyTrend, setDailyTrend] = useState<any[]>([]);

  // Fetch batches on mount
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await fetch(`/api/batches?tenantId=${tenantId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success && data.batches) {
          const batchNames = data.batches.map((b: any) => b.name || b.batchName).filter(Boolean);
          setBatches(batchNames);
        }
      } catch (err) {
        console.error("Failed to fetch batches:", err);
      }
    };
    fetchBatches();
  }, [tenantId]);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
      });
      if (batch) params.append("batch", batch);

      console.log("📊 Fetching analytics with params:", { startDate, endDate, batch });

      const res = await fetch(`/api/attendance/analytics?${params.toString()}`, {
        credentials: "include",
      });
      const data = await res.json();

      console.log("✅ Analytics response:", data);

      if (data.success) {
        console.log("📈 Stats structure:", {
          total: data.stats?.total,
          present: data.stats?.present,
          absent: data.stats?.absent,
          late: data.stats?.late,
          excused: data.stats?.excused,
        });
        console.log("👥 Student count:", data.studentStats?.length || 0);
        console.log("📅 Trend days:", data.dailyTrend?.length || 0);
        
        setStats(data.stats);
        setStudentStats(data.studentStats || []);
        setDailyTrend(data.dailyTrend || []);
      } else {
        console.error("❌ API error:", data.message);
      }
    } catch (err) {
      console.error("❌ Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) {
      fetchAnalytics();
    }
  }, [tenantId, startDate, endDate, batch]);

  const chartColors = {
    present: "#10b981",
    absent: "#ef4444",
    late: "#f59e0b",
    excused: "#8b5cf6",
  };

  // Status distribution data
  const statusData = stats ? [
    { name: "Present", value: stats.present, fill: chartColors.present },
    { name: "Absent", value: stats.absent, fill: chartColors.absent },
    { name: "Late", value: stats.late, fill: chartColors.late },
    { name: "Excused", value: stats.excused, fill: chartColors.excused },
  ] : [];

  // Most absent students
  const mostAbsent = [...studentStats]
    .sort((a, b) => b.absentDays - a.absentDays)
    .slice(0, 10);

  // Lowest attendance students
  const lowestAttendance = [...studentStats]
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 10);

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
            📊 Attendance Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive attendance insights and student performance metrics
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Batch
              </label>
              <select
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Batches</option>
                {batches.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchAnalytics}
                disabled={loading}
                className="w-full px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-medium transition-all"
              >
                {loading ? "Loading..." : "Refresh"}
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Days</p>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-300 mt-1">{stats.totalDays}</p>
                </div>
                <span className="text-4xl">📅</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-6 border border-green-200 dark:border-green-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Present</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-300 mt-1">{stats.present}</p>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                    {Math.round((stats.present / stats.totalDays) * 100)}%
                  </p>
                </div>
                <span className="text-4xl">✓</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-xl p-6 border border-red-200 dark:border-red-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">Absent</p>
                  <p className="text-3xl font-bold text-red-900 dark:text-red-300 mt-1">{stats.absent}</p>
                  <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                    {Math.round((stats.absent / stats.totalDays) * 100)}%
                  </p>
                </div>
                <span className="text-4xl">✗</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-xl p-6 border border-yellow-200 dark:border-yellow-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Late</p>
                  <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-300 mt-1">{stats.late}</p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                    {Math.round((stats.late / stats.totalDays) * 100)}%
                  </p>
                </div>
                <span className="text-4xl">⏰</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Excused</p>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-300 mt-1">{stats.excused}</p>
                  <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">
                    {Math.round((stats.excused / stats.totalDays) * 100)}%
                  </p>
                </div>
                <span className="text-4xl">📝</span>
              </div>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution Pie Chart */}
          {statusData.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                📈 Attendance Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Daily Trend */}
          {dailyTrend.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                📊 Daily Attendance Trend
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151" }} />
                  <Legend />
                  <Line type="monotone" dataKey="present" stroke={chartColors.present} strokeWidth={2} name="Present" />
                  <Line type="monotone" dataKey="absent" stroke={chartColors.absent} strokeWidth={2} name="Absent" />
                  <Line type="monotone" dataKey="late" stroke={chartColors.late} strokeWidth={2} name="Late" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Most Absent Students */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            ⚠️ Most Absent Students
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Roll No</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Batch</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-900 dark:text-white">Total Days</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-900 dark:text-white">Absent</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-900 dark:text-white">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {mostAbsent.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{student.rollNumber}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{student.name}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{student.batch}</td>
                    <td className="px-4 py-3 text-center text-gray-900 dark:text-white">{student.totalDays}</td>
                    <td className="px-4 py-3 text-center text-red-600 dark:text-red-400 font-medium">{student.absentDays}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        student.percentage >= 75 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : student.percentage >= 50
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}>
                        {student.percentage.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lowest Attendance Students */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            🎯 Students with Lowest Attendance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Roll No</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-white">Batch</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-900 dark:text-white">Present</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-900 dark:text-white">Absent</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-900 dark:text-white">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {lowestAttendance.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{student.rollNumber}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{student.name}</td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{student.batch}</td>
                    <td className="px-4 py-3 text-center text-green-600 dark:text-green-400 font-medium">{student.presentDays}</td>
                    <td className="px-4 py-3 text-center text-red-600 dark:text-red-400 font-medium">{student.absentDays}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        student.percentage >= 75 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : student.percentage >= 50
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}>
                        {student.percentage.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
