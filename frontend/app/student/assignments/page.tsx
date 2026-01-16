"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTenantFromBrowser } from "@/lib/middleware/tenantContext";

interface Assignment {
  _id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: "submitted" | "pending" | "overdue";
  score?: number;
  totalMarks?: number;
}

export default function AssignmentsPage() {
  const router = useRouter();
  const [tenant, setTenant] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "submitted">("all");

  useEffect(() => {
    const tenantSubdomain = getTenantFromBrowser();
    setTenant(tenantSubdomain);

    if (!tenantSubdomain) {
      router.push("/student/login");
      return;
    }

    fetchAssignments();
  }, [router]);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setLoading(false);
        return;
      }

      const res = await fetch("/api/student/assignments", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setAssignments(data.assignments || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    if (filter === "all") return true;
    return a.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "overdue":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading assignments...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 mb-6 font-semibold"
        >
          ← Back to Home
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Assignments</h1>

          {/* Filter Buttons */}
          <div className="flex gap-3 mb-6">
            {(["all", "pending", "submitted"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === f
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Assignments List */}
          {filteredAssignments.length > 0 ? (
            <div className="space-y-4">
              {filteredAssignments.map((assignment) => (
                <div
                  key={assignment._id}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {assignment.title}
                      </h3>
                      <p className="text-sm text-gray-600">{assignment.subject}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-4 ${getStatusColor(
                        assignment.status
                      )}`}
                    >
                      {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                      📅 Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                    {assignment.score !== undefined && assignment.totalMarks && (
                      <p className="text-sm font-semibold text-blue-600">
                        Score: {assignment.score}/{assignment.totalMarks}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 text-lg">
                No {filter !== "all" ? filter : ""} assignments
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
