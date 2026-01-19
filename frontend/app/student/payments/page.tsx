"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClientDashboard from "@/components/dashboard/ClientDashboard";
import { API_BASE_URL } from "@/lib/apiConfig";

export default function PaymentsPage() {
  const router = useRouter();
  const [student, setStudent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const studentLinks = [
    { href: "/student/home", label: "🏠 Dashboard" },
    { href: "/student/profile", label: "🧑‍💻 My Profile" },
    { href: "/student/attendance", label: "📅 My Attendance" },
    { href: "/student/fees", label: "💳 Fees & Payments" },
    { 
      label: "📚 Academics",
      href: "#",
      children: [
        { label: "📝 Test Schedule", href: "/student/test-schedule" },
        { label: "📖 My Tests", href: "/student/tests" },
      ]
    },
  ];

  const fetchData = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
      if (!token) {
        setStatus("Not authenticated");
        setLoading(false);
        console.error("❌ No token in localStorage");
        return;
      }

      console.log("🔑 Token found, fetching from /api/student-auth/me");
      const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      };

      const res = await fetch(`${API_BASE_URL}/api/student-auth/me`, { headers });
      
      if (!res.ok) {
        console.error(`❌ API Error ${res.status}:`, res.statusText);
        const errorData = await res.json();
        console.error("Error response:", errorData);
        setStatus(`Failed to load (${res.status})`);
        setLoading(false);
        return;
      }

      const data = await res.json();

      console.log("✅ Student data with payments:", {
        name: data.name,
        email: data.email,
        fees: data.fees,
        balance: data.balance,
        paymentsCount: data.payments?.length || 0,
        payments: data.payments || []
      });
      
      if (!data.payments || data.payments.length === 0) {
        console.warn("⚠️  No payments in response - empty array or null");
      }

      setStudent(data);
      setStatus("");
    } catch (err: any) {
      console.error("❌ Fetch error:", err.message);
      setStatus(err.message || "Error loading data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <ClientDashboard userName="Loading..." sidebarLinks={studentLinks}>
        <div className="p-6 max-w-4xl mx-auto">
          <p className="text-gray-500">Loading payment history...</p>
        </div>
      </ClientDashboard>
    );
  }

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
  const balance = student.balance ?? 0;
  const totalPaid = totalFees - balance;
  const paymentPercentage = totalFees > 0 ? (totalPaid / totalFees) * 100 : 0;
  const payments = student.payments ?? [];

  return (
    <ClientDashboard userName={student.name} sidebarLinks={studentLinks}>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fees & Payments</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">View your payment history and receipts</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Total Fees</p>
            <p className="text-3xl font-bold text-blue-600">
              ₹{totalFees.toLocaleString()}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Total Paid</p>
            <p className="text-3xl font-bold text-green-600">
              ₹{totalPaid.toLocaleString()}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Balance Due</p>
            <p className={`text-3xl font-bold ${balance > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              ₹{balance.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Payment Progress</p>
            <p className="text-sm font-bold text-blue-600">{paymentPercentage.toFixed(1)}%</p>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${paymentPercentage}%` }}
            />
          </div>
        </div>

        {/* Payment History Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment History</h2>
          
          {payments && payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Method</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((txn: any) => (
                    <tr key={txn._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-4 px-4 text-gray-800 dark:text-gray-200">
                        {txn.date ? new Date(txn.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        }) : "—"}
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white">
                        ₹{txn.amount ? txn.amount.toLocaleString() : "0"}
                      </td>
                      <td className="py-4 px-4 text-gray-600 dark:text-gray-400 capitalize">
                        {txn.method || "—"}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          txn.status === "success" || txn.status === "completed"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                            : txn.status === "pending" 
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" 
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}>
                          {txn.status || "—"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {txn.receiptUrl || txn.invoiceUrl ? (
                          <a
                            href={txn.receiptUrl || txn.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                          >
                            📄 View
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">No payment history yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Payments created by your institute will appear here</p>
            </div>
          )}
        </div>
      </div>
    </ClientDashboard>
  );
}

