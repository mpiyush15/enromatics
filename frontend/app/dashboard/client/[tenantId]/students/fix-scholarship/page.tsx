"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle, XCircle, ArrowLeft, Play } from "lucide-react";

export default function FixScholarshipStudentsPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params?.tenantId as string;

  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const runMigration = async () => {
    if (!confirm("This will fix all scholarship-enrolled students with negative balance or missing roll numbers. Continue?")) {
      return;
    }

    try {
      setRunning(true);
      setError("");
      setResult(null);

      const res = await fetch("/api/students/fix-scholarship-enrollments", {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Migration failed");
      }

      setResult(data);
    } catch (err: any) {
      console.error("Migration error:", err);
      setError(err.message || "An error occurred");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push(`/dashboard/client/${tenantId}/students`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back to Students
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Fix Scholarship Enrollments</h1>
          <p className="text-gray-600 mt-2">
            This migration will fix students enrolled from scholarship exams who have:
          </p>
          <ul className="mt-2 space-y-1 text-gray-600">
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Negative balance (will be reset to 0)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Missing roll numbers (will be generated)
            </li>
          </ul>
        </div>

        {/* Warning Box */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-yellow-600 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-yellow-900">Before Running</h3>
              <p className="text-yellow-800 text-sm mt-1">
                This migration will update existing student records. Make sure you have a database backup.
                It's safe to run multiple times - it will only update students that need fixing.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <button
            onClick={runMigration}
            disabled={running}
            className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-semibold text-white transition-colors ${
              running
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {running ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Running Migration...
              </>
            ) : (
              <>
                <Play size={20} />
                Run Migration
              </>
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex items-start gap-3">
              <XCircle className="text-red-600 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-semibold text-red-900">Error</h3>
                <p className="text-red-800 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Success Header */}
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold text-green-900">Migration Completed</h3>
                  <p className="text-green-800 text-sm mt-1">{result.message}</p>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Summary</h4>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Found</p>
                  <p className="text-2xl font-bold text-gray-900">{result.summary?.totalFound || 0}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600">Fixed</p>
                  <p className="text-2xl font-bold text-green-900">{result.summary?.fixed || 0}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-red-600">Errors</p>
                  <p className="text-2xl font-bold text-red-900">{result.summary?.errors || 0}</p>
                </div>
              </div>

              {/* Fixed Students */}
              {result.fixedStudents && result.fixedStudents.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Fixed Students</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {result.fixedStudents.map((student: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-600">ID: {student.studentId}</p>
                        <div className="mt-2 space-y-1">
                          {student.updates.balance !== undefined && (
                            <p className="text-xs text-green-600">✓ Balance fixed: 0</p>
                          )}
                          {student.updates.rollNumber && (
                            <p className="text-xs text-blue-600">✓ Roll number: {student.updates.rollNumber}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Errors */}
              {result.errors && result.errors.length > 0 && (
                <div>
                  <h4 className="font-semibold text-red-900 mb-3">Errors</h4>
                  <div className="space-y-2">
                    {result.errors.map((err: any, idx: number) => (
                      <div key={idx} className="bg-red-50 p-3 rounded-lg">
                        <p className="font-medium text-red-900">{err.name}</p>
                        <p className="text-sm text-red-700">ID: {err.studentId}</p>
                        <p className="text-xs text-red-600 mt-1">Error: {err.error}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 p-4 flex gap-3">
              <button
                onClick={() => router.push(`/dashboard/client/${tenantId}/students`)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Students
              </button>
              <button
                onClick={() => {
                  setResult(null);
                  setError("");
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Run Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
