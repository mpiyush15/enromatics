"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClientDashboard from "@/components/dashboard/ClientDashboard";
import { API_BASE_URL } from "@/lib/apiConfig";

export default function StudentTestReportsPage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };

      const studentRes = await fetch(`${API_BASE_URL}/api/student-auth/me`, {
        headers,
      });
      const studentData = await studentRes.json();
      
      if (!studentRes.ok) {
        setLoading(false);
        return;
      }

      setStudent(studentData);
      console.log("✅ Student fetched:", studentData.name);

      // Fetch all tests
      const testsRes = await fetch(`${API_BASE_URL}/api/academics/tests`, {
        headers,
      });

      if (!testsRes.ok) throw new Error("Failed to fetch tests");

      const testsData = await testsRes.json();
      const allTests = testsData.tests || testsData.data || [];
      const results: any[] = [];

      // For each test, fetch marks and find this student's result
      for (const test of allTests) {
        try {
          const marksRes = await fetch(`${API_BASE_URL}/api/academics/tests/${test._id}/marks`, {
            headers,
          });

          if (!marksRes.ok) continue;

          const marksData = await marksRes.json();
          const marks = marksData.marks || [];

          const studentMark = marks.find(
            (m: any) =>
              (typeof m.studentId === "string" ? m.studentId : m.studentId?._id) ===
              studentData._id
          );

          if (studentMark) {
            const marksObtained = studentMark.marksObtained || 0;
            const percentage = (marksObtained / test.totalMarks) * 100;
            const passed = marksObtained >= test.passingMarks;

            const sortedMarks = [...marks].sort((a, b) => (b.marksObtained || 0) - (a.marksObtained || 0));
            const rank = sortedMarks.findIndex(
              (m: any) =>
                (typeof m.studentId === "string" ? m.studentId : m.studentId?._id) ===
                studentData._id
            ) + 1;

            results.push({
              _id: test._id,
              testName: test.name,
              subject: test.subject || "General",
              marksObtained,
              totalMarks: test.totalMarks,
              percentage: Math.round(percentage * 100) / 100,
              testDate: test.testDate,
              passed,
              rank,
              grade: percentage >= 90 ? "A+" : percentage >= 80 ? "A" : percentage >= 70 ? "B" : percentage >= 60 ? "C" : percentage >= 50 ? "D" : "F",
            });
          }
        } catch (err) {
          console.error(`Error fetching marks for test ${test._id}:`, err);
        }
      }

      results.sort((a, b) => new Date(b.testDate || 0).getTime() - new Date(a.testDate || 0).getTime());
      setTests(results);
      console.log("✅ Test Reports fetched:", results.length);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ClientDashboard userName="Loading..." sidebarLinks={studentLinks}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
            <p>Loading reports...</p>
          </div>
        </div>
      </ClientDashboard>
    );
  }

  // Calculate statistics
  const totalTests = tests.length;
  const passedTests = tests.filter(t => t.passed).length;
  const failedTests = totalTests - passedTests;
  const avgPercentage = totalTests > 0
    ? (tests.reduce((sum, t) => sum + t.percentage, 0) / totalTests).toFixed(2)
    : 0;
  const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;

  // Group by subject
  const subjectStats = tests.reduce((acc: any, test) => {
    if (!acc[test.subject]) {
      acc[test.subject] = {
        total: 0,
        totalMarks: 0,
        obtainedMarks: 0,
        passed: 0,
      };
    }
    acc[test.subject].total++;
    acc[test.subject].totalMarks += test.totalMarks;
    acc[test.subject].obtainedMarks += test.marksObtained;
    if (test.passed) acc[test.subject].passed++;
    return acc;
  }, {});

  // Sort tests by percentage (highest first)
  const sortedTests = [...tests].sort((a, b) => b.percentage - a.percentage);
  const topTests = sortedTests.slice(0, 5);

  return (
    <ClientDashboard userName={student?.name || "Student"} sidebarLinks={studentLinks}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl p-8 text-white">
            <h1 className="text-4xl font-bold mb-2">📊 Test Reports & Analytics</h1>
            <p className="text-blue-100">Comprehensive overview of your academic performance</p>
            {student && (
              <div className="mt-4 space-y-1 text-sm">
                <p><strong>Name:</strong> {student.name}</p>
                <p><strong>Roll Number:</strong> {student.rollNumber}</p>
                <p><strong>Course:</strong> {student.course} | <strong>Batch:</strong> {student.batchName}</p>
              </div>
            )}
          </div>

          {/* Overall Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Tests</p>
                  <p className="text-3xl font-bold text-blue-600">{totalTests}</p>
                </div>
                <div className="text-5xl">📝</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Passed</p>
                  <p className="text-3xl font-bold text-green-600">{passedTests}</p>
                </div>
                <div className="text-5xl">✅</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average %</p>
                  <p className="text-3xl font-bold text-purple-600">{avgPercentage}%</p>
                </div>
                <div className="text-5xl">📊</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pass Rate</p>
                  <p className="text-3xl font-bold text-yellow-600">{passRate}%</p>
                </div>
                <div className="text-5xl">🎯</div>
              </div>
            </div>
          </div>

          {/* Top Performances */}
          {topTests.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-gray-700 dark:to-gray-700 px-6 py-4 border-b rounded-t-2xl">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">🏆 Your Best Performances</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {topTests.map((test, index) => (
                    <div key={test._id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-xl hover:shadow-md transition-all">
                      <div className="text-4xl">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🏅"}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{test.testName}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{test.subject} • {new Date(test.testDate).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">{test.percentage}%</p>
                        <p className="text-sm text-gray-600">Grade: <span className="font-bold">{test.grade}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Subject-wise Performance */}
          {Object.keys(subjectStats).length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-700 px-6 py-4 border-b rounded-t-2xl">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">📚 Subject-wise Performance</h2>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {Object.entries(subjectStats).map(([subject, stats]: [string, any]) => {
                    const percentage = ((stats.obtainedMarks / stats.totalMarks) * 100).toFixed(1);
                    return (
                      <div key={subject} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h3 className="font-bold text-lg">{subject}</h3>
                          <div className="text-right">
                            <p className="text-xl font-bold text-blue-600">{percentage}%</p>
                            <p className="text-sm text-gray-600">
                              {stats.passed}/{stats.total} passed
                            </p>
                          </div>
                        </div>
                        <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-4 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-green-500 to-blue-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                          <span>Total Tests: {stats.total}</span>
                          <span>Total Marks: {stats.obtainedMarks}/{stats.totalMarks}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {totalTests === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
              <div className="text-8xl mb-4">📊</div>
              <h3 className="text-2xl font-bold mb-2">No Test Data Available</h3>
              <p className="text-gray-600 dark:text-gray-400">Your performance reports will appear here once you have test results.</p>
            </div>
          )}
        </div>
      </div>
    </ClientDashboard>
  );
}
