"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type DemoRequest = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
};

export default function DemoRequestsPage() {
  const [requests, setRequests] = useState<DemoRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: "",
    phone: "",
    googleMeetLink: "",
    name: "",
    scheduleDate: "",
    scheduleTime: "",
  });

  useEffect(() => {
    fetchDemoRequests();
  }, [page, status]);

  const fetchDemoRequests = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());
      if (status) queryParams.append("status", status);

      const res = await fetch(`/api/demo-requests?${queryParams.toString()}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch demo requests");
      }

      const data = await res.json();
      setRequests(data.demoRequests);
      setTotal(data.pagination.total);
    } catch (err: any) {
      console.error("❌ Error fetching demo requests:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    setPage(1);
  };

  const handleCreateDemoSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      // Combine date and time
      const demoDateTime = new Date(`${createForm.scheduleDate}T${createForm.scheduleTime}`);

      const res = await fetch("/api/demo-requests", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createForm.name,
          email: createForm.email,
          phone: createForm.phone,
          company: "Manual Demo Session",
          demoDateTime: demoDateTime.toISOString(),
          date: createForm.scheduleDate,
          time: createForm.scheduleTime,
          message: `Google Meet Link: ${createForm.googleMeetLink}`,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create demo session");
      }

      const data = await res.json();
      console.log("✅ Demo session created:", data);

      // Reset form and close modal
      setCreateForm({ email: "", phone: "", googleMeetLink: "", name: "", scheduleDate: "", scheduleTime: "" });
      setShowCreateModal(false);

      // Refresh demo requests list
      fetchDemoRequests();
      alert("Demo session created successfully!");
    } catch (err: any) {
      console.error("❌ Error creating demo session:", err);
      alert("Error: " + err.message);
    } finally {
      setCreating(false);
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

  const pages = Math.ceil(total / limit);

  if (loading) return <p className="p-6 text-gray-500">Loading demo requests...</p>;
  if (error)
    return <p className="p-6 text-red-600">Error: {error}</p>;

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          📅 Demo Requests
        </h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Total: <strong>{total}</strong> requests
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium transition"
          >
            + Create Demo Session
          </button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => handleStatusChange("")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            status === ""
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          All
        </button>
        {["pending", "confirmed", "completed", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => handleStatusChange(s)}
            className={`px-4 py-2 rounded-lg font-medium transition capitalize ${
              status === s
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Company
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Date & Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {requests.map((req) => (
              <tr
                key={req._id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {req.name}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {req.email}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {req.company}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  <div>{req.date}</div>
                  <div className="text-xs">{req.time}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      req.status
                    )}`}
                  >
                    {req.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <Link
                    href={`/dashboard/demo-requests/${req._id}`}
                    className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {requests.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-4">
          No demo requests found.
        </p>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>
          {Array.from({ length: pages }).map((_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`px-3 py-2 rounded-lg transition ${
                  page === pageNum
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setPage(Math.min(pages, page + 1))}
            disabled={page === pages}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next
          </button>
        </div>
      )}

      {/* Create Demo Session Drawer */}
      {showCreateModal && (
        <>
          {/* Backdrop with Blur */}
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 cursor-pointer"
            onClick={() => {
              setShowCreateModal(false);
              setCreateForm({
                email: "",
                phone: "",
                googleMeetLink: "",
                name: "",
              });
            }}
          />

          {/* Right Side Drawer */}
          <div className="fixed right-0 top-0 h-screen w-full max-w-md bg-white dark:bg-gray-800 shadow-lg z-50 overflow-y-auto transform transition-transform duration-300">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Create Demo Session
                </h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateForm({
                      email: "",
                      phone: "",
                      googleMeetLink: "",
                      name: "",
                      scheduleDate: "",
                      scheduleTime: "",
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateDemoSession} className="space-y-4">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.name}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Enter client name"
                  />
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, email: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="client@example.com"
                  />
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={createForm.phone}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="+91 9876543210"
                  />
                </div>

                {/* Google Meet Link Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Google Meet Link
                  </label>
                  <input
                    type="url"
                    required
                    value={createForm.googleMeetLink}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        googleMeetLink: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="https://meet.google.com/..."
                  />
                </div>

                {/* Schedule Date Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Schedule Date
                  </label>
                  <input
                    type="date"
                    required
                    value={createForm.scheduleDate}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        scheduleDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Schedule Time Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Schedule Time
                  </label>
                  <input
                    type="time"
                    required
                    value={createForm.scheduleTime}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        scheduleTime: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-6 sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 -mx-6 px-6 py-4">
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {creating ? "Creating..." : "Create Session"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setCreateForm({
                        email: "",
                        phone: "",
                        googleMeetLink: "",
                        name: "",
                        scheduleDate: "",
                        scheduleTime: "",
                      });
                    }}
                    disabled={creating}
                    className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
