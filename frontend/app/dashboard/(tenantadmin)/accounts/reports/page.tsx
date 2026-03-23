"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";

interface ReportResponse {
  success: boolean;
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    expensesByCategory: Record<string, number>;
    monthlyData: Array<{
      month: string;
      income: number;
      expenses: number;
      profit: number;
    }>;
    topExpenseCategories: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
  };
}

export default function AccountsReportsPage() {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "";
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: ""
  });
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState<ReportResponse | null>(null);

  const summary = response?.summary || {
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    expensesByCategory: {},
    monthlyData: [],
    topExpenseCategories: [],
  };

  const fetchReports = async () => {
    try {
      setLoading(true);

      // Build query string
      const queryParams = new URLSearchParams();
      if (dateFilter.startDate) queryParams.set("startDate", dateFilter.startDate);
      if (dateFilter.endDate) queryParams.set("endDate", dateFilter.endDate);
      
      const reportsUrl = `/api/accounts/reports${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

      const res = await fetch(reportsUrl, {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setResponse(data);
      }
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) {
      fetchReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId, dateFilter.startDate, dateFilter.endDate]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return value.toFixed(2) + "%";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Loading financial reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">Financial Reports</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">P&L analysis and financial metrics</p>
        </div>

        {/* Date Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                Start Date
              </label>
              <input
                type="date"
                value={dateFilter.startDate}
                onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                End Date
              </label>
              <input
                type="date"
                value={dateFilter.endDate}
                onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-gray-400 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <button
              onClick={() => setDateFilter({ startDate: "", endDate: "" })}
              className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Key Metrics - Minimal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Income */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Total Income</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{formatCurrency(summary.totalIncome)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">Revenue from all sources</p>
          </div>

          {/* Total Expenses */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Total Expenses</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{formatCurrency(summary.totalExpenses)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">Operating costs</p>
          </div>

          {/* Net Profit */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Net Profit</p>
            <p className={`text-2xl font-semibold mb-2 ${summary.netProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
              {formatCurrency(summary.netProfit)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">{summary.netProfit >= 0 ? "Profitable" : "Loss"}</p>
          </div>

          {/* Profit Margin */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Profit Margin</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">{formatPercentage(summary.profitMargin)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-500">% of income</p>
          </div>
        </div>

        {/* Top Expense Categories */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Expense Categories</h2>
          
          {summary.topExpenseCategories.length === 0 ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">No expense data available</p>
          ) : (
            <div className="space-y-3">
              {summary.topExpenseCategories.map((category: any, index: number) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">{category.category}</span>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">{formatCurrency(category.amount)}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-900 dark:bg-gray-300 transition-all duration-300"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{formatPercentage(category.percentage)} of total</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly Trends Table */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Trends</h2>
          </div>

          {summary.monthlyData.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">No monthly data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="text-left py-3 px-6 font-semibold text-gray-900 dark:text-white">Month</th>
                    <th className="text-right py-3 px-6 font-semibold text-gray-900 dark:text-white">Income</th>
                    <th className="text-right py-3 px-6 font-semibold text-gray-900 dark:text-white">Expenses</th>
                    <th className="text-right py-3 px-6 font-semibold text-gray-900 dark:text-white">Profit</th>
                    <th className="text-right py-3 px-6 font-semibold text-gray-900 dark:text-white">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {summary.monthlyData.map((month: any, index: number) => {
                    const margin = month.income > 0 ? (month.profit / month.income) * 100 : 0;
                    return (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="py-3 px-6 text-gray-900 dark:text-white font-medium">
                          {month.month}
                        </td>
                        <td className="py-3 px-6 text-right text-gray-900 dark:text-white">
                          {formatCurrency(month.income)}
                        </td>
                        <td className="py-3 px-6 text-right text-gray-900 dark:text-white">
                          {formatCurrency(month.expenses)}
                        </td>
                        <td className={`py-3 px-6 text-right font-medium ${month.profit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                          {formatCurrency(month.profit)}
                        </td>
                        <td className="py-3 px-6 text-right text-gray-900 dark:text-white">
                          {formatPercentage(margin)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
