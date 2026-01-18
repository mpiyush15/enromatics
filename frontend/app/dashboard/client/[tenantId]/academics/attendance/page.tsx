"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";

interface Test {
  _id: string;
  name: string;
  subject: string;
  course: string;
  batch?: string;
  date: string;
  testDate: string;
  totalMarks: number;
  duration?: number;
  attendanceMarked?: boolean;
}

export default function TestAttendanceIndexPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const tenantId = params?.tenantId as string;

  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCourse, setFilterCourse] = useState("");
  const [filterBatch, setFilterBatch] = useState("");
  const [filterSubject, setFilterSubject] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (user) {
      fetchTests();
    }
  }, [user]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      setError(null);

      let url = `/api/academics/tests`;
      const query = new URLSearchParams();

      if (filterCourse) query.append("course", filterCourse);
      if (filterBatch) query.append("batch", filterBatch);
      if (filterSubject) query.append("subject", filterSubject);

      if (query.toString()) {
        url += `?${query.toString()}`;
      }

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();

      if (res.ok && data.success) {
        setTests(data.tests || []);
      } else {
        setError(data.message || "Failed to fetch tests");
      }
    } catch (err) {
      console.error("Error fetching tests:", err);
      setError("Failed to load tests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = tests.filter((test) => {
    if (searchQuery && !test.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !test.subject.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getTestStatusColor = (test: Test) => {
    const testDate = new Date(test.testDate || test.date);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - testDate.getTime()) / (1000 * 60 * 60 * 24));

    if (test.attendanceMarked) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (daysDiff > 7) {
      return 'bg-red-100 text-red-800 border-red-200';
    } else if (daysDiff > 0) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getTestStatus = (test: Test) => {
    const testDate = new Date(test.testDate || test.date);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - testDate.getTime()) / (1000 * 60 * 60 * 24));

    if (test.attendanceMarked) return 'Marked';
    if (daysDiff > 7) return 'Overdue';
    if (daysDiff > 0) return 'Pending';
    return 'Upcoming';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600">Loading tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Test Attendance</h1>
              <p className="text-gray-600 mt-1">Mark attendance for scheduled tests</p>
            </div>
            <button
              onClick={fetchTests}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
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

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Filter Tests</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search by name or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Filter by course"
              value={filterCourse}
              onChange={(e) => {
                setFilterCourse(e.target.value);
                fetchTests();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Filter by batch"
              value={filterBatch}
              onChange={(e) => {
                setFilterBatch(e.target.value);
                fetchTests();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Filter by subject"
              value={filterSubject}
              onChange={(e) => {
                setFilterSubject(e.target.value);
                fetchTests();
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tests Grid */}
        {filteredTests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Tests Found</h3>
            <p className="text-gray-500">No scheduled tests available or they don't match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests.map((test) => (
              <div
                key={test._id}
                onClick={() => router.push(`/dashboard/client/${tenantId}/academics/attendance/${test._id}`)}
                className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="font-semibold text-lg">{test.subject}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTestStatusColor(test)}`}>
                      {getTestStatus(test)}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg mb-1">{test.name}</h4>
                    <p className="text-sm text-gray-500">Total Marks: {test.totalMarks}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Course</p>
                      <p className="font-medium text-gray-900">{test.course}</p>
                    </div>
                    {test.batch && (
                      <div>
                        <p className="text-gray-500">Batch</p>
                        <p className="font-medium text-gray-900">{test.batch}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(test.testDate || test.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    {test.duration && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {test.duration} minutes
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 pb-4">
                  <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 group-hover:bg-blue-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    {test.attendanceMarked ? 'View Attendance' : 'Mark Attendance'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
