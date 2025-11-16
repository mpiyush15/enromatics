"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/apiConfig";
import useAuth from "@/hooks/useAuth";

interface ConfigForm {
  phoneNumberId: string;
  accessToken: string;
  wabaId: string;
  businessName: string;
}

export default function WhatsappSettingsPage() {
  const { tenantId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState("");
  const [configured, setConfigured] = useState(false);

  const [form, setForm] = useState<ConfigForm>({
    phoneNumberId: "",
    accessToken: "",
    wabaId: "",
    businessName: "",
  });

  const [testPhone, setTestPhone] = useState("");
  const [syncingTemplates, setSyncingTemplates] = useState(false);
  const [templateSyncStatus, setTemplateSyncStatus] = useState("");
  const [removing, setRemoving] = useState(false);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/whatsapp/config`, {
        credentials: "include",
      });
      const data = await res.json();

      if (data.configured) {
        setConfigured(true);
        setForm({
          phoneNumberId: data.config.phoneNumberId || "",
          accessToken: "", // Don't show token for security
          wabaId: data.config.wabaId || "",
          businessName: data.config.businessName || "",
        });
      }
    } catch (err) {
      console.error("Fetch config error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/whatsapp/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setStatus("✅ Configuration saved successfully!");
      setConfigured(true);
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setStatus(`❌ Error: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!testPhone) {
      setStatus("❌ Please enter a test phone number");
      return;
    }

    if (!form.phoneNumberId || !form.accessToken) {
      setStatus("❌ Please fill Phone Number ID and Access Token first");
      return;
    }

    setTesting(true);
    setStatus("Testing connection...");

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/whatsapp/test-connection`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            phoneNumberId: form.phoneNumberId,
            accessToken: form.accessToken,
            testPhone,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setStatus("✅ Connection successful! Test message sent to " + testPhone);
      setTimeout(() => setStatus(""), 5000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Connection failed";
      setStatus(`❌ Connection failed: ${errorMessage}`);
    } finally {
      setTesting(false);
    }
  };

  const handleSyncTemplates = async () => {
    setSyncingTemplates(true);
    setTemplateSyncStatus("Fetching templates from Meta...");

    try {
      const res = await fetch(`${API_BASE_URL}/api/whatsapp/templates/sync`, {
        method: "POST",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setTemplateSyncStatus(
        `✅ ${data.message}\n📊 Approved: ${data.stats.approved}, Pending: ${data.stats.pending}, Rejected: ${data.stats.rejected}`
      );
      setTimeout(() => setTemplateSyncStatus(""), 8000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Sync failed";
      setTemplateSyncStatus(`❌ Sync failed: ${errorMessage}`);
    } finally {
      setSyncingTemplates(false);
    }
  };

  const handleRemoveConfig = async () => {
    setRemoving(true);
    setStatus("Removing WhatsApp configuration...");

    try {
      const res = await fetch(`${API_BASE_URL}/api/whatsapp/config`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setStatus("✅ WhatsApp configuration removed successfully!");
      setConfigured(false);
      setForm({
        phoneNumberId: "",
        accessToken: "",
        wabaId: "",
        businessName: "",
      });
      setShowRemoveConfirm(false);
      setTimeout(() => setStatus(""), 5000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to remove configuration";
      setStatus(`❌ Error: ${errorMessage}`);
    } finally {
      setRemoving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-700 rounded-3xl shadow-2xl p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="text-6xl">💬</div>
            <div>
              <h1 className="text-4xl font-bold">WhatsApp Business Setup</h1>
              <p className="text-green-100 mt-2">
                Connect your WhatsApp Business Account to send messages to
                students & parents
              </p>
            </div>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-3">
            📖 How to Get Your Credentials
          </h3>
          <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li>
              <strong>1. Go to Meta Business Suite:</strong>{" "}
              <a
                href="https://business.facebook.com"
                target="_blank"
                className="underline"
              >
                business.facebook.com
              </a>
            </li>
            <li>
              <strong>2. Navigate to:</strong> Settings → Business Settings →
              Accounts → WhatsApp Business Accounts
            </li>
            <li>
              <strong>3. Copy your credentials:</strong>
              <ul className="ml-6 mt-1 space-y-1">
                <li>• WABA ID: Your WhatsApp Business Account ID</li>
                <li>• Phone Number ID: From phone numbers section</li>
                <li>
                  • Access Token: Generate from System Users or use temporary
                  token
                </li>
              </ul>
            </li>
            <li>
              <strong>4. Test:</strong> Use your own WhatsApp number to test the
              connection
            </li>
          </ol>
        </div>

        {/* Configuration Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b">
            <h2 className="text-xl font-bold">
              {configured ? "Update" : "Configure"} WhatsApp Credentials
            </h2>
          </div>

          <form onSubmit={handleSave} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Business Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., ABC Coaching Institute"
                value={form.businessName}
                onChange={(e) =>
                  setForm({ ...form, businessName: e.target.value })
                }
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                WhatsApp Business Account ID (WABA ID) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., 123456789012345"
                value={form.wabaId}
                onChange={(e) => setForm({ ...form, wabaId: e.target.value })}
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 dark:bg-gray-700 font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Phone Number ID *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., 987654321098765"
                value={form.phoneNumberId}
                onChange={(e) =>
                  setForm({ ...form, phoneNumberId: e.target.value })
                }
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 dark:bg-gray-700 font-mono"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Access Token {configured ? "" : "*"}
              </label>
              <textarea
                required={!configured}
                placeholder={configured ? "Leave empty to keep existing token, or paste new token to update" : "Paste your WhatsApp Access Token here..."}
                value={form.accessToken}
                onChange={(e) =>
                  setForm({ ...form, accessToken: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-green-500 dark:bg-gray-700 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                {configured 
                  ? "⚠️ Token is encrypted in database. Leave empty to keep current token, or paste a new one to update it."
                  : "Get this from Meta Business → WhatsApp → API Setup"
                }
              </p>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold text-lg disabled:opacity-50"
            >
              {saving ? "Saving..." : configured ? "Update Configuration" : "Save Configuration"}
            </button>

            {/* Remove Configuration Button */}
            {configured && (
              <div className="pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowRemoveConfirm(true)}
                  className="w-full px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold disabled:opacity-50"
                >
                  🗑️ Remove WhatsApp Configuration
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Test Connection */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b">
            <h2 className="text-xl font-bold">🧪 Test Connection</h2>
          </div>

          <div className="p-8 space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Send a test message to verify your WhatsApp setup is working
              correctly.
            </p>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Test Phone Number (with country code)
              </label>
              <input
                type="tel"
                placeholder="e.g., 919876543210 (without + sign)"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: Country code + phone number (no spaces or symbols)
              </p>
            </div>

            <button
              onClick={handleTestConnection}
              disabled={testing || !testPhone}
              className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold disabled:opacity-50"
            >
              {testing ? "Sending Test Message..." : "Send Test Message"}
            </button>
          </div>
        </div>

        {/* Sync Templates from Meta */}
        {configured && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b">
              <h2 className="text-xl font-bold">📋 Message Templates</h2>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-4">
                <p className="text-sm text-blue-900 dark:text-blue-100">
                  <strong>⚠️ Important:</strong> WhatsApp requires pre-approved message templates to send messages. 
                  Click below to fetch your approved templates from Meta.
                </p>
              </div>

              <button
                onClick={handleSyncTemplates}
                disabled={syncingTemplates}
                className="w-full px-6 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-bold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {syncingTemplates ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Syncing Templates from Meta...
                  </>
                ) : (
                  <>
                    🔄 Fetch Templates from Meta
                  </>
                )}
              </button>

              {templateSyncStatus && (
                <div
                  className={`p-4 rounded-xl font-semibold whitespace-pre-line ${
                    templateSyncStatus.includes("✅")
                      ? "bg-green-100 text-green-800 border-2 border-green-200"
                      : "bg-red-100 text-red-800 border-2 border-red-200"
                  }`}
                >
                  {templateSyncStatus}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Message */}
        {status && (
          <div
            className={`p-4 rounded-xl font-semibold text-center ${
              status.includes("✅")
                ? "bg-green-100 text-green-800 border-2 border-green-200"
                : status.includes("❌")
                ? "bg-red-100 text-red-800 border-2 border-red-200"
                : "bg-blue-100 text-blue-800 border-2 border-blue-200"
            }`}
          >
            {status}
          </div>
        )}

        {/* Next Steps */}
        {configured && (
          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-green-900 dark:text-green-100 mb-3">
              ✅ Configuration Complete! Next Steps:
            </h3>
            <div className="space-y-2 text-sm text-green-800 dark:text-green-200">
              <p>
                • Go to{" "}
                <button
                  onClick={() =>
                    router.push(`/dashboard/client/${tenantId}/whatsapp/campaigns`)
                  }
                  className="underline font-semibold"
                >
                  Campaigns
                </button>{" "}
                to send messages
              </p>
              <p>
                • Visit{" "}
                <button
                  onClick={() =>
                    router.push(
                      `/dashboard/client/${tenantId}/whatsapp/reports`
                    )
                  }
                  className="underline font-semibold"
                >
                  Reports
                </button>{" "}
                to track sent messages
              </p>
              <p>
                • Manage{" "}
                <button
                  onClick={() =>
                    router.push(`/dashboard/client/${tenantId}/whatsapp/contacts`)
                  }
                  className="underline font-semibold"
                >
                  Contacts
                </button>{" "}
                for student/parent numbers
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Remove Confirmation Modal */}
      {showRemoveConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-200">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Remove WhatsApp Configuration?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                This will disconnect your WhatsApp Business Account from this dashboard. 
                All message templates and contact data will be preserved, but you won't be able to send messages until you reconnect.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRemoveConfirm(false)}
                disabled={removing}
                className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveConfig}
                disabled={removing}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {removing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Removing...
                  </>
                ) : (
                  <>🗑️ Remove</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
