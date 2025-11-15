"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ClientDashboard from "@/components/dashboard/ClientDashboard";

export default function StudentProfilePage() {
  const router = useRouter();
  const [student, setStudent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

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

  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:5050/api/student-auth/me", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Not authenticated");
      setStudent(data);
      setForm({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
      });
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setStatus("Saving...");
    try {
      const res = await fetch("http://localhost:5050/api/student-auth/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update");
      
      setStudent({ ...student, ...form });
      setStatus("✅ Profile updated successfully!");
      setIsEditing(false);
      setTimeout(() => setStatus(""), 3000);
    } catch (err: any) {
      setStatus(`❌ ${err.message}`);
    }
  };

  if (loading) {
    return (
      <ClientDashboard userName="Loading..." sidebarLinks={studentLinks}>
        <div className="p-6 max-w-4xl mx-auto">
          <p className="text-gray-500">Loading your profile...</p>
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

  return (
    <ClientDashboard userName={student.name} sidebarLinks={studentLinks}>
      <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl p-8 text-white mb-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white/30">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">My Profile</h1>
                <p className="text-blue-100 text-sm md:text-base">
                  Manage your personal information
                </p>
              </div>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Information</h2>
              </div>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2"
                >
                  ✏️ Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    💾 Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setForm({
                        name: student.name || "",
                        email: student.email || "",
                        phone: student.phone || "",
                        address: student.address || "",
                      });
                    }}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
                  >
                    ❌ Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    👤 Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-900 dark:text-white px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {student.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    📧 Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-900 dark:text-white px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {student.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    📞 Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  ) : (
                    <p className="text-lg font-medium text-gray-900 dark:text-white px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      {student.phone || "Not provided"}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    🔢 Roll Number
                  </label>
                  <p className="text-lg font-mono font-bold text-gray-900 dark:text-white px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {student.rollNumber || "Not Assigned"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    📚 Course
                  </label>
                  <p className="text-lg font-medium text-gray-900 dark:text-white px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {student.course}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    🎓 Batch
                  </label>
                  <p className="text-lg font-medium text-gray-900 dark:text-white px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {student.batch}
                  </p>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  📍 Address
                </label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                ) : (
                  <p className="text-lg text-gray-900 dark:text-white px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {student.address || "Not provided"}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Status Message */}
          {status && (
            <div className={`mt-4 p-4 rounded-lg ${status.includes('✅') ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : status.includes('❌') ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
              {status}
            </div>
          )}
        </div>
      </div>
    </ClientDashboard>
  );
}
