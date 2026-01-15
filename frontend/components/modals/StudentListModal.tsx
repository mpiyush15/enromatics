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

        // If batch is provided, use the batches/:batchId/students endpoint (more accurate)
        // This uses the BatchStudent collection which is the source of truth
        if (batch) {
          const url = `/api/batches/${batch}/students?page=1&limit=100`;
          console.log("🔍 StudentListModal fetching from batch endpoint:", url);
          
          const res = await fetch(url, {
            credentials: "include",
          });

          if (!res.ok) {
            console.error("❌ StudentListModal fetch failed with status:", res.status, res.statusText);
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP ${res.status}: Failed to fetch students`);
          }

          const data = await res.json();
          console.log("📦 StudentListModal batch students response:", data);

          if (!data.success) {
            throw new Error(data.message || "Failed to fetch students");
          }

          setStudents(data.students || []);
        } else if (course) {
          // For course-based filtering, use the students endpoint
          const params = new URLSearchParams();
          params.set("page", "1");
          params.set("limit", "100");
          params.set("course", course);

          const url = `/api/students?${params.toString()}`;
          console.log("🔍 StudentListModal fetching from students endpoint:", url);

          const res = await fetch(url, {
            credentials: "include",
          });

          const data = await res.json();
          console.log("📦 StudentListModal course students response:", data);

          if (!data.success) {
            throw new Error(data.message || "Failed to fetch students");
          }

          setStudents(data.students || []);
        }
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
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Right Side Drawer */}
      <div className="fixed right-0 top-0 h-screen w-full sm:w-[500px] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col transition-transform duration-300">
        {/* Header */}
        <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {loading ? "Loading..." : `${students.length} student${students.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <Loader className="animate-spin mx-auto mb-3 text-blue-600" size={32} />
                <p className="text-gray-600 dark:text-gray-400">Loading students...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && students.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-5xl mb-3">👥</div>
              <p className="text-gray-600 dark:text-gray-400">No students found</p>
            </div>
          )}

          {!loading && !error && students.length > 0 && (
            <div className="space-y-3">
              {students.map((student) => (
                <div
                  key={student._id}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {student.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {student.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {student.rollNumber && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                            📋 {student.rollNumber}
                          </span>
                        )}
                        {student.rollNo && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded text-xs font-medium">
                            📋 {student.rollNo}
                          </span>
                        )}
                        {!student.rollNumber && !student.rollNo && (
                          <span className="text-xs text-gray-500 dark:text-gray-500">No roll number</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
