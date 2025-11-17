"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/lib/apiConfig";

type Tenant = {
  _id: string;
  name: string;
  email: string;
  tenantId: string;
  plan: string;
  active: boolean;
  subscription?: {
    status: string;
    startDate: string;
    endDate: string;
  };
};

export default function AdminTenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${API_BASE_URL}`}/api/tenants`, {
          method: "GET",
          credentials: "include", // ✅ Send httpOnly cookie with request
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("📍 Tenants API response status:", res.status);

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

    fetchTenants();
  }, []);

  if (loading) return <p className="p-6 text-gray-500">Loading tenants...</p>;
  if (error) return <p className="p-6 text-red-600">Error: {error}</p>;

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">🏢 All Tenants</h1>

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
                    Subscription
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
                        <span className="text-green-600 dark:text-green-400">✅ Active</span>
                      ) : (
                        <span className="text-red-600 dark:text-red-400">❌ Inactive</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600 dark:text-gray-400">
                      {tenant.subscription
                        ? `${new Date(
                            tenant.subscription.startDate
                          ).toLocaleDateString()} → ${new Date(
                            tenant.subscription.endDate
                          ).toLocaleDateString()}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <a
                        href={`/dashboard/tenants/${tenant.tenantId}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium underline"
                      >
                        Manage
                      </a>
                    </td>
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
    </div>
  );
}
