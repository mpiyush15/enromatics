"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClientDashboard from "@/components/dashboard/ClientDashboard";
import { API_BASE_URL } from "@/lib/apiConfig";

export default function StudentMyTestsPage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const studentLinks = [
    { href: "/student/dashboard", label: "🏠 Dashboard" },
    { href: "/student/profile", label: "🧑‍💻 My Profile" },
    { href: "/student/attendance", label: "📅 My Attendance" },
    { href: "/student/fees", label: "💳 Fees & Payments" },
    { 
      label: "📚 Academics",
      href: "#",
      children: [
        { label: "📖 My Tests", href: "/student/my-tests" },
        { label: "📊 Test Reports", href: "/student/test-reports" },
      ]
    },
  ];

  useEffect(() => {
    fetchStudentTests();
  }, []);

  const fetchStudentTests = async () => {
    try {
      // Get current student info
      const studentRes = await fetch(`${API_BASE_URL}/api/student-auth/me`, {
        credentials: "include",
      });
      const studentData = await studentRes.json();
      
      if (!studentRes.ok) {
        setTimeout(() => router.push("/student/login"), 800);
        return;
      }
      
      setStudent(studentData);

      // Fetch test marks for this student
      const testsRes = await fetch(
        `${API_BASE_URL}/api/academics/students/${studentData._id}/tests`,
        { credentials: "include" }
      );
      const testsData = await testsRes.json();
      
      if (testsRes.ok) {
        setTests(testsData.tests || []);
      }
    } catch (error) {
      console.error("Error fetching tests:", error);
      setStatus("❌ Failed to load test data");
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade === "A+" || grade === "A") return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (grade === "B+" || grade === "B") return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    if (grade === "C" || grade === "D") return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
  };

  if (loading) {
    return (
      <ClientDashboard userName="Loading..." sidebarLinks={studentLinks}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
            <p>Loading your tests...</p>
          </div>
        </div>
      </ClientDashboard>
    );
  }

  const passedCount = tests.filter((t) => t.passed).length;
  const avgPercentage = tests.length > 0
    ? (tests.reduce((sum, t) => sum + t.percentage, 0) / tests.length).toFixed(2)
    : 0;

  return (
    <ClientDashboard userName={student?.name || "Student"} sidebarLinks={studentLinks}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl p-8 text-white mb-6">
            <h1 className="text-4xl font-bold mb-2">📖 My Tests</h1>
            <p className="text-blue-100">View your test performance and results</p>
            {student && (
              <div className="mt-4 space-y-1 text-sm">
                <p><strong>Name:</strong> {student.name}</p>
                <p><strong>Roll Number:</strong> {student.rollNumber}</p>
                <p><strong>Course:</strong> {student.course} | <strong>Batch:</strong> {student.batch}</p>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Tests</p>
                  <p className="text-3xl font-bold text-blue-600">{tests.length}</p>
                </div>
                <div className="text-5xl">📝</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tests Passed</p>
                  <p className="text-3xl font-bold text-green-600">{passedCount}</p>
                </div>
                <div className="text-5xl">✅</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Average Score</p>
                  <p className="text-3xl font-bold text-purple-600">{avgPercentage}%</p>
                </div>
                <div className="text-5xl">📊</div>
              </div>
            </div>
          </div>

          {/* Tests List */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-700 px-6 py-4 border-b rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">📚 Test Results</h2>
            </div>

            <div className="p-6">
              {tests.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-8xl mb-4">📝</div>
                  <h3 className="text-xl font-bold mb-2">No Tests Yet</h3>
                  <p className="text-gray-600 dark:text-gray-400">Your test results will appear here once available.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tests.map((test) => (
                    <div key={test._id} className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-700 dark:to-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-gray-100 dark:border-gray-600 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3">
                        <h3 className="text-lg font-bold text-white">{test.testName}</h3>
                        <p className="text-sm text-blue-100">{test.subject}</p>
                      </div>
                      
                      <div className="p-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Date:</span>
                          <span className="font-semibold">{new Date(test.testDate).toLocaleDateString()}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Marks:</span>
                          <span className="font-bold text-lg">
                            {test.marksObtained} / {test.totalMarks}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Percentage:</span>
                          <span className="font-bold text-xl text-blue-600">{test.percentage}%</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Grade:</span>
                          <span className={`px-4 py-1 rounded-full font-bold text-lg ${getGradeColor(test.grade)}`}>
                            {test.grade}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${test.percentage}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Result:</span>
                          <span className={`px-4 py-1 rounded-full font-bold ${
                            test.passed
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}>
                            {test.passed ? "✅ Passed" : "❌ Failed"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {status && (
            <div className={`mt-6 p-4 rounded-xl font-semibold ${
              status.includes("❌") ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
            }`}>
              {status}
            </div>
          )}
        </div>
      </div>
    </ClientDashboard>
  );
}
