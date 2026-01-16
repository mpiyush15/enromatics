"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClientDashboard from "@/components/dashboard/ClientDashboard";
import { getTenantFromBrowser } from "@/lib/middleware/tenantContext";

interface StudentData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  course?: string;
  batch?: string;
  fees?: number;
  balance?: number;
  rollNumber?: string;
  status?: string;
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const [tenant, setTenant] = useState<string | null>(null);
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);

  // Student sidebar navigation links
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
        { label: "📖 My Tests", href: "/student/my-tests" },
        { label: "📊 Test Reports", href: "/student/test-reports" },
      ]
    },
  ];

  useEffect(() => {
    const tenantSubdomain = getTenantFromBrowser();
    setTenant(tenantSubdomain);

    if (!tenantSubdomain) {
      router.push("/student/login");
      return;
    }

    fetchStudentData();
  }, [router]);

  const fetchStudentData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.error("❌ No auth token found in localStorage");
        router.push("/student/login");
        return;
      }

      console.log("🔑 Token found, fetching student data from /api/student-auth/me...");
      const res = await fetch("http://localhost:5050/api/student-auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error(`❌ API Error: ${res.status} ${res.statusText}`);
        if (res.status === 401) {
          console.error("❌ Unauthorized - Token may be invalid");
          router.push("/student/login");
        }
        throw new Error("Failed to fetch profile");
      }

      const data = await res.json();
      console.log("✅ Student data loaded:", {
        name: data.name || data.student?.name,
        email: data.email || data.student?.email,
        rollNumber: data.rollNumber || data.student?.rollNumber,
        fees: data.fees || data.student?.fees,
        balance: data.balance || data.student?.balance,
        paymentsCount: data.payments?.length || 0,
        course: data.course || data.student?.course,
        batch: data.batch || data.student?.batch
      });

      if (data.payments && data.payments.length > 0) {
        console.log(`✅ Found ${data.payments.length} payment records`);
        data.payments.forEach((p: any, i: number) => {
          console.log(`  ${i + 1}. ₹${p.amount} - ${new Date(p.date).toLocaleDateString()} (${p.status})`);
        });
      } else {
        console.warn("⚠️  No payments found");
      }

      setStudent(data.student || data);
    } catch (err) {
      console.error("Error fetching student data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("authToken");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    
    // Clear token cookie
    document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
    
    router.push("/student/login");
  };

  if (loading) {
    return (
      <ClientDashboard userName="Loading..." sidebarLinks={studentLinks}>
        <div className="p-6 max-w-6xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </ClientDashboard>
    );
  }

  if (!student) {
    return (
      <ClientDashboard userName="Student" sidebarLinks={studentLinks}>
        <div className="p-6 max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Failed to load student data</p>
          </div>
        </div>
      </ClientDashboard>
    );
  }

  const totalFees = student.fees || 0;
  const balance = student.balance || 0;
  const paidAmount = totalFees - balance;

  return (
    <ClientDashboard 
      userName={student.name || "Student"} 
      sidebarLinks={studentLinks}
      user={student}
    >
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {student.name}</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Roll No: {student.rollNumber || "N/A"} • {student.course || "N/A"} • {student.batch || "N/A"}</p>
        </div>

        {/* Stats Grid - Minimal */}
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
            <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">{student.batch || "—"}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Status</p>
            <p className={`text-lg font-semibold mt-1 ${student.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
              {student.status || "Unknown"}
            </p>
          </div>
        </div>

        {/* Fees Section */}
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
              <p className="text-2xl font-bold text-orange-600">₹{balance.toLocaleString()}</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-2">
            <div
              className="bg-blue-600 h-2 rounded transition-all"
              style={{ width: `${totalFees > 0 ? (paidAmount / totalFees) * 100 : 0}%` }}
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
          <a href="/student/test-schedule" className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Tests</p>
          </a>
          <a href="/student/fees" className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-md transition text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Fees</p>
          </a>
        </div>

        {/* Contact Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Info</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Email</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{student.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Phone</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{student.phone || "Not provided"}</p>
            </div>
          </div>
        </div>
      </div>
    </ClientDashboard>
  );
}
