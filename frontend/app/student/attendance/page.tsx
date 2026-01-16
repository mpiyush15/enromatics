"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClientDashboard from "@/components/dashboard/ClientDashboard";
import AttendanceCalendar from "@/components/attendance/AttendanceCalendar";
import { API_BASE_URL } from "@/lib/apiConfig";

// Prevent static generation for student pages
export const dynamic = 'force-dynamic';

interface AttendanceRecord {
  _id: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  remarks?: string;
}

interface Summary {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}

export default function StudentAttendancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [studentName, setStudentName] = useState("Student");
  const [student, setStudent] = useState<any | null>(null);
  const [status, setStatus] = useState("");

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const studentLinks = [
    { href: "/student/dashboard", label: "🏠 Dashboard" },
    { href: "/student/profile", label: "🧑‍💻 My Profile" },
    { href: "/student/attendance", label: "📅 My Attendance" },
    { href: "/student/fees", label: "💳 Fees & Payments" },
    { 
      label: "📚 Academics",
      href: "#",
      children: [
        { label: "� Test Schedule", href: "/student/test-schedule" },
        { label: "�📖 My Tests", href: "/student/my-tests" },
        { label: "📊 Test Reports", href: "/student/test-reports" },
      ]
    },
  ];

  const fetchAttendance = async (month: number, year: number) => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      if (!token) {
        setStatus("Not authorized, no token");
        setLoading(false);
        return;
      }

      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };

      const res = await fetch(
        `${API_BASE_URL}/api/student-auth/attendance?month=${month}&year=${year}`,
        { headers }
      );
      const data = await res.json();

      if (res.ok) {
        setRecords(data.records || []);
        setSummary(data.summary || null);
        setStatus("");
      } else {
        setStatus(data.message || "Error loading attendance");
      }
    } catch (err: any) {
      console.error(err);
      setStatus(err.message || "Error loading attendance");
    } finally {
      setLoading(false);
    }
  };

  // Fetch student name
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/student-auth/me`, {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          setStudentName(data.name || "Student");
          setStudent(data);
        }
      } catch (err) {
        console.error("Failed to fetch student:", err);
      }
    };
    fetchStudent();
  }, []);

  useEffect(() => {
    fetchAttendance(currentMonth, currentYear);
  }, [currentMonth, currentYear]);

  const handleMonthChange = (month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  };

  // Print attendance list
  const printAttendanceList = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow pop-ups to print");
      return;
    }

    const html = `
      <html>
      <head>
        <title>My Attendance Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; color: #333; }
          h2 { color: #555; margin-top: 15px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .header { margin-bottom: 15px; color: #666; }
          .summary { margin-top: 20px; padding: 15px; background-color: #f0f0f0; border-radius: 5px; }
          .summary-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin-top: 10px; }
          .summary-item { padding: 10px; background-color: white; border-radius: 5px; text-align: center; }
          .summary-item strong { display: block; font-size: 24px; color: #333; }
          .summary-item span { font-size: 12px; color: #666; }
          @media print {
            body { margin: 0; padding: 10px; }
            table { font-size: 11px; }
          }
        </style>
      </head>
      <body>
        <h1>📋 My Attendance Report</h1>
        <div class="header">
          <p><strong>Student Name:</strong> ${studentName}</p>
          <p><strong>Month:</strong> ${new Date(currentYear, currentMonth - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
        </div>

        <div class="summary">
          <strong>Attendance Summary</strong>
          <div class="summary-grid">
            <div class="summary-item">
              <strong>${summary?.total || 0}</strong>
              <span>Total Days</span>
            </div>
            <div class="summary-item" style="background-color: #d4edda;">
              <strong>${summary?.present || 0}</strong>
              <span>Present</span>
            </div>
            <div class="summary-item" style="background-color: #f8d7da;">
              <strong>${summary?.absent || 0}</strong>
              <span>Absent</span>
            </div>
            <div class="summary-item" style="background-color: #fff3cd;">
              <strong>${summary?.late || 0}</strong>
              <span>Late</span>
            </div>
            <div class="summary-item" style="background-color: #e2e3e5;">
              <strong>${summary?.excused || 0}</strong>
              <span>Excused</span>
            </div>
            <div class="summary-item" style="background-color: #cce5ff;">
              <strong>${summary?.percentage || 0}%</strong>
              <span>Attendance Rate</span>
            </div>
          </div>
        </div>

        <h2>Attendance Details</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Day</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${records.map(record => {
              const date = new Date(record.date);
              const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
              const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              const statusDisplay = record.status === "present" ? "✓ Present" : record.status === "absent" ? "✗ Absent" : record.status === "late" ? "⏰ Late" : "📝 Excused";
              return `
              <tr>
                <td>${dateStr}</td>
                <td>${dayName}</td>
                <td>${statusDisplay}</td>
                <td>${record.remarks || "-"}</td>
              </tr>
            `;
            }).join("")}
          </tbody>
        </table>

        <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
          <p>Printed on ${new Date().toLocaleString()}</p>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <ClientDashboard userName={studentName} sidebarLinks={studentLinks}>
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
            My Attendance
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Track your attendance and performance</p>
        </div>

        {status && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
            {status}
          </div>
        )}

        {/* Summary Stats */}
        {summary && !loading && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 md:p-6 shadow-lg text-white">
              <div className="text-3xl md:text-4xl font-bold mb-1">{summary.total}</div>
              <div className="text-xs md:text-sm opacity-90">Total Days</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 md:p-6 shadow-lg text-white">
              <div className="text-3xl md:text-4xl font-bold mb-1">{summary.present}</div>
              <div className="text-xs md:text-sm opacity-90">Present</div>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 md:p-6 shadow-lg text-white">
              <div className="text-3xl md:text-4xl font-bold mb-1">{summary.absent}</div>
              <div className="text-xs md:text-sm opacity-90">Absent</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 md:p-6 shadow-lg text-white">
              <div className="text-3xl md:text-4xl font-bold mb-1">{summary.late}</div>
              <div className="text-xs md:text-sm opacity-90">Late</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 md:p-6 shadow-lg text-white">
              <div className="text-3xl md:text-4xl font-bold mb-1">{summary.excused}</div>
              <div className="text-xs md:text-sm opacity-90">Excused</div>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-4 md:p-6 shadow-lg text-white">
              <div className="text-3xl md:text-4xl font-bold mb-1">{summary.percentage}%</div>
              <div className="text-xs md:text-sm opacity-90">Attendance</div>
            </div>
          </div>
        )}

        {/* Performance Indicator */}
        {summary && !loading && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Attendance Performance
              </h3>
              <button
                onClick={printAttendanceList}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-colors flex items-center gap-2"
              >
                🖨️ Print Attendance
              </button>
            </div>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span
                    className={`text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full ${
                      summary.percentage >= 75
                        ? "text-green-600 bg-green-200"
                        : summary.percentage >= 50
                        ? "text-yellow-600 bg-yellow-200"
                        : "text-red-600 bg-red-200"
                    }`}
                  >
                    {summary.percentage >= 75
                      ? "Excellent"
                      : summary.percentage >= 50
                      ? "Average"
                      : "Needs Improvement"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-gray-600 dark:text-gray-400">
                    {summary.percentage}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  style={{ width: `${summary.percentage}%` }}
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500 ${
                    summary.percentage >= 75
                      ? "bg-green-500"
                      : summary.percentage >= 50
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                ></div>
              </div>
            </div>
            {summary.percentage < 75 && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                💡 Tip: Maintain at least 75% attendance for better academic performance!
              </p>
            )}
          </div>
        )}

        {/* Two Column Layout - Calendar + Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calendar Column */}
          <div>
            {loading ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">Loading...</p>
              </div>
            ) : (
              <AttendanceCalendar
                records={records}
                month={currentMonth}
                year={currentYear}
                onMonthChange={handleMonthChange}
              />
            )}
          </div>

          {/* Table Column */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Attendance Records
              </h3>
              <button
                onClick={printAttendanceList}
                className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-colors text-sm"
              >
                🖨️ Print
              </button>
            </div>
            
            {!loading && records.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">Date</th>
                      <th className="text-left py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                      <th className="text-left py-2 px-2 font-semibold text-gray-700 dark:text-gray-300">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record) => (
                      <tr key={record._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-3 px-2 text-gray-800 dark:text-gray-200">
                          {new Date(record.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric"
                          })}
                        </td>
                        <td className="py-3 px-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                            record.status === "present"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : record.status === "absent"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : record.status === "late"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-gray-600 dark:text-gray-400 text-xs">
                          {record.remarks || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : !loading ? (
              <div className="text-center py-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm">No records for this month</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </ClientDashboard>
  );
}
