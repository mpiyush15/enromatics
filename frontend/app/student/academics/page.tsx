"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClientDashboard from "@/components/dashboard/ClientDashboard";
import StatCard from "@/components/dashboard/StatCard";
import { getTenantFromBrowser } from "@/lib/middleware/tenantContext";
import { 
  BookOpen, 
  TrendingUp, 
  Calendar,
  Award,
  Target,
  CheckCircle,
  Clock
} from "lucide-react";

interface AcademicData {
  batchName: string;
  courses: Array<{ name: string; progress: number }>;
  averageScore?: number;
  totalClasses?: number;
  classesAttended?: number;
}

export default function AcademicsPage() {
  const router = useRouter();
  const [tenant, setTenant] = useState<string | null>(null);
  const [academics, setAcademics] = useState<AcademicData | null>(null);
  const [studentName, setStudentName] = useState("Student");
  const [loading, setLoading] = useState(true);

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

    // Fetch student name
    const fetchStudent = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;
        
        const res = await fetch("http://localhost:5050/api/student-auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.ok) {
          const data = await res.json();
          setStudentName(data.name || "Student");
        }
      } catch (err) {
        console.error("Failed to fetch student:", err);
      }
    };

    fetchStudent();
    fetchAcademics();
  }, [router]);

  const fetchAcademics = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setLoading(false);
        return;
      }
      
      const res = await fetch("/api/student/academics", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch academics");
      }

      const data = await res.json();
      setAcademics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ClientDashboard userName={studentName} sidebarLinks={studentLinks}>
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </ClientDashboard>
    );
  }

  return (
    <ClientDashboard userName={studentName} sidebarLinks={studentLinks}>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Academics</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{academics?.batchName || "Not assigned"}</p>
        </div>

        {academics ? (
          <div className="space-y-6">
            {/* Stats */}
            {(academics.averageScore !== undefined || academics.classesAttended !== undefined) && (
              <div className="grid grid-cols-2 gap-4">
                {academics.averageScore !== undefined && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Average Score</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {academics.averageScore.toFixed(1)}%
                    </p>
                  </div>
                )}
                {academics.classesAttended !== undefined && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Attendance</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                      {academics.classesAttended}/{academics.totalClasses}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Courses */}
            {academics.courses && academics.courses.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Courses</h2>
                <div className="space-y-3">
                  {academics.courses.map((course, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">{course.name}</span>
                        <span className="text-gray-600 dark:text-gray-400">{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">No academic data available</p>
          </div>
        )}
      </div>
    </ClientDashboard>
  );
}
