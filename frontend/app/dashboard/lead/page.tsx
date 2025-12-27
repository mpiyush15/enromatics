"use client";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Types
interface Lead {
  _id: string;
  name: string;
  email: string;
  phone: string;
  source: string;
  status: string;
  priority: string;
  interestedCourse?: string;
  assignedTo?: { _id: string; name: string; email: string };
  nextFollowUpDate?: string;
  lastCallDate?: string;
  totalCalls: number;
  createdAt: string;
  notes?: string;
  tags?: string[];
}

interface DashboardStats {
  totalLeads: number;
  statusCounts: Record<string, number>;
  sourceCounts: Record<string, number>;
  todaysFollowUps: number;
  overdueFollowUps: number;
  weeklyConversions: number;
}

// Status configuration
const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
  new: { label: "New", color: "text-blue-700", bgColor: "bg-blue-100" },
  contacted: { label: "Contacted", color: "text-yellow-700", bgColor: "bg-yellow-100" },
  interested: { label: "Interested", color: "text-green-700", bgColor: "bg-green-100" },
  "follow-up": { label: "Follow-up", color: "text-orange-700", bgColor: "bg-orange-100" },
  negotiation: { label: "Negotiation", color: "text-purple-700", bgColor: "bg-purple-100" },
  converted: { label: "Converted", color: "text-emerald-700", bgColor: "bg-emerald-100" },
  lost: { label: "Lost", color: "text-red-700", bgColor: "bg-red-100" },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-gray-100 text-gray-700" },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-700" },
  high: { label: "High", color: "bg-orange-100 text-orange-700" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-700" },
};

const SOURCE_OPTIONS = [
  { value: "", label: "All Sources" },
  { value: "website", label: "🌐 Website" },
  { value: "whatsapp", label: "💬 WhatsApp" },
  { value: "walk-in", label: "🚶 Walk-in" },
  { value: "facebook", label: "📘 Facebook" },
  { value: "instagram", label: "📷 Instagram" },
  { value: "referral", label: "🤝 Referral" },
  { value: "scholarship-exam", label: "🎓 Scholarship Exam" },
  { value: "phone-call", label: "📞 Phone Call" },
  { value: "other", label: "📋 Other" },
];

const CALL_OUTCOMES = [
  { value: "interested", label: "✅ Interested" },
  { value: "callback", label: "📞 Callback Requested" },
  { value: "not-interested", label: "❌ Not Interested" },
  { value: "no-answer", label: "📵 No Answer" },
  { value: "busy", label: "⏳ Busy" },
  { value: "wrong-number", label: "❓ Wrong Number" },
];

