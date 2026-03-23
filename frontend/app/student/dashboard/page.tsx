"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { Home, BookOpen, FileText, TrendingUp, LogOut, Menu, X, Sun, Moon } from "lucide-react";

interface StudentData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  rollNumber: string;
  course: string;
  batch: string;
  fees: number;
  balance: number;
  status: string;
  joinDate: string;
}

interface StudentStats {
  attendance: number;
  totalClasses: number;
  marks: number;
  courseName: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"home" | "profile" | "tests" | "lessons" | "progress">("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check saved theme preference or system preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDark(savedTheme === "dark");
    } else {
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }, []);

  useEffect(() => {
    // Update HTML class and localStorage
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/tenant/login");
      return;
    }

    if (user && user.role?.toLowerCase() !== "student" && !user.isStudent) {
      router.push("/dashboard/home");
      return;
    }

    fetchStudentData();
  }, [user, authLoading, router]);

  const fetchStudentData = async () => {
    try {
      const res = await fetch("/api/student/profile", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch student data");
      }

      const data = await res.json();
      setStudent(data.student);
      setStats(data.stats);
    } catch (err: any) {
      console.error("Error fetching student data:", err);
      setError(err.message || "Failed to load student data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      localStorage.removeItem("token");
      router.push("/tenant/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={() => router.push("/tenant/login")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No student data found</p>
        </div>
      </div>
    );
  }

  const feesPercentage = student.fees > 0 ? ((student.fees - student.balance) / student.fees) * 100 : 0;

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      {/* Sidebar - Overlay on top */}
      <div 
        onMouseEnter={() => setSidebarOpen(true)}
        onMouseLeave={() => setSidebarOpen(false)}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed h-screen left-0 top-0 transition-all duration-300 z-50 flex flex-col cursor-pointer md:cursor-default ${
          sidebarOpen 
            ? isDark 
              ? "w-60 md:w-64" 
              : "w-60 md:w-64" 
            : "w-16 md:w-20"
        }`}
        style={{
          background: sidebarOpen
            ? isDark
              ? "linear-gradient(to right, rgba(31, 41, 55, 0.85), rgba(31, 41, 55, 0))"
              : "linear-gradient(to right, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0))"
            : "transparent",
          backdropFilter: sidebarOpen ? "blur(12px)" : "none"
        }}
      >

        {/* Sidebar Header */}
        <div className={`p-4 flex items-center justify-center transition-all duration-300 ${sidebarOpen ? "border-b border-gray-200 dark:border-gray-700" : ""}`}>
          {sidebarOpen && <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400">Shree</h2>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <NavItem
            icon={<Home size={20} />}
            label="Home"
            active={activeTab === "home"}
            collapsed={!sidebarOpen}
            onClick={() => setActiveTab("home")}
          />
          <NavItem
            icon={<BookOpen size={20} />}
            label="Lessons"
            active={activeTab === "lessons"}
            collapsed={!sidebarOpen}
            onClick={() => setActiveTab("lessons")}
          />
          <NavItem
            icon={<FileText size={20} />}
            label="Tests"
            active={activeTab === "tests"}
            collapsed={!sidebarOpen}
            onClick={() => setActiveTab("tests")}
          />
          <NavItem
            icon={<TrendingUp size={20} />}
            label="Progress"
            active={activeTab === "progress"}
            collapsed={!sidebarOpen}
            onClick={() => setActiveTab("progress")}
          />
          <NavItem
            icon={<Home size={20} />}
            label="My Profile"
            active={activeTab === "profile"}
            collapsed={!sidebarOpen}
            onClick={() => setActiveTab("profile")}
          />
        </nav>

        {/* Logout */}
        <div className={`p-4 transition-all duration-300 ${sidebarOpen ? "border-t border-gray-200 dark:border-gray-700" : ""}`}>
          <button
            onClick={() => setIsDark(!isDark)}
            className={`w-full flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition mb-2 ${!sidebarOpen && "justify-center"}`}
            title={!sidebarOpen ? (isDark ? "Light Mode" : "Dark Mode") : ""}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            {sidebarOpen && <span>{isDark ? "Light" : "Dark"}</span>}
          </button>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition ${!sidebarOpen && "justify-center"}`}
            title={!sidebarOpen ? "Logout" : ""}
          >
            <LogOut size={20} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content - With margin for collapsed sidebar icons */}
      <div className="ml-16 md:ml-20 w-[calc(100%-64px)] md:w-[calc(100%-80px)] flex flex-col">
        {/* Header */}
        <div className="p-4 md:p-6 sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Welcome, {student.name}!</h1>
              <p className={`${isDark ? "text-gray-400" : "text-gray-600"} mt-1`}>Roll: {student.rollNumber} • {student.batch}</p>
            </div>
            <div className="text-right">
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Course</p>
              <p className={`text-lg font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{student.course}</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className={`p-4 md:p-6 overflow-auto h-[calc(100vh-100px)] ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
          {activeTab === "home" && <HomeTab student={student} stats={stats} feesPercentage={feesPercentage} isDark={isDark} />}
          {activeTab === "profile" && <ProfileTab student={student} isDark={isDark} />}
          {activeTab === "lessons" && <LessonsTab isDark={isDark} />}
          {activeTab === "tests" && <TestsTab isDark={isDark} />}
          {activeTab === "progress" && <ProgressTab stats={stats} isDark={isDark} />}
        </div>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, collapsed, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
        collapsed 
          ? "justify-center text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200" 
          : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
      }`}
      title={collapsed ? label : ""}
    >
      {icon}
      {!collapsed && <span className="font-medium">{label}</span>}
    </button>
  );
}

function HomeTab({ student, stats, feesPercentage, isDark }: any) {
  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <BookOpen size={200} />
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-bold mb-2">Ready to Learn?</h2>
          <p className="text-blue-100 mb-4">Continue your journey to success</p>
          <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">
            Start Learning →
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <StatCard icon="📚" label="Batch" value={student.batch} isDark={isDark} />
        <StatCard icon="✅" label="Attendance" value={`${stats?.attendance || 0}%`} isDark={isDark} />
        <StatCard icon="📊" label="Marks" value={`${stats?.marks || 0}`} isDark={isDark} />
        <StatCard icon="💰" label="Fees Pending" value={`₹${student.balance}`} isDark={isDark} />
      </div>

      {/* Fees Status & Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Fees Status */}
        <div className={`${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg p-6 shadow-sm border`}>
          <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"} mb-4`}>Fees Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className={isDark ? "text-gray-400" : "text-gray-600"}>Total Fees</span>
              <span className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>₹{student.fees}</span>
            </div>
            <div className={`w-full ${isDark ? "bg-gray-700" : "bg-gray-200"} rounded-full h-4`}>
              <div
                className="bg-blue-600 h-4 rounded-full transition-all"
                style={{ width: `${feesPercentage}%` }}
              ></div>
            </div>
            <div className={`flex justify-between text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              <span>Paid: ₹{student.fees - student.balance}</span>
              <span>Pending: ₹{student.balance}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg p-6 shadow-sm border`}>
          <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"} mb-4`}>Recent Activity</h3>
          <div className="space-y-3">
            <ActivityItem title="Math Test Completed" time="2 days ago" status="completed" isDark={isDark} />
            <ActivityItem title="Physics Lesson Started" time="5 days ago" status="in-progress" isDark={isDark} />
            <ActivityItem title="Chemistry Assignment Due" time="Tomorrow" status="pending" isDark={isDark} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileTab({ student, isDark }: any) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className={`${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg p-6 shadow-sm border`}>
        <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-6`}>My Profile</h2>

        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
            {student.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{student.name}</h3>
            <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>Roll: {student.rollNumber}</p>
            <p className={`text-sm font-semibold mt-2 ${student.status === "active" ? "text-green-600" : "text-red-600"}`}>
              {student.status.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <ProfileField label="Email" value={student.email} isDark={isDark} />
          <ProfileField label="Phone" value={student.phone || "Not provided"} isDark={isDark} />
          <ProfileField label="Course" value={student.course} isDark={isDark} />
          <ProfileField label="Batch" value={student.batch} isDark={isDark} />
          <ProfileField label="Join Date" value={new Date(student.joinDate).toLocaleDateString()} isDark={isDark} />
          <ProfileField label="Status" value={student.status} isDark={isDark} />
        </div>
      </div>
    </div>
  );
}

function LessonsTab({ isDark }: any) {
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  const subjects = ["all", "Math", "Physics", "Chemistry", "Biology", "English", "History"];

  const lessons = [
    {
      id: 1,
      title: "Introduction to Algebra",
      thumbnail: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop",
      brief: "Learn the basics of algebraic expressions and equations",
      duration: "45 min",
      instructor: "Prof. Smith",
      subject: "Math"
    },
    {
      id: 2,
      title: "Physics Mechanics",
      thumbnail: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=400&h=300&fit=crop",
      brief: "Understand motion, forces, and Newton's laws",
      duration: "52 min",
      instructor: "Dr. Johnson",
      subject: "Physics"
    },
    {
      id: 3,
      title: "Chemistry Basics",
      thumbnail: "https://images.unsplash.com/photo-1530993807003-fd4bda007d11?w=400&h=300&fit=crop",
      brief: "Explore atomic structure and chemical bonding",
      duration: "38 min",
      instructor: "Ms. Patel",
      subject: "Chemistry"
    },
    {
      id: 4,
      title: "English Literature",
      thumbnail: "https://images.unsplash.com/photo-1507842217343-583f20270319?w=400&h=300&fit=crop",
      brief: "Deep dive into classic novels and poetry analysis",
      duration: "56 min",
      instructor: "Prof. Williams",
      subject: "English"
    },
    {
      id: 5,
      title: "Biology - Cell Structure",
      thumbnail: "https://images.unsplash.com/photo-1576091160550-112173fba4b7?w=400&h=300&fit=crop",
      brief: "Understanding cells and their biological functions",
      duration: "48 min",
      instructor: "Dr. Brown",
      subject: "Biology"
    },
    {
      id: 6,
      title: "History of Ancient Rome",
      thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
      brief: "Explore the rise and fall of the Roman Empire",
      duration: "64 min",
      instructor: "Prof. Miller",
      subject: "History"
    },
    {
      id: 7,
      title: "Organic Chemistry",
      thumbnail: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=300&fit=crop",
      brief: "Master organic reactions and mechanisms",
      duration: "65 min",
      instructor: "Dr. Lewis",
      subject: "Chemistry"
    },
    {
      id: 8,
      title: "World Geography",
      thumbnail: "https://images.unsplash.com/photo-1569163139394-de4798aa62b6?w=400&h=300&fit=crop",
      brief: "Explore continents, countries, and cultures",
      duration: "58 min",
      instructor: "Prof. Turner",
      subject: "History"
    },
    {
      id: 9,
      title: "Calculus Fundamentals",
      thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f70a504f0?w=400&h=300&fit=crop",
      brief: "Master derivatives and integrals",
      duration: "72 min",
      instructor: "Prof. Smith",
      subject: "Math"
    },
    {
      id: 10,
      title: "Thermodynamics",
      thumbnail: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=300&fit=crop",
      brief: "Understand heat, energy, and temperature",
      duration: "60 min",
      instructor: "Dr. Johnson",
      subject: "Physics"
    }
  ];

  // Filter lessons based on selected subject
  const filteredLessons = selectedSubject === "all" 
    ? lessons 
    : lessons.filter(lesson => lesson.subject === selectedSubject);

  // If a lesson is selected, show video player
  if (selectedLesson) {
    return <VideoPlayer lesson={selectedLesson} onBack={() => setSelectedLesson(null)} isDark={isDark} lessons={lessons} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className={`text-lg md:text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"} mb-2`}>Lessons</h2>
        <p className={`text-xs md:text-base ${isDark ? "text-gray-400" : "text-gray-600"}`}>Learn from expert instructors at your own pace</p>
      </div>

      {/* Subject Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {subjects.map((subject) => (
          <button
            key={subject}
            onClick={() => setSelectedSubject(subject)}
            className={`px-3 md:px-4 py-2 rounded-full text-sm md:text-base font-medium transition-all whitespace-nowrap ${
              selectedSubject === subject
                ? "bg-blue-600 text-white"
                : isDark
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {subject.charAt(0).toUpperCase() + subject.slice(1)}
          </button>
        ))}
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 md:gap-4">
        {filteredLessons.map((lesson) => (
          <div key={lesson.id} className="group cursor-pointer" onClick={() => setSelectedLesson(lesson)}>
            {/* Thumbnail with overlay - 4:5 ratio like Instagram */}
            <div className="relative rounded-lg overflow-hidden bg-gray-900 aspect-[4/5] mb-0">
              <img
                src={lesson.thumbnail}
                alt={lesson.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">
                  {lesson.title}
                </h3>
                <p className="text-gray-200 text-sm mb-3 line-clamp-2">
                  {lesson.brief}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-300">{lesson.duration}</span>
                  <span className="text-xs text-gray-400">{lesson.instructor}</span>
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  Watch Now
                </button>
              </div>

              {/* Duration badge */}
              <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-semibold">
                {lesson.duration}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TestsTab({ isDark }: any) {
  return (
    <div className="space-y-6">
      <h2 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Tests</h2>
      <div className={`${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg p-12 text-center shadow-sm border`}>
        <FileText size={48} className={`mx-auto ${isDark ? "text-gray-600" : "text-gray-400"} mb-4`} />
        <p className={`${isDark ? "text-gray-400" : "text-gray-600"}`}>Tests coming soon!</p>
      </div>
    </div>
  );
}

function ProgressTab({ stats, isDark }: any) {
  return (
    <div className="space-y-6">
      <h2 className={`text-lg md:text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Progress</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <ProgressCard label="Attendance" value={`${stats?.attendance || 0}%`} color="bg-blue-600" isDark={isDark} />
        <ProgressCard label="Average Marks" value={`${stats?.marks || 0}`} color="bg-green-600" isDark={isDark} />
        <ProgressCard label="Lessons Completed" value="12" color="bg-purple-600" isDark={isDark} />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, isDark }: any) {
  return (
    <div className={`${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg p-6 shadow-sm border`}>
      <div className="text-2xl mb-2">{icon}</div>
      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{label}</p>
      <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"} mt-1`}>{value}</p>
    </div>
  );
}

function ProfileField({ label, value, isDark }: any) {
  return (
    <div>
      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"} mb-1`}>{label}</p>
      <p className={`font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}

function ActivityItem({ title, time, status, isDark }: any) {
  const statusColor = {
    completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    "in-progress": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  };

  return (
    <div className={`flex items-center justify-between p-3 border ${isDark ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-50"} rounded-lg transition`}>
      <div>
        <p className={`font-medium ${isDark ? "text-white" : "text-gray-900"}`}>{title}</p>
        <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{time}</p>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[status as keyof typeof statusColor]}`}>
        {status}
      </span>
    </div>
  );
}

function ProgressCard({ label, value, color, isDark }: any) {
  return (
    <div className={`${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg p-6 shadow-sm border`}>
      <div className={`${color} w-12 h-12 rounded-lg mb-4`}></div>
      <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>{label}</p>
      <p className={`text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"} mt-2`}>{value}</p>
    </div>
  );
}

function VideoPlayer({ lesson, onBack, isDark, lessons }: any) {
  const relatedLessons = lessons.filter((l: any) => l.id !== lesson.id).slice(0, 8);

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"} space-y-4 md:space-y-6`}>
      {/* Back Button & Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition text-sm md:text-base"
        >
          ← Back
        </button>
        <h1 className={`text-lg md:text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{lesson.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 h-[calc(100vh-180px)]">
        {/* Main Video Player - Fixed */}
        <div className="lg:col-span-3 space-y-4 overflow-y-auto pr-4">
          {/* Video Player - YouTube Style */}
          <div className={`${isDark ? "bg-black" : "bg-black"} rounded-lg overflow-hidden`}>
            <div className="relative w-full bg-black aspect-video">
              <img
                src={lesson.thumbnail}
                alt={lesson.title}
                className="w-full h-full object-cover"
              />
              {/* Play Button - Only inside video container */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center cursor-pointer transition shadow-lg">
                  <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Video Details */}
          <div className={`${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} rounded-lg p-4 md:p-6 border space-y-4`}>
            <div>
              <h2 className={`text-lg md:text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{lesson.title}</h2>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"} mt-2`}>{lesson.brief}</p>
            </div>

            <div className={`flex flex-wrap gap-4 text-sm border-t pt-4 ${isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-600"}`}>
              <div>
                <span className="font-semibold">Duration:</span> {lesson.duration}
              </div>
              <div>
                <span className="font-semibold">Instructor:</span> {lesson.instructor}
              </div>
              <div>
                <span className="font-semibold">Subject:</span> {lesson.subject}
              </div>
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition">
              Watch Full Video
            </button>
          </div>
        </div>

        {/* Related Videos Sidebar */}
        <div className="lg:col-span-1">
          <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"} mb-4 sticky top-0 z-10 ${isDark ? "bg-gray-900" : "bg-gray-50"} py-2`}>Related Videos</h3>
          <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-240px)]">
            {relatedLessons.map((relatedLesson: any) => (
              <div
                key={relatedLesson.id}
                onClick={() => onBack() && setTimeout(() => {}, 0)} // Just for demo
                className={`${isDark ? "bg-gray-800 hover:bg-gray-700 border-gray-700" : "bg-white hover:bg-gray-50 border-gray-200"} rounded-lg overflow-hidden cursor-pointer transition border p-2 md:p-3`}
              >
                <div className="relative rounded overflow-hidden mb-2 aspect-video">
                  <img
                    src={relatedLesson.thumbnail}
                    alt={relatedLesson.title}
                    className="w-full h-full object-cover hover:scale-105 transition"
                  />
                  <div className={`absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded`}>
                    {relatedLesson.duration}
                  </div>
                </div>
                <h4 className={`text-xs md:text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"} line-clamp-2`}>
                  {relatedLesson.title}
                </h4>
                <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"} mt-1`}>
                  {relatedLesson.instructor}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
