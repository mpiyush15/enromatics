"use client";

import { useState, useEffect } from "react";
import { X, Loader } from "lucide-react";
import type { StudentDTO } from "@/types/student";

interface StudentListModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch?: string;  // This will be batchId (MongoDB ID) from the button
  course?: string;
  batchName?: string;
  courseName?: string;
}

export default function StudentListModal({
  isOpen,
  onClose,
  batch,
  course,
  batchName,
  courseName,
}: StudentListModalProps) {
  const [students, setStudents] = useState<StudentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();
        params.set("page", "1");
        params.set("limit", "100");

        // batch param will be the batchId from batches page
        // course param will be the courseName from courses page (for regex match)
        if (batch) params.set("batchId", batch);
        if (course) params.set("course", course);

        const url = `/api/students?${params.toString()}`;
        console.log("🔍 StudentListModal fetching from:", url);

        const res = await fetch(url, {
          credentials: "include",
        });

        const data = await res.json();
        console.log("📦 StudentListModal API response:", data);

        if (!data.success) {
          throw new Error(data.message || "Failed to fetch students");
        }

        setStudents(data.students || []);
      } catch (err: any) {
        console.error("❌ StudentListModal error fetching students:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [isOpen, batch, course]);

  if (!isOpen) return null;

  const title = batchName ? `Students in ${batchName}` : courseName ? `Students in ${courseName}` : "Students";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader className="animate-spin" size={32} />
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {!loading && !error && students.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No students found
            </div>
          )}

          {!loading && !error && students.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                      Roll No
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
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                            {student.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {student.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {student.gender || "N/A"} • {student.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {student.email}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {student.phone || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {student.rollNumber || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            student.status === "active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {student.status || "inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