export default function LeadsCRMPage() {
  // State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFollowUpToday, setShowFollowUpToday] = useState(false);
  const [showOverdue, setShowOverdue] = useState(false);
  
  // Modals
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showCallHistoryModal, setShowCallHistoryModal] = useState(false);
  
  // View mode
  const [viewMode, setViewMode] = useState<"table" | "pipeline">("table");

  // Fetch dashboard stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/leads/dashboard", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

  // Fetch leads
  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (sourceFilter) params.append("source", sourceFilter);
      if (searchQuery) params.append("search", searchQuery);
      if (showFollowUpToday) params.append("followUpToday", "true");
      if (showOverdue) params.append("overdueFollowUps", "true");

      const res = await fetch(`/api/leads?${params.toString()}`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch leads");

      const data = await res.json();
      setLeads(data.leads || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, sourceFilter, searchQuery, showFollowUpToday, showOverdue]);

  useEffect(() => {
    fetchStats();
    fetchLeads();
  }, [fetchStats, fetchLeads]);

  // Update lead status
  const updateStatus = async (leadId: string, newStatus: string, lostReason?: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/status`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, lostReason }),
      });

      if (res.ok) {
        fetchLeads();
        fetchStats();
        setShowStatusModal(false);
        setSelectedLead(null);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Log call
  const logCall = async (leadId: string, callData: any) => {
    try {
      const res = await fetch(`/api/leads/${leadId}/log-call`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(callData),
      });

      if (res.ok) {
        fetchLeads();
        fetchStats();
        setShowCallModal(false);
        setSelectedLead(null);
      }
    } catch (err) {
      console.error("Failed to log call:", err);
    }
  };

  // Format date
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Check if overdue
  const isOverdue = (dateStr?: string) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  if (loading && leads.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📋 Lead Management (CRM)</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Manage leads, track follow-ups, and convert prospects
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("table")}
          >
            📊 Table
          </Button>
          <Button
            variant={viewMode === "pipeline" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("pipeline")}
          >
            🔀 Pipeline
          </Button>
          <Button onClick={() => setShowAddModal(true)}>+ Add Lead</Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
            <p className="text-2xl font-bold text-blue-600">{stats.totalLeads}</p>
            <p className="text-xs text-gray-500">Total Leads</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
            <p className="text-2xl font-bold text-green-600">{stats.statusCounts?.converted || 0}</p>
            <p className="text-xs text-gray-500">Converted</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
            <p className="text-2xl font-bold text-orange-600">{stats.todaysFollowUps}</p>
            <p className="text-xs text-gray-500">Today's Follow-ups</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
            <p className="text-2xl font-bold text-red-600">{stats.overdueFollowUps}</p>
            <p className="text-xs text-gray-500">Overdue</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
            <p className="text-2xl font-bold text-purple-600">{stats.statusCounts?.new || 0}</p>
            <p className="text-xs text-gray-500">New Leads</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
            <p className="text-2xl font-bold text-emerald-600">{stats.weeklyConversions}</p>
            <p className="text-xs text-gray-500">This Week</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="🔍 Search by name, phone, email..."
              className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>

          {/* Source Filter */}
          <select
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            {SOURCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Quick Filters */}
          <button
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showFollowUpToday
                ? "bg-orange-500 text-white"
                : "bg-orange-100 text-orange-700 hover:bg-orange-200"
            }`}
            onClick={() => {
              setShowFollowUpToday(!showFollowUpToday);
              setShowOverdue(false);
            }}
          >
            📅 Today's Follow-ups
          </button>
          <button
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              showOverdue
                ? "bg-red-500 text-white"
                : "bg-red-100 text-red-700 hover:bg-red-200"
            }`}
            onClick={() => {
              setShowOverdue(!showOverdue);
              setShowFollowUpToday(false);
            }}
          >
            ⚠️ Overdue
          </button>
        </div>
      </div>

      {/* Pipeline View */}
      {viewMode === "pipeline" && (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <div
                key={status}
                className="w-72 bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-semibold ${config.color}`}>{config.label}</h3>
                  <span className="bg-gray-200 dark:bg-gray-700 text-xs px-2 py-1 rounded-full">
                    {leads.filter((l) => l.status === status).length}
                  </span>
                </div>
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {leads
                    .filter((lead) => lead.status === status)
                    .map((lead) => (
                      <div
                        key={lead._id}
                        className="bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowStatusModal(true);
                        }}
                      >
                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                          {lead.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{lead.phone}</p>
                        {lead.interestedCourse && (
                          <p className="text-xs text-blue-600 mt-1">{lead.interestedCourse}</p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <Badge className={PRIORITY_CONFIG[lead.priority]?.color || "bg-gray-100"}>
                            {lead.priority}
                          </Badge>
                          {lead.nextFollowUpDate && (
                            <span
                              className={`text-xs ${
                                isOverdue(lead.nextFollowUpDate)
                                  ? "text-red-600 font-semibold"
                                  : "text-gray-500"
                              }`}
                            >
                              📅 {formatDate(lead.nextFollowUpDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === "table" && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Follow-up</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Calls</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{lead.name}</p>
                        {lead.interestedCourse && (
                          <p className="text-xs text-blue-600">{lead.interestedCourse}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900 dark:text-white">{lead.phone}</p>
                      <p className="text-xs text-gray-500">{lead.email || "-"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm">
                        {SOURCE_OPTIONS.find((s) => s.value === lead.source)?.label || lead.source}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          STATUS_CONFIG[lead.status]?.bgColor
                        } ${STATUS_CONFIG[lead.status]?.color}`}
                      >
                        {STATUS_CONFIG[lead.status]?.label || lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={PRIORITY_CONFIG[lead.priority]?.color}>
                        {PRIORITY_CONFIG[lead.priority]?.label || lead.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {lead.nextFollowUpDate ? (
                        <span
                          className={`text-sm ${
                            isOverdue(lead.nextFollowUpDate)
                              ? "text-red-600 font-semibold"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {formatDate(lead.nextFollowUpDate)}
                          {isOverdue(lead.nextFollowUpDate) && " ⚠️"}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 hover:underline cursor-pointer"
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowCallHistoryModal(true);
                        }}
                        title="View Call History"
                      >
                        📞 {lead.totalCalls || 0}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          className="p-1.5 text-green-600 hover:bg-green-100 rounded"
                          title="Log Call"
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowCallModal(true);
                          }}
                        >
                          📞
                        </button>
                        <button
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded"
                          title="Update Status"
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowStatusModal(true);
                          }}
                        >
                          🔄
                        </button>
                        <a
                          href={`https://wa.me/91${lead.phone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-green-600 hover:bg-green-100 rounded"
                          title="WhatsApp"
                        >
                          💬
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {leads.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No leads found. Add your first lead to get started!
            </div>
          )}
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddModal && (
        <AddLeadModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchLeads();
            fetchStats();
          }}
        />
      )}

      {/* Log Call Modal */}
      {showCallModal && selectedLead && (
        <LogCallModal
          lead={selectedLead}
          onClose={() => {
            setShowCallModal(false);
            setSelectedLead(null);
          }}
          onSubmit={(data) => logCall(selectedLead._id, data)}
        />
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedLead && (
        <StatusUpdateModal
          lead={selectedLead}
          onClose={() => {
            setShowStatusModal(false);
            setSelectedLead(null);
          }}
          onUpdate={(status, reason) => updateStatus(selectedLead._id, status, reason)}
        />
      )}

      {/* Call History Modal */}
      {showCallHistoryModal && selectedLead && (
        <CallHistoryModal
          lead={selectedLead}
          onClose={() => {
            setShowCallHistoryModal(false);
            setSelectedLead(null);
          }}
        />
      )}
    </div>
  );
}

// Add Lead Modal Component
function AddLeadModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    source: "other",
    interestedCourse: "",
    priority: "medium",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        onSuccess();
      }
    } catch (err) {
      console.error("Failed to add lead:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Add New Lead</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone *</label>
              <input
                type="tel"
                required
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Source</label>
              <select
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              >
                {SOURCE_OPTIONS.slice(1).map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Interested Course</label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                value={formData.interestedCourse}
                onChange={(e) => setFormData({ ...formData, interestedCourse: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Adding..." : "Add Lead"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Log Call Modal Component
function LogCallModal({
  lead,
  onClose,
  onSubmit,
}: {
  lead: Lead;
  onClose: () => void;
  onSubmit: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    outcome: "",
    notes: "",
    newStatus: lead.status,
    nextFollowUpDate: "",
    nextFollowUpNotes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">📞 Log Call - {lead.name}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Call Outcome *</label>
              <select
                required
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                value={formData.outcome}
                onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
              >
                <option value="">Select outcome...</option>
                {CALL_OUTCOMES.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Update Status</label>
              <select
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                value={formData.newStatus}
                onChange={(e) => setFormData({ ...formData, newStatus: e.target.value })}
              >
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Next Follow-up Date</label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                value={formData.nextFollowUpDate}
                onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Call Notes</label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                rows={3}
                placeholder="What was discussed..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Log Call
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Status Update Modal Component
function StatusUpdateModal({
  lead,
  onClose,
  onUpdate,
}: {
  lead: Lead;
  onClose: () => void;
  onUpdate: (status: string, reason?: string) => void;
}) {
  const [newStatus, setNewStatus] = useState(lead.status);
  const [lostReason, setLostReason] = useState("");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Update Status - {lead.name}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(STATUS_CONFIG).map(([status, config]) => (
                <button
                  key={status}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    newStatus === status
                      ? `${config.bgColor} border-current ${config.color}`
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setNewStatus(status)}
                >
                  <span className={`font-medium ${config.color}`}>{config.label}</span>
                </button>
              ))}
            </div>
            {newStatus === "lost" && (
              <div>
                <label className="block text-sm font-medium mb-1">Reason for Lost</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  rows={2}
                  placeholder="Why was this lead lost?"
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value)}
                />
              </div>
            )}
            <div className="flex gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => onUpdate(newStatus, lostReason)} className="flex-1">
                Update Status
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Call History Modal Component
interface CallLog {
  _id: string;
  callDate: string;
  callType: string;
  callDuration?: number;
  outcome: string;
  notes?: string;
  counsellorName?: string;
  previousStatus?: string;
  newStatus?: string;
  nextFollowUpDate?: string;
}

function CallHistoryModal({
  lead,
  onClose,
}: {
  lead: Lead;
  onClose: () => void;
}) {
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCallHistory = async () => {
      try {
        const res = await fetch(`/api/leads/${lead._id}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          console.log("📞 Call history data:", data);
          // Backend returns callHistory, not callLogs
          setCallLogs(data.callHistory || data.callLogs || []);
        }
      } catch (err) {
        console.error("Failed to fetch call history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCallHistory();
  }, [lead._id]);

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOutcomeEmoji = (outcome: string) => {
    const outcomes: Record<string, string> = {
      interested: "✅",
      callback: "📞",
      "not-interested": "❌",
      "no-answer": "📵",
      busy: "⏳",
      "wrong-number": "❓",
    };
    return outcomes[outcome] || "📋";
  };

  const getCallTypeIcon = (type: string) => {
    const types: Record<string, string> = {
      outbound: "📤",
      inbound: "📥",
      missed: "📵",
    };
    return types[type] || "📞";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold">📞 Call History - {lead.name}</h2>
              <p className="text-sm text-gray-500">{lead.phone}</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-xl">✕</button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : callLogs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-2">📞</p>
              <p>No call history found for this lead.</p>
              <p className="text-sm mt-1">Log your first call to start tracking!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
              {callLogs.map((log, idx) => (
                <div
                  key={log._id || idx}
                  className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getCallTypeIcon(log.callType)}</span>
                      <span className="text-sm font-medium capitalize">{log.callType} Call</span>
                      {log.callDuration && (
                        <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-600 px-2 py-0.5 rounded">
                          {log.callDuration} min
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{formatDateTime(log.callDate)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getOutcomeEmoji(log.outcome)}</span>
                    <span className="text-sm font-medium capitalize">{log.outcome.replace("-", " ")}</span>
                  </div>

                  {log.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded border mt-2">
                      💬 {log.notes}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-3 text-xs">
                    {log.counsellorName && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        👤 {log.counsellorName}
                      </span>
                    )}
                    {log.previousStatus && log.newStatus && log.previousStatus !== log.newStatus && (
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        Status: {log.previousStatus} → {log.newStatus}
                      </span>
                    )}
                    {log.nextFollowUpDate && (
                      <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">
                        📅 Follow-up: {new Date(log.nextFollowUpDate).toLocaleDateString("en-IN")}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t mt-4">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
