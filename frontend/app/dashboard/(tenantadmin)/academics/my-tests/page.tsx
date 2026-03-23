"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentMyTestsPage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchStudentTests();
  }, []);

  const fetchStudentTests = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      // Get current student info via BFF
      const studentRes = await fetch(`/api/student-auth/me`, {
        headers,
      });
      const studentData = await studentRes.json();
      
      if (!studentRes.ok) {
        setTimeout(() => router.push("/student/login"), 800);
        return;
      }
      
      setStudent(studentData.student);

      // Fetch test marks for this student via BFF
      const testsRes = await fetch(
        `/api/academics/students/${studentData.student._id}/tests`,
        { headers }
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p>Loading your tests...</p>
        </div>
      </div>
    );
  }

  const passedCount = tests.filter((t) => t.passed).length;
  const avgPercentage = tests.length > 0
    ? (tests.reduce((sum, t) => sum + t.percentage, 0) / tests.length).toFixed(2)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl p-8 text-white mb-6">
          <h1 className="text-4xl font-bold mb-2">📖 My Tests</h1>
          <p className="text-blue-100">View your test performance and results</p>
          {student && (
            <div className="mt-4 text-sm">
              <p><strong>Name:</strong> {student.name}</p>
              <p><strong>Roll No:</strong> {student.rollNumber}</p>
              <p><strong>Course:</strong> {student.course} {student.batchName && `- ${student.batchName}`}</p>
            </div>
          )}
        </div>

        {/* Status Message */}
        {status && (
          <div className="mb-6 p-4 rounded-xl font-semibold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            {status}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Total Tests</p>
                <p className="text-3xl font-bold">{tests.length}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Tests Passed</p>
                <p className="text-3xl font-bold">{passedCount}</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Average</p>
                <p className="text-3xl font-bold">{avgPercentage}%</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tests List */}
        {tests.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-2xl font-bold mb-2">No Tests Yet</h3>
            <p className="text-gray-600 dark:text-gray-400">Your test results will appear here once marks are entered</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <div key={test._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{test.testId?.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{test.testId?.subject}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    test.passed 
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  }`}>
                    {test.passed ? "✓ Pass" : "✗ Fail"}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Date:</span>
                    <span className="font-semibold">{new Date(test.testId?.testDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                    <span className="font-semibold">{test.testId?.testType}</span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Marks:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {test.marksObtained} / {test.testId?.totalMarks}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Percentage:</span>
                    <span className="text-xl font-bold">{test.percentage?.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Grade:</span>
                    <span className={`px-4 py-1 rounded-full font-bold ${getGradeColor(test.grade)}`}>
                      {test.grade}
                    </span>
                  </div>
                </div>

                {test.remarks && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Remarks:</strong> {test.remarks}
                    </p>
                  </div>
                )}

                {/* Progress Bar */}
                <div className="mt-4 w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      test.percentage >= 90 ? "bg-green-600" :
                      test.percentage >= 70 ? "bg-blue-600" :
                      test.percentage >= 50 ? "bg-yellow-600" :
                      "bg-red-600"
                    }`}
                    style={{ width: `${test.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
