"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/apiConfig";

interface Stats {
  total: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  deliveryRate: string;
  readRate: string;
}

interface Template {
  _id: string;
  name: string;
  status: string;
  category: string;
  language: string;
  content: string;
  variables?: string[];
  components?: any[];
}

export default function WhatsAppDashboardPage() {
  const { tenantId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("");
  
  const [templateForm, setTemplateForm] = useState({
    name: "",
    category: "UTILITY",
    language: "en",
    bodyText: "",
    headerText: "",
    footerText: "",
  });

  useEffect(() => {
    checkConfig();
  }, []);

  const checkConfig = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/whatsapp/config`, {
        credentials: "include",
      });
      const data = await res.json();
      setConfigured(data.configured);
      if (data.configured) {
        fetchStats();
        fetchTemplates();
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

  const fetchTemplates = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/whatsapp/templates`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSyncTemplates = async () => {
    setSyncing(true);
    setSubmitStatus("Syncing templates from Meta...");
    try {
      const res = await fetch(`${API_BASE_URL}/api/whatsapp/templates/sync`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setSubmitStatus(`✅ ${data.message}`);
        fetchTemplates();
        setTimeout(() => setSubmitStatus(""), 5000);
      } else {
        setSubmitStatus(`❌ ${data.message || "Sync failed"}`);
      }
    } catch (err) {
      setSubmitStatus("❌ Failed to sync templates");
    } finally {
      setSyncing(false);
    }
  };

  const handleSubmitTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateForm.name || !templateForm.bodyText) {
      setSubmitStatus("❌ Template name and body text are required");
      return;
    }
    
    setSubmitting(true);
    setSubmitStatus("Submitting template to Meta for approval...");
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/whatsapp/templates/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(templateForm),
      });
      const data = await res.json();
      
      if (data.success) {
        setSubmitStatus(`✅ ${data.message}`);
        setShowCreateTemplate(false);
        setTemplateForm({
          name: "",
          category: "UTILITY",
          language: "en",
          bodyText: "",
          headerText: "",
          footerText: "",
        });
        fetchTemplates();
        setTimeout(() => setSubmitStatus(""), 8000);
      } else {
        setSubmitStatus(`❌ ${data.message || "Failed to submit template"}`);
      }
    } catch (err: any) {
      setSubmitStatus(`❌ Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading WhatsApp Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl p-12 text-center border-2 border-green-100">
            <div className="text-8xl mb-6">💬</div>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
              WhatsApp Business Not Configured
            </h1>
            <p className="text-gray-600 mb-8 text-lg">
              Connect your WhatsApp Business Account to start sending messages
            </p>
            <button
              onClick={() => router.push(`/dashboard/client/${tenantId}/whatsapp/settings`)}
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold text-lg shadow-lg"
            >
              ⚙️ Configure WhatsApp
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header with Quick Actions */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-4xl shadow-lg">
                💬
              </div>
              <div className="text-white">
                <h1 className="text-3xl font-bold">WhatsApp Business</h1>
                <p className="text-green-100">Manage your WhatsApp campaigns & templates</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/dashboard/client/${tenantId}/whatsapp/campaigns`)}
                className="px-6 py-3 bg-white text-green-600 rounded-xl hover:bg-green-50 font-semibold shadow-lg flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                Campaigns
              </button>
              
              <button
                onClick={() => router.push(`/dashboard/client/${tenantId}/whatsapp/contacts`)}
                className="px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 font-semibold backdrop-blur-sm flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Contacts
              </button>
              
              <button
                onClick={() => router.push(`/dashboard/client/${tenantId}/whatsapp/reports`)}
                className="px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 font-semibold backdrop-blur-sm flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Reports
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm font-medium">Total Messages</span>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm font-medium">Sent</span>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.sent}</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm font-medium">Delivered</span>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" transform="translate(3,0)" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.delivered}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.deliveryRate} rate</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-teal-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm font-medium">Read</span>
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.read}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.readRate} rate</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-red-500">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm font-medium">Failed</span>
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.failed}</p>
            </div>
          </div>
        )}

        {/* Status Message */}
        {submitStatus && (
          <div className={`p-4 rounded-xl font-semibold text-center ${
            submitStatus.includes("✅")
              ? "bg-green-100 text-green-800 border-2 border-green-200"
              : submitStatus.includes("❌")
              ? "bg-red-100 text-red-800 border-2 border-red-200"
              : "bg-blue-100 text-blue-800 border-2 border-blue-200"
          }`}>
            {submitStatus}
          </div>
        )}

        {/* Templates Section */}
        <div className="bg-white rounded-2xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Message Templates</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Manage and create WhatsApp message templates for campaigns
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSyncTemplates}
                  disabled={syncing}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 flex items-center gap-2"
                >
                  <svg className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {syncing ? "Syncing..." : "Sync from Meta"}
                </button>
                
                <button
                  onClick={() => setShowCreateTemplate(true)}
                  className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-semibold flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Template
                </button>
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="p-6">
            {templates.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Templates Found</h3>
                <p className="text-gray-600 mb-6">Create or sync templates to start sending messages</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleSyncTemplates}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    Sync from Meta
                  </button>
                  <button
                    onClick={() => setShowCreateTemplate(true)}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                  >
                    Create New Template
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div
                    key={template._id}
                    className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-green-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-green-600">
                        {template.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        template.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : template.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {template.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex gap-2 mb-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded font-medium">
                        {template.category}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded font-medium">
                        {template.language.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                      {template.content}
                    </p>
                    
                    {template.variables && template.variables.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.variables.map((v, i) => (
                          <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded font-mono">
                            {`{{${v}}}`}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Template Modal */}
        {showCreateTemplate && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Create New Template</h2>
                  <button
                    onClick={() => {
                      setShowCreateTemplate(false);
                      setSubmitStatus("");
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmitTemplate} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    placeholder="e.g., fee_reminder_v2"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Use lowercase and underscores only</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      required
                      value={templateForm.category}
                      onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="UTILITY">Utility</option>
                      <option value="MARKETING">Marketing</option>
                      <option value="AUTHENTICATION">Authentication</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Language *
                    </label>
                    <select
                      required
                      value={templateForm.language}
                      onChange={(e) => setTemplateForm({ ...templateForm, language: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="en">English</option>
                      <option value="hi">Hindi</option>
                      <option value="en_US">English (US)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Header Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={templateForm.headerText}
                    onChange={(e) => setTemplateForm({ ...templateForm, headerText: e.target.value })}
                    placeholder="Fee Reminder"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Body Text * (Use variables: {`{{1}}, {{2}}, {{3}}`})
                  </label>
                  <textarea
                    required
                    value={templateForm.bodyText}
                    onChange={(e) => setTemplateForm({ ...templateForm, bodyText: e.target.value })}
                    placeholder={`Hello {{1}}, your fee of Rs.{{2}} is due on {{3}}. Please pay soon.`}
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use {`{{1}}, {{2}}`} etc for dynamic variables
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Footer Text (Optional)
                  </label>
                  <input
                    type="text"
                    value={templateForm.footerText}
                    onChange={(e) => setTemplateForm({ ...templateForm, footerText: e.target.value })}
                    placeholder="Thank you - Your Institute"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Template Submission</p>
                      <p>Your template will be submitted to Meta for approval. This usually takes 24-48 hours.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateTemplate(false);
                      setSubmitStatus("");
                    }}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Submit Template
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
