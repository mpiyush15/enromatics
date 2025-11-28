"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Power, Plus, X } from "lucide-react";

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

  useEffect(() => {
    fetchTenants();
  }, []);

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

  if (loading) return <p className="p-6 text-gray-500">Loading tenants...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          🏢 Manage Tenants
        </h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          <Plus size={18} /> Add New Tenant
        </button>
      </div>

      {/* Filters and Search Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 md:p-6 mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              🔍 Search
            </label>
            <input
              type="text"
              placeholder="Name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="active">✅ Active</option>
              <option value="suspended">⏸️ Suspended</option>
            </select>
          </div>

          {/* Plan Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Plan
            </label>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Plans</option>
              <option value="free">Free</option>
              <option value="trial">Trial</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Newest First</option>
              <option value="name">Name (A-Z)</option>
              <option value="plan">Plan</option>
            </select>
          </div>

          {/* Results Counter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Results
            </label>
            <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-semibold text-gray-900 dark:text-white">
              {filteredTenants.length} / {tenants.length}
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(statusFilter !== "all" || planFilter !== "all" || searchQuery) && (
          <button
            onClick={() => {
              setStatusFilter("all");
              setPlanFilter("all");
              setSearchQuery("");
            }}
            className="mt-4 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            ✕ Clear Filters
          </button>
        )}
      </div>

      {/* Tenants Table */}
      <div className="overflow-x-auto -mx-4 md:mx-0 shadow-md rounded-lg">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                    Tenant ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                    Plan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTenants.map((tenant) => (
                  <tr
                    key={tenant.tenantId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {tenant.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {tenant.email}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-gray-600 dark:text-gray-400">
                      {tenant.tenantId}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        {tenant.plan || "free"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {tenant.active ? (
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          ✅ Active
                        </span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          ⏸️ Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => goToManagePage(tenant.tenantId)}
                          className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors gap-1"
                        >
                          <Eye size={16} /> Manage
                        </button>
                        <button
                          onClick={() => toggleSuspend(tenant)}
                          disabled={suspending && suspendingId === tenant.tenantId}
                          className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium gap-1 transition-colors ${
                            tenant.active
                              ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 disabled:opacity-50"
                              : "bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                          }`}
                        >
                          <Power size={16} />
                          {suspending && suspendingId === tenant.tenantId
                            ? "Updating..."
                            : tenant.active
                            ? "Suspend"
                            : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {filteredTenants.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 mt-4 text-center">
          {searchQuery || statusFilter !== "all" || planFilter !== "all"
            ? "No tenants match your filters."
            : "No tenants found."}
        </p>
      )}

      {/* Add New Tenant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                ➕ Add New Tenant
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={createNewTenant} className="p-6 space-y-4">
              {/* Owner Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Owner Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., John Smith"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g., john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Institute Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Institute/Organization Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., ABC Coaching Institute"
                  value={formData.instituteName}
                  onChange={(e) => setFormData({ ...formData, instituteName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g., +91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  placeholder="e.g., India"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-400">
                <p className="font-medium mb-1">📝 What happens next?</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Account created with free plan by default</li>
                  <li>Tenant receives login credentials</li>
                  <li>They can upgrade to Pro or Enterprise anytime</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  disabled={creatingTenant}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTenant}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creatingTenant ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus size={18} /> Create Account
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
