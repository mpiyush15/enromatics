"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/apiConfig";

interface MessageContent {
  text?: string;
  templateName?: string;
}

interface Message {
  _id: string;
  recipientName?: string;
  recipientPhone: string;
  content: MessageContent;
  status: string;
  campaign: string;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  createdAt: string;
}

interface Stats {
  total: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  deliveryRate: number;
  readRate: number;
}

export default function WhatsappReportsPage() {
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (statusFilter) params.append("status", statusFilter);
      if (campaignFilter) params.append("campaign", campaignFilter);

      const res = await fetch(
        `${API_BASE_URL}/api/whatsapp/messages?${params}`,
        { credentials: "include" }
      );
      const data = await res.json();

      if (data.success) {
        setMessages(data.messages);
        setTotalPages(data.pagination.pages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/whatsapp/stats`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchStats();
  }, [statusFilter, campaignFilter, page, fetchMessages, fetchStats]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      sent: "bg-blue-100 text-blue-800",
      delivered: "bg-green-100 text-green-800",
      read: "bg-purple-100 text-purple-800",
      failed: "bg-red-100 text-red-800",
      queued: "bg-yellow-100 text-yellow-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, string> = {
      sent: "📤",
      delivered: "✅",
      read: "👁️",
      failed: "❌",
      queued: "⏳",
    };
    return icons[status] || "📨";
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-700 rounded-xl md:rounded-3xl shadow-2xl p-4 md:p-8 text-white">
          <h1 className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">📈 WhatsApp Reports</h1>
          <p className="text-sm md:text-base text-purple-100">
            Track message delivery & campaign performance
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border-2 border-blue-200 dark:border-blue-900">
              <div className="text-3xl md:text-4xl mb-2">📨</div>
              <div className="text-2xl md:text-3xl font-bold text-blue-600">
                {stats.total}
              </div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Total Sent</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border-2 border-green-200 dark:border-green-900">
              <div className="text-3xl md:text-4xl mb-2">✅</div>
              <div className="text-2xl md:text-3xl font-bold text-green-600">
                {stats.delivered}
              </div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Delivered</div>
              <div className="text-xs text-green-600 font-semibold">
                {stats.deliveryRate}% rate
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border-2 border-purple-200 dark:border-purple-900">
              <div className="text-3xl md:text-4xl mb-2">👁️</div>
              <div className="text-2xl md:text-3xl font-bold text-purple-600">
                {stats.read}
              </div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Read</div>
              <div className="text-xs text-purple-600 font-semibold">
                {stats.readRate}% rate
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-lg p-4 md:p-6 border-2 border-red-200 dark:border-red-900">
              <div className="text-3xl md:text-4xl mb-2">❌</div>
              <div className="text-2xl md:text-3xl font-bold text-red-600">
                {stats.failed}
              </div>
              <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Failed</div>
            </div>
          </div>
        )}

        {/* Filters & Messages Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="bg-gray-50 dark:bg-gray-700 px-4 md:px-6 py-3 md:py-4 border-b">
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-start md:items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold">Message History</h2>

              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 md:px-4 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-sm"
                >
                  <option value="">All Status</option>
                  <option value="sent">Sent</option>
                  <option value="delivered">Delivered</option>
                  <option value="read">Read</option>
                  <option value="failed">Failed</option>
                  <option value="queued">Queued</option>
                </select>

                <select
                  value={campaignFilter}
                  onChange={(e) => {
                    setCampaignFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-2 md:px-4 border-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 text-sm"
                >
                  <option value="">All Campaigns</option>
                  <option value="manual">Manual</option>
                  <option value="bulk_campaign">Bulk Campaign</option>
                  <option value="welcome">Welcome</option>
                  <option value="fee_reminder">Fee Reminder</option>
                  <option value="attendance_alert">Attendance Alert</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto -mx-4 md:mx-0">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-lg font-semibold mb-2">No Messages Yet</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Send your first WhatsApp message from the Campaigns page
                </p>
              </div>
            ) : (
              <table className="w-full min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-bold uppercase whitespace-nowrap">
                      Recipient
                    </th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-bold uppercase whitespace-nowrap">
                      Message
                    </th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-bold uppercase whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-bold uppercase whitespace-nowrap">
                      Campaign
                    </th>
                    <th className="px-4 md:px-6 py-3 md:py-4 text-left text-xs font-bold uppercase whitespace-nowrap">
                      Sent At
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {messages.map((msg) => (
                    <tr
                      key={msg._id}
                      className="hover:bg-blue-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <div className="font-semibold text-sm">
                          {msg.recipientName || "Unknown"}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                          {msg.recipientPhone}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4">
                        <div className="text-xs md:text-sm line-clamp-2 max-w-xs">
                          {msg.content?.text || msg.content?.templateName || "-"}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <span
                          className={`px-2 md:px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${getStatusBadge(
                            msg.status
                          )}`}
                        >
                          <span>{getStatusIcon(msg.status)}</span>
                          <span className="capitalize">{msg.status}</span>
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded text-xs">
                          {msg.campaign.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {msg.sentAt
                          ? new Date(msg.sentAt).toLocaleString()
                          : new Date(msg.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t flex justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Previous
              </button>
              <div className="px-4 py-2">
                Page {page} of {totalPages}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
