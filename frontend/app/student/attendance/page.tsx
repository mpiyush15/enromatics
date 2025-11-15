"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClientDashboard from "@/components/dashboard/ClientDashboard";
import AttendanceCalendar from "@/components/attendance/AttendanceCalendar";

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
      const res = await fetch(
        `http://localhost:5050/api/student-auth/attendance?month=${month}&year=${year}`,
        { credentials: "include" }
      );
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Not authenticated");

      setRecords(data.records || []);
      setSummary(data.summary || null);
      setStatus("");
    } catch (err: any) {
      console.error(err);
      setStatus(err.message || "Error loading attendance");
      if (err.message.includes("authenticated")) {
        setTimeout(() => router.push("/student/login"), 800);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch student name
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const res = await fetch("http://localhost:5050/api/student-auth/me", {
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
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Attendance Performance
            </h3>
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

        {/* Calendar */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading attendance...</p>
          </div>
        ) : (
          <AttendanceCalendar
            records={records}
            month={currentMonth}
            year={currentYear}
            onMonthChange={handleMonthChange}
          />
        )}

        {/* Recent Records */}
        {!loading && records.length > 0 && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Recent Attendance
            </h3>
            <div className="space-y-3">
              {records.slice(0, 10).map((record) => (
                <div
                  key={record._id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        record.status === "present"
                          ? "bg-green-500"
                          : record.status === "absent"
                          ? "bg-red-500"
                          : record.status === "late"
                          ? "bg-yellow-500"
                          : "bg-purple-500"
                      }`}
                    >
                      {record.status === "present"
                        ? "✓"
                        : record.status === "absent"
                        ? "✗"
                        : record.status === "late"
                        ? "⏰"
                        : "📝"}
                    </div>
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">
                        {new Date(record.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      {record.remarks && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {record.remarks}
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                      record.status === "present"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : record.status === "absent"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : record.status === "late"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                    }`}
                  >
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && records.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              No Attendance Records
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No attendance has been marked for this month yet.
            </p>
          </div>
        )}
      </div>
    </ClientDashboard>
  );
}
