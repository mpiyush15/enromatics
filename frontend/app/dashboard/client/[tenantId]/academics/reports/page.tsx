"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";

interface Statistics {
  totalTests: number;
  totalMarksRecords: number;
  avgPercentage: string;
  passPercentage: string;
}

interface TopPerformer {
  student: {
    _id: string;
    name: string;
    rollNumber?: string;
    email?: string;
  };
  test: {
    name: string;
    title?: string;
    subject: string;
  };
  percentage: string;
  grade: string;
}

interface SubjectPerformance {
  subject: string;
  testCount: number;
  avgPercentage: string;
}

type ViewMode = "overview" | "performers" | "subjects";

export default function TestReportsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const tenantId = params?.tenantId as string;

  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformance[]>([]);
  const [filterCourse, setFilterCourse] = useState("");
  const [filterBatch, setFilterBatch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPerformer, setSelectedPerformer] = useState<TopPerformer | null>(null);
  
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);
  const [availableBatches, setAvailableBatches] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchCoursesAndBatches();
      fetchReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  
  useEffect(() => {
    if (user && (filterCourse || filterBatch)) {
      fetchReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCourse, filterBatch]);
  
  const fetchCoursesAndBatches = async () => {
    try {
      // Fetch courses
      const coursesRes = await fetch(`/api/courses`, { credentials: "include" });
      const coursesData = await coursesRes.json();
      if (coursesRes.ok && coursesData.courses) {
        setAvailableCourses(coursesData.courses.map((c: any) => c.name));
      }
      
      // Fetch batches
      const batchesRes = await fetch(`/api/batches`, { credentials: "include" });
      const batchesData = await batchesRes.json();
      if (batchesRes.ok && batchesData.batches) {
        setAvailableBatches(batchesData.batches.map((b: any) => b.name));
      }
    } catch (err) {
      console.error("Error fetching courses/batches:", err);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `/api/academics/reports`;
      const query = new URLSearchParams();

      if (filterCourse) query.append("course", filterCourse);
      if (filterBatch) query.append("batch", filterBatch);

      if (query.toString()) {
        url += `?${query.toString()}`;
      }

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatistics(
          data.statistics ?? {
            totalTests: 0,
            totalMarksRecords: 0,
            avgPercentage: "0.00",
            passPercentage: "0.00",
          }
        );
        setTopPerformers(data.topPerformers ?? []);
        setSubjectPerformance(data.subjectPerformance ?? []);
      } else {
        setError(data.message || "Failed to fetch reports");
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to load reports. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  const getGradeColor = (grade?: string) => {
    if (!grade) return 'bg-gray-100 text-gray-700 border-gray-200';
    switch (grade.toUpperCase()) {
      case 'A+': return 'bg-green-100 text-green-800 border-green-200';
      case 'A': return 'bg-green-100 text-green-700 border-green-200';
      case 'B': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'C': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'D': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'F': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Test Reports & Analytics</h1>
              <p className="text-gray-600 mt-1">Comprehensive performance analysis and insights</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  showFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
              </button>
              <button
                onClick={fetchReports}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="text-red-800 flex-1">{error}</div>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 animate-in fade-in duration-200">
            <h3 className="font-semibold text-gray-900 mb-4">Filter Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
                <select
                  value={filterCourse}
                  onChange={(e) => setFilterCourse(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">All Courses</option>
                  {availableCourses.map((course) => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch</label>
                <select
                  value={filterBatch}
                  onChange={(e) => setFilterBatch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">All Batches</option>
                  {availableBatches.map((batch) => (
                    <option key={batch} value={batch}>{batch}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* View Mode Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setViewMode("overview")}
                className={`px-6 py-4 font-medium transition-all border-b-2 ${
                  viewMode === "overview"
                    ? "border-blue-600 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Overview
                </div>
              </button>
              <button
                onClick={() => setViewMode("performers")}
                className={`px-6 py-4 font-medium transition-all border-b-2 ${
                  viewMode === "performers"
                    ? "border-blue-600 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Top Performers
                </div>
              </button>
              <button
                onClick={() => setViewMode("subjects")}
                className={`px-6 py-4 font-medium transition-all border-b-2 ${
                  viewMode === "subjects"
                    ? "border-blue-600 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Subject Analysis
                </div>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {viewMode === "overview" && (
              <div className="space-y-6">
                {/* Statistics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard 
                    label="Total Tests" 
                    value={statistics?.totalTests || 0}
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                    color="blue"
                  />
                  <StatCard 
                    label="Total Evaluations" 
                    value={statistics?.totalMarksRecords || 0}
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
                    color="green"
                  />
                  <StatCard 
                    label="Average Score" 
                    value={`${statistics?.avgPercentage || '0.00'}%`}
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                    color="purple"
                  />
                  <StatCard 
                    label="Pass Rate" 
                    value={`${statistics?.passPercentage || '0.00'}%`}
                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    color="orange"
                  />
                </div>

                {/* Quick Actions */}
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button 
                      onClick={() => router.push(`/dashboard/client/${tenantId}/academics/schedules`)}
                      className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
                    >
                      <span className="text-2xl">📅</span>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">View Schedules</div>
                        <div className="text-xs text-gray-500">Manage test schedules</div>
                      </div>
                    </button>
                    <button 
                      onClick={() => router.push(`/dashboard/client/${tenantId}/academics/attendance`)}
                      className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all"
                    >
                      <span className="text-2xl">✅</span>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">Attendance</div>
                        <div className="text-xs text-gray-500">Track attendance</div>
                      </div>
                    </button>
                    <button 
                      onClick={() => router.push(`/dashboard/client/${tenantId}/academics/marks`)}
                      className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all"
                    >
                      <span className="text-2xl">📝</span>
                      <div className="text-left">
                        <div className="font-medium text-gray-900">Enter Marks</div>
                        <div className="text-xs text-gray-500">Record test results</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {viewMode === "performers" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Top Performing Students</h3>
                  <span className="text-sm text-gray-500">{topPerformers.length} students</span>
                </div>
                
                {topPerformers.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-500">No performance data available</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {topPerformers.map((performer, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedPerformer(performer)}
                        className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-5 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                              {performer.student.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{performer.student.name}</h4>
                              <p className="text-xs text-gray-500">{performer.student.email}</p>
                            </div>
                          </div>
                          {index < 3 && (
                            <span className="text-2xl">
                              {index === 0 && '🥇'}
                              {index === 1 && '🥈'}
                              {index === 2 && '🥉'}
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Test</span>
                            <span className="font-medium text-gray-900">{performer.test.title || performer.test.name}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Score</span>
                            <span className="font-bold text-blue-600 text-lg">{performer.percentage}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Grade</span>
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getGradeColor(performer.grade)}`}>
                              {performer.grade || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {viewMode === "subjects" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Subject-wise Performance</h3>
                  <span className="text-sm text-gray-500">{subjectPerformance.length} subjects</span>
                </div>

                {subjectPerformance.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p className="text-gray-500">No subject data available</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {subjectPerformance.map((subject, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg p-5 border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900 text-lg">{subject.subject}</h4>
                            <p className="text-sm text-gray-500">{subject.testCount} test{subject.testCount !== 1 ? 's' : ''} conducted</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">{subject.avgPercentage}%</div>
                            <div className="text-xs text-gray-500">Average</div>
                          </div>
                        </div>
                        
                        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`absolute h-full rounded-full transition-all duration-500 ${getPerformanceColor(parseFloat(subject.avgPercentage))}`}
                            style={{ width: `${subject.avgPercentage}%` }}
                          />
                        </div>
                        
                        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                          <span>0%</span>
                          <span className="font-medium text-gray-700">
                            {parseFloat(subject.avgPercentage) >= 80 ? 'Excellent' :
                             parseFloat(subject.avgPercentage) >= 60 ? 'Good' :
                             parseFloat(subject.avgPercentage) >= 40 ? 'Average' : 'Needs Improvement'}
                          </span>
                          <span>100%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

/* Small helper */
function Stat({ label, value }: { label: string; value?: number | string }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded shadow border">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold">{value ?? 0}</p>
    </div>
  );
}

/* Enhanced StatCard Component */
function StatCard({ 
  label, 
  value, 
  icon, 
  color 
}: { 
  label: string; 
  value: number | string; 
  icon: React.ReactNode; 
  color: 'blue' | 'green' | 'purple' | 'orange'; 
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-white rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
