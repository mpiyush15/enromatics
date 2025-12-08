"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";

interface Test {
  _id: string;
  name: string;
  subject: string;
  course: string;
  batch: string;
  testDate: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  testType: string;
  description?: string;
  status: string;
  createdBy: {
    name: string;
    email: string;
  };
}

export default function TestSchedulesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const tenantId = params?.tenantId as string;
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [status, setStatus] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [form, setForm] = useState({
    name: "",
    subject: "",
    course: "",
    batch: "",
    testDate: "",
    duration: 60,
    totalMarks: 100,
    passingMarks: 40,
    testType: "Unit Test",
    description: "",
  });

  useEffect(() => {
    if (user) fetchTests();
  }, [user, filterCourse, filterStatus]);

  const fetchTests = async () => {
    try {
      let url = `/api/academics/tests`;
      const params = new URLSearchParams();
      if (filterCourse) params.append("course", filterCourse);
      if (filterStatus) params.append("status", filterStatus);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setTests(data.tests || []);
      }
    } catch (error) {
      console.error("Error fetching tests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Saving...");
    
    try {
      console.log("Submitting test form:", form);
      
      const url = editingTest
        ? `/api/academics/tests/${editingTest._id}`
        : `/api/academics/tests`;
      
      const res = await fetch(url, {
        method: editingTest ? "PUT" : "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      console.log("Response:", data);
      
      if (!res.ok) throw new Error(data.message || "Failed to save test");

      setStatus("✅ " + (editingTest ? "Updated" : "Created") + " successfully!");
      setShowAddModal(false);
      setEditingTest(null);
      resetForm();
      fetchTests();
      setTimeout(() => setStatus(""), 3000);
    } catch (error: any) {
      console.error("Error submitting test:", error);
      setStatus("❌ " + (error.message || "Failed to save test"));
    }
  };

  const handleDelete = async (testId: string) => {
    if (!confirm("Delete this test? All attendance and marks data will be removed.")) return;
    
    try {
      const res = await fetch(`/api/academics/tests/${testId}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to delete");
      
      setStatus("✅ Test deleted successfully");
      fetchTests();
      setTimeout(() => setStatus(""), 3000);
    } catch (error: any) {
      setStatus("❌ " + error.message);
    }
  };

  const handleEdit = (test: Test) => {
    setEditingTest(test);
    setForm({
      name: test.name,
      subject: test.subject,
      course: test.course,
      batch: test.batch,
      testDate: new Date(test.testDate).toISOString().split("T")[0],
      duration: test.duration,
      totalMarks: test.totalMarks,
      passingMarks: test.passingMarks,
      testType: test.testType,
      description: test.description || "",
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setForm({
      name: "",
      subject: "",
      course: "",
      batch: "",
      testDate: "",
      duration: 60,
      totalMarks: 100,
      passingMarks: 40,
      testType: "Unit Test",
      description: "",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      ongoing: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      completed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return colors[status] || colors.scheduled;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p>Loading test schedules...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl p-8 text-white mb-6">
          <h1 className="text-4xl font-bold mb-2">📅 Test Schedules</h1>
          <p className="text-blue-100">Create and manage test schedules for your students</p>
        </div>

        {/* Status Message */}
        {status && (
          <div className={`mb-6 p-4 rounded-xl font-semibold ${
            status.includes("✅") 
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}>
            {status}
          </div>
        )}

        {/* Filters & Add Button */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 flex-1">
              <input
                type="text"
                placeholder="Filter by course..."
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 flex-1"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              >
                <option value="">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <button
              onClick={() => {
                setEditingTest(null);
                resetForm();
                setShowAddModal(true);
              }}
              className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold transition-colors"
            >
              ➕ Add New Test
            </button>
          </div>
        </div>

        {/* Tests Grid */}
        {tests.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-2xl font-bold mb-2">No Tests Scheduled</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first test schedule to get started</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold"
            >
              Create Test
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <div key={test._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{test.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(test.status)}`}>
                      {test.status}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(test)}
                      className="p-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(test._id)}
                      className="p-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="font-semibold">{test.subject}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>{test.course} {test.batch && `- ${test.batch}`}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{new Date(test.testDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{test.duration} minutes</span>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Total Marks:</span>
                    <span className="font-semibold">{test.totalMarks}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Passing Marks:</span>
                    <span className="font-semibold">{test.passingMarks}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                    <span className="font-semibold">{test.testType}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex gap-2">
                  <button
                    onClick={() => router.push(`/dashboard/client/${tenantId}/academics/attendance?testId=${test._id}`)}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold"
                  >
                    ✅ Attendance
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/client/${tenantId}/academics/marks?testId=${test._id}`)}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-semibold"
                  >
                    📝 Marks
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{editingTest ? "Edit Test" : "Create New Test"}</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingTest(null);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Test Name *</label>
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Subject *</label>
                    <input
                      required
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Course *</label>
                    <input
                      required
                      type="text"
                      value={form.course}
                      onChange={(e) => setForm({ ...form, course: e.target.value })}
                      className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Batch</label>
                    <input
                      type="text"
                      value={form.batch}
                      onChange={(e) => setForm({ ...form, batch: e.target.value })}
                      className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Test Date *</label>
                    <input
                      required
                      type="date"
                      value={form.testDate}
                      onChange={(e) => setForm({ ...form, testDate: e.target.value })}
                      className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Duration (minutes) *</label>
                    <input
                      required
                      type="number"
                      min={1}
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                      className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Total Marks *</label>
                    <input
                      required
                      type="number"
                      min={1}
                      value={form.totalMarks}
                      onChange={(e) => setForm({ ...form, totalMarks: Number(e.target.value) })}
                      className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">Passing Marks *</label>
                    <input
                      required
                      type="number"
                      min={1}
                      value={form.passingMarks}
                      onChange={(e) => setForm({ ...form, passingMarks: Number(e.target.value) })}
                      className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">Test Type *</label>
                    <select
                      required
                      value={form.testType}
                      onChange={(e) => setForm({ ...form, testType: e.target.value })}
                      className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    >
                      <option value="Unit Test">Unit Test</option>
                      <option value="Mid Term">Mid Term</option>
                      <option value="Final Exam">Final Exam</option>
                      <option value="Practice Test">Practice Test</option>
                      <option value="Assignment">Assignment</option>
                      <option value="Quiz">Quiz</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold mb-2">Description</label>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className="w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold"
                  >
                    {editingTest ? "Update Test" : "Create Test"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingTest(null);
                      resetForm();
                    }}
                    className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
