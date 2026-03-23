"use client";

import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import { FaWhatsapp } from "react-icons/fa";
import { MdCall } from "react-icons/md";
import PremiumLeadCard from "@/ai/components/PremiumLeadCard";
import PremiumDashboardHeader from "@/ai/components/PremiumDashboardHeader";
import { calculateLeadScore, getNextBestAction, getTierColor, formatLeadForDisplay } from "@/ai/hooks/useLeadScoring";
import { cardHoverClasses, filterButtonClasses, chartBarColor, chartPieColors, cardHeaderClasses } from "@/ai/config/themeColors";

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
  const [activeTab, setActiveTab] = useState<"enquiries" | "admission-engine">("admission-engine");
  const [viewMode, setViewMode] = useState<"dashboard" | "kanban" | "table" | "premium">("premium");
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

  // AI Scoring - Calculate tier distribution
  const leadsWithAIScore = leads.map((lead) =>
    formatLeadForDisplay({
      ...lead,
      totalCalls: lead.totalCalls || 0,
      lastCallDate: lead.lastCallDate,
      source: lead.source,
    })
  );

  const aiStats = {
    totalLeads: leads.length,
    hotLeads: leadsWithAIScore.filter((l) => l.aiTier === "hot").length,
    warmLeads: leadsWithAIScore.filter((l) => l.aiTier === "warm").length,
    coldLeads: leadsWithAIScore.filter((l) => l.aiTier === "cold").length,
    conversionRate: Number(conversionRate),
    avgScore: leadsWithAIScore.length > 0 ? Math.round(leadsWithAIScore.reduce((sum, l) => sum + l.aiScore, 0) / leadsWithAIScore.length) : 0,
    overdueTasks: leadsWithAIScore.filter((l) => l.aiTier === "hot" && l.actionPriority === "critical").length,
  };
  
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
          <div className="px-6 border-t border-gray-200 dark:border-gray-700 flex gap-0 overflow-x-auto">
            <button
              onClick={() => setActiveTab("enquiries")}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "enquiries"
                  ? "text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400"
                  : "text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              📑 Enquiries Table
            </button>
            <button
              onClick={() => setActiveTab("admission-engine")}
              className={`px-6 py-3 font-semibold transition-colors border-b-2 whitespace-nowrap ${
                activeTab === "admission-engine"
                  ? "text-purple-600 dark:text-purple-400 border-purple-600 dark:border-purple-400"
                  : "text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              🚀 AI Admission Engine (Beta)
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* AI LEADS TAB - ANALYTICS & INSIGHTS */}
          {/* ENQUIRIES TABLE TAB */}
          {activeTab === "enquiries" && (
            <div className="space-y-6">
              {/* AI Powered Search */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="🔍 Search by name, phone, email, course, source, status or AI score..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  />
                </div>
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
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold transition whitespace-nowrap"
                >
                  {isSubmitting ? "🔄 Computing..." : "🤖 Calculate"}
                </button>
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
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">🤖 AI SCORE</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">🎯 NEXT ACTION</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">CALLS</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredLeads.length > 0 ? (
                        filteredLeads.map((lead) => {
                          const config = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new;
                          // Get AI data for this lead
                          const aiLead = leadsWithAIScore.find(l => l._id === lead._id);
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

                              {/* 🤖 AI SCORE Column */}
                              <td className="px-6 py-4">
                                {aiLead ? (
                                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-bold text-sm ${aiLead.tierColors.bg} ${aiLead.tierColors.text} ${aiLead.tierColors.darkBg} ${aiLead.tierColors.darkText}`}>
                                    <span>{aiLead.tierColors.icon}</span>
                                    <span>{aiLead.aiScore}</span>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-sm">—</span>
                                )}
                              </td>

                              {/* 🎯 NEXT ACTION Column */}
                              <td className="px-6 py-4">
                                {aiLead ? (
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-xs truncate">
                                    {aiLead.actionIcon} {aiLead.nextAction}
                                  </p>
                                ) : (
                                  <span className="text-gray-400 text-sm">—</span>
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

          {/* AI ADMISSION ENGINE TAB */}
          {activeTab === "admission-engine" && (
            <div className="space-y-6 pb-12">
              {/* Analytics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Leads Card */}
                <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${cardHoverClasses} transition-all duration-300 cursor-pointer`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalLeads}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Active in pipeline</p>
                    </div>
                    <span className="text-3xl">📊</span>
                  </div>
                </div>

                {/* Conversion Rate Card */}
                <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${cardHoverClasses} transition-all duration-300 cursor-pointer`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{conversionRate}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">{converted} converted</p>
                    </div>
                    <span className="text-3xl">📈</span>
                  </div>
                </div>

                {/* Hot Leads Card */}
                <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${cardHoverClasses} transition-all duration-300 cursor-pointer`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-3xl font-bold text-blue-600">{aiStats.hotLeads}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Ready to close</p>
                    </div>
                    <span className="text-3xl">🔥</span>
                  </div>
                </div>

                {/* Avg AI Score Card */}
                <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${cardHoverClasses} transition-all duration-300 cursor-pointer`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-3xl font-bold text-blue-600">{aiStats.avgScore}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Out of 100</p>
                    </div>
                    <span className="text-3xl">⚡</span>
                  </div>
                </div>
              </div>

              {/* Follow-up Intelligence & Hot Leads Top 5 - Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-max">
                {/* Follow-up Intelligence Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
                    <h3 className="text-lg font-bold text-black dark:text-gray-100">Follow-up Intelligence</h3>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition">Tomorrow</button>
                      <button className="px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition">Today</button>
                      <button className="px-3 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition">Yesterday</button>
                    </div>
                  </div>
                  <div className="overflow-y-auto flex-1" style={{ minHeight: "400px" }}>
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Name</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Mobile</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Next Action</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {leadsWithAIScore.filter((l) => l.aiTier === "hot").slice(0, 10).map((lead) => (
                          <tr key={lead._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">{lead.name}</td>
                            <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">{lead.phone}</td>
                            <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">{lead.actionIcon} {lead.nextAction}</td>
                            <td className="px-6 py-3"><span className="inline-block px-2 py-1 text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded">Urgent</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Hot Leads Top 5 Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
                    <h3 className="text-lg font-bold text-black dark:text-gray-100">Hot Leads Top 10</h3>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition">Weekly</button>
                      <button className="px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition">Daily</button>
                    </div>
                  </div>
                  <div className="overflow-y-auto flex-1" style={{ minHeight: "400px" }}>
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Name</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Mobile</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Lead Score</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {leadsWithAIScore.filter((l) => l.aiTier === "hot").sort((a, b) => b.aiScore - a.aiScore).slice(0, 10).map((lead) => (
                          <tr key={lead._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">{lead.name}</td>
                            <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">{lead.phone}</td>
                            <td className="px-6 py-3"><div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-bold text-xs ${lead.tierColors.bg} ${lead.tierColors.text}`}><span>{lead.tierColors.icon}</span><span>{lead.aiScore}</span></div></td>
                            <td className="px-6 py-3"><button onClick={() => { setSelectedLead(lead); setShowCallDrawer(true); }} className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded transition">📞 Call</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Conversion Intelligence Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-black dark:text-gray-100">Conversion Intelligence</h3>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-500">Academic Year</span>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={funnelData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                        <XAxis dataKey="name" stroke="#6b7280" className="dark:stroke-gray-500 text-sm" />
                        <YAxis stroke="#6b7280" className="dark:stroke-gray-500 text-sm" />
                        <Bar dataKey="value" fill="#2563eb" radius={[8, 8, 0, 0]} isAnimationActive={false} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-4">Pipeline stages: New → Contacted → Interested → Converted</p>
                </div>

                {/* Today Task List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-black dark:text-gray-100">Today Task List</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-500">Date</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { task: "Call 6 hot leads", priority: "Critical" },
                      { task: "Follow up 3 demos", priority: "High" },
                      { task: "Send WhatsApp to 8 warm leads", priority: "Medium" },
                    ].map((item, idx) => (
                      <div key={idx} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between hover:bg-purple-50 dark:hover:bg-purple-900/10 transition">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" className="w-4 h-4 rounded" />
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{item.task}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded font-semibold ${
                          item.priority === "Critical" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" :
                          item.priority === "High" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" :
                          "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        }`}>{item.priority}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Follow-up Overdue & Source of Leads - Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-max">
                {/* Follow-up Overdue Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
                    <h3 className="text-lg font-bold text-black dark:text-gray-100">Follow-up Overdue</h3>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition">Daily</button>
                      <button className="px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition">Weekly</button>
                    </div>
                  </div>
                  <div className="overflow-y-auto flex-1" style={{ minHeight: "400px" }}>
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Name</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Mobile</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Lead Score</th>
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {leadsWithAIScore.filter((l) => l.aiTier === "warm" || l.aiTier === "cold").slice(0, 10).map((lead) => (
                          <tr key={lead._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">{lead.name}</td>
                            <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">{lead.phone}</td>
                            <td className="px-6 py-3"><div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-bold text-xs ${lead.tierColors.bg} ${lead.tierColors.text}`}><span>{lead.tierColors.icon}</span><span>{lead.aiScore}</span></div></td>
                            <td className="px-6 py-3"><button onClick={() => { setSelectedLead(lead); setShowCallDrawer(true); }} className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded transition">📱 WhatsApp</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Source of Leads Pie Chart Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-full">
                  <h3 className="text-lg font-bold text-black dark:text-gray-100 mb-6">Source of Leads</h3>
                  <div className="flex-1 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={sourceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={100}
                          fill="#2563eb"
                          dataKey="value"
                          isAnimationActive={false}
                        >
                          <Cell fill="#2563eb" fillOpacity={1} />
                          <Cell fill="#2563eb" fillOpacity={0.85} />
                          <Cell fill="#2563eb" fillOpacity={0.70} />
                          <Cell fill="#2563eb" fillOpacity={0.55} />
                          <Cell fill="#2563eb" fillOpacity={0.40} />
                          <Cell fill="#2563eb" fillOpacity={0.25} />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
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
