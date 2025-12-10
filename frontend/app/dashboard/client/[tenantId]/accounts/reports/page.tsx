"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useDashboardData } from "@/hooks/useDashboardData";

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
  const params = useParams();
  const tenantId = params?.tenantId as string;
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: ""
  });

  // Build query string for SWR
  const queryParams = new URLSearchParams();
  if (dateFilter.startDate) queryParams.set("startDate", dateFilter.startDate);
  if (dateFilter.endDate) queryParams.set("endDate", dateFilter.endDate);
  
  const reportsUrl = `/api/accounts/reports${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  // ✅ SWR: Auto-caching financial reports with dynamic date filters
  const { data: response, isLoading: loading } = useDashboardData<ReportResponse>(
    tenantId ? reportsUrl : null
  );

  const summary = response?.summary || {
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    expensesByCategory: {},
    monthlyData: [],
    topExpenseCategories: [],
  };

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl p-8 text-white mb-6">
          <h1 className="text-4xl font-bold mb-2">📊 Financial Reports</h1>
          <p className="text-blue-100">Comprehensive profit & loss analysis</p>
        </div>

        {/* Date Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Income */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-green-100 text-sm mb-1">Total Income</p>
                <p className="text-3xl font-bold">{formatCurrency(summary.totalIncome)}</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-green-100 text-xs">Revenue from all sources</p>
          </div>

          {/* Total Expenses */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-red-100 text-sm mb-1">Total Expenses</p>
                <p className="text-3xl font-bold">{formatCurrency(summary.totalExpenses)}</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <p className="text-red-100 text-xs">Operating costs & expenses</p>
          </div>

          {/* Net Profit */}
          <div className={`bg-gradient-to-br rounded-2xl shadow-xl p-6 text-white ${
            summary.netProfit >= 0 
              ? "from-emerald-500 to-emerald-600" 
              : "from-orange-500 to-orange-600"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className={`text-sm mb-1 ${summary.netProfit >= 0 ? "text-emerald-100" : "text-orange-100"}`}>
                  Net Profit
                </p>
                <p className="text-3xl font-bold">{formatCurrency(summary.netProfit)}</p>
              </div>
              <div className={`p-3 bg-white bg-opacity-20 rounded-xl`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className={`text-xs ${summary.netProfit >= 0 ? "text-emerald-100" : "text-orange-100"}`}>
              {summary.netProfit >= 0 ? "Your institute is profitable" : "Expenses exceed income"}
            </p>
          </div>

          {/* Profit Margin */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-blue-100 text-sm mb-1">Profit Margin</p>
                <p className="text-3xl font-bold">{formatPercentage(summary.profitMargin)}</p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-xl">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8L5.257 19.393A2 2 0 005 18.21V5a2 2 0 012-2h8a2 2 0 012 2z" />
                </svg>
              </div>
            </div>
            <p className="text-blue-100 text-xs">Profit as % of income</p>
          </div>
        </div>

        {/* Top Expense Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-3xl">📊</span>
            Top Expense Categories
          </h2>
          
          {summary.topExpenseCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No expense data available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {summary.topExpenseCategories.map((category, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-32">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                      {category.category}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {formatCurrency(category.amount)}
                    </div>
                  </div>
                  
                  <div className="flex-grow">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 w-16 text-right">
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatPercentage(category.percentage)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly Trends */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-3xl">📈</span>
            Monthly Trends
          </h2>

          {summary.monthlyData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No monthly data available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Month</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Income</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Expenses</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Profit</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {summary.monthlyData.map((month, index) => {
                    const margin = month.income > 0 ? (month.profit / month.income) * 100 : 0;
                    return (
                      <tr
                        key={index}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-800/50"
                        }`}
                      >
                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                          {month.month}
                        </td>
                        <td className="text-right py-3 px-4 text-green-600 dark:text-green-400 font-semibold">
                          {formatCurrency(month.income)}
                        </td>
                        <td className="text-right py-3 px-4 text-red-600 dark:text-red-400 font-semibold">
                          {formatCurrency(month.expenses)}
                        </td>
                        <td className="text-right py-3 px-4 font-semibold">
                          <span className={month.profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-orange-600 dark:text-orange-400"}>
                            {formatCurrency(month.profit)}
                          </span>
                        </td>
                        <td className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Link href={`/dashboard/client/${tenantId}/accounts/overview`}>
            <button className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg hover:shadow-xl transition-all">
              📊 Overview
            </button>
          </Link>
          <Link href={`/dashboard/client/${tenantId}/accounts/expenses`}>
            <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 font-semibold shadow-lg hover:shadow-xl transition-all">
              💸 Expenses
            </button>
          </Link>
          <Link href={`/dashboard/client/${tenantId}/accounts/refunds`}>
            <button className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 font-semibold shadow-lg hover:shadow-xl transition-all">
              💰 Refunds
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
