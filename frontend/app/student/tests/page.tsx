"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClientDashboard from "@/components/dashboard/ClientDashboard";
import { API_BASE_URL } from "@/lib/apiConfig";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function StudentTestsPage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "reports">("all");

  const studentLinks = [
    { href: "/student/dashboard", label: "🏠 Dashboard" },
    { href: "/student/profile", label: "🧑‍💻 My Profile" },
    { href: "/student/attendance", label: "📅 My Attendance" },
    { href: "/student/fees", label: "💳 Fees & Payments" },
    { 
      label: "📚 Academics",
      href: "#",
      children: [
        { label: "📅 Test Schedule", href: "/student/test-schedule" },
        { label: "📖 My Tests", href: "/student/tests" },
      ]
    },
  ];

  useEffect(() => {
    fetchStudentTests();
  }, []);

  const fetchStudentTests = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      if (!token) {
        setStatus("Not authenticated");
        setLoading(false);
        return;
      }

      const headers = { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };

      // Fetch student data
      const res = await fetch(`${API_BASE_URL}/api/student-auth/me`, { headers });
      const data = await res.json();
      
      if (res.ok) {
        setStudent(data);
        setStatus("");
        
        // Fetch student tests
        try {
          const testsRes = await fetch(`${API_BASE_URL}/api/academics/student/tests`, { headers });
          const testsData = await testsRes.json();
          
          if (testsRes.ok && testsData.tests) {
            console.log("✅ Tests fetched with marks:", testsData.tests.map((t: any) => ({
              name: t.name,
              marksObtained: t.marksObtained,
              totalMarks: t.totalMarks,
              percentage: t.percentage,
            })));
            setTests(testsData.tests);
          } else {
            console.error("❌ Failed to fetch tests:", testsData);
          }
        } catch (testErr) {
          console.error("Error fetching tests:", testErr);
        }
      } else {
        setStatus("Failed to load student data");
      }
    } catch (err: any) {
      console.error(err);
      setStatus(err.message || "Error loading data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ClientDashboard userName="Loading..." sidebarLinks={studentLinks}>
        <div className="p-6 max-w-6xl mx-auto">
          <p className="text-gray-500">Loading tests information...</p>
        </div>
      </ClientDashboard>
    );
  }

  if (!student) {
    return (
      <ClientDashboard userName="Student" sidebarLinks={studentLinks}>
        <div className="p-6 max-w-6xl mx-auto">
          <p className="text-red-600">{status || 'Not authenticated'}</p>
          <p className="text-sm text-gray-500 mt-2">Redirecting to login...</p>
        </div>
      </ClientDashboard>
    );
  }

  // Calculate statistics
  const totalTests = tests.length;
  const passedTests = tests.filter((t: any) => (t.marksObtained || 0) >= 50).length;
  const failedTests = totalTests - passedTests;
  const avgPercentage = totalTests > 0
    ? (tests.reduce((sum: number, t: any) => sum + ((t.marksObtained || 0) / (t.totalMarks || 100) * 100), 0) / totalTests).toFixed(2)
    : 0;
  const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;

  // Group by subject
  const subjectStats = tests.reduce((acc: any, test: any) => {
    const subject = test.subject || "General";
    if (!acc[subject]) {
      acc[subject] = {
        total: 0,
        count: 0,
        passed: 0,
        tests: [],
      };
    }
    acc[subject].total += test.marksObtained || 0;
    acc[subject].count += 1;
    if ((test.marksObtained || 0) >= 50) {
      acc[subject].passed += 1;
    }
    acc[subject].tests.push(test);
    return acc;
  }, {});

  // Progress data for line chart
  const progressData = tests
    .sort((a: any, b: any) => new Date(a.testDate || 0).getTime() - new Date(b.testDate || 0).getTime())
    .map((test: any) => ({
      date: new Date(test.testDate || new Date()).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      name: test.name,
      percentage: ((test.marksObtained || 0) / (test.totalMarks || 100) * 100).toFixed(1),
      marks: test.marksObtained || 0,
    }));

  // Subject performance data for bar chart
  const subjectData = Object.entries(subjectStats).map(([subject, stats]: any) => ({
    subject,
    avgMarks: stats.count > 0 ? ((stats.total / stats.count)).toFixed(1) : 0,
    passRate: stats.count > 0 ? ((stats.passed / stats.count) * 100).toFixed(1) : 0,
  }));

  return (
    <ClientDashboard userName={student?.name || "Student"} sidebarLinks={studentLinks}>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">📚 My Tests</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Course: <span className="font-semibold">{student?.courseName || student?.course || "N/A"}</span> | 
            Batch: <span className="font-semibold">{student?.batchName || "N/A"}</span>
          </p>
        </div>

        {/* Status */}
        {status && (
          <div className={`p-4 rounded-lg ${status.includes("✅") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {status}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-3 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-5 py-3 rounded-t-lg font-semibold text-sm transition-all duration-300 ${
              activeTab === "all"
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white/50"
            }`}
          >
            📖 All Tests ({totalTests})
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`px-5 py-3 rounded-t-lg font-semibold text-sm transition-all duration-300 ${
              activeTab === "reports"
                ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white/50"
            }`}
          >
            📊 Performance Reports
          </button>
        </div>

        {/* All Tests Tab */}
        {activeTab === "all" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Tests</p>
                <p className="text-3xl font-bold text-blue-600">{totalTests}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Passed</p>
                <p className="text-3xl font-bold text-green-600">{passedTests}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Failed</p>
                <p className="text-3xl font-bold text-red-600">{failedTests}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Avg %</p>
                <p className="text-3xl font-bold text-purple-600">{avgPercentage}%</p>
              </div>
            </div>

            {/* Tests Table */}
            {tests.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">No tests taken yet</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                      <tr>
                        <th className="px-6 py-3 text-left text-gray-900 dark:text-white font-semibold">Test Name</th>
                        <th className="px-6 py-3 text-left text-gray-900 dark:text-white font-semibold">Subject</th>
                        <th className="px-6 py-3 text-center text-gray-900 dark:text-white font-semibold">Date</th>
                        <th className="px-6 py-3 text-center text-gray-900 dark:text-white font-semibold">Marks</th>
                        <th className="px-6 py-3 text-center text-gray-900 dark:text-white font-semibold">%</th>
                        <th className="px-6 py-3 text-center text-gray-900 dark:text-white font-semibold">Rank</th>
                        <th className="px-6 py-3 text-center text-gray-900 dark:text-white font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {tests.map((test: any) => {
                        const percentage = test.totalMarks ? ((test.marksObtained || 0) / test.totalMarks * 100).toFixed(1) : 0;
                        const passed = (test.marksObtained || 0) >= 50;
                        const rank = test.marks?.rank || test.batchRank || "-";
                        return (
                          <tr key={test._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-3 text-gray-900 dark:text-white font-medium">{test.name}</td>
                            <td className="px-6 py-3 text-gray-600 dark:text-gray-400">{test.subject || "N/A"}</td>
                            <td className="px-6 py-3 text-center text-gray-600 dark:text-gray-400">
                              {test.testDate ? new Date(test.testDate).toLocaleDateString("en-IN") : "N/A"}
                            </td>
                            <td className="px-6 py-3 text-center font-semibold text-gray-900 dark:text-white">
                              {test.marksObtained || 0}/{test.totalMarks || 100}
                            </td>
                            <td className="px-6 py-3 text-center text-gray-600 dark:text-gray-400">{percentage}%</td>
                            <td className="px-6 py-3 text-center">
                              {typeof rank === 'number' ? (
                                <span className={`px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                                  rank === 1 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                  rank <= 3 ? 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200' :
                                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                }`}>
                                  #{rank}
                                </span>
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </td>
                            <td className="px-6 py-3 text-center">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                passed 
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              }`}>
                                {passed ? "✅ Pass" : "❌ Fail"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Tests</p>
                <p className="text-3xl font-bold text-blue-600">{totalTests}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Pass Rate</p>
                <p className="text-3xl font-bold text-green-600">{passRate}%</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Avg Percentage</p>
                <p className="text-3xl font-bold text-purple-600">{avgPercentage}%</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Subjects</p>
                <p className="text-3xl font-bold text-orange-600">{Object.keys(subjectStats).length}</p>
              </div>
            </div>

            {/* Charts */}
            {tests.length > 0 && (
              <>
                {/* Progress Line Chart */}
                {progressData.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📈 Progress Over Time</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={progressData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="percentage" 
                          stroke="#3b82f6" 
                          name="Percentage (%)"
                          strokeWidth={2}
                          dot={{ fill: "#3b82f6", r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Subject Performance Bar Chart */}
                {subjectData.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📊 Subject-wise Performance</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={subjectData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="subject" angle={-45} textAnchor="end" height={70} />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="avgMarks" fill="#10b981" name="Avg Marks" />
                        <Bar dataKey="passRate" fill="#f59e0b" name="Pass Rate (%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            )}

            {/* Subject Details */}
            {Object.keys(subjectStats).length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📚 Subject Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(subjectStats).map(([subject, stats]: any) => (
                    <div key={subject} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{subject}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Tests Taken:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{stats.count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Avg Marks:</span>
                          <span className="font-semibold text-gray-900 dark:text-white">{stats.total / stats.count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Pass Rate:</span>
                          <span className="font-semibold text-green-600">{((stats.passed / stats.count) * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tests.length === 0 && (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">No test data available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </ClientDashboard>
  );
}
