"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClientDashboard from "@/components/dashboard/ClientDashboard";

export default function StudentTestSchedulePage() {
  const router = useRouter();
  const [student, setStudent] = useState<any>(null);
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, upcoming, completed

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
        { label: "📖 My Tests", href: "/student/my-tests" },
        { label: "📊 Test Reports", href: "/student/test-reports" },
      ]
    },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Get student info
      const studentRes = await fetch("http://localhost:5050/api/student-auth/me", {
        credentials: "include",
      });
      const studentData = await studentRes.json();
      
      if (!studentRes.ok) {
        setTimeout(() => router.push("/student/login"), 800);
        return;
      }
      
      setStudent(studentData);

      // Fetch all tests for student's course and batch using student-specific endpoint
      const testsRes = await fetch(
        `http://localhost:5050/api/academics/student/tests`,
        { credentials: "include" }
      );
      const testsData = await testsRes.json();
      
      if (testsRes.ok) {
        setTests(testsData.tests || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: any = {
      scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      ongoing: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      completed: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return badges[status] || badges.scheduled;
  };

  const isUpcoming = (testDate: string) => {
    return new Date(testDate) > new Date();
  };

  const filteredTests = tests.filter((test) => {
    if (filter === "upcoming") return isUpcoming(test.testDate);
    if (filter === "completed") return !isUpcoming(test.testDate);
    return true;
  });

  // Sort by date (upcoming first, then past)
  const sortedTests = [...filteredTests].sort((a, b) => {
    const dateA = new Date(a.testDate).getTime();
    const dateB = new Date(b.testDate).getTime();
    const now = new Date().getTime();
    
    const aIsUpcoming = dateA > now;
    const bIsUpcoming = dateB > now;
    
    if (aIsUpcoming && !bIsUpcoming) return -1;
    if (!aIsUpcoming && bIsUpcoming) return 1;
    if (aIsUpcoming && bIsUpcoming) return dateA - dateB; // Upcoming: earliest first
    return dateB - dateA; // Past: most recent first
  });

  const upcomingCount = tests.filter((t) => isUpcoming(t.testDate)).length;
  const completedCount = tests.filter((t) => !isUpcoming(t.testDate)).length;

  if (loading) {
    return (
      <ClientDashboard userName="Loading..." sidebarLinks={studentLinks}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
            <p>Loading test schedule...</p>
          </div>
        </div>
      </ClientDashboard>
    );
  }

  return (
    <ClientDashboard userName={student?.name || "Student"} sidebarLinks={studentLinks}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl p-8 text-white">
            <h1 className="text-4xl font-bold mb-2">📅 Test Schedule</h1>
            <p className="text-blue-100">View your upcoming and past tests</p>
            {student && (
              <div className="mt-4 space-y-1 text-sm">
                <p><strong>Name:</strong> {student.name}</p>
                <p><strong>Course:</strong> {student.course} | <strong>Batch:</strong> {student.batch}</p>
              </div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Upcoming</p>
                  <p className="text-3xl font-bold text-green-600">{upcomingCount}</p>
                </div>
                <div className="text-5xl">⏰</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-l-4 border-gray-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-gray-600">{completedCount}</p>
                </div>
                <div className="text-5xl">✅</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 flex gap-3">
            <button
              onClick={() => setFilter("all")}
              className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              All Tests
            </button>
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                filter === "upcoming"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-6 py-2 rounded-xl font-semibold transition-all ${
                filter === "completed"
                  ? "bg-gray-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              Completed
            </button>
          </div>

          {/* Tests List */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-700 px-6 py-4 border-b rounded-t-2xl">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {filter === "all" ? "📚 All Tests" : filter === "upcoming" ? "⏰ Upcoming Tests" : "✅ Completed Tests"}
              </h2>
            </div>

            <div className="p-6">
              {sortedTests.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-8xl mb-4">
                    {filter === "upcoming" ? "⏰" : filter === "completed" ? "✅" : "📝"}
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    {filter === "upcoming" ? "No Upcoming Tests" : filter === "completed" ? "No Completed Tests" : "No Tests Scheduled"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {filter === "upcoming" 
                      ? "You don't have any upcoming tests at the moment."
                      : filter === "completed"
                      ? "You haven't taken any tests yet."
                      : "No tests have been scheduled for your course and batch."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedTests.map((test) => {
                    const testDate = new Date(test.testDate);
                    const upcoming = isUpcoming(test.testDate);
                    const daysUntil = Math.ceil((testDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <div
                        key={test._id}
                        className={`bg-gradient-to-r p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-2 ${
                          upcoming
                            ? "from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800"
                            : "from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-gray-200 dark:border-gray-600"
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="text-4xl">
                                {upcoming ? "📝" : "✅"}
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">{test.name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{test.subject}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Date & Time</p>
                                <p className="font-semibold text-sm">
                                  {testDate.toLocaleDateString()}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {testDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>

                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                                <p className="font-semibold text-sm">{test.duration} mins</p>
                              </div>

                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Total Marks</p>
                                <p className="font-semibold text-sm">{test.totalMarks}</p>
                              </div>

                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Passing Marks</p>
                                <p className="font-semibold text-sm">{test.passingMarks}</p>
                              </div>
                            </div>

                            {test.testType && (
                              <div className="mt-3">
                                <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-xs font-bold">
                                  {test.testType}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-3">
                            <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusBadge(test.status)}`}>
                              {test.status}
                            </span>
                            
                            {upcoming && daysUntil >= 0 && (
                              <div className="text-center bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 px-4 py-2 rounded-xl">
                                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                  {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil} days`}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {daysUntil === 0 ? "Test is today!" : "until test"}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ClientDashboard>
  );
}
