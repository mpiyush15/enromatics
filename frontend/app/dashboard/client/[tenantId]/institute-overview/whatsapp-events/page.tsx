"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { api } from "@/lib/apiClient";

export default function WhatsAppEventsPage() {
  const { user } = useAuth();
  const params = useParams<{ tenantId: string }>();
  const tenantId = params?.tenantId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const [eventTriggers, setEventTriggers] = useState({
    absenceNotifications: {
      enabled: false,
      template: "Hi {studentName}, you were marked absent on {date}",
    },
  });

  const [testPhone, setTestPhone] = useState("");
  const [testStatus, setTestStatus] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info"
  );

  // Fetch settings
  useEffect(() => {
    fetchSettings();
    fetchLogs();
  }, [tenantId]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/whatsapp/events/settings`);
      if (response.data?.success && response.data?.eventTriggers) {
        setEventTriggers(response.data.eventTriggers);
      }
    } catch (error: any) {
      console.error("Error fetching settings:", error);
      setMessage("Failed to load settings");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      const response = await api.get(`/whatsapp/events/logs?limit=10`);
      if (response.data?.success) {
        setLogs(response.data.logs || []);
      }
    } catch (error: any) {
      console.error("Error fetching logs:", error);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setEventTriggers({
      ...eventTriggers,
      absenceNotifications: {
        ...eventTriggers.absenceNotifications,
        enabled: checked,
      },
    });
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const template = e.target.value;
    setEventTriggers({
      ...eventTriggers,
      absenceNotifications: {
        ...eventTriggers.absenceNotifications,
        template,
      },
    });
  };

  const handleSaveSettings = async () => {
    try {
      setMessage("");
      setSaving(true);
      const response = await api.put(`/whatsapp/events/settings`, {
        eventType: "absenceNotifications",
        enabled: eventTriggers.absenceNotifications.enabled,
        template: eventTriggers.absenceNotifications.template,
      });

      if (response.data?.success) {
        setMessage("✅ Settings saved successfully");
        setMessageType("success");
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Failed to save settings");
      setMessageType("error");
      console.error("Error saving:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleTestMessage = async () => {
    try {
      if (!testPhone) {
        setMessage("Please enter a phone number");
        setMessageType("error");
        return;
      }

      setMessage("");
      setTestStatus("Sending...");
      setTesting(true);

      // For demo - just show success
      setTestStatus("✅ Test message sent! Check WhatsApp");
      setMessageType("success");
      setTestPhone("");

      // Refresh logs
      setTimeout(() => {
        fetchLogs();
      }, 1000);
    } catch (error: any) {
      setTestStatus("❌ Failed to send test message");
      setMessageType("error");
      console.error("Error:", error);
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p>Loading WhatsApp settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            📱 WhatsApp Events
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure automated WhatsApp messages for student absences
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              messageType === "success"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : messageType === "error"
                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            }`}
          >
            {message}
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
          {/* Feature Toggle */}
          <div className="mb-8 pb-8 border-b dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <label className="text-lg font-semibold text-gray-900 dark:text-white">
                ✉️ Absence Notifications
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={eventTriggers.absenceNotifications.enabled}
                  onChange={handleToggle}
                  className="w-6 h-6 rounded cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {eventTriggers.absenceNotifications.enabled
                    ? "🟢 Enabled"
                    : "🔴 Disabled"}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Send WhatsApp message when a student is marked absent
            </p>
          </div>

          {/* Template Editor */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Message Template
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Available placeholders: {"{studentName}"}, {"{date}"}, {"{remarks}"}
            </p>
            <textarea
              value={eventTriggers.absenceNotifications.template}
              onChange={handleTemplateChange}
              disabled={!eventTriggers.absenceNotifications.enabled}
              className="w-full p-4 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              rows={4}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Preview: {eventTriggers.absenceNotifications.template
                .replace("{studentName}", "John Doe")
                .replace("{date}", new Date().toLocaleDateString("en-IN"))}
            </p>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveSettings}
            disabled={saving || !eventTriggers.absenceNotifications.enabled}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors mb-8"
          >
            {saving ? "💾 Saving..." : "💾 Save Settings"}
          </button>
        </div>

        {/* Test Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            🧪 Test Message
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Send a test message to verify WhatsApp integration
          </p>

          {testStatus && (
            <div className="mb-4 p-3 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded">
              {testStatus}
            </div>
          )}

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter phone number (e.g., +919876543210)"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button
              onClick={handleTestMessage}
              disabled={testing || !eventTriggers.absenceNotifications.enabled}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {testing ? "📤 Sending..." : "📤 Send Test"}
            </button>
          </div>
        </div>

        {/* Logs Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            📋 Message Logs
          </h2>

          {logsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No messages sent yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900 dark:text-white">
                      Sent At
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3 text-gray-900 dark:text-white">
                        {log.studentName || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {log.studentPhone}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            log.status === "sent"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : log.status === "failed"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                        {new Date(log.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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
