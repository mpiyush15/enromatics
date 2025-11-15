"use client";

import { useEffect, useState } from "react";

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
        console.log("🔵 Fetching all tenants from API...");
        const res = await fetch("http://localhost:5050/api/tenants", {
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
        console.log("🟢 Tenants fetched successfully:", data.length, "tenants");
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🏢 All Tenants</h1>

      <table className="w-full border border-gray-600 rounded text-sm md:text-base">
        <thead className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white text-left">
          <tr>
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Tenant ID</th>
            <th className="p-2">Plan</th>
            <th className="p-2">Status</th>
            <th className="p-2">Subscription</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {tenants.map((tenant) => (
            <tr
              key={tenant.tenantId}
              className="border-t border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td className="p-2">{tenant.name}</td>
              <td className="p-2">{tenant.email}</td>
              <td className="p-2">{tenant.tenantId}</td>
              <td className="p-2 font-medium text-blue-600">
                {tenant.plan || "free"}
              </td>
              <td className="p-2">
                {tenant.active ? "✅ Active" : "❌ Inactive"}
              </td>
              <td className="p-2">
                {tenant.subscription
                  ? `${new Date(
                      tenant.subscription.startDate
                    ).toLocaleDateString()} → ${new Date(
                      tenant.subscription.endDate
                    ).toLocaleDateString()}`
                  : "—"}
              </td>
              <td className="p-2">
                <a
                  href={`/dashboard/tenants/${tenant.tenantId}`}
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  Manage
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {tenants.length === 0 && (
        <p className="text-gray-500 mt-4">No tenants found.</p>
      )}
    </div>
  );
}
