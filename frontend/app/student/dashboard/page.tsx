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
      if (res.ok) {
        setStudent(data);
      } else {
        setStatus(data.message || "Error loading profile");
      }
    } catch (err: any) {
      console.error(err);
      setStatus(err.message || "Error");
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
        { label: "📖 My Tests", href: "/student/tests" },
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
    <ClientDashboard userName={student.name} sidebarLinks={studentLinks}>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {student.name}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Roll No: {student.rollNumber || "N/A"} • {student.course || "N/A"} • {student.batchName || "N/A"}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Roll Number</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{student.rollNumber || "—"}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Course</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{student.course || "—"}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Batch</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{student.batchName || "—"}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Email</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1 truncate text-sm">{student.email || "—"}</p>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Summary</h2>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Fees</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{totalFees.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Paid</p>
              <p className="text-2xl font-bold text-green-600">₹{paidAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Balance</p>
              <p className="text-2xl font-bold text-orange-600">₹{remainingAmount.toLocaleString()}</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-2">
            <div
              className="bg-blue-600 h-2 rounded transition-all"
              style={{ width: `${Math.min(100, paymentPercentage)}%` }}
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <a href="/student/profile" className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Profile</p>
          </a>
          <a href="/student/attendance" className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Attendance</p>
          </a>
          <a href="/student/academics" className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Academics</p>
          </a>
          <a href="/student/fees" className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Fees</p>
          </a>
        </div>
      </div>
    </ClientDashboard>
  );
}
