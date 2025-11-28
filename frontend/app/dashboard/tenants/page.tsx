"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Power } from "lucide-react";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [suspendingId, setSuspendingId] = useState<string | null>(null);
  const [suspending, setSuspending] = useState(false);

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

  const toggleSuspend = async (tenant: Tenant) => {
    try {
      setSuspending(true);
      setSuspendingId(tenant.tenantId);

      // ✅ Use BFF route to toggle active status
      const res = await fetch(`/api/tenants/${tenant.tenantId}`, {
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

      const updated = await res.json();
      setTenants(tenants.map(t => t.tenantId === updated.tenantId ? updated : t));
      alert(
        updated.active
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

      {tenants.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400 mt-4 text-center">
          No tenants found.
        </p>
      )}
    </div>
  );
}
