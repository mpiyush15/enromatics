"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface Lead {
  _id: string;
  name: string;
  phone: string;
  email?: string;
}

interface WhatsAppSendModalProps {
  lead: Lead;
  tenantId: string;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

export default function WhatsAppSendModal({
  lead,
  tenantId,
  onClose,
  onSuccess,
}: WhatsAppSendModalProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [checkingConnection, setCheckingConnection] = useState(true);

  // Check if WhatsApp is configured
  useEffect(() => {
    const checkWhatsAppConnection = async () => {
      try {
        setCheckingConnection(true);
        const response = await fetch(
          `/api/whatsapp/config?tenantId=${tenantId}`,
          {
            credentials: "include",
          }
        );

        if (response.ok) {
          const data = await response.json();
          setIsConnected(data.isConfigured === true);
        } else {
          setIsConnected(false);
        }
      } catch (err) {
        console.error("Error checking WhatsApp connection:", err);
        setIsConnected(false);
      } finally {
        setCheckingConnection(false);
      }
    };

    checkWhatsAppConnection();
  }, [tenantId]);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/whatsapp/send-message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          tenantId,
          recipientPhone: lead.phone,
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }

      onSuccess?.(message);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4 rounded-t-lg">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            💬 Send WhatsApp Message
          </h2>
        </div>

        <div className="p-6 space-y-4">
          {checkingConnection && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            </div>
          )}

          {!checkingConnection && !isConnected && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-700 dark:text-red-300 font-semibold mb-2">
                ⚠️ WhatsApp Not Connected
              </p>
              <p className="text-red-600 dark:text-red-400 text-sm mb-4">
                You need to configure your WhatsApp Business Account first.
              </p>
              <Button
                onClick={() => {
                  onClose();
                  window.location.href = `/dashboard/whatsapp/settings`;
                }}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                Go to WhatsApp Settings
              </Button>
            </div>
          )}

          {!checkingConnection && isConnected && (
            <>
              {/* Recipient Info */}
              <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">To:</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {lead.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {lead.phone}
                </p>
              </div>

              {/* Message Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={4}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {message.length} / 1600 characters
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-red-700 dark:text-red-300 text-sm">
                    ❌ {error}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={onClose}
                  variant="outline"
                  disabled={loading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={loading || !message.trim()}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
