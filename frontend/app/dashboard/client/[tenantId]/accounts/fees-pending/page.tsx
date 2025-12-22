"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function FeesPendingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const tenantId = params?.tenantId as string;
  const initialBatch = searchParams?.get("batch") || "";

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    batch: initialBatch,
    course: "",
    minAmount: "",
  });
  const [availableBatches, setAvailableBatches] = useState<string[]>([]);
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);

  const fetchFeesPending = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.batch) params.append("batch", filters.batch);
      if (filters.course) params.append("course", filters.course);
      if (filters.minAmount) params.append("minAmount", filters.minAmount);

      const res = await fetch(`/api/accounts/fees-pending?${params.toString()}`, {
        credentials: "include",
      });

      const data = await res.json();
      if (data.success) {
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error("Failed to fetch fees pending:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFiltersData = async () => {
    try {
      // Fetch batches
      const batchRes = await fetch(`/api/academics/batches`, {
        credentials: "include",
      });
      const batchData = await batchRes.json();
      if (batchData.success) {
        const uniqueBatches = [...new Set(batchData.batches.map((b: any) => b.name))];
        setAvailableBatches(uniqueBatches as string[]);
      }

      // Fetch courses
      const courseRes = await fetch(`/api/academics/courses`, {
        credentials: "include",
      });
      const courseData = await courseRes.json();
      if (courseData.success) {
        const uniqueCourses = [...new Set(courseData.courses.map((c: any) => c.name))];
        setAvailableCourses(uniqueCourses as string[]);
      }
    } catch (err) {
      console.error("Failed to fetch filters:", err);
    }
  };

  useEffect(() => {
    fetchFiltersData();
  }, []);

  useEffect(() => {
    fetchFeesPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.batch, filters.course, filters.minAmount]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const totalPending = students.reduce((sum, s) => sum + (s.pendingAmount || 0), 0);
  const totalFees = students.reduce((sum, s) => sum + (s.fees || 0), 0);

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              ⏳ Fees Pending Students
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Students with outstanding fee payments
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/client/${tenantId}/accounts/add-payment`}>
              <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-medium shadow-md hover:shadow-lg transition-all">
                💰 Add Payment
              </button>
            </Link>
            <Link href={`/dashboard/client/${tenantId}/accounts/overview`}>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition">
                ← Back to Overview
              </button>
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 shadow-lg text-white">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-3xl font-bold">{students.length}</div>
            <div className="text-sm opacity-90">Students with Pending Fees</div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 shadow-lg text-white">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-3xl font-bold">{formatCurrency(totalPending)}</div>
            <div className="text-sm opacity-90">Total Pending Amount</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg text-white">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-3xl font-bold">{formatCurrency(totalFees)}</div>
            <div className="text-sm opacity-90">Total Fees (All Students)</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">🔍 Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Batch
              </label>
              <select
                value={filters.batch}
                onChange={(e) => setFilters({ ...filters, batch: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Batches</option>
                {availableBatches.map((batch) => (
                  <option key={batch} value={batch}>
                    {batch}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Course
              </label>
              <select
                value={filters.course}
                onChange={(e) => setFilters({ ...filters, course: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Courses</option>
                {availableCourses.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Min Pending Amount
              </label>
              <input
                type="number"
                value={filters.minAmount}
                onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                placeholder="e.g., 5000"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ batch: "", course: "", minAmount: "" })}
                className="w-full px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Students Table */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-orange-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No Pending Fees!
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              All students have cleared their fees or no students match the filters.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                📋 Students List ({students.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">
                      Batch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">
                      Total Fees
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">
                      Paid
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">
                      Pending
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {students.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                            {student.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {student.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {student.rollNumber}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {student.batch || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {student.course || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900 dark:text-white">
                        {formatCurrency(student.fees || 0)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(student.balance || 0)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-red-600 dark:text-red-400">
                        {formatCurrency(student.pendingAmount || 0)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/client/${tenantId}/students/${student._id}`}>
                            <button
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition"
                              title="View Student Details"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </Link>
                          <Link href={`/dashboard/client/${tenantId}/accounts/receipts?search=${student.rollNumber}`}>
                            <button
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 rounded-lg transition"
                              title="Add Payment / Collect Fee"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          </Link>
                          <Link href={`/dashboard/client/${tenantId}/accounts/receipts`}>
                            <button
                              className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900 rounded-lg transition"
                              title="View Payment History"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
