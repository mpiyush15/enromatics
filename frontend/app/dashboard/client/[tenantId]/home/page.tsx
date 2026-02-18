"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function TenantHomePage() {
  const { tenantId } = useParams();
  const router = useRouter();

  const quickActions = [
    {
      title: "💰 Collect Fees",
      description: "Search students and record payments",
      href: `/dashboard/client/${tenantId}/accounts/receipts`,
      color: "from-green-500 to-green-600"
    },
    {
      title: "📊 Accounts Overview",
      description: "View financial summary and reports",
      href: `/dashboard/client/${tenantId}/accounts/overview`,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "🎓 All Students",
      description: "View and manage student records",
      href: `/dashboard/client/${tenantId}/students`,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "📅 Daily Attendance",
      description: "Mark daily batch attendance",
      href: `/dashboard/client/${tenantId}/students/attendance`,
      color: "from-orange-500 to-orange-600"
    },
    {
      title: "🎯 Scholarship Exams",
      description: "Manage entrance exams and registrations",
      href: `/dashboard/client/${tenantId}/scholarship-exams`,
      color: "from-pink-500 to-pink-600"
    },
    {
      title: "💸 Add Expense",
      description: "Record new expenses",
      href: `/dashboard/client/${tenantId}/accounts/expenses`,
      color: "from-red-500 to-red-600"
    }
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            🏠 Tenant Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Quick access to all your management tools
          </p>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="group"
            >
              <div className={`bg-gradient-to-br ${action.color} rounded-2xl p-6 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200 cursor-pointer h-full`}>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {action.title}
                </h3>
                <p className="text-white/90 text-sm">
                  {action.description}
                </p>
                <div className="mt-4 flex items-center text-white font-semibold group-hover:translate-x-2 transition-transform">
                  <span className="mr-2">Go to</span>
                  <span className="text-xl">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <span className="text-xl">💡</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quick Tip
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Use the <strong>"Collect Fees"</strong> button to quickly search students by name, roll number, or batch and record their fee payments with instant receipt generation.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                <span className="text-xl">📈</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Performance
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              View your <strong>Accounts Overview</strong> for detailed financial analytics, including total collections, pending fees, expenses, and net income reports.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
