"use client";

import { useEffect, useState } from "react";
import { Trash2, Edit2, X } from "lucide-react";

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
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Tenant>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTenants();
  }, []);

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

  const startEdit = (tenant: Tenant) => {
    setEditingId(tenant.tenantId);
    setEditForm({ ...tenant });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveTenant = async () => {
    try {
      setSaving(true);
      // ✅ Use BFF route to update tenant
      const res = await fetch(`/api/tenants/${editForm.tenantId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update tenant");
      }

      const updated = await res.json();
      setTenants(tenants.map(t => t.tenantId === updated.tenantId ? updated : t));
      setEditingId(null);
      setEditForm({});
      alert("✅ Tenant updated successfully!");
    } catch (err: any) {
      console.error("Error updating tenant:", err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const moveTenantToTrash = async (tenantId: string) => {
    try {
      setDeleting(true);
      // ✅ Use BFF route to soft delete (move to trash)
      const res = await fetch(`/api/tenants/${tenantId}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to move to trash");
      }

      setTenants(tenants.filter(t => t.tenantId !== tenantId));
      setDeleteConfirm(null);
      alert("✅ Tenant moved to trash!");
    } catch (err: any) {
      console.error("Error moving to trash:", err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <p className="p-6 text-gray-500">Loading tenants...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">🏢 Manage Tenants</h1>

      {/* Mobile-friendly scrollable table wrapper */}
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
                {tenants.map((tenant) => (
                  <tr
                    key={tenant.tenantId}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    {editingId === tenant.tenantId ? (
                      // Edit Mode
                      <>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <input
                            type="text"
                            value={editForm.name || ""}
                            onChange={(e) =>
                              setEditForm({ ...editForm, name: e.target.value })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <input
                            type="email"
                            value={editForm.email || ""}
                            onChange={(e) =>
                              setEditForm({ ...editForm, email: e.target.value })
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-gray-600 dark:text-gray-400">
                          {tenant.tenantId}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <select
                            value={editForm.plan || "free"}
                            onChange={(e) =>
                              setEditForm({ ...editForm, plan: e.target.value })
                            }
                            className="px-2 py-1 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600"
                          >
                            <option value="free">Free</option>
                            <option value="pro">Pro</option>
                            <option value="enterprise">Enterprise</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={editForm.active || false}
                              onChange={(e) =>
                                setEditForm({ ...editForm, active: e.target.checked })
                              }
                              className="rounded"
                            />
                            {editForm.active ? "Active" : "Inactive"}
                          </label>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={saveTenant}
                              disabled={saving}
                              className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors disabled:opacity-50"
                            >
                              {saving ? "Saving..." : "✅ Save"}
                            </button>
                            <button
                              onClick={cancelEdit}
                              disabled={saving}
                              className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      // View Mode
                      <>
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
                            <span className="text-green-600 dark:text-green-400">✅ Active</span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400">❌ Inactive</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEdit(tenant)}
                              className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors gap-1"
                            >
                              <Edit2 size={16} /> Edit
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(tenant.tenantId)}
                              className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors gap-1"
                            >
                              <Trash2 size={16} /> Trash
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {tenants.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 mt-4 text-center">No tenants found.</p>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Move to Trash?
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to move <strong>{tenants.find(t => t.tenantId === deleteConfirm)?.name}</strong> to trash? This action can be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => moveTenantToTrash(deleteConfirm)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium"
                >
                  {deleting ? "Moving..." : "Move to Trash"}
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
