"use client";

import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import { FaWhatsapp } from "react-icons/fa";
import { MdCall } from "react-icons/md";

interface CallLogEntry {
  _id?: string;
  callDate: string;
  duration: number;
  outcome: string;
  notes: string;
  rating: number;
}

interface Lead {
  _id: string;
  name: string;
  phone: string;
  email: string;
  interestedCourse?: string;
  source: string;
  status: string;
  priority: string;
  totalCalls?: number;
  lastCallDate?: string;
  lastCallOutcome?: string;
  convertedToStudent?: boolean;
  callHistory?: CallLogEntry[];
  score?: number;
  scoreTier?: "cold" | "warm" | "hot";
  scoreUpdatedAt?: string;
}

interface CallLog {
  _id: string;
  leadId: string;
  counsellorName: string;
  callDate: string;
  duration: number;
  outcome: string;
  notes: string;
  rating: number;
}

const STATUS_CONFIG: Record<string, { label: string; bgColor: string; textColor: string }> = {
  new: { label: "New", bgColor: "bg-blue-100", textColor: "text-blue-700" },
  contacted: { label: "Contacted", bgColor: "bg-yellow-100", textColor: "text-yellow-700" },
  interested: { label: "Interested", bgColor: "bg-green-100", textColor: "text-green-700" },
  "follow-up": { label: "Follow-up", bgColor: "bg-purple-100", textColor: "text-purple-700" },
  negotiation: { label: "Negotiation", bgColor: "bg-orange-100", textColor: "text-orange-700" },
  converted: { label: "Converted", bgColor: "bg-emerald-100", textColor: "text-emerald-700" },
  lost: { label: "Lost", bgColor: "bg-red-100", textColor: "text-red-700" },
};

const SCORE_TIER_CONFIG: Record<string, { label: string; bgColor: string; textColor: string; icon: string }> = {
  cold: { label: "Cold", bgColor: "bg-slate-100", textColor: "text-slate-700", icon: "❄️" },
  warm: { label: "Warm", bgColor: "bg-amber-100", textColor: "text-amber-700", icon: "🔥" },
  hot: { label: "Hot", bgColor: "bg-red-100", textColor: "text-red-700", icon: "🔥🔥" },
};

const KANBAN_COLUMNS = [
  { id: "new", label: "New Leads", icon: "📌" },
  { id: "contacted", label: "Contacted", icon: "☎️" },
  { id: "interested", label: "Interested", icon: "👍" },
  { id: "follow-up", label: "Follow-up", icon: "🔔" },
  { id: "negotiation", label: "Negotiation", icon: "💬" },
  { id: "converted", label: "Converted", icon: "✅" },
];

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    console.error(`❌ Fetch failed for ${url}:`, res.status, res.statusText);
    throw new Error("Failed to fetch");
  }
  const json = await res.json();
  console.log(`✅ Fetched from ${url}:`, json);
  return json;
};

