"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/apiConfig";

export default function TenantDashboard() {
  const { tenantId } = useParams();
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenantInfo = async () => {
      try {
        console.log("🔵 Fetching tenant info for tenantId:", tenantId);
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${API_BASE_URL}`}/api/tenants/${tenantId}`, {
          method: "GET",
          credentials: "include", // ✅ Send httpOnly cookie with request
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("📍 Tenant API response status:", res.status);

        if (!res.ok) {
          const errorData = await res.json();
          console.error("❌ Tenant API error response:", errorData);
          throw new Error(errorData.message || `Failed to fetch tenant info (${res.status})`);
        }

        const data = await res.json();
        console.log("🟢 Tenant info fetched successfully:", data);
        setTenant(data);
      } catch (err: any) {
        console.error("❌ Error fetching tenant info:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) fetchTenantInfo();
  }, [tenantId]);

  if (loading) return <div className="p-6 text-gray-600">Loading tenant details...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

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
