"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function TenantDashboard() {
  const params = useParams();
  const tenantId = params?.tenantId as string;
  const router = useRouter();
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTenantInfo = async () => {
      try {
        console.log("🔵 Fetching tenant info for tenantId:", tenantId);
        // ✅ Use BFF route instead of direct backend call
        const res = await fetch(`/api/tenants/${tenantId}`, {
          method: "GET",
          credentials: "include", // ✅ Send httpOnly cookie with request
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("📍 Tenant API response status:", res.status);
        console.log("📍 Cache status:", res.headers.get('X-Cache'));

        if (!res.ok) {
          const errorData = await res.json();
          console.error("❌ Tenant API error response:", errorData);
          throw new Error(errorData.message || `Failed to fetch tenant info (${res.status})`);
        }

        const data = await res.json();
        console.log("🟢 Tenant info fetched successfully:", data);
        setTenant(data);

        // Check if tenant needs onboarding (paid but not completed)
        if (data.paid_status === true && data.onboarding_completed !== true) {
          console.log("🔄 Redirecting to onboarding...");
          // Redirect to onboarding page
          setTimeout(() => {
            router.push(`/onboarding/whitelabel?tenantId=${tenantId}`);
          }, 500);
          return;
        }
      } catch (err: any) {
        console.error("❌ Error fetching tenant info:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) fetchTenantInfo();
  }, [tenantId, router]);

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