export default function EnquiryDashboard({ tenantId }: { tenantId: string }) {
  const [activeTab, setActiveTab] = useState<"analytics" | "enquiries">("analytics");
  const [viewMode, setViewMode] = useState<"dashboard" | "kanban" | "table">("dashboard");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showCallModal, setShowCallModal] = useState(false);
  const [showCallDrawer, setShowCallDrawer] = useState(false);
  const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(null);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    interestedCourse: "",
    source: "walk-in",
  });
  const [callLogData, setCallLogData] = useState({
    outcome: "interested",
    duration: 0,
    notes: "",
    rating: 3,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch leads data
  const { data: leadsData, isLoading: leadsLoading, mutate: refreshLeads, error: leadsError } = useSWR(
    `/api/leads`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  );

  if (leadsError) {
    console.error("❌ Error fetching leads:", leadsError);
  }

  const leads: Lead[] = leadsData?.leads || leadsData?.data || [];

  console.log("📊 Dashboard Data - Leads count:", leads.length, "Full data:", leadsData);

  // Filter logic for Enquiries tab
  const filteredLeads = leads.filter((lead) => {
    const matchesStatus = filterStatus === "all" || lead.status === filterStatus;
    const matchesSource = filterSource === "all" || lead.source === filterSource;
    const matchesTier = filterTier === "all" || lead.scoreTier === filterTier;
    const matchesSearch =
      searchTerm === "" ||
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.includes(searchTerm) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSource && matchesTier && matchesSearch;
  }).sort((a, b) => (b.score || 0) - (a.score || 0)); // Sort by score descending

  // Get unique sources for filter dropdown (sorted)
  const uniqueSources = Array.from(new Set(leads.map((l) => l.source))).sort();

  // Calculate stats
  const totalLeads = leads.length;
  const converted = leads.filter((l) => l.convertedToStudent).length;
  const conversionRate = totalLeads > 0 ? ((converted / totalLeads) * 100).toFixed(1) : "0";
  
  // Tier stats
  const hotLeads = leads.filter((l) => l.scoreTier === "hot").length;
  const warmLeads = leads.filter((l) => l.scoreTier === "warm").length;
  const coldLeads = leads.filter((l) => l.scoreTier === "cold").length;

  // Group leads by status for kanban
  const groupedByStatus = KANBAN_COLUMNS.map((col) => ({
    ...col,
    leads: leads.filter((l) => l.status === col.id),
    count: leads.filter((l) => l.status === col.id).length,
  }));

  // Calculate source distribution
  const sourceData = Object.entries(
    leads.reduce((acc: Record<string, number>, lead) => {
      acc[lead.source] = (acc[lead.source] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

  // Calculate funnel data
  const funnelData = [
    { name: "Total Leads", value: totalLeads },
    { name: "Contacted", value: leads.filter((l) => l.totalCalls! > 0).length },
    { name: "Interested", value: leads.filter((l) => l.status === "interested" || l.status === "negotiation").length },
    { name: "Converted", value: converted },
  ];

  // Today's followups (leads with next follow-up today)
  const todayFollowups = leads
    .filter((l) => {
      const nextFollowUp = new Date(l.lastCallDate || new Date());
      const today = new Date();
      return (
        nextFollowUp.getDate() === today.getDate() &&
        nextFollowUp.getMonth() === today.getMonth() &&
        nextFollowUp.getFullYear() === today.getFullYear()
      );
    })
    .slice(0, 5);

  if (leadsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading dashboard...</div>
      </div>
    );
  }

  // Handle Add Lead Form Submission
  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        interestedCourse: formData.interestedCourse,
        source: formData.source,
        status: "new",
      };

      console.log("📤 Sending lead data:", payload);

      const res = await fetch("/api/leads", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Response data:", data);

      if (res.ok) {
        setFormData({ name: "", phone: "", email: "", interestedCourse: "", source: "walk-in" });
        setShowAddLeadModal(false);
        // Force refresh data
        await new Promise((resolve) => setTimeout(resolve, 500));
        refreshLeads();
        alert("✅ Lead created successfully!");
      } else {
        alert(`❌ ${data.message || "Failed to create lead"}`);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("❌ Error creating lead: " + err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle CSV Upload
  const handleCSVUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement;
    const file = input?.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csv = event.target?.result as string;
      const lines = csv.split("\n").filter((line) => line.trim());
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

      const leads = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const lead: any = { tenantId };
        headers.forEach((header, idx) => {
          lead[header] = values[idx] || "";
        });
        return lead;
      });

      try {
        const res = await fetch("/api/leads/bulk", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leads }),
        });

        if (res.ok) {
          setShowUploadModal(false);
          refreshLeads();
          alert("Leads imported successfully!");
        } else {
          alert("Failed to import leads");
        }
      } catch (err) {
        alert("Error importing leads");
      }
    };
    reader.readAsText(file);
  };

  // Download CSV Template
  const downloadTemplate = () => {
    const csv = `name,phone,email,interestedCourse,source
Riya Singh,9876543210,riya@example.com,JEE,walk-in
Arjun Patel,8765432109,arjun@example.com,NEET,instagram
Priya Sharma,7654321098,priya@example.com,Foundation,referral
Aditya Kumar,6543210987,aditya@example.com,JEE,facebook
Sneha Desai,5432109876,sneha@example.com,NEET,website`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads-template.csv";
    a.click();
  };

  // Handle Add Call Log
  const handleAddCallLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    setIsSubmitting(true);
    try {
      const payload = {
        outcome: callLogData.outcome,
        duration: callLogData.duration,
        notes: callLogData.notes,
        rating: callLogData.rating,
      };

      console.log("📤 Sending call log payload:", payload);

      const res = await fetch(`/api/leads/${selectedLead._id}/log-call`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("📥 Response:", data);

      if (res.ok) {
        setCallLogData({ outcome: "interested", duration: 0, notes: "", rating: 3 });
        setShowCallDrawer(false);
        refreshLeads();
        alert("✅ Call log created successfully!");
      } else {
        alert(`❌ Failed to create call log: ${data.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("❌ Error:", err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      alert(`❌ Error creating call log: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Status Update
  const handleStatusUpdate = async (leadId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        refreshLeads();
      }
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Main Content */}
      <div className="flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="px-6 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📋 Students Enquiry Management</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Track leads, follow-ups and admissions performance</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button onClick={() => setShowAddLeadModal(true)} className="bg-blue-600 hover:bg-blue-700">+ Add Lead</Button>
                <Button onClick={() => setShowUploadModal(true)} variant="outline">📤 Import CSV</Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 border-t border-gray-200 dark:border-gray-700 flex gap-0">
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === "analytics"
                  ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                  : "text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              📊 Analytics
            </button>
            <button
              onClick={() => setActiveTab("enquiries")}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 ${
                activeTab === "enquiries"
                  ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                  : "text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              📑 Enquiries Table
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ANALYTICS TAB */}
          {activeTab === "analytics" && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                {[
                  { label: "Total Leads", value: totalLeads.toString(), icon: "📊", color: "from-blue-500 to-blue-600" },
                  { label: "Converted", value: converted.toString(), icon: "✅", color: "from-green-500 to-green-600" },
                  { label: "Conversion %", value: `${conversionRate}%`, icon: "📈", color: "from-purple-500 to-purple-600" },
                  { label: "Contacted", value: leads.filter((l) => l.totalCalls! > 0).length.toString(), icon: "☎️", color: "from-yellow-500 to-yellow-600" },
                  { label: "Interested", value: leads.filter((l) => l.status === "interested" || l.status === "negotiation").length.toString(), icon: "🎯", color: "from-orange-500 to-orange-600" },
                  { label: "Today's FU", value: todayFollowups.length.toString(), icon: "⏰", color: "from-red-500 to-red-600" },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className={`bg-gradient-to-br ${stat.color} text-white rounded-lg p-4 shadow-lg hover:shadow-xl transition`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium opacity-90">{stat.label}</p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                      </div>
                      <span className="text-4xl opacity-20">{stat.icon}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Conversion Funnel */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🔀 Leads Conversion Funnel</h2>
                  <div className="space-y-3">
                    {funnelData.map((item, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{item.name}</span>
                          <span className="font-bold text-gray-900 dark:text-white">{item.value}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${
                              idx === 0
                                ? "from-blue-500 to-blue-600"
                                : idx === 1
                                ? "from-cyan-500 to-cyan-600"
                                : idx === 2
                                ? "from-green-500 to-green-600"
                                : "from-emerald-500 to-emerald-600"
                            }`}
                            style={{ width: `${(item.value / totalLeads) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lead Sources */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📊 Lead Sources</h2>
                  {sourceData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={sourceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#4ECDC4" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-gray-400">No source data yet</div>
                  )}
                </div>
              </div>

              {/* Lead Pipeline (Kanban Preview) */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">🏗️ Lead Pipeline</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {groupedByStatus.map((column) => (
                    <div
                      key={column.id}
                      className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg p-4 min-h-[200px]"
                    >
                      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-300 dark:border-gray-600">
                        <span className="text-2xl">{column.icon}</span>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{column.label}</h3>
                      </div>
                      <div className="text-center py-8">
                        <p className="font-bold text-2xl text-gray-900 dark:text-white">{column.count}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">leads</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Today's Followups */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    📅 Today's Followups
                  </h3>
                  <div className="space-y-3">
                    {todayFollowups.length > 0 ? (
                      todayFollowups.map((lead: Lead) => (
                        <div
                          key={lead._id}
                          className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
                          onClick={() => {
                            setSelectedLead(lead);
                            setShowCallModal(true);
                          }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{lead.name}</h4>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{lead.phone}</span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{lead.interestedCourse || "Course pending"}</p>
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded ${
                                lead.status === "converted"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                  : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
                              }`}
                            >
                              {(STATUS_CONFIG[lead.status] || STATUS_CONFIG.new).label}
                            </span>
                            <button className="text-blue-500 hover:text-blue-700 text-xs font-semibold">Call</button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                        No followups scheduled for today
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    📈 Quick Stats
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Conversion Rate</span>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{conversionRate}%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hot Leads</span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">{leads.filter((l) => l.status === "interested" || l.status === "negotiation").length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Avg. Calls</span>
                      <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {totalLeads > 0 ? (leads.reduce((sum, l) => sum + (l.totalCalls || 0), 0) / totalLeads).toFixed(1) : 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">This Month</span>
                      <span className="text-lg font-bold text-orange-600 dark:text-orange-400">{totalLeads}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ENQUIRIES TABLE TAB */}
          {activeTab === "enquiries" && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">🔍 Filters & Lead Scoring</h2>
                
                {/* Filter Grid - 5 columns */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
                  {/* Search */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase">Search</label>
                    <input
                      type="text"
                      placeholder="Name, phone, email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="interested">Interested</option>
                      <option value="follow-up">Follow-up</option>
                      <option value="negotiation">Negotiation</option>
                      <option value="converted">Converted</option>
                      <option value="lost">Lost</option>
                    </select>
                  </div>

                  {/* Source */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase">Source</label>
                    <select
                      value={filterSource}
                      onChange={(e) => setFilterSource(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    >
                      <option value="all">All Sources</option>
                      {uniqueSources.map((source) => (
                        <option key={source} value={source}>
                          {source.charAt(0).toUpperCase() + source.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Lead Tier */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase">Lead Tier</label>
                    <select
                      value={filterTier}
                      onChange={(e) => setFilterTier(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    >
                      <option value="all">All Tiers</option>
                      <option value="hot">🔥 Hot (70+)</option>
                      <option value="warm">🔥 Warm (40-69)</option>
                      <option value="cold">❄️ Cold (&lt;40)</option>
                    </select>
                  </div>

                  {/* Action Button */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setFilterStatus("all");
                        setFilterSource("all");
                        setFilterTier("all");
                      }}
                      title="Clear all filters"
                      className="flex-1 px-3 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white rounded-lg font-medium transition text-sm"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => {
                        console.log("🤖 Calculating AI scores for all leads...");
                        setIsSubmitting(true);
                        fetch(`/api/leads/calculate-all-scores`, {
                          method: "POST",
                          credentials: "include",
                          headers: { "Content-Type": "application/json" },
                        })
                          .then((res) => {
                            console.log("Response status:", res.status);
                            if (!res.ok) throw new Error(`HTTP ${res.status}`);
                            return res.json();
                          })
                          .then((data) => {
                            console.log("✅ Scores calculated:", data);
                            const skippedMsg = data.skippedLeads > 0 
                              ? `\n✂️ Skipped ${data.skippedLeads} unchanged leads` 
                              : "";
                            alert(`✅ ${data.message}${skippedMsg}`);
                            refreshLeads();
                          })
                          .catch((err) => {
                            console.error("❌ Calculation error:", err);
                            alert(`❌ Error: ${String(err)}`);
                          })
                          .finally(() => setIsSubmitting(false));
                      }}
                      disabled={isSubmitting}
                      title="Calculate AI scores for all leads"
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition text-sm"
                    >
                      {isSubmitting ? "🔄 Computing..." : "🤖 Calculate"}
                    </button>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalLeads}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">🔥 Hot</p>
                    <p className="text-2xl font-bold text-red-600">{hotLeads}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">🔥 Warm</p>
                    <p className="text-2xl font-bold text-amber-600">{warmLeads}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">❄️ Cold</p>
                    <p className="text-2xl font-bold text-slate-600">{coldLeads}</p>
                  </div>
                </div>
              </div>

              {/* Enquiries Table */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {filteredLeads.length} of {leads.length} enquiries
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">NAME</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">PHONE</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">COURSE</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">SOURCE</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">STATUS</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">SCORE</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">CALLS</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredLeads.length > 0 ? (
                        filteredLeads.map((lead) => {
                          const config = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new;
                          return (
                            <tr key={lead._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                              <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{lead.name}</td>
                              <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{lead.phone || "N/A"}</td>
                              <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{lead.interestedCourse || "N/A"}</td>
                              <td className="px-6 py-4 text-gray-600 dark:text-gray-400 capitalize">{lead.source}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-block px-3 py-1 text-sm font-semibold ${config.bgColor} ${config.textColor} rounded-full`}
                                  >
                                    {config.label}
                                  </span>
                                  <div className="relative">
                                    <button 
                                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                                      onClick={() => setOpenStatusDropdown(openStatusDropdown === lead._id ? null : lead._id)}
                                    >
                                      ⚙️
                                    </button>
                                    {openStatusDropdown === lead._id && (
                                      <div className="absolute bg-white dark:bg-gray-800 shadow-2xl rounded-lg z-20 top-8 left-0 min-w-56 border border-gray-200 dark:border-gray-700 overflow-hidden">
                                        {["new", "contacted", "interested", "follow-up", "negotiation", "converted", "lost"].map(
                                          (status, idx, arr) => {
                                            const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.new;
                                            return (
                                              <button
                                                key={status}
                                                onClick={() => {
                                                  handleStatusUpdate(lead._id, status);
                                                  setOpenStatusDropdown(null);
                                                }}
                                                className={`block w-full text-left px-4 py-3 transition font-medium text-sm
                                                  ${lead.status === status 
                                                    ? `${statusConfig.bgColor} ${statusConfig.textColor}` 
                                                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"}
                                                  ${idx < arr.length - 1 ? "border-b border-gray-100 dark:border-gray-700" : ""}
                                                `}
                                              >
                                                <span className="flex items-center gap-2">
                                                  {lead.status === status && <span className="text-lg">✓</span>}
                                                  {statusConfig.label}
                                                </span>
                                              </button>
                                            );
                                          }
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* AI Score */}
                              <td className="px-6 py-4">
                                {lead.score !== undefined ? (
                                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-semibold text-sm ${SCORE_TIER_CONFIG[lead.scoreTier || "cold"].bgColor} ${SCORE_TIER_CONFIG[lead.scoreTier || "cold"].textColor}`}>
                                    <span>{SCORE_TIER_CONFIG[lead.scoreTier || "cold"].icon}</span>
                                    <span>{lead.score}/100</span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">N/A</span>
                                )}
                              </td>

                              <td className="px-6 py-4 text-gray-600 dark:text-gray-400 font-semibold">{lead.totalCalls || 0}</td>
                              <td className="px-6 py-4">
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => {
                                      setSelectedLead(lead);
                                      setShowCallDrawer(true);
                                    }}
                                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                                    title="Log Call"
                                  >
                                    <MdCall size={20} />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (lead.phone) {
                                        window.open(`https://wa.me/${lead.phone}`, "_blank");
                                      }
                                    }}
                                    className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
                                    title="Send WhatsApp"
                                  >
                                    <FaWhatsapp size={20} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                            No enquiries match your filters
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Draft Badge */}
      <div className="fixed bottom-6 right-6 bg-yellow-500 text-white px-4 py-2 rounded-full shadow-lg font-semibold">
        🚀 DRAFT VERSION
      </div>

      {/* Add Lead Modal */}
      {showAddLeadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">➕ Add New Lead</h2>
            <form onSubmit={handleAddLead} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Interested Course</label>
                <input
                  type="text"
                  value={formData.interestedCourse}
                  onChange={(e) => setFormData({ ...formData, interestedCourse: e.target.value })}
                  placeholder="e.g., JEE, NEET, Foundation"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Source *</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="walk-in">Walk-in</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="website">Website</option>
                  <option value="referral">Referral</option>
                  <option value="phone-call">Phone Call</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition font-medium"
                >
                  {isSubmitting ? "Creating..." : "Create Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">📤 Import Leads via CSV</h2>
            <form onSubmit={handleCSVUpload} className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-900 dark:text-blue-200 mb-3">
                  Upload a CSV file with columns: name, phone, email, interestedCourse, source
                </p>
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="w-full px-3 py-2 bg-blue-100 dark:bg-blue-900/50 hover:bg-blue-200 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg font-medium transition text-sm"
                >
                  📥 Download Template
                </button>
              </div>

              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload" className="cursor-pointer">
                  <p className="text-gray-600 dark:text-gray-400 mb-2">Click to upload CSV file</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Max file size: 10MB</p>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
                >
                  Import
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Call Log Drawer - Right Side */}
      {showCallDrawer && selectedLead && (
        <>
          {/* Glass Blur Background */}
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-md z-40 transition-opacity duration-300"
            onClick={() => setShowCallDrawer(false)}
          />
          
          {/* Drawer Panel */}
          <div className="fixed right-0 top-0 h-screen w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 shadow-md">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-1">{selectedLead.name}</h2>
                  <p className="text-blue-100">{selectedLead.phone || "No phone"}</p>
                  <p className="text-sm text-blue-100 mt-2">
                    Status: <span className="font-semibold capitalize">{selectedLead.status}</span>
                  </p>
                </div>
                <button
                  onClick={() => setShowCallDrawer(false)}
                  className="text-xl hover:bg-blue-500 p-2 rounded-lg transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Form Section */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Log Call</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                handleAddCallLog(e);
              }} className="space-y-4">
                {/* Call Outcome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Call Outcome
                  </label>
                  <select
                    value={callLogData.outcome}
                    onChange={(e) =>
                      setCallLogData({ ...callLogData, outcome: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">Select outcome...</option>
                    <option value="interested">Interested</option>
                    <option value="not_interested">Not Interested</option>
                    <option value="follow_up">Follow-up Needed</option>
                    <option value="connected">Connected with Counselor</option>
                    <option value="no_answer">No Answer</option>
                    <option value="wrong_number">Wrong Number</option>
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={callLogData.duration}
                    onChange={(e) =>
                      setCallLogData({ ...callLogData, duration: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="0"
                    required
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Call Quality Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setCallLogData({ ...callLogData, rating: star })
                        }
                        className={`text-3xl transition transform hover:scale-110 ${
                          star <= callLogData.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Call Notes
                  </label>
                  <textarea
                    value={callLogData.notes}
                    onChange={(e) =>
                      setCallLogData({ ...callLogData, notes: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    placeholder="Add any notes about this call..."
                    rows={4}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                >
                  ✓ Save Call Log
                </button>
              </form>
            </div>

            {/* Call History Section */}
            {selectedLead.callHistory && selectedLead.callHistory.length > 0 && (
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Call History</h3>
                <div className="space-y-4">
                  {selectedLead.callHistory
                    .sort((a: CallLogEntry, b: CallLogEntry) => new Date(b.callDate).getTime() - new Date(a.callDate).getTime())
                    .map((call: CallLogEntry, index: number) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            {new Date(call.callDate).toLocaleDateString()} at{" "}
                            {new Date(call.callDate).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          {call.rating > 0 && (
                            <span className="text-yellow-400">
                              {"★".repeat(call.rating)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <span className="font-medium">Outcome:</span> {call.outcome}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <span className="font-medium">Duration:</span> {call.duration} min
                        </p>
                        {call.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                            {call.notes}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {(!selectedLead.callHistory || selectedLead.callHistory.length === 0) && (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <p>No call history yet. Log your first call above!</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
