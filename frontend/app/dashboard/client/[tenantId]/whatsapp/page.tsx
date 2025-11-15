"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Stats {
  total: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  deliveryRate: string;
  readRate: string;
}

interface Message {
  _id: string;
  recipientPhone: string;
  recipientName?: string;
  content: any;
  status: string;
  sentAt?: string;
  createdAt: string;
}

export default function WhatsAppDashboardPage() {
  const { tenantId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    checkConfig();
    
    // Auto-refresh stats every 10 seconds
    const interval = setInterval(() => {
      if (configured) {
        fetchStats();
        fetchRecentMessages();
      }
    }, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(interval);
  }, [configured]);

  const checkConfig = async () => {
    try {
      const res = await fetch(`http://localhost:5050/api/whatsapp/config`, {
        credentials: "include",
      });
      const data = await res.json();
      
      setConfigured(data.configured);
      
      if (data.configured) {
        fetchStats();
        fetchRecentMessages();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`http://localhost:5050/api/whatsapp/stats`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecentMessages = async () => {
    try {
      const res = await fetch(
        `http://localhost:5050/api/whatsapp/messages?limit=5`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (data.success) {
        setRecentMessages(data.messages);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStats(), fetchRecentMessages()]);
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600"></div>
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Header */}
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 rounded-3xl shadow-2xl p-12 text-white mb-8 text-center">
            <div className="text-8xl mb-6">💬</div>
            <h1 className="text-5xl font-bold mb-4">
              Welcome to WhatsApp Business
            </h1>
            <p className="text-xl text-green-100">
              Connect with students & parents instantly through WhatsApp
            </p>
          </div>

          {/* Setup Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold mb-4">🚀 Get Started in 3 Steps</h2>

            <div className="space-y-6 mb-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Get Your WhatsApp Business Account</h3>
                  <p className="text-gray-600 text-sm">
                    Visit{" "}
                    <a
                      href="https://business.facebook.com"
                      target="_blank"
                      className="text-blue-600 underline"
                    >
                      Meta Business Suite
                    </a>{" "}
                    and create a WhatsApp Business Account
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Get Your Credentials</h3>
                  <p className="text-gray-600 text-sm">
                    Copy your WABA ID, Phone Number ID, and Access Token from Meta Business Settings
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-xl">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Configure Your Account</h3>
                  <p className="text-gray-600 text-sm">
                    Enter your credentials in Settings and test the connection
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                router.push(`/dashboard/client/${tenantId}/whatsapp/settings`)
              }
              className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-bold text-lg"
            >
              Configure WhatsApp Now →
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="text-4xl mb-3">📨</div>
              <h3 className="font-bold text-lg mb-2">Bulk Messaging</h3>
              <p className="text-sm text-gray-600">
                Send messages to multiple students and parents at once
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-bold text-lg mb-2">Instant Delivery</h3>
              <p className="text-sm text-gray-600">
                Real-time message delivery with read receipts
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="font-bold text-lg mb-2">Track Performance</h3>
              <p className="text-sm text-gray-600">
                Monitor delivery rates and engagement analytics
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 rounded-3xl shadow-2xl p-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2">💬 WhatsApp Business Dashboard</h1>
              <p className="text-green-100">
                Your complete WhatsApp messaging overview
              </p>
              {lastUpdated && (
                <p className="text-xs text-green-200 mt-1">
                  Last updated: {lastUpdated.toLocaleTimeString()} • Auto-refreshes every 10s
                </p>
              )}
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              <span className={refreshing ? "animate-spin" : ""}>🔄</span>
              {refreshing ? "Refreshing..." : "Refresh Now"}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-blue-200">
              <div className="text-4xl mb-2">📨</div>
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Messages</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-indigo-200">
              <div className="text-4xl mb-2">📤</div>
              <div className="text-3xl font-bold text-indigo-600">{stats.sent}</div>
              <div className="text-sm text-gray-600">Sent</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-green-200">
              <div className="text-4xl mb-2">✅</div>
              <div className="text-3xl font-bold text-green-600">
                {stats.delivered}
              </div>
              <div className="text-sm text-gray-600">Delivered</div>
              <div className="text-xs text-green-600 font-semibold">
                {stats.deliveryRate}%
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-purple-200">
              <div className="text-4xl mb-2">👁️</div>
              <div className="text-3xl font-bold text-purple-600">{stats.read}</div>
              <div className="text-sm text-gray-600">Read</div>
              <div className="text-xs text-purple-600 font-semibold">
                {stats.readRate}%
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border-2 border-red-200">
              <div className="text-4xl mb-2">❌</div>
              <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() =>
              router.push(`/dashboard/client/${tenantId}/whatsapp/campaigns`)
            }
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all"
          >
            <div className="text-6xl mb-4">📨</div>
            <h3 className="text-xl font-bold mb-2">Send Messages</h3>
            <p className="text-sm text-gray-600">
              Create and send bulk WhatsApp campaigns
            </p>
          </button>

          <button
            onClick={() =>
              router.push(`/dashboard/client/${tenantId}/whatsapp/reports`)
            }
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:border-purple-500 hover:shadow-xl transition-all"
          >
            <div className="text-6xl mb-4">📈</div>
            <h3 className="text-xl font-bold mb-2">View Reports</h3>
            <p className="text-sm text-gray-600">
              Track message delivery and engagement
            </p>
          </button>

          <button
            onClick={() =>
              router.push(`/dashboard/client/${tenantId}/whatsapp/settings`)
            }
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border-2 border-gray-200 hover:border-green-500 hover:shadow-xl transition-all"
          >
            <div className="text-6xl mb-4">⚙️</div>
            <h3 className="text-xl font-bold mb-2">Settings</h3>
            <p className="text-sm text-gray-600">
              Manage your WhatsApp account settings
            </p>
          </button>
        </div>

        {/* Recent Messages */}
        {recentMessages.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Recent Messages</h2>
              <button
                onClick={() =>
                  router.push(`/dashboard/client/${tenantId}/whatsapp/reports`)
                }
                className="text-blue-600 hover:underline font-semibold text-sm"
              >
                View All →
              </button>
            </div>

            <div className="p-6 space-y-4">
              {recentMessages.map((msg) => (
                <div
                  key={msg._id}
                  className="flex items-center gap-4 p-4 border-2 rounded-xl hover:bg-blue-50 dark:hover:bg-gray-700"
                >
                  <div className="text-3xl">
                    {msg.status === "read"
                      ? "👁️"
                      : msg.status === "delivered"
                      ? "✅"
                      : msg.status === "sent"
                      ? "📤"
                      : msg.status === "failed"
                      ? "❌"
                      : "📨"}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">
                      {msg.recipientName || msg.recipientPhone}
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-1">
                      {msg.content?.text || "-"}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {msg.sentAt
                      ? new Date(msg.sentAt).toLocaleString()
                      : new Date(msg.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
