"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function AccountsOverviewPage() {
  const params = useParams();
  const tenantId = params?.tenantId as string;
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const overview = data?.success ? data.overview : null;
  const expensesByCategory = data?.success ? data.expensesByCategory : {};
  const recentPayments = data?.success ? data.recentPayments : [];

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build URL with filters
      const queryParams = new URLSearchParams();
      if (dateFilter.startDate) queryParams.append("startDate", dateFilter.startDate);
      if (dateFilter.endDate) queryParams.append("endDate", dateFilter.endDate);

      const res = await fetch(`/api/accounts/overview?${queryParams.toString()}`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.statusText}`);
      }

      const responseData = await res.json();
      setData(responseData);
    } catch (err: any) {
      setError(err.message || "Failed to load accounts data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter.startDate, dateFilter.endDate]);

  if (loading) {
    return (
      <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Loading accounts data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || (data && !data.success)) {
    return (
      <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900 rounded-2xl shadow-lg p-8 border-l-4 border-red-600">
            <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">Error Loading Data</h2>
            <p className="text-red-700 dark:text-red-300 mb-4">{error || data?.message || "Failed to load"}</p>
            <button
              onClick={() => fetchOverview()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(amount);
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              💰 Accounts Overview
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Financial summary and analytics
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/dashboard/client/${tenantId}/accounts/add-payment`}>
              <button className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-medium shadow-md hover:shadow-lg transition-all">
                💰 Add Payment
              </button>
            </Link>
            <Link href={`/dashboard/client/${tenantId}/accounts/receipts`}>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium shadow-md hover:shadow-lg transition-all">
                🧾 Generate Receipt
              </button>
            </Link>
            <Link href={`/dashboard/client/${tenantId}/accounts/expenses`}>
              <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 font-medium shadow-md hover:shadow-lg transition-all">
                💸 Add Expense
              </button>
            </Link>
          </div>
        </div>

        {/* Date Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <button
              onClick={() => setDateFilter({ startDate: "", endDate: "" })}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition"
            >
              Clear Filter
            </button>
          </div>
        </div>

        {/* Main Stats */}
        {overview && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg text-white transform hover:scale-105 transition-transform cursor-default">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">💵</span>
                  <span className="text-sm bg-white/20 px-2 py-1 rounded">Income</span>
                </div>
                <div className="text-3xl font-bold mb-1">{formatCurrency(overview.totalFeesCollected)}</div>
                <div className="text-sm opacity-90">Total Fees Collected</div>
              </div>

              <Link href={`/dashboard/client/${tenantId}/accounts/fees-pending`}>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 shadow-lg text-white transform hover:scale-105 transition-transform cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">⏳</span>
                    <span className="text-sm bg-white/20 px-2 py-1 rounded">Pending</span>
                  </div>
                  <div className="text-3xl font-bold mb-1">{formatCurrency(overview.totalPending)}</div>
                  <div className="text-sm opacity-90 flex items-center gap-1">
                    Fees Pending
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>

              <Link href={`/dashboard/client/${tenantId}/accounts/expenses`}>
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 shadow-lg text-white transform hover:scale-105 transition-transform cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">💸</span>
                    <span className="text-sm bg-white/20 px-2 py-1 rounded">Expense</span>
                  </div>
                  <div className="text-3xl font-bold mb-1">{formatCurrency(overview.totalExpenses)}</div>
                  <div className="text-sm opacity-90 flex items-center gap-1">
                    Total Expenses
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg text-white transform hover:scale-105 transition-transform cursor-default">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">📊</span>
                  <span className="text-sm bg-white/20 px-2 py-1 rounded">Net</span>
                </div>
                <div className="text-3xl font-bold mb-1">{formatCurrency(overview.netIncome)}</div>
                <div className="text-sm opacity-90">Net Income</div>
              </div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                    <span className="text-2xl">🧾</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{overview.receiptsGenerated}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Receipts Generated</div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{overview.receiptsDelivered}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Receipts Delivered</div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
                    <span className="text-2xl">⏰</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{overview.receiptsPending}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Receipts Pending</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expenses Breakdown */}
            {Object.keys(expensesByCategory).length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  💸 Expenses by Category
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Object.entries(expensesByCategory).map(([category, amount]: [string, any]) => (
                    <div key={category} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 capitalize mb-1">
                        {category}
                      </div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Payments */}
            {recentPayments.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      📜 Recent Payments
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Showing last 10 entries
                    </p>
                  </div>
                  <Link href={`/dashboard/client/${tenantId}/accounts/transactions`}>
                    <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 font-medium shadow-md hover:shadow-lg transition-all flex items-center gap-2">
                      📊 View All Transactions
                    </button>
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">
                          Method
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">
                          Receipt
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {recentPayments.slice(0, 10).map((payment: any) => (
                        <tr key={payment._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {new Date(payment.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {payment.studentId?.name || "N/A"}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {payment.studentId?.rollNumber || ""}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 uppercase">
                              {payment.method}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {payment.receiptGenerated ? (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                ✓ Generated
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {/* View Eye Icon */}
                              {payment.studentId?._id && (
                                <Link href={`/dashboard/client/${tenantId}/students/${payment.studentId._id}`}>
                                  <button
                                    className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition group relative"
                                    title="View Student Details"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                      View Student
                                    </span>
                                  </button>
                                </Link>
                              )}
                              {/* View Receipt Icon */}
                              {payment.receiptGenerated && (
                                <Link href={`/dashboard/client/${tenantId}/accounts/receipts?search=${payment.studentId?.rollNumber}`}>
                                  <button
                                    className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition group relative"
                                    title="View Receipt"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                      View Receipt
                                    </span>
                                  </button>
                                </Link>
                              )}
                              {/* Download Icon */}
                              {payment.receiptGenerated && (
                                <button
                                  onClick={() => window.open(`/dashboard/client/${tenantId}/accounts/receipts?search=${payment.studentId?.rollNumber}`, '_blank')}
                                  className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition group relative"
                                  title="Download Receipt"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    Download
                                  </span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
