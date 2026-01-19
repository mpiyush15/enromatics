"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/apiClient";

interface Props {
  tenantId?: string;
}

interface Student {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface WhatsAppConfig {
  isConfigured: boolean;
  connectionStatus: "connected" | "disconnected" | "error";
  phoneNumber?: string;
  businessAccountId?: string;
  phoneNumberId?: string;
  errorMessage?: string;
  connectedAt?: string;
}

export default function WhatsAppEventsSettings({ tenantId }: Props) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [whatsappConfig, setWhatsappConfig] = useState<WhatsAppConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  const [eventTriggers, setEventTriggers] = useState({
    absenceNotifications: {
      enabled: false,
      template: "Hi {studentName}, you were marked absent on {date}",
    },
    enrollmentNotifications: {
      enabled: false,
      emailEnabled: false,
      whatsappTemplate: "Hi {studentName}, welcome! You have been enrolled in {batchName}. 📚\n\nYour Portal Access:\n🔗 URL: {portalUrl}\n👤 Login ID: {loginId}\n🔐 Password: {password}\n\nDownload our app: {googlePlayUrl}\n\nHappy Learning!",
    },
  });

  const [testPhone, setTestPhone] = useState("");
  const [testStatus, setTestStatus] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info"
  );

  useEffect(() => {
    fetchSettings();
    fetchLogs();
    fetchWhatsAppConfig();
    fetchStudents();
  }, [tenantId]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/whatsapp/events/settings?tenantId=${tenantId}`);
      if (response?.success && response?.eventTriggers) {
        setEventTriggers(response.eventTriggers);
      }
    } catch (error: any) {
      console.error("Error fetching settings:", error);
      setMessage("Failed to load settings");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const fetchWhatsAppConfig = async () => {
    try {
      setConfigLoading(true);
      const response = await api.get(`/api/whatsapp/config?tenantId=${tenantId}`);
      // The response might be wrapped in a 'config' field or be direct
      const configData = response?.config || response;
      if (configData) {
        setWhatsappConfig({
          isConfigured: configData.isConfigured,
          connectionStatus: configData.connectionStatus,
          phoneNumber: configData.phoneNumber,
          businessAccountId: configData.businessAccountId,
          phoneNumberId: configData.phoneNumberId,
          errorMessage: configData.errorMessage,
          connectedAt: configData.connectedAt,
        });
      }
    } catch (error: any) {
      console.error("Error fetching WhatsApp config:", error);
    } finally {
      setConfigLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      const response = await api.get(`/api/students?tenantId=${tenantId}&limit=100`);
      const studentsList = response?.data || response?.students || [];
      setStudents(studentsList);
    } catch (error: any) {
      console.error("Error fetching students:", error);
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      const response = await api.get(`/api/whatsapp/events/logs?tenantId=${tenantId}&limit=10`);
      if (response?.success) {
        setLogs(response.logs || []);
      } else {
        setLogs(response?.logs || []);
      }
    } catch (error: any) {
      console.error("Error fetching logs:", error.message || error);
      // Don't set error message for logs - it's optional
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

  const handleEnrollmentToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setEventTriggers({
      ...eventTriggers,
      enrollmentNotifications: {
        ...eventTriggers.enrollmentNotifications,
        enabled: checked,
      },
    });
  };

  const handleEnrollmentEmailToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setEventTriggers({
      ...eventTriggers,
      enrollmentNotifications: {
        ...eventTriggers.enrollmentNotifications,
        emailEnabled: checked,
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

  const handleEnrollmentTemplateChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const template = e.target.value;
    setEventTriggers({
      ...eventTriggers,
      enrollmentNotifications: {
        ...eventTriggers.enrollmentNotifications,
        whatsappTemplate: template,
      },
    });
  };

  const handleSaveSettings = async () => {
    try {
      setMessage("");
      setSaving(true);
      
      // Save absence notifications via WhatsApp events settings endpoint
      const absenceResponse = await api.put(`/api/whatsapp/events/settings?tenantId=${tenantId}`, {
        eventType: "absenceNotifications",
        enabled: eventTriggers.absenceNotifications.enabled,
        template: eventTriggers.absenceNotifications.template,
      });

      // Save enrollment notifications via same WhatsApp events settings endpoint
      const enrollmentResponse = await api.put(`/api/whatsapp/events/settings?tenantId=${tenantId}`, {
        eventType: "enrollmentNotifications",
        enabled: eventTriggers.enrollmentNotifications.enabled,
        emailEnabled: eventTriggers.enrollmentNotifications.emailEnabled,
        whatsappTemplate: eventTriggers.enrollmentNotifications.whatsappTemplate,
      });

      if (absenceResponse?.success || enrollmentResponse?.success) {
        setMessage("✅ All settings saved successfully");
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
      if (!selectedStudentId) {
        setMessage("Please select a student");
        setMessageType("error");
        return;
      }

      setMessage("");
      setTestStatus("Sending...");
      setTesting(true);

      const response = await api.post(`/api/whatsapp/events/test?tenantId=${tenantId}`, {
        studentId: selectedStudentId,
      });

      if (response?.success) {
        setTestStatus("✅ Test message sent! Check WhatsApp");
        setMessageType("success");
        setSelectedStudentId("");
        
        setTimeout(() => {
          fetchLogs();
        }, 1500);
      } else {
        const reason = response?.reason || response?.message || "Unknown error";
        setTestStatus(`❌ ${reason}`);
        setMessageType("error");
      }
    } catch (error: any) {
      setTestStatus(`❌ ${error.message || "Failed to send test message"}`);
      setMessageType("error");
      console.error("Error:", error);
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p>Loading WhatsApp settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Messages */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
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

      {/* WhatsApp Connection Status */}
      {configLoading ? (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 animate-pulse">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
        </div>
      ) : whatsappConfig ? (
        <div
          className={`rounded-lg p-6 border-l-4 ${
            whatsappConfig.connectionStatus === "connected"
              ? "bg-green-50 border-green-500 dark:bg-green-900/20"
              : whatsappConfig.connectionStatus === "error"
              ? "bg-red-50 border-red-500 dark:bg-red-900/20"
              : "bg-yellow-50 border-yellow-500 dark:bg-yellow-900/20"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
              {whatsappConfig.connectionStatus === "connected"
                ? "✅ WhatsApp Connected"
                : whatsappConfig.connectionStatus === "error"
                ? "❌ WhatsApp Error"
                : "⚠️ WhatsApp Not Connected"}
            </h4>
          </div>
          
          {whatsappConfig.connectionStatus === "connected" && (
            <div className="space-y-2 text-sm">
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">📱 Phone Number:</span> {whatsappConfig.phoneNumber}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">🆔 Business Account:</span> {whatsappConfig.businessAccountId}
              </p>
              {whatsappConfig.phoneNumberId && (
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-medium">📲 Phone ID:</span> {whatsappConfig.phoneNumberId}
                </p>
              )}
              {whatsappConfig.connectedAt && (
                <p className="text-gray-600 dark:text-gray-400 text-xs">
                  Connected: {new Date(whatsappConfig.connectedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
          
          {whatsappConfig.connectionStatus === "error" && whatsappConfig.errorMessage && (
            <p className="text-red-700 dark:text-red-200 text-sm">
              <span className="font-medium">Error:</span> {whatsappConfig.errorMessage}
            </p>
          )}
          
          {!whatsappConfig.isConfigured && (
            <p className="text-yellow-700 dark:text-yellow-200 text-sm">
              ⚠️ WhatsApp connection is not configured. Please set it up in <a href={`/dashboard/client/${tenantId}/whatsapp/settings`} className="underline font-medium hover:no-underline">WhatsApp Settings</a> first.
            </p>
          )}
        </div>
      ) : null}

      {/* Absence Notifications Section */}
      <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 ${
        whatsappConfig?.connectionStatus !== "connected" ? "opacity-50 pointer-events-none" : ""
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              ✉️ Absence Notifications
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Send WhatsApp messages when students are marked absent
            </p>
          </div>
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

        {/* Message Template */}
        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Message Template
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Available placeholders: {"{studentName}"}, {"{date}"}, {"{remarks}"}
          </p>
          <textarea
            value={eventTriggers.absenceNotifications.template}
            onChange={handleTemplateChange}
            disabled={!eventTriggers.absenceNotifications.enabled}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
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
          className="mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          {saving ? "💾 Saving..." : "💾 Save Settings"}
        </button>
      </div>

      {/* Enrollment Notifications Section */}
      <div className={`bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 ${
        whatsappConfig?.connectionStatus !== "connected" ? "opacity-50 pointer-events-none" : ""
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              🎓 Enrollment Notifications
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Send WhatsApp messages when new students enroll with their portal access details
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={eventTriggers.enrollmentNotifications.enabled}
              onChange={handleEnrollmentToggle}
              className="w-6 h-6 rounded cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {eventTriggers.enrollmentNotifications.enabled
                ? "🟢 Enabled"
                : "🔴 Disabled"}
            </span>
          </div>
        </div>

        {/* Email Notification Toggle */}
        <div className="mb-4 p-3 bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="enrollmentEmail"
              checked={eventTriggers.enrollmentNotifications.emailEnabled}
              onChange={handleEnrollmentEmailToggle}
              disabled={!eventTriggers.enrollmentNotifications.enabled}
              className="w-4 h-4 rounded cursor-pointer"
            />
            <label htmlFor="enrollmentEmail" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              📧 Also send email notification to tenant admin
            </label>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-7">
            When enabled, tenant admin will receive an email with enrollment details
          </p>
        </div>

        {/* Message Template */}
        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            WhatsApp Message Template
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Available placeholders: {"{studentName}"}, {"{batchName}"}, {"{portalUrl}"}, {"{loginId}"}, {"{password}"}, {"{googlePlayUrl}"}
          </p>
          <textarea
            value={eventTriggers.enrollmentNotifications.whatsappTemplate}
            onChange={handleEnrollmentTemplateChange}
            disabled={!eventTriggers.enrollmentNotifications.enabled}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
            rows={6}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            <strong>Preview:</strong>
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 p-2 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 whitespace-pre-wrap">
            {eventTriggers.enrollmentNotifications.whatsappTemplate
              .replace("{studentName}", "John Doe")
              .replace("{batchName}", "Class A")
              .replace("{portalUrl}", "https://portal.enromatics.com")
              .replace("{loginId}", "2025MA001")
              .replace("{password}", "XXXXX")
              .replace("{googlePlayUrl}", "Coming soon")}
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          {saving ? "💾 Saving..." : "💾 Save All Settings"}
        </button>
      </div>

      {/* Test Message Section */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🧪 Test Absence Message
        </h3>

        {testStatus && (
          <div className={`mb-4 p-3 rounded ${
            testStatus.includes("✅")
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
          }`}>
            {testStatus}
          </div>
        )}

        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Student
            </label>
            {studentsLoading ? (
              <div className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded text-gray-500">
                Loading students...
              </div>
            ) : (
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">-- Select a student --</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name} {student.phone ? `(${student.phone})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>
          <button
            onClick={handleTestMessage}
            disabled={testing || !eventTriggers.absenceNotifications.enabled}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            {testing ? "📤 Sending..." : "📤 Send Test"}
          </button>
        </div>
      </div>

      {/* Logs Section */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📋 Message Logs
        </h3>

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
                  <tr
                    key={log._id}
                    className="hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
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
  );
}
