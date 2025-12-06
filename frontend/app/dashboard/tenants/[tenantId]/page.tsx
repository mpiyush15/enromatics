"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Power, Loader, Mail, KeyRound } from "lucide-react";

// Plan name mapping
const PLAN_NAMES: Record<string, string> = {
  free: "Free",
  trial: "Trial",
  test: "Test Plan",
  starter: "Starter",
  professional: "Professional",
  enterprise: "Enterprise",
  pro: "Pro",
};

type Tenant = {
  _id: string;
  tenantId: string;
  name: string;
  email: string;
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
    paymentId?: string;
    startDate: string;
    endDate: string;
  };
  usage?: {
    studentsCount?: number;
    staffCount?: number;
    adsCount?: number;
  };
  whatsappOptIn?: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params?.tenantId as string | undefined;

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [suspending, setSuspending] = useState(false);
  const [sendingCredentials, setSendingCredentials] = useState(false);

  useEffect(() => {
    const fetchTenantDetail = async () => {
      try {
        if (!tenantId) throw new Error("Tenant ID not found");

        // ✅ Use superadmin-only route (no tenantProtect middleware)
        const tenantRes = await fetch(
          `/api/tenants/admin/${tenantId}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log("📍 Tenant Admin Detail API response status:", tenantRes.status);

        if (!tenantRes.ok) {
          const errorData = await tenantRes.json().catch(() => ({}));
          console.error('❌ Tenant detail error:', tenantRes.status, errorData);
          throw new Error(errorData.message || `Failed to fetch tenant details: ${tenantRes.status}`);
        }

        const tenantData = await tenantRes.json();
        
        if (!tenantData || typeof tenantData !== 'object') {
          throw new Error("Invalid tenant data received");
        }

        setTenant(tenantData.tenant || tenantData);
      } catch (err: any) {
        console.error("Error fetching tenant details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (tenantId) {
      fetchTenantDetail();
    }
  }, [tenantId]);

  const toggleSuspend = async () => {
    if (!tenant) return;

    try {
      setSuspending(true);

      // ✅ Toggle active status via superadmin route
      const res = await fetch(`/api/tenants/admin/${tenantId}`, {
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
      const updatedTenant = updated.tenant || updated;
      setTenant(updatedTenant);
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
    }
  };

  // Send login credentials to tenant
  const sendCredentials = async () => {
    if (!tenant || !tenantId) return;
    
    const confirmed = confirm(
      `Send login credentials to ${tenant.email}?\n\nThis will generate a new password and email it to the tenant owner.`
    );
    if (!confirmed) return;

    try {
      setSendingCredentials(true);
      
      const res = await fetch(`/api/tenants/admin/${tenantId}/send-credentials`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send credentials");
      }

      alert(`✅ Login credentials sent successfully to ${tenant.email}`);
    } catch (err: any) {
      console.error("Error sending credentials:", err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setSendingCredentials(false);
    }
  };

  // Show loading while waiting for params or data
  if (!tenantId || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader className="animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" size={40} />
          <p className="text-gray-600 dark:text-gray-400">Loading tenant details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🏢</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Tenant Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">The tenant you're looking for doesn't exist.</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Go back"
              >
                <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                  {tenant.instituteName || tenant.name}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Tenant ID: <code className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{tenant.tenantId}</code>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Send Credentials Button */}
              <button
                onClick={sendCredentials}
                disabled={sendingCredentials}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Send login credentials to tenant"
              >
                {sendingCredentials ? (
                  <Loader className="animate-spin" size={18} />
                ) : (
                  <KeyRound size={18} />
                )}
                {sendingCredentials ? "Sending..." : "Send Credentials"}
              </button>

              {/* Suspend/Activate Button */}
              <button
                onClick={toggleSuspend}
                disabled={suspending}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  tenant.active
                    ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50"
                    : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Power size={18} />
                {suspending
                  ? "Updating..."
                  : tenant.active
                  ? "Suspend Account"
                  : "Activate Account"}
              </button>
            </div>
          </div>

          {/* Status Badge */}
          {tenant.active ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full"></span>
              ✅ Active
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full"></span>
              ⏸️ Suspended
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - SaaS Management Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Account Information Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                👤 Account Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Account Owner Name
                  </label>
                  <p className="text-gray-900 dark:text-white mt-1 text-lg font-medium">
                    {tenant.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Email Address
                  </label>
                  <p className="text-gray-900 dark:text-white mt-1 font-mono text-sm">
                    {tenant.email}
                  </p>
                </div>
                {tenant.instituteName && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Institute/Organization Name
                    </label>
                    <p className="text-gray-900 dark:text-white mt-1">
                      {tenant.instituteName}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information Card */}
            {tenant.contact && (tenant.contact.phone || tenant.contact.address || tenant.contact.city || tenant.contact.state || tenant.contact.country) && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  📞 Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tenant.contact.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Phone
                      </label>
                      <p className="text-gray-900 dark:text-white mt-1">
                        {tenant.contact.phone}
                      </p>
                    </div>
                  )}
                  {tenant.contact.address && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Address
                      </label>
                      <p className="text-gray-900 dark:text-white mt-1">
                        {tenant.contact.address}
                      </p>
                    </div>
                  )}
                  {tenant.contact.city && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        City
                      </label>
                      <p className="text-gray-900 dark:text-white mt-1">
                        {tenant.contact.city}
                      </p>
                    </div>
                  )}
                  {tenant.contact.state && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        State
                      </label>
                      <p className="text-gray-900 dark:text-white mt-1">
                        {tenant.contact.state}
                      </p>
                    </div>
                  )}
                  {tenant.contact.country && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Country
                      </label>
                      <p className="text-gray-900 dark:text-white mt-1">
                        {tenant.contact.country}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Plan & Subscription Info */}
          <div className="space-y-6">
            {/* Plan Information Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                💳 Plan Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Current Plan
                  </label>
                  <p className="mt-2">
                    <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                      {PLAN_NAMES[tenant.plan?.toLowerCase() || "free"] || tenant.plan || "Free"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Subscription Card */}
            {tenant.subscription && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  🔄 Subscription
                </h2>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Status
                    </label>
                    <p className="mt-1">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize ${
                          tenant.subscription.status === "active"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400"
                        }`}
                      >
                        {tenant.subscription.status || "N/A"}
                      </span>
                    </p>
                  </div>
                  {tenant.subscription.startDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Join Date
                      </label>
                      <p className="text-gray-900 dark:text-white mt-1 text-sm">
                        {new Date(tenant.subscription.startDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                  {tenant.subscription.endDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Renewal Date
                      </label>
                      <p className="text-gray-900 dark:text-white mt-1 text-sm">
                        {new Date(tenant.subscription.endDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Account Metadata Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                📅 Timeline
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <label className="font-medium text-gray-600 dark:text-gray-400">
                    Account Created
                  </label>
                  <p className="text-gray-900 dark:text-white mt-1">
                    {new Date(tenant.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <label className="font-medium text-gray-600 dark:text-gray-400">
                    Last Updated
                  </label>
                  <p className="text-gray-900 dark:text-white mt-1">
                    {new Date(tenant.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}