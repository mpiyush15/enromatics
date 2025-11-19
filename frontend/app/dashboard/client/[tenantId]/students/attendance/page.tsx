"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { DatePicker } from "@/components/ui/date-picker";
import { API_BASE_URL } from "@/lib/apiConfig";

interface Student {
  _id: string;
  name: string;
  email: string;
  rollNumber: string;
  batch: string;
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

  // Fetch unique batches and courses for filters
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/students?tenantId=${tenantId}&limit=1000`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          const uniqueBatches = [...new Set(data.students.map((s: any) => s.batch))].filter(Boolean);
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

      const res = await fetch(`${API_BASE_URL}/api/attendance/date?${params.toString()}`, {
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

  useEffect(() => {
    if (date) fetchAttendance();
  }, [date, batch, course]);

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

      const res = await fetch(`${API_BASE_URL}/api/attendance/mark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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

      const res = await fetch(`${API_BASE_URL}/api/attendance/upload-csv`, {
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
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              📅 Mark Attendance
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
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg font-semibold flex items-center gap-2"
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
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
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
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
              <div className="flex gap-2 w-full">
                <button
                  onClick={markAllPresent}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg text-sm font-medium"
                >
                  ✓ All Present
                </button>
                <button
                  onClick={markAllAbsent}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg text-sm font-medium"
                >
                  ✗ All Absent
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg text-white transform hover:scale-105 transition-transform">
              <div className="text-4xl font-bold mb-1">{summary.total}</div>
              <div className="text-sm opacity-90 font-medium">Total Students</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 shadow-lg text-white transform hover:scale-105 transition-transform">
              <div className="flex items-center gap-2">
                <span className="text-3xl">✓</span>
                <div className="text-4xl font-bold">{summary.present}</div>
              </div>
              <div className="text-sm opacity-90 font-medium mt-1">Present</div>
            </div>
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 shadow-lg text-white transform hover:scale-105 transition-transform">
              <div className="flex items-center gap-2">
                <span className="text-3xl">✗</span>
                <div className="text-4xl font-bold">{summary.absent}</div>
              </div>
              <div className="text-sm opacity-90 font-medium mt-1">Absent</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 shadow-lg text-white transform hover:scale-105 transition-transform">
              <div className="flex items-center gap-2">
                <span className="text-3xl">⏰</span>
                <div className="text-4xl font-bold">{summary.late}</div>
              </div>
              <div className="text-sm opacity-90 font-medium mt-1">Late</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg text-white transform hover:scale-105 transition-transform">
              <div className="flex items-center gap-2">
                <span className="text-3xl">📝</span>
                <div className="text-4xl font-bold">{summary.excused}</div>
              </div>
              <div className="text-sm opacity-90 font-medium mt-1">Excused</div>
            </div>
            <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl p-6 shadow-lg text-white transform hover:scale-105 transition-transform">
              <div className="flex items-center gap-2">
                <span className="text-3xl">⏸</span>
                <div className="text-4xl font-bold">{summary.notMarked}</div>
              </div>
              <div className="text-sm opacity-90 font-medium mt-1">Not Marked</div>
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
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Roll No
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Student Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Batch
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {students.map((student, index) => (
                      <tr
                        key={student._id}
                        className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-800/50"
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                            {student.rollNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {student.name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {student.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {student.batch}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900 dark:text-white">{student.course}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={student.attendance?.status || "present"}
                            onChange={(e) => handleStatusChange(student._id, e.target.value)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium border-2 focus:ring-2 focus:outline-none transition-all ${
                              (student.attendance?.status || "present") === "present"
                                ? "border-green-300 bg-green-50 text-green-800 focus:ring-green-500 dark:bg-green-900 dark:text-green-200 dark:border-green-700"
                                : (student.attendance?.status || "present") === "absent"
                                ? "border-red-300 bg-red-50 text-red-800 focus:ring-red-500 dark:bg-red-900 dark:text-red-200 dark:border-red-700"
                                : (student.attendance?.status || "present") === "late"
                                ? "border-yellow-300 bg-yellow-50 text-yellow-800 focus:ring-yellow-500 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700"
                                : "border-purple-300 bg-purple-50 text-purple-800 focus:ring-purple-500 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700"
                            }`}
                          >
                            <option value="present">✓ Present</option>
                            <option value="absent">✗ Absent</option>
                            <option value="late">⏰ Late</option>
                            <option value="excused">📝 Excused</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={student.attendance?.remarks || ""}
                            onChange={(e) => handleRemarksChange(student._id, e.target.value)}
                            placeholder="Add remarks..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition"
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
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:transform-none flex items-center gap-2"
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
