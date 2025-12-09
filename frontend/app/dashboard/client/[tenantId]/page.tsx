"use client";

import { useParams } from "next/navigation";
import { useSWRFetch } from "@/lib/hooks/use-swr-fetch";

export default function TenantDashboard() {
  const params = useParams();
  const tenantId = params?.tenantId as string;
  
  // Use SWR for caching - data persists across navigation
  const { data: tenant, isLoading: loading, isError, error } = useSWRFetch<any>(
    tenantId ? `/api/tenants/${tenantId}` : null
  );

  if (loading) return <div className="p-6 text-gray-600">Loading tenant details...</div>;
  if (isError) return <div className="p-6 text-red-500">Error: {error?.message || "Failed to load"}</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-gray-800">
        Welcome, <span className="text-blue-600">{tenant?.name}</span> 👋
      </h1>

      <div className="rounded-2xl p-4 border border-gray-100">
        <p><strong>Customer ID:</strong> {tenant?.tenantId}</p>
        <p><strong>Email:</strong> {tenant?.email}</p>
        <p><strong>Plan:</strong> {tenant?.plan?.name || "Free"}</p>
        <p><strong>Plan Expiry:</strong> {tenant?.plan?.expiryDate
          ? new Date(tenant.plan.expiryDate).toLocaleDateString()
          : "N/A"}
        </p>
      </div>

      <div className="text-gray-600">
        You’re now on your dashboard. From here you can manage users, payments, and more 🚀
      </div>
    </div>
  );
}
