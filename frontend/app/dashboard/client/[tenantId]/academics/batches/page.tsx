"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { Eye } from "lucide-react";
import StudentListModal from "@/components/modals/StudentListModal";

interface Course {
  _id: string;
  name: string;
  description: string;
  duration: string;
  fees: number;
  status: string;
  createdAt: string;
}

interface Batch {
  _id: string;
  name: string;
  courseId?: string | {
    _id: string;
    name: string;
    fees?: number;
    duration?: string;
  };
  courseName?: string;
  description: string;
  startDate: string;
  endDate: string;
  capacity: number;
  enrolledCount: number;
  status: string;
  createdAt: string;
}

// SWR fetcher
const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
};

export default function CoursesAndBatchesPage() {
  const params = useParams();
  const tenantId = params?.tenantId as string;
  
  const [activeTab, setActiveTab] = useState<"courses" | "batches">("courses");
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [message, setMessage] = useState("");
  const [studentListModal, setStudentListModal] = useState<{
    isOpen: boolean;
    batchId?: string;
    batchName?: string;
    courseId?: string;
    courseName?: string;
  }>({
    isOpen: false,
  });

  // Fetch courses
  const { data: coursesData, isLoading: loadingCourses, mutate: refreshCourses } = useSWR(
    `/api/academics/courses`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000,
      revalidateIfStale: false,
      keepPreviousData: true, // Prevent flickering
    }
  );

  // Fetch batches
  const { data: batchesData, isLoading: loadingBatches, mutate: refreshBatches } = useSWR(
    `/api/academics/batches`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000,
      revalidateIfStale: false,
      keepPreviousData: true, // Prevent flickering
    }
  );

  const courses: Course[] = coursesData?.success ? coursesData.courses : [];
  const batches: Batch[] = batchesData?.success ? batchesData.batches : [];

  const [courseForm, setCourseForm] = useState({
    name: "",
    description: "",
    duration: "",
    fees: "",
    status: "active",
  });

  const [batchForm, setBatchForm] = useState({
    name: "",
    courseId: "",
    description: "",
    startDate: "",
    endDate: "",
    capacity: "",
    status: "active",
  });

  // Course handlers
  const handleCourseInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCourseForm({ ...courseForm, [name]: value });
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Saving course...");

    try {
      const url = editingCourse
        ? `/api/academics/courses/${editingCourse._id}`
        : `/api/academics/courses`;
      const method = editingCourse ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...courseForm,
          fees: courseForm.fees ? parseFloat(courseForm.fees) : null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage(editingCourse ? "✅ Course updated!" : "✅ Course created!");
        refreshCourses();
        resetCourseForm();
        setShowModal(false);
      } else {
        setMessage("❌ " + (data.message || "Operation failed"));
      }
    } catch (error) {
      console.error("Error saving course:", error);
      setMessage("❌ Server error");
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      name: course.name,
      description: course.description || "",
      duration: course.duration || "",
      fees: course.fees?.toString() || "",
      status: course.status,
    });
    setShowModal(true);
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      const res = await fetch(`/api/academics/courses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Course deleted!");
        refreshCourses();
      } else {
        setMessage("❌ Delete failed");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      setMessage("❌ Server error");
    }
  };

  const resetCourseForm = () => {
    setCourseForm({
      name: "",
      description: "",
      duration: "",
      fees: "",
      status: "active",
    });
    setEditingCourse(null);
    setMessage("");
  };

  // Batch handlers
  const handleBatchInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBatchForm({ ...batchForm, [name]: value });
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Saving batch...");

    try {
      const url = editingBatch
        ? `/api/academics/batches/${editingBatch._id}`
        : `/api/academics/batches`;
      const method = editingBatch ? "PUT" : "POST";

      const payload = {
        ...batchForm,
        capacity: batchForm.capacity ? parseInt(batchForm.capacity) : null,
      };

      console.log('[FRONTEND] Submitting batch:', { method, url, payload });

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      console.log('[FRONTEND] Batch response:', data);

      if (data.success) {
        setMessage(editingBatch ? "✅ Batch updated!" : "✅ Batch created!");
        refreshBatches();
        resetBatchForm();
        setShowModal(false);
      } else {
        setMessage("❌ " + (data.message || "Operation failed"));
      }
    } catch (error) {
      console.error("Error saving batch:", error);
      setMessage("❌ Server error");
    }
  };

  const handleEditBatch = (batch: Batch) => {
    setEditingBatch(batch);
    
    // Extract courseId string - handle both populated object and string
    const courseIdValue = typeof batch.courseId === 'object' && batch.courseId?._id 
      ? batch.courseId._id 
      : typeof batch.courseId === 'string' 
      ? batch.courseId 
      : "";
    
    setBatchForm({
      name: batch.name,
      courseId: courseIdValue,
      description: batch.description || "",
      startDate: batch.startDate ? new Date(batch.startDate).toISOString().split("T")[0] : "",
      endDate: batch.endDate ? new Date(batch.endDate).toISOString().split("T")[0] : "",
      capacity: batch.capacity?.toString() || "",
      status: batch.status,
    });
    setShowModal(true);
  };

  const handleDeleteBatch = async (id: string) => {
    if (!confirm("Are you sure you want to delete this batch? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/academics/batches/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Batch deleted!");
        refreshBatches();
      } else {
        setMessage("❌ Delete failed");
      }
    } catch (error) {
      console.error("Error deleting batch:", error);
      setMessage("❌ Server error");
    }
  };

  const resetBatchForm = () => {
    setBatchForm({
      name: "",
      courseId: "",
      description: "",
      startDate: "",
      endDate: "",
      capacity: "",
      status: "active",
    });
    setEditingBatch(null);
    setMessage("");
  };

  const loading = loadingCourses || loadingBatches;

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">📚 Courses & Batches</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage courses and batches for your institute
          </p>
        </div>
        <button
          onClick={() => {
            if (activeTab === "courses") {
              resetCourseForm();
            } else {
              resetBatchForm();
            }
            setShowModal(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          + Add {activeTab === "courses" ? "Course" : "Batch"}
        </button>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 rounded text-sm">
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("courses")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "courses"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            📖 Courses ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab("batches")}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === "batches"
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            📚 Batches ({batches.length})
          </button>
        </div>
      </div>

      {/* Courses Tab */}
      {activeTab === "courses" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-5"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {course.name}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      course.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {course.status}
                  </span>
                </div>

                {course.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {course.description}
                  </p>
                )}

                <div className="space-y-2 text-sm mb-4">
                  {course.duration && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">⏱️ Duration:</span>
                      <span>{course.duration}</span>
                    </div>
                  )}
                  {course.fees && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">💰 Fees:</span>
                      <span>₹{course.fees.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setStudentListModal({
                      isOpen: true,
                      courseId: course.name,  // Pass course NAME for regex match, not ID
                      courseName: course.name,
                    })}
                    className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                    title="View Students in this Course"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    onClick={() => handleEditCourse(course)}
                    className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Edit Course"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course._id)}
                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete Course"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {courses.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg">
              <div className="text-6xl mb-4">📖</div>
              <h3 className="text-lg font-semibold mb-2">No Courses Yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create your first course to get started
              </p>
              <button
                onClick={() => {
                  resetCourseForm();
                  setShowModal(true);
                }}
                className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
              >
                Create Course
              </button>
            </div>
          )}
        </>
      )}

      {/* Batches Tab */}
      {activeTab === "batches" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {batches.map((batch) => (
          <div
            key={batch._id}
            className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-5"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {batch.name}
              </h3>
              <span
                className={`px-2 py-1 text-xs rounded ${
                  batch.status === "active"
                    ? "bg-green-100 text-green-800"
                    : batch.status === "completed"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {batch.status}
              </span>
            </div>

            {batch.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {batch.description}
              </p>
            )}

            <div className="space-y-2 text-sm mb-4">
              {batch.startDate && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">📅 Start:</span>
                  <span>{new Date(batch.startDate).toLocaleDateString()}</span>
                </div>
              )}
              {batch.capacity && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">👥 Capacity:</span>
                  <span>
                    {batch.enrolledCount || 0} / {batch.capacity}
                  </span>
                </div>
              )}
            </div>

            {batch.courseName && (
              <div className="mb-2 px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded inline-block">
                📖 {batch.courseName}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setStudentListModal({
                  isOpen: true,
                  batchId: batch._id,
                  batchName: batch.name,
                })}
                className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                title="View Students in this Batch"
              >
                <Eye size={18} />
              </button>
              <button
                onClick={() => handleEditBatch(batch)}
                className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Edit Batch"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              </button>
              <button
                onClick={() => handleDeleteBatch(batch._id)}
                className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete Batch"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {batches.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-lg font-semibold mb-2">No Batches Yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create your first batch to start organizing students
          </p>
          <button
            onClick={() => {
              resetBatchForm();
              setShowModal(true);
            }}
            className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
          >
            Create Batch
          </button>
        </div>
      )}
        </>
      )}

      {/* Course Modal */}
      {showModal && activeTab === "courses" && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30"
          onClick={() => {
            resetCourseForm();
            setShowModal(false);
          }}
        >
          <div 
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200/20 dark:border-gray-700/30"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingCourse ? "Edit Course" : "Create New Course"}
            </h2>

            <form onSubmit={handleCourseSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-gray-300">Course Name *</label>
                <input
                  type="text"
                  name="name"
                  value={courseForm.name}
                  onChange={handleCourseInputChange}
                  required
                  placeholder="e.g., Web Development, Data Science"
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  name="description"
                  value={courseForm.description}
                  onChange={handleCourseInputChange}
                  rows={2}
                  placeholder="Course description"
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-gray-300">Duration</label>
                  <input
                    type="text"
                    name="duration"
                    value={courseForm.duration}
                    onChange={handleCourseInputChange}
                    placeholder="e.g., 6 months"
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-gray-300">Fees (₹)</label>
                  <input
                    type="number"
                    name="fees"
                    value={courseForm.fees}
                    onChange={handleCourseInputChange}
                    placeholder="Course fees"
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-gray-300">Status</label>
                <select
                  name="status"
                  value={courseForm.status}
                  onChange={handleCourseInputChange}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-lg shadow-indigo-500/30"
                >
                  {editingCourse ? "Update" : "Create"} Course
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetCourseForm();
                    setShowModal(false);
                  }}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Modal */}
      {showModal && activeTab === "batches" && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30"
          onClick={() => {
            resetBatchForm();
            setShowModal(false);
          }}
        >
          <div 
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200/20 dark:border-gray-700/30"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingBatch ? "Edit Batch" : "Create New Batch"}
            </h2>

            <form onSubmit={handleBatchSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-gray-300">Batch Name *</label>
                <input
                  type="text"
                  name="name"
                  value={batchForm.name}
                  onChange={handleBatchInputChange}
                  required
                  placeholder="e.g., Batch 2024, Morning Batch"
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-gray-300">Course</label>
                <select
                  name="courseId"
                  value={batchForm.courseId}
                  onChange={handleBatchInputChange}
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="">Select Course (Optional)</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  name="description"
                  value={batchForm.description}
                  onChange={handleBatchInputChange}
                  rows={2}
                  placeholder="Optional description"
                  className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={batchForm.startDate}
                    onChange={handleBatchInputChange}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-gray-300">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={batchForm.endDate}
                    onChange={handleBatchInputChange}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-gray-300">Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    value={batchForm.capacity}
                    onChange={handleBatchInputChange}
                    placeholder="Max students"
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 font-medium text-gray-700 dark:text-gray-300">Status</label>
                  <select
                    name="status"
                    value={batchForm.status}
                    onChange={handleBatchInputChange}
                    className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-lg shadow-indigo-500/30"
                >
                  {editingBatch ? "Update" : "Create"} Batch
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetBatchForm();
                    setShowModal(false);
                  }}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student List Modal */}
      <StudentListModal
        isOpen={studentListModal.isOpen}
        onClose={() => setStudentListModal({ isOpen: false })}
        batch={studentListModal.batchId}
        batchName={studentListModal.batchName}
        course={studentListModal.courseId}
        courseName={studentListModal.courseName}
      />
    </div>
  );
}
