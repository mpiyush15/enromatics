"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Lead {
  _id: string;
  type: "form" | "demo";
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  institute?: string;
  source?: string;
  status: string;
  plan?: string;
  date?: string;
  time?: string;
  createdAt: string;
}

export default function AllLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "form" | "demo">("all");
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAllLeads();
  }, []);

  const fetchAllLeads = async () => {
    setLoading(true);
    try {
      // Fetch both form leads and demo requests
      const [formRes, demoRes] = await Promise.all([
        fetch("/api/form-leads?limit=100", { credentials: "include" }),
        fetch("/api/demo-requests?limit=100", { credentials: "include" }),
      ]);

      const combinedLeads: Lead[] = [];

      if (formRes.ok) {
        const formData = await formRes.json();
        (formData.leads || []).forEach((lead: any) => {
          combinedLeads.push({
            ...lead,
            type: "form",
            status: lead.status || "new",
          });
        });
      }

      if (demoRes.ok) {
        const demoData = await demoRes.json();
        (demoData.demoRequests || []).forEach((demo: any) => {
          combinedLeads.push({
            ...demo,
            type: "demo",
            status: demo.status || "pending",
          });
        });
      }

      // Sort by createdAt descending
      combinedLeads.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setLeads(combinedLeads);
    } catch (err) {
      console.error("Error fetching leads:", err);
    } finally {
      setLoading(false);
    }
  };

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    // Type filter
    if (filter !== "all" && lead.type !== filter) return false;
    
    // Status filter
    if (statusFilter && lead.status !== statusFilter) return false;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        lead.name?.toLowerCase().includes(query) ||
        lead.email?.toLowerCase().includes(query) ||
        lead.phone?.includes(query) ||
        lead.company?.toLowerCase().includes(query) ||
        lead.institute?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  const getStatusBadge = (status: string, type: string) => {
    if (type === "form") {
      const colors: Record<string, string> = {
        new: "bg-blue-100 text-blue-800",
        contacted: "bg-yellow-100 text-yellow-800",
        converted: "bg-green-100 text-green-800",
        lost: "bg-red-100 text-red-800",
      };
      return colors[status] || "bg-gray-100 text-gray-800";
    } else {
      const colors: Record<string, string> = {
        pending: "bg-yellow-100 text-yellow-800",
        confirmed: "bg-blue-100 text-blue-800",
        completed: "bg-green-100 text-green-800",
        cancelled: "bg-red-100 text-red-800",
      };
      return colors[status] || "bg-gray-100 text-gray-800";
    }
  };

  const getTypeBadge = (type: string) => {
    return type === "form" 
      ? "bg-purple-100 text-purple-800" 
      : "bg-green-100 text-green-800";
  };

  // Stats
  const formCount = leads.filter(l => l.type === "form").length;
  const demoCount = leads.filter(l => l.type === "demo").length;
  const newCount = leads.filter(l => l.status === "new" || l.status === "pending").length;
  const convertedCount = leads.filter(l => l.status === "converted" || l.status === "completed").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard/supercrm" className="text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              📋 All Leads
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Combined view of all form leads and demo requests
          </p>
        </div>
        <button
          onClick={fetchAllLeads}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500">Total Leads</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{leads.length}</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
          <p className="text-sm text-purple-600">Form Leads</p>
          <p className="text-2xl font-bold text-purple-700">{formCount}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
          <p className="text-sm text-green-600">Demo Requests</p>
          <p className="text-2xl font-bold text-green-700">{demoCount}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
          <p className="text-sm text-blue-600">New / Pending</p>
          <p className="text-2xl font-bold text-blue-700">{newCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        {/* Type Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === "all" 
                ? "bg-purple-600 text-white" 
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            All ({leads.length})
          </button>
          <button
            onClick={() => setFilter("form")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === "form" 
                ? "bg-purple-600 text-white" 
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            📝 Forms ({formCount})
          </button>
          <button
            onClick={() => setFilter("demo")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              filter === "demo" 
                ? "bg-purple-600 text-white" 
                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            📅 Demos ({demoCount})
          </button>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="pending">Pending</option>
          <option value="contacted">Contacted</option>
          <option value="confirmed">Confirmed</option>
          <option value="converted">Converted</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="lost">Lost</option>
        </select>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name, email, phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Contact</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Company/Institute</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Source/Plan</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No leads found
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={`${lead.type}-${lead._id}`} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(lead.type)}`}>
                        {lead.type === "form" ? "📝 Form" : "📅 Demo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">{lead.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-900 dark:text-white">{lead.phone || "-"}</p>
                      <p className="text-sm text-gray-500">{lead.email || "-"}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {lead.company || lead.institute || "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {lead.type === "form" ? (
                        <span className="text-sm">
                          {lead.source || "-"}
                          {lead.plan && <span className="ml-1 text-purple-600">({lead.plan})</span>}
                        </span>
                      ) : (
                        <span className="text-sm">
                          {lead.date && lead.time ? `${lead.date} ${lead.time}` : "-"}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(lead.status, lead.type)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">
                      {new Date(lead.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
