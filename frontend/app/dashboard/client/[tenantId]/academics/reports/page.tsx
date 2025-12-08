"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";

export default function TestReportsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const tenantId = params?.tenantId as string;
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<any>(null);
  const [topPerformers, setTopPerformers] = useState<any[]>([]);
  const [subjectPerformance, setSubjectPerformance] = useState<any[]>([]);
  const [filterCourse, setFilterCourse] = useState("");
  const [filterBatch, setFilterBatch] = useState("");

  useEffect(() => {
    if (user) fetchReports();
  }, [user, filterCourse, filterBatch]);

  const fetchReports = async () => {
    try {
      let url = `/api/academics/reports`;
      const params = new URLSearchParams();
      if (filterCourse) params.append("course", filterCourse);
      if (filterBatch) params.append("batch", filterBatch);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setStatistics(data.statistics || {});
        setTopPerformers(data.topPerformers || []);
        setSubjectPerformance(data.subjectPerformance || []);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p>Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 rounded-3xl shadow-2xl p-8 text-white mb-6">
          <h1 className="text-4xl font-bold mb-2">📊 Test Reports & Analytics</h1>
          <p className="text-green-100">Comprehensive performance analysis and insights</p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Filter by course..."
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="flex-1 px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            />
            <input
              type="text"
              placeholder="Filter by batch..."
              value={filterBatch}
              onChange={(e) => setFilterBatch(e.target.value)}
              className="flex-1 px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
            />
          </div>
        </div>

        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <p className="text-blue-100 text-sm mb-1">Total Tests</p>
            <p className="text-4xl font-bold">{statistics?.totalTests || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <p className="text-purple-100 text-sm mb-1">Total Evaluations</p>
            <p className="text-4xl font-bold">{statistics?.totalMarksRecords || 0}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="text-green-100 text-sm mb-1">Average Percentage</p>
            <p className="text-4xl font-bold">{statistics?.avgPercentage || 0}%</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <p className="text-orange-100 text-sm mb-1">Pass Rate</p>
            <p className="text-4xl font-bold">{statistics?.passPercentage || 0}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="text-3xl">🏆</span>
                Top Performers
              </h2>
            </div>
            <div className="p-6">
              {topPerformers.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-400">No performance data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topPerformers.slice(0, 10).map((performer, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-xl hover:shadow-lg transition-shadow">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? "bg-gradient-to-br from-yellow-400 to-yellow-600" :
                        index === 1 ? "bg-gradient-to-br from-gray-400 to-gray-600" :
                        index === 2 ? "bg-gradient-to-br from-orange-400 to-orange-600" :
                        "bg-gradient-to-br from-blue-500 to-purple-600"
                      }`}>
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-lg">{performer.student?.name || "Unknown"}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {performer.test?.name} - {performer.test?.subject}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">{performer.percentage?.toFixed(2)}%</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          performer.grade === "A+" || performer.grade === "A" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        }`}>
                          {performer.grade}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Subject-wise Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <span className="text-3xl">📚</span>
                Subject-wise Performance
              </h2>
            </div>
            <div className="p-6">
              {subjectPerformance.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="text-gray-600 dark:text-gray-400">No subject data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {subjectPerformance.map((subject, index) => {
                    const percentage = parseFloat(subject.avgPercentage);
                    return (
                      <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-bold text-lg">{subject.subject}</h3>
                          <span className="text-2xl font-bold text-blue-600">{subject.avgPercentage}%</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <span>📝 {subject.testCount} {subject.testCount === 1 ? "Test" : "Tests"}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-500 ${
                              percentage >= 80 ? "bg-gradient-to-r from-green-500 to-green-600" :
                              percentage >= 60 ? "bg-gradient-to-r from-blue-500 to-blue-600" :
                              percentage >= 40 ? "bg-gradient-to-r from-yellow-500 to-yellow-600" :
                              "bg-gradient-to-r from-red-500 to-red-600"
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push(`/dashboard/client/${tenantId}/academics/schedules`)}
              className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-shadow font-semibold"
            >
              📅 View Test Schedules
            </button>
            <button
              onClick={() => router.push(`/dashboard/client/${tenantId}/academics/attendance`)}
              className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-shadow font-semibold"
            >
              ✅ Mark Attendance
            </button>
            <button
              onClick={() => router.push(`/dashboard/client/${tenantId}/academics/marks`)}
              className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-shadow font-semibold"
            >
              📝 Enter Marks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
