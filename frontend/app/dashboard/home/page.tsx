"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/apiConfig";
import { cache, CACHE_KEYS, CACHE_TTL } from "@/lib/cache";
import { DashboardSkeleton } from "@/components/ui/Skeleton";
import TrialNote from "@/components/roles/user/TrialNote";

export default function HomeDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Check cache first
        const cachedUser = cache.get(CACHE_KEYS.AUTH_USER) as any;
        if (cachedUser) {
          setUser(cachedUser);
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          throw new Error("Unauthorized");
        }

        const data = await res.json();
        setUser(data);
        
        // Cache the user data
        cache.set(CACHE_KEYS.AUTH_USER, data, CACHE_TTL.MEDIUM);
      } catch (err: any) {
        cache.remove(CACHE_KEYS.AUTH_USER);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  if (loading) return <DashboardSkeleton />;
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
