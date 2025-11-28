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
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Total: <strong>{total}</strong> requests
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
    </div>
  );
}
