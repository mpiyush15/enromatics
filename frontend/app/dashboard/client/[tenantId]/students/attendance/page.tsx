"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DatePicker } from "@/components/ui/date-picker";

interface Student {
  _id: string;
  name: string;
  email: string;
  rollNumber: string;
  batchName: string;
  course: string;
  attendance: {
    _id: string;
    status: string;
    remarks: string;
  } | null;
}

interface Summary {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  notMarked: number;
}

export default function AttendancePage() {
  const params = useParams();
  const tenantId = params?.tenantId as string;

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [batch, setBatch] = useState("");
  const [course, setCourse] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [batches, setBatches] = useState<string[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null); // Filter by status

  // Fetch unique batches and courses for filters
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await fetch(`/api/students?limit=1000`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          const uniqueBatches = [...new Set(data.students.map((s: any) => s.batchName))].filter(Boolean);
          const uniqueCourses = [...new Set(data.students.map((s: any) => s.course))].filter(Boolean);
          setBatches(uniqueBatches as string[]);
          setCourses(uniqueCourses as string[]);
        }
      } catch (err) {
        console.error("Failed to fetch filters:", err);
      }
    };
    fetchFilters();
  }, [tenantId]);

  const fetchAttendance = async () => {
    setLoading(true);
    setStatus("");
    try {
      const params = new URLSearchParams({ date });
      if (batch) params.append("batch", batch);
      if (course) params.append("course", course);

      // Call BFF route instead of backend directly
      const res = await fetch(`/api/attendance/date?${params.toString()}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to fetch attendance");

      setStudents(data.students || []);
      setSummary(data.summary || null);
    } catch (err: any) {
      console.error(err);
      setStatus(err.message || "Error loading attendance");
    } finally {
      setLoading(false);
    }
  };

  // Removed auto-fetch - user must click "Load Students" button

  const handleStatusChange = (studentId: string, newStatus: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s._id === studentId
          ? { ...s, attendance: { ...(s.attendance || { _id: "", remarks: "" }), status: newStatus } }
          : s
      )
    );
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s._id === studentId
          ? { ...s, attendance: { ...(s.attendance || { _id: "", status: "present" }), remarks } }
          : s
      )
    );
  };

  const handleSave = async () => {
    setLoading(true);
    setStatus("Saving...");
    try {
      const records = students.map((s) => ({
        studentId: s._id,
        date,
        status: s.attendance?.status || "present",
        remarks: s.attendance?.remarks || "",
      }));

      // Call BFF route instead of backend directly
      const res = await fetch(`/api/attendance/mark`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ records }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save attendance");

      setStatus("✅ Attendance saved successfully!");
      setTimeout(() => setStatus(""), 3000);
      fetchAttendance();
    } catch (err: any) {
      console.error(err);
      setStatus(`❌ ${err.message || "Error saving attendance"}`);
    } finally {
      setLoading(false);
    }
  };

  const markAllPresent = () => {
    setStudents((prev) =>
      prev.map((s) => ({ ...s, attendance: { ...(s.attendance || { _id: "", remarks: "" }), status: "present" } }))
    );
  };

  const markAllAbsent = () => {
    setStudents((prev) =>
      prev.map((s) => ({ ...s, attendance: { ...(s.attendance || { _id: "", remarks: "" }), status: "absent" } }))
    );
  };

  const markAllLate = () => {
    setStudents((prev) =>
      prev.map((s) => ({ ...s, attendance: { ...(s.attendance || { _id: "", remarks: "" }), status: "late" } }))
    );
  };

  const markAllExcused = () => {
    setStudents((prev) =>
      prev.map((s) => ({ ...s, attendance: { ...(s.attendance || { _id: "", remarks: "" }), status: "excused" } }))
    );
  };

  // Filter students by status when card is clicked
  const filterByStatus = (status: string) => {
    setStatusFilter(statusFilter === status ? null : status); // Toggle filter
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setUploadFile(file);
        setUploadStatus("");
      } else {
        setUploadStatus("❌ Please select a valid CSV file");
        setUploadFile(null);
      }
    }
  };

  const handleUploadCSV = async () => {
    if (!uploadFile) {
      setUploadStatus("❌ Please select a file first");
      return;
    }

    setUploadLoading(true);
    setUploadStatus("⏳ Processing CSV file...");

    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("date", date);

      // Call BFF route instead of backend directly
      const res = await fetch(`/api/attendance/upload-csv`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Failed to upload attendance");

      setUploadStatus(`✅ Successfully uploaded attendance for ${data.processed || 0} students!`);
      setUploadFile(null);
      
      // Refresh attendance data
      setTimeout(() => {
        fetchAttendance();
        setShowUploadModal(false);
        setUploadStatus("");
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setUploadStatus(`❌ ${err.message || "Error uploading CSV"}`);
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              📅 Daily Batch Attendance
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {new Date(date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
          >
            <span>📤</span>
            Upload CSV
          </button>
        </div>

        {/* CSV Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>📤</span>
                  Upload Biometric Attendance
                </h2>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFile(null);
                    setUploadStatus("");
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
                >
                  <span className="text-2xl">✕</span>
                </button>
              </div>

              <div className="space-y-6">
                {/* Info Box */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                      📋 CSV Format Requirements
                    </h3>
                    <a
                      href="/sample-attendance.csv"
                      download
                      className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      ⬇️ Download Sample
                    </a>
                  </div>
                  <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                    <li>• Columns: <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">rollNumber</code>, <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">status</code>, <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">remarks</code> (optional)</li>
                    <li>• Status values: <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">present</code>, <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">absent</code>, <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">late</code>, <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">excused</code></li>
                    <li>• Example: <code className="bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">BA001,present,On time</code></li>
                  </ul>
                </div>

                {/* Date Info */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">Attendance Date:</span> {new Date(date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select CSV File
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-900 dark:text-gray-100
                        file:mr-4 file:py-3 file:px-6
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-gradient-to-r file:from-purple-600 file:to-purple-700
                        file:text-white
                        hover:file:from-purple-700 hover:file:to-purple-800
                        file:cursor-pointer file:transition-all
                        border border-gray-300 dark:border-gray-600 rounded-xl
                        cursor-pointer bg-gray-50 dark:bg-gray-700
                        focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  {uploadFile && (
                    <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                      <span>✓</span>
                      Selected: {uploadFile.name}
                    </p>
                  )}
                </div>

                {/* Status Message */}
                {uploadStatus && (
                  <div
                    className={`p-4 rounded-xl ${
                      uploadStatus.startsWith("✅")
                        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700"
                        : uploadStatus.startsWith("❌")
                        ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700"
                        : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700"
                    }`}
                  >
                    <p className="font-medium text-sm">{uploadStatus}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadFile(null);
                      setUploadStatus("");
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUploadCSV}
                    disabled={!uploadFile || uploadLoading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all font-semibold flex items-center justify-center gap-2"
                  >
                    {uploadLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <span>📤</span>
                        Upload Attendance
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <DatePicker
                value={date}
                onChange={setDate}
                label="📆 Date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🎓 Batch
              </label>
              <select
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Batches</option>
                {batches.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📚 Course
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">All Courses</option>
                {courses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchAttendance}
                disabled={loading}
                className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
              >
                {loading ? "Loading..." : "Load Students"}
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats - CLICKABLE TO FILTER */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{summary.total}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Students</div>
            </div>
            
            <button
              onClick={() => filterByStatus("present")}
              className={`bg-white dark:bg-gray-800 rounded-lg border-2 p-6 shadow-sm text-left hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors group ${
                statusFilter === "present" 
                  ? "border-green-500 dark:border-green-500 ring-2 ring-green-500" 
                  : "border-green-200 dark:border-green-800"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">✓</span>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{summary.present}</div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-green-700 dark:group-hover:text-green-400 font-medium">
                Present {statusFilter === "present" ? "(Filtered)" : "(Click to filter)"}
              </div>
            </button>
            
            <button
              onClick={() => filterByStatus("absent")}
              className={`bg-white dark:bg-gray-800 rounded-lg border-2 p-6 shadow-sm text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group ${
                statusFilter === "absent" 
                  ? "border-red-500 dark:border-red-500 ring-2 ring-red-500" 
                  : "border-red-200 dark:border-red-800"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">✗</span>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">{summary.absent}</div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-red-700 dark:group-hover:text-red-400 font-medium">
                Absent {statusFilter === "absent" ? "(Filtered)" : "(Click to filter)"}
              </div>
            </button>
            
            <button
              onClick={() => filterByStatus("late")}
              className={`bg-white dark:bg-gray-800 rounded-lg border-2 p-6 shadow-sm text-left hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors group ${
                statusFilter === "late" 
                  ? "border-yellow-500 dark:border-yellow-500 ring-2 ring-yellow-500" 
                  : "border-yellow-200 dark:border-yellow-800"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">⏰</span>
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{summary.late}</div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-yellow-700 dark:group-hover:text-yellow-400 font-medium">
                Late {statusFilter === "late" ? "(Filtered)" : "(Click to filter)"}
              </div>
            </button>
            
            <button
              onClick={() => filterByStatus("excused")}
              className={`bg-white dark:bg-gray-800 rounded-lg border-2 p-6 shadow-sm text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors group ${
                statusFilter === "excused" 
                  ? "border-purple-500 dark:border-purple-500 ring-2 ring-purple-500" 
                  : "border-purple-200 dark:border-purple-800"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">📝</span>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{summary.excused}</div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-purple-700 dark:group-hover:text-purple-400 font-medium">
                Excused {statusFilter === "excused" ? "(Filtered)" : "(Click to filter)"}
              </div>
            </button>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">⏸</span>
                <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">{summary.notMarked}</div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Not Marked</div>
            </div>
          </div>
        )}

        {/* Status Message */}
        {status && (
          <div
            className={`p-4 rounded-xl shadow-md ${
              status.startsWith("✅")
                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-300 dark:border-green-700"
                : status.startsWith("❌")
                ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700"
                : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700"
            }`}
          >
            <p className="font-medium">{status}</p>
          </div>
        )}

        {/* Students List */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Loading students...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              No Students Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters or add students to this batch/course.
            </p>
          </div>
        ) : (
          <>
            {/* Filter info banner - Always reserve space */}
            <div className="min-h-[60px]">
              {statusFilter && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-700 dark:text-blue-300 font-medium">
                      Filtering by: <span className="font-bold capitalize">{statusFilter}</span>
                    </span>
                    <span className="text-sm text-blue-600 dark:text-blue-400">
                      ({students.filter(s => s.attendance?.status === statusFilter).length} students)
                    </span>
                  </div>
                  <button
                    onClick={() => setStatusFilter(null)}
                    className="text-sm text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 font-medium"
                  >
                    Clear Filter ✕
                  </button>
                </div>
              )}
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Roll No
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Batch
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {students
                      .filter(s => !statusFilter || s.attendance?.status === statusFilter)
                      .map((student) => (
                      <tr
                        key={student._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {student.rollNumber}
                          </span>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {student.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {student.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {student.batchName}
                          </span>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-white">{student.course}</span>
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap">
                          <select
                            value={student.attendance?.status || "present"}
                            onChange={(e) => handleStatusChange(student._id, e.target.value)}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium border focus:ring-2 focus:outline-none transition-colors ${
                              (student.attendance?.status || "present") === "present"
                                ? "border-green-300 bg-green-50 text-green-800 focus:ring-green-500 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700"
                                : (student.attendance?.status || "present") === "absent"
                                ? "border-red-300 bg-red-50 text-red-800 focus:ring-red-500 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700"
                                : (student.attendance?.status || "present") === "late"
                                ? "border-yellow-300 bg-yellow-50 text-yellow-800 focus:ring-yellow-500 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700"
                                : "border-purple-300 bg-purple-50 text-purple-800 focus:ring-purple-500 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700"
                            }`}
                          >
                            <option value="present">✓ Present</option>
                            <option value="absent">✗ Absent</option>
                            <option value="late">⏰ Late</option>
                            <option value="excused">📝 Excused</option>
                          </select>
                        </td>
                        <td className="px-6 py-3">
                          <input
                            type="text"
                            value={student.attendance?.remarks || ""}
                            onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                            placeholder="Add remarks..."
                            className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    Save Attendance
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
