"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClientDashboard from "@/components/dashboard/ClientDashboard";

export default function StudentDashboardPage() {
  const router = useRouter();
  const [student, setStudent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const fetchProfile = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`/api/student-auth/me`, { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Not authenticated");
      setStudent(data);
    } catch (err: any) {
      console.error(err);
      setStatus(err.message || "Error");
      setTimeout(() => router.push("/student/login"), 800);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Student sidebar menu - only student-specific routes
  const studentLinks = [
    { href: "/student/dashboard", label: "🏠 Dashboard" },
    { href: "/student/profile", label: "🧑‍💻 My Profile" },
    { href: "/student/attendance", label: "📅 My Attendance" },
    { href: "/student/fees", label: "💳 Fees & Payments" },
    { 
      label: "📚 Academics",
      href: "#",
      children: [
        { label: "� Test Schedule", href: "/student/test-schedule" },
        { label: "�📖 My Tests", href: "/student/my-tests" },
        { label: "📊 Test Reports", href: "/student/test-reports" },
      ]
    },
  ];

  // Show loading state within the dashboard layout to avoid hydration mismatch
  if (loading) {
    return (
      <ClientDashboard userName="Loading..." sidebarLinks={studentLinks}>
        <div className="p-6 max-w-4xl mx-auto">
          <p className="text-gray-500">Loading your profile...</p>
        </div>
      </ClientDashboard>
    );
  }

  // Show error state within the dashboard layout
  if (!student) {
    return (
      <ClientDashboard userName="Student" sidebarLinks={studentLinks}>
        <div className="p-6 max-w-4xl mx-auto">
          <p className="text-red-600">{status || 'Not authenticated'}</p>
          <p className="text-sm text-gray-500 mt-2">Redirecting to login...</p>
        </div>
      </ClientDashboard>
    );
  }

  const totalFees = student.fees ?? 0;
  const paidAmount = student.balance ?? 0;
  const remainingAmount = totalFees - paidAmount;
  const paymentPercentage = totalFees > 0 ? (paidAmount / totalFees) * 100 : 0;

  return (
    // Reuse admin ClientDashboard so student UI matches admin dashboard
    <ClientDashboard userName={student.name} sidebarLinks={studentLinks}>
      <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white/30">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Welcome back, {student.name}! 👋
                </h1>
                <p className="text-blue-100 text-sm md:text-base">
                  {student.rollNumber} • {student.course} • {student.batchName}
                </p>
              </div>
            </div>
          </div>

          {/* Profile Info Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">📋 Profile Information</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">📧</div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{student.email}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🔢</div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Roll Number</div>
                      <div className="text-sm font-mono font-bold text-gray-900 dark:text-white mt-1 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg w-fit">
                        {student.rollNumber || "Not Assigned"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">📚</div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Course</div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{student.course}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🎓</div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Batch</div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{student.batchName}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">📍</div>
                    <div className="flex-1">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Address</div>
                      <div className="text-sm text-gray-900 dark:text-white mt-1">{student.address || "Not provided"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fees Summary Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">💰 Fees Summary</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
                  <div className="text-sm opacity-90 font-medium mb-2">Total Fees</div>
                  <div className="text-3xl font-bold">₹{totalFees.toLocaleString()}</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
                  <div className="text-sm opacity-90 font-medium mb-2">Paid Amount</div>
                  <div className="text-3xl font-bold">₹{paidAmount.toLocaleString()}</div>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
                  <div className="text-sm opacity-90 font-medium mb-2">Remaining</div>
                  <div className="text-3xl font-bold">₹{remainingAmount.toLocaleString()}</div>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Payment Progress</span>
                  <span className="font-bold text-gray-900 dark:text-white">{paymentPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: `${Math.min(100, paymentPercentage)}%` }}
                  >
                    {paymentPercentage > 10 && (
                      <span className="text-xs font-bold text-white">
                        {paymentPercentage.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment History Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">📜 Payment History</h2>
              </div>
            </div>
            <div className="p-6">
              {!student.payments || student.payments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">💳</div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    No Payments Yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your payment history will appear here once you make your first payment.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                          Receipt
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {student.payments.map((p: any, index: number) => (
                        <tr
                          key={p._id}
                          className={`hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors ${
                            index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-800/50"
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            📅 {new Date(p.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-lg font-bold text-green-600 dark:text-green-400">
                              ₹{p.amount.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {p.method}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                p.status === "success"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : p.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              }`}
                            >
                              {p.status === "success" ? "✓ " : p.status === "pending" ? "⏳ " : "✗ "}
                              {p.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <a
                              href={`/api/payments/${p._id}/receipt/download`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 font-medium shadow-md hover:shadow-lg transition-all transform hover:scale-105 text-sm"
                            >
                              📥 Download
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ClientDashboard>
  );
}
