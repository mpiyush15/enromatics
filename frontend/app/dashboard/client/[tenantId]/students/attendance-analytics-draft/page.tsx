"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

interface AttendanceStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  attendancePercentage: number;
  avgAttendance: number;
}

interface AttendanceTrend {
  date: string;
  present: number;
  absent: number;
  percentage: number;
}

interface StudentAttendance {
  studentId: string;
  name: string;
  rollNumber: string;
  totalClasses: number;
  classesAttended: number;
  attendancePercentage: number;
  status: "excellent" | "good" | "average" | "poor";
}

export default function AttendanceAnalyticsDraftPage() {
  const params = useParams();
  const tenantId = params?.tenantId as string;
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [trends, setTrends] = useState<AttendanceTrend[]>([]);
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedBatch, setSelectedBatch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "excellent" | "good" | "average" | "poor">("all");

  // Mock data for now - will be replaced with API calls
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setStats({
        totalStudents: 145,
        presentToday: 128,
        absentToday: 17,
        attendancePercentage: 88.3,
        avgAttendance: 85.2,
      });

      setTrends([
        { date: "2024-03-11", present: 130, absent: 15, percentage: 89.7 },
        { date: "2024-03-12", present: 125, absent: 20, percentage: 86.2 },
        { date: "2024-03-13", present: 132, absent: 13, percentage: 91.0 },
        { date: "2024-03-14", present: 128, absent: 17, percentage: 88.3 },
      ]);

      setStudents([
        {
          studentId: "S001",
          name: "Rajesh Kumar",
          rollNumber: "A001",
          totalClasses: 60,
          classesAttended: 58,
          attendancePercentage: 96.7,
          status: "excellent",
        },
        {
          studentId: "S002",
          name: "Priya Singh",
          rollNumber: "A002",
          totalClasses: 60,
          classesAttended: 54,
          attendancePercentage: 90.0,
          status: "good",
        },
        {
          studentId: "S003",
          name: "Amit Patel",
          rollNumber: "A003",
          totalClasses: 60,
          classesAttended: 48,
          attendancePercentage: 80.0,
          status: "average",
        },
        {
          studentId: "S004",
          name: "Neha Sharma",
          rollNumber: "A004",
          totalClasses: 60,
          classesAttended: 42,
          attendancePercentage: 70.0,
          status: "poor",
        },
      ]);

      setLoading(false);
    }, 500);
  }, []);

  const filteredStudents = students.filter(
    (s) => filterStatus === "all" || s.status === filterStatus
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-green-100 text-green-800";
      case "good":
        return "bg-blue-100 text-blue-800";
      case "average":
        return "bg-yellow-100 text-yellow-800";
      case "poor":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Attendance Analytics</h1>
              <p className="text-gray-600 mt-2">📊 Comprehensive attendance insights and trends</p>
            </div>
            <Link href={`/dashboard/client/${tenantId}/students/attendance`}>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                ← Back to Attendance
              </button>
            </Link>
          </div>
        </div>

        {/* === SECTION 1: FILTERS === */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Batch</label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">All Batches</option>
                <option value="batch-a">Batch A</option>
                <option value="batch-b">Batch B</option>
              </select>
            </div>
            <div className="flex items-end">
              <button className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                Apply Filters
              </button>
            </div>
          </div>
        </div>

        {/* === SECTION 2: QUICK STATS === */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-gray-600 text-sm mb-2">Total Students</div>
            <div className="text-3xl font-bold text-gray-900">{stats?.totalStudents || 0}</div>
          </div>

          <div className="bg-green-50 rounded-lg shadow p-6">
            <div className="text-green-600 text-sm mb-2">Present Today</div>
            <div className="text-3xl font-bold text-green-700">{stats?.presentToday || 0}</div>
          </div>

          <div className="bg-red-50 rounded-lg shadow p-6">
            <div className="text-red-600 text-sm mb-2">Absent Today</div>
            <div className="text-3xl font-bold text-red-700">{stats?.absentToday || 0}</div>
          </div>

          <div className="bg-blue-50 rounded-lg shadow p-6">
            <div className="text-blue-600 text-sm mb-2">Today's %</div>
            <div className="text-3xl font-bold text-blue-700">{stats?.attendancePercentage.toFixed(1) || 0}%</div>
          </div>

          <div className="bg-purple-50 rounded-lg shadow p-6">
            <div className="text-purple-600 text-sm mb-2">Avg Attendance</div>
            <div className="text-3xl font-bold text-purple-700">{stats?.avgAttendance.toFixed(1) || 0}%</div>
          </div>
        </div>

        {/* === SECTION 3: ATTENDANCE TRENDS CHART === */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">📈 Attendance Trends (Last 7 Days)</h2>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">
              [Chart component to be integrated - Line chart showing attendance % over time]
            </p>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-2">
            {trends.map((trend, idx) => (
              <div key={idx} className="bg-gray-50 p-3 rounded">
                <div className="text-xs text-gray-600">{trend.date}</div>
                <div className="font-semibold">{trend.percentage}%</div>
                <div className="text-xs text-gray-500">
                  {trend.present} present, {trend.absent} absent
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* === SECTION 4: ATTENDANCE BY BATCH === */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">📚 Attendance by Batch</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Batch Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Total Students</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Attendance %</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3">Batch A (JEE)</td>
                  <td className="px-4 py-3">45</td>
                  <td className="px-4 py-3">87.5%</td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Good</span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3">Batch B (NEET)</td>
                  <td className="px-4 py-3">50</td>
                  <td className="px-4 py-3">84.2%</td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Average</span>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-3">Batch C (FOUNDATION)</td>
                  <td className="px-4 py-3">50</td>
                  <td className="px-4 py-3">88.0%</td>
                  <td className="px-4 py-3">
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Good</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* === SECTION 5: STUDENT ATTENDANCE DETAILS === */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">👥 Student Attendance Details</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus("all")}
                className={`px-3 py-1 rounded text-sm ${
                  filterStatus === "all"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus("excellent")}
                className={`px-3 py-1 rounded text-sm ${
                  filterStatus === "excellent"
                    ? "bg-green-600 text-white"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                Excellent (95%+)
              </button>
              <button
                onClick={() => setFilterStatus("good")}
                className={`px-3 py-1 rounded text-sm ${
                  filterStatus === "good"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                Good (80-95%)
              </button>
              <button
                onClick={() => setFilterStatus("average")}
                className={`px-3 py-1 rounded text-sm ${
                  filterStatus === "average"
                    ? "bg-yellow-600 text-white"
                    : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                }`}
              >
                Average (70-80%)
              </button>
              <button
                onClick={() => setFilterStatus("poor")}
                className={`px-3 py-1 rounded text-sm ${
                  filterStatus === "poor"
                    ? "bg-red-600 text-white"
                    : "bg-red-100 text-red-700 hover:bg-red-200"
                }`}
              >
                Poor (&lt;70%)
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Roll No.</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Total Classes</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Classes Attended</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Attendance %</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredStudents.map((student) => (
                  <tr key={student.studentId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{student.name}</td>
                    <td className="px-4 py-3 text-gray-600">{student.rollNumber}</td>
                    <td className="px-4 py-3 text-center">{student.totalClasses}</td>
                    <td className="px-4 py-3 text-center font-medium">{student.classesAttended}</td>
                    <td className="px-4 py-3 text-center font-semibold">{student.attendancePercentage.toFixed(1)}%</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(student.status)}`}>
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* === SECTION 6: INSIGHTS & ALERTS === */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">⚠️ Insights & Alerts</h2>
          <div className="space-y-3">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="font-semibold text-red-900">🚨 Critical Alert</div>
              <p className="text-red-800">4 students have attendance below 70%. Recommend immediate follow-up.</p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <div className="font-semibold text-yellow-900">⚠️ Warning</div>
              <p className="text-yellow-800">12 students have attendance between 70-80%. Monitor closely.</p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <div className="font-semibold text-blue-900">ℹ️ Information</div>
              <p className="text-blue-800">Overall institute attendance improved by 2.3% this week.</p>
            </div>
          </div>
        </div>

        {/* === SECTION 7: EXPORT & ACTIONS === */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">📥 Actions</h2>
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              📊 Export as PDF
            </button>
            <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
              📈 Export as Excel
            </button>
            <button className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600">
              📧 Send Report via Email
            </button>
            <button className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
              🔄 Refresh Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
