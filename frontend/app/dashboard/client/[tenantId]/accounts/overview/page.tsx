"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/apiConfig";

export default function AccountsOverviewPage() {
  const { tenantId } = useParams();
  const [overview, setOverview] = useState<any>(null);
  const [expensesByCategory, setExpensesByCategory] = useState<any>({});
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: ""
  });

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateFilter.startDate) params.append("startDate", dateFilter.startDate);
      if (dateFilter.endDate) params.append("endDate", dateFilter.endDate);

      const res = await fetch(`${API_BASE_URL}/api/accounts/overview?${params.toString()}`, {
        credentials: "include"
      });

      const data = await res.json();
      if (data.success) {
        setOverview(data.overview);
        setExpensesByCategory(data.expensesByCategory);
        setRecentPayments(data.recentPayments);
      }
    } catch (err) {
      console.error("Failed to fetch overview:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [dateFilter]);

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
          <div className="flex gap-2">
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
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">💵</span>
                  <span className="text-sm bg-white/20 px-2 py-1 rounded">Income</span>
                </div>
                <div className="text-3xl font-bold mb-1">{formatCurrency(overview.totalFeesCollected)}</div>
                <div className="text-sm opacity-90">Total Fees Collected</div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 shadow-lg text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">⏳</span>
                  <span className="text-sm bg-white/20 px-2 py-1 rounded">Pending</span>
                </div>
                <div className="text-3xl font-bold mb-1">{formatCurrency(overview.totalPending)}</div>
                <div className="text-sm opacity-90">Fees Pending</div>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 shadow-lg text-white transform hover:scale-105 transition-transform">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">💸</span>
                  <span className="text-sm bg-white/20 px-2 py-1 rounded">Expense</span>
                </div>
                <div className="text-3xl font-bold mb-1">{formatCurrency(overview.totalExpenses)}</div>
                <div className="text-sm opacity-90">Total Expenses</div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg text-white transform hover:scale-105 transition-transform">
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
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    📜 Recent Payments
                  </h2>
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
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {recentPayments.map((payment) => (
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
