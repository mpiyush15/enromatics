"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type DemoRequest = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export default function DemoRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [request, setRequest] = useState<DemoRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchDemoRequest();
    }
  }, [id]);

  const fetchDemoRequest = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/demo-requests/${id}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch demo request");
      }

      const data = await res.json();
      setRequest(data.demoRequest);
      setStatus(data.demoRequest.status);
      setNotes(data.demoRequest.notes);
    } catch (err: any) {
      console.error("❌ Error fetching demo request:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!status) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/demo-requests/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });

      if (!res.ok) {
        throw new Error("Failed to update demo request");
      }

      const data = await res.json();
      setRequest(data.demoRequest);
      alert("✅ Demo request updated successfully");
    } catch (err: any) {
      console.error("❌ Error updating demo request:", err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this demo request?")) return;

    try {
      const res = await fetch(`/api/demo-requests/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error("Failed to delete demo request");
      }

      alert("✅ Demo request deleted successfully");
      router.push("/dashboard/demo-requests");
    } catch (err: any) {
      console.error("❌ Error deleting demo request:", err);
      alert(`❌ Error: ${err.message}`);
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading)
    return <p className="p-6 text-gray-500">Loading demo request...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;
  if (!request)
    return <p className="p-6 text-gray-500">Demo request not found.</p>;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            📅 Demo Request Details
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Requested on {new Date(request.createdAt).toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
        >
          ← Back
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Requestor Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              👤 Contact Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Full Name
                </label>
                <p className="text-lg text-gray-900 dark:text-white">
                  {request.name}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Email
                  </label>
                  <p className="text-gray-900 dark:text-white break-all">
                    <a
                      href={`mailto:${request.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {request.email}
                    </a>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Phone
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    <a
                      href={`tel:${request.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {request.phone}
                    </a>
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Company/Institute
                </label>
                <p className="text-gray-900 dark:text-white">
                  {request.company}
                </p>
              </div>
            </div>
          </div>

          {/* Demo Scheduled */}
          <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg shadow-md p-6 border border-blue-200 dark:border-blue-700">
            <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4">
              📅 Demo Scheduled
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Date
                </label>
                <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  {request.date}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Time (IST)
                </label>
                <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  {request.time}
                </p>
              </div>
            </div>
          </div>

          {/* Message */}
          {request.message && (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                💬 Message
              </h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {request.message}
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Status & Actions */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Status
            </h2>
            <div className="mb-4">
              <span
                className={`px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(
                  request.status
                )}`}
              >
                {request.status.toUpperCase()}
              </span>
            </div>

            {/* Status Change */}
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                Update Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              📝 Internal Notes
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleUpdateStatus}
              disabled={updating}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition"
            >
              {updating ? "Updating..." : "✓ Update"}
            </button>
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition"
            >
              🗑️ Delete Request
            </button>
          </div>

          {/* Metadata */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-xs text-gray-600 dark:text-gray-400">
            <p>
              <strong>Created:</strong> {new Date(request.createdAt).toLocaleString()}
            </p>
            <p>
              <strong>Updated:</strong> {new Date(request.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
