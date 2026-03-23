"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Power, Plus, X } from "lucide-react";
import useAuth from "@/hooks/useAuth";

type Tenant = {
  _id: string;
  name: string;
  email: string;
  tenantId: string;
  instituteName?: string;
  plan: string;
  active: boolean;
  contact?: {
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  subscription?: {
    status: string;
    startDate: string;
    endDate: string;
  };
  createdAt: string;
  updatedAt: string;
};

export default function AdminTenantsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [suspendingId, setSuspendingId] = useState<string | null>(null);
  const [suspending, setSuspending] = useState(false);
  
  // Filter and sort states
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [planFilter, setPlanFilter] = useState<"all" | "free" | "pro" | "enterprise" | "trial">("all");
  const [sortBy, setSortBy] = useState<"name" | "date" | "plan">("date");
  const [searchQuery, setSearchQuery] = useState("");

  // Add tenant modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [creatingTenant, setCreatingTenant] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    instituteName: "",
    phone: "",
    country: "India",
  });

  // 🔒 Role-based access control - Only SuperAdmin can see this page
  useEffect(() => {
    if (!authLoading && user && user.role?.toLowerCase() !== "superadmin") {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role?.toLowerCase() === "superadmin") {
      fetchTenants();
    }
  }, [user]);

  // Apply filters and sorting whenever data or filters change
  useEffect(() => {
    let result = [...tenants];

    // Apply status filter
    if (statusFilter === "active") {
      result = result.filter(t => t.active);
    } else if (statusFilter === "suspended") {
      result = result.filter(t => !t.active);
    }

    // Apply plan filter
    if (planFilter !== "all") {
      result = result.filter(t => t.plan === planFilter);
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        t =>
          t.name.toLowerCase().includes(query) ||
          t.email.toLowerCase().includes(query) ||
          t.tenantId.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "plan") {
        return a.plan.localeCompare(b.plan);
      } else {
        // Sort by date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    setFilteredTenants(result);
  }, [tenants, statusFilter, planFilter, sortBy, searchQuery]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      // ✅ Use BFF route instead of direct backend call
      const res = await fetch(`/api/tenants`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("📍 Tenants API response status:", res.status);
      console.log("📍 Cache status:", res.headers.get('X-Cache'));

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("❌ Tenants API error:", errorData);
        throw new Error("Failed to fetch tenants");
      }

      const data = await res.json();
      setTenants(data);
    } catch (err: any) {
      console.error("❌ Tenant Fetch Error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSuspend = async (tenant: Tenant) => {
    try {
      setSuspending(true);
      setSuspendingId(tenant.tenantId);

      // ✅ Use superadmin BFF route to toggle active status
      const res = await fetch(`/api/tenants/admin/${tenant.tenantId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          active: !tenant.active,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update tenant");
      }

      const response = await res.json();
      // Handle both response formats: { tenant: {...} } or direct tenant object
      const updatedTenant = response.tenant || response;
      
      setTenants(tenants.map(t => t.tenantId === updatedTenant.tenantId ? updatedTenant : t));
      alert(
        updatedTenant.active
          ? "✅ Tenant account activated!"
          : "✅ Tenant account suspended!"
      );
    } catch (err: any) {
      console.error("Error updating tenant:", err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setSuspending(false);
      setSuspendingId(null);
    }
  };

  const goToManagePage = (tenantId: string) => {
    router.push(`/dashboard/tenants/${tenantId}`);
  };

  const createNewTenant = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setCreatingTenant(true);

      // Call backend to create new tenant
      const res = await fetch(`/api/tenants/create`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          instituteName: formData.instituteName,
          phone: formData.phone,
          country: formData.country,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to create tenant");
      }

      const newTenant = await res.json();
      
      // Add to tenants list
      setTenants([...tenants, newTenant.tenant || newTenant]);
      
      // Show success message with login details
      alert(
        `✅ Tenant created successfully!\n\nLogin Details:\nEmail: ${formData.email}\nTenant ID: ${newTenant.tenant?.tenantId || newTenant.tenantId}\n\nThey can now sign in and choose a plan!`
      );

      // Reset form and close modal
      setFormData({
        name: "",
        email: "",
        instituteName: "",
        phone: "",
        country: "India",
      });
      setShowAddModal(false);
    } catch (err: any) {
      console.error("Error creating tenant:", err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setCreatingTenant(false);
    }
  };

  if (authLoading || loading) return <p className="p-6 text-gray-500">Loading tenants...</p>;
  if (!user || user.role?.toLowerCase() !== "superadmin") {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold">Access Denied</h2>
          <p className="text-red-600 mt-2">This page is only accessible to SuperAdmin users.</p>
        </div>
      </div>
    );
  }
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900/50 dark:to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-cyan-500 to-purple-500 bg-clip-text text-transparent dark:from-purple-400 dark:via-cyan-300 dark:to-purple-400">
              Tenants Management
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2 text-lg">
              View and manage all registered tenants
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 dark:from-purple-700 dark:to-cyan-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Plus size={20} /> Add Tenant
          </button>
        </div>

        {/* KPI Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-slate-200/50 dark:border-slate-700/50">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Total Tenants</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{tenants.length}k</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">+550 this month</p>
          </div>
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-slate-200/50 dark:border-slate-700/50">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Active Tenants</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{tenants.filter(t => t.active).length}</h3>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">+24 growth</p>
          </div>
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-slate-200/50 dark:border-slate-700/50">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Suspended Tenants</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{tenants.filter(t => !t.active).length}</h3>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">-22 this month</p>
          </div>
          <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-slate-200/50 dark:border-slate-700/50">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">Trial Ending Soon</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">78</h3>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">-78 need attention</p>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-slate-200/50 dark:border-slate-700/50 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            {/* Search Input */}
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Search tenants...</label>
              <input
                type="text"
                placeholder="Name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="active">✓ Active</option>
                <option value="suspended">Suspended</option>
              </select>

              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value as any)}
                className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Plans</option>
                <option value="free">Free</option>
                <option value="trial">Trial</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="date">Newest First</option>
                <option value="name">Name (A-Z)</option>
                <option value="plan">Plan</option>
              </select>

              {(statusFilter !== "all" || planFilter !== "all" || searchQuery) && (
                <button
                  onClick={() => {
                    setStatusFilter("all");
                    setPlanFilter("all");
                    setSearchQuery("");
                  }}
                  className="px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">Showing {filteredTenants.length} of {tenants.length} results</p>
        </div>

        {/* Tenants Table */}
        <div className="bg-white dark:bg-slate-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">TENANT</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">PLAN</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">USAGE</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">STATUS</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">STATUS</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredTenants.map((tenant) => (
                  <tr key={tenant.tenantId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                          {tenant.name ? tenant.name.charAt(0).toUpperCase() : "?"}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{tenant.name || "Unknown"}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{tenant.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                        {tenant.plan || "free"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">73 👥 19 📁</div>
                        <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="w-2/3 h-full bg-gradient-to-r from-purple-500 to-cyan-500"></div>
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">67%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${tenant.active ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"}`}>
                        {tenant.active ? "✓ Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${tenant.active ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"}`}>
                        {tenant.active ? "✓ Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => goToManagePage(tenant.tenantId)}
                          className="px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          Manage
                        </button>
                        <button
                          onClick={() => toggleSuspend(tenant)}
                          disabled={suspending && suspendingId === tenant.tenantId}
                          className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${tenant.active ? "text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20" : "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"} ${suspending && suspendingId === tenant.tenantId ? "opacity-50" : ""}`}
                        >
                          {suspending && suspendingId === tenant.tenantId ? "..." : tenant.active ? "Suspend" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTenants.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-500 dark:text-slate-400">
                {searchQuery || statusFilter !== "all" || planFilter !== "all"
                  ? "No tenants match your filters."
                  : "No tenants found."}
              </p>
            </div>
          )}
        </div>

        {/* Pagination Info */}
        {filteredTenants.length > 0 && (
          <div className="mt-6 flex justify-between items-center text-sm text-slate-600 dark:text-slate-400">
            <p>Showing {filteredTenants.length} of {tenants.length} results</p>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">←</button>
              <button className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg">1</button>
              <button className="px-3 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">→</button>
            </div>
          </div>
        )}
      </div>

      {/* Add New Tenant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-purple-50 to-cyan-50 dark:from-purple-900/20 dark:to-cyan-900/20">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Add New Tenant
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-200/50 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={createNewTenant} className="p-6 space-y-4">
              {/* Owner Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Owner Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., John Smith"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g., john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Institute Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Institute/Organization Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., ABC Coaching Institute"
                  value={formData.instituteName}
                  onChange={(e) => setFormData({ ...formData, instituteName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g., +91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  placeholder="e.g., India"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Info Box */}
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/50 rounded-lg p-4 text-sm text-purple-700 dark:text-purple-300">
                <p className="font-medium mb-2">What happens next?</p>
                <ul className="list-disc list-inside space-y-1 text-xs opacity-90">
                  <li>Account created with free plan</li>
                  <li>Tenant receives login credentials</li>
                  <li>Can upgrade anytime</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={creatingTenant}
                  className="flex-1 px-4 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTenant}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 dark:from-purple-700 dark:to-cyan-700 text-white rounded-lg transition-all font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creatingTenant ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={18} /> Create
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
