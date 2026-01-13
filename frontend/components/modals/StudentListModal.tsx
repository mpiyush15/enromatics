"use client";

import { useState, useEffect } from "react";
import { X, Loader } from "lucide-react";
import type { StudentDTO } from "@/types/student";

interface StudentListModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchId?: string;
  batchName?: string;
  courseId?: string;
  courseName?: string;
  tenantId: string;
}

export function StudentListModal({
  isOpen,
  onClose,
  batchId,
  batchName,
  courseId,
  courseName,
  tenantId,
}: StudentListModalProps) {
  const [students, setStudents] = useState<StudentDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && (batchId || courseId)) {
      fetchStudents();
    }
  }, [isOpen, batchId, courseId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (batchId) params.set("batchId", batchId);
      if (courseId) params.set("course", courseId);
      params.set("limit", "100"); // Get all students for modal

      console.log("📋 Fetching students with params:", {
        batchId,
        courseId,
        url: `/api/students?${params.toString()}`,
      });

      const res = await fetch(`/api/students?${params.toString()}`, {
        credentials: "include",
      });

      console.log("📋 API Response status:", res.status);

      const data = await res.json();
      console.log("📋 API Response:", data);

      if (!data.success) throw new Error(data.message || "Fetch failed");

      setStudents(data.students || []);
    } catch (err: any) {
      console.error("❌ Error fetching students:", err);
      setError(err.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const title = batchName ? `Students in ${batchName}` : `Students in ${courseName}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex flex-col items-center gap-3">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-gray-600 dark:text-gray-400">Loading students...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
                {error}
              </div>
            </div>
          ) : students.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-4xl mb-3">👨‍🎓</div>
                <p className="text-gray-600 dark:text-gray-400">
                  No students assigned to this {batchId ? "batch" : "course"} yet.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                        Roll No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                        Batch
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {students.map((student) => (
                      <tr
                        key={student._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {student.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {student.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {student.phone || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-gray-700 dark:text-gray-300">
                          {student.rollNumber || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {student.course || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {student.batchName || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              student.status === "active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {student.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Total Students: <span className="font-bold text-gray-900 dark:text-white">{students.length}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
