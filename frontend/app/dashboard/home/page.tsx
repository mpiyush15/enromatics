"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import TrialNote from "@/components/roles/user/TrialNote";

export default function HomeDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch user details using backend API (Express)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("🔵 Fetching user details from API...");
        const res = await fetch("http://localhost:5050/api/auth/me", {
          method: "GET",
          credentials: "include", // ✅ Send httpOnly cookie with request
          headers: { "Content-Type": "application/json" },
        });

        console.log("📍 Auth API response status:", res.status);

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          console.error("❌ Auth API error:", errorData);
          throw new Error(errorData.message || "Unauthorized");
        }

        const data = await res.json();
        console.log("🟢 User details fetched:", { name: data.name, role: data.role });
        setUser(data);
      } catch (err: any) {
        console.error("❌ Auth check failed:", err.message);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>;
  if (!user) return null;

  // ✅ Extract role and plan
  const role = user.role || "user";
  const plan = user.plan || "free";
  const planExpiry = user.planExpiry
    ? new Date(user.planExpiry).toLocaleDateString()
    : "N/A";

  // ✅ Role-based rendering
  return (
    <div className="space-y-6 p-10">
      <h1 className="text-3xl font-bold text-blue-600">
        👋 Welcome, {user.name || "User"}
      </h1>
      <p className="text-gray-600 dark:text-gray-300">
        You are logged in as <b>{role}</b>
      </p>

      {role === "SuperAdmin" ? (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-semibold text-blue-500 mb-2">Admin Overview</h2>
          <p>Manage tenants, monitor activity, and control global settings.</p>
        </div>
      ) : role === "tenantAdmin" ? (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-semibold text-blue-500 mb-2">
            Tenant Dashboard
          </h2>
          <p>
            Manage your staff, students, and ads campaign performance here.
          </p>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold">Trial Access</h2>
          <TrialNote />
        </div>
      )}

      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mt-4">
        <p><strong>Plan:</strong> {plan}</p>
        <p><strong>Expiry:</strong> {planExpiry}</p>
      </div>

      
    </div>
  );
}
