"use client";

import { useState } from "react";
import { X, Mail, AlertCircle, CheckCircle } from "lucide-react";
import { api, safeApiCall } from "@/lib/apiClient";

interface SendSubscriptionNotificationModalProps {
  tenantId: string;
  tenantName: string;
  tenantEmail: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SendSubscriptionNotificationModal({
  tenantId,
  tenantName,
  tenantEmail,
  onClose,
  onSuccess,
}: SendSubscriptionNotificationModalProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSendNotification = async () => {
    console.log('🔔 handleSendNotification called');
    console.log('📤 Sending notification for tenantId:', tenantId);
    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      console.log('🌐 Making API call to /api/subscription-notifications/send-expiry-notification');
      const [data, err] = await safeApiCall(() =>
        api.post("/api/subscription-notifications/send-expiry-notification", {
          tenantId,
        })
      );
      
      console.log('📥 API Response - data:', data, 'error:', err);
      
      if (err) {
        setStatus("error");
        setMessage(err.message || "Failed to send notification");
        setLoading(false);
        return;
      }

      if (data?.success) {
        setStatus("success");
        setMessage(`✅ Notification sent to ${tenantName}!`);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setStatus("error");
        setMessage(data?.message || "Failed to send notification");
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Error sending notification:", error);
      setStatus("error");
      setMessage(error.message || "Error sending notification");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Mail size={20} className="text-blue-600" />
            Send Expiry Notification
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Tenant Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              <strong>Tenant:</strong> {tenantName}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <strong>Email:</strong> {tenantEmail}
            </p>
          </div>

          {/* Info Message */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex gap-3">
            <AlertCircle size={20} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium mb-1">This will send:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Professional HTML email with subscription details</li>
                <li>Current plan information and available upgrade options</li>
                <li>Link to dashboard subscription page for easy upgrade</li>
              </ul>
            </div>
          </div>

          {/* Status Messages */}
          {status === "success" && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex gap-3">
              <CheckCircle size={20} className="text-green-600 dark:text-green-400 flex-shrink-0" />
              <p className="text-sm font-medium text-green-800 dark:text-green-200">{message}</p>
            </div>
          )}

          {status === "error" && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-3">
              <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0" />
              <p className="text-sm font-medium text-red-800 dark:text-red-200">{message}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSendNotification}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail size={16} />
                Send Notification
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
