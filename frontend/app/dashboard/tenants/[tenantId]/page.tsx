"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface TenantDetail {
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
    paymentId?: string;
  };
  usage?: {
    studentsCount: number;
    staffCount: number;
    adsCount: number;
  };
  whatsappOptIn?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface StudentStats {
  total: number;
  active: number;
  inactive: number;
}

interface UserStats {
  total: number;
  admins: number;
  staff: number;
}

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params?.tenantId as string | undefined;

  const [tenant, setTenant] = useState<TenantDetail | null>(null);
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTenantDetail = async () => {
      try {
        // ✅ Fetch tenant details using BFF route instead of backend directly
        const tenantRes = await fetch(
          `/api/tenants/${tenantId}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!tenantRes.ok) {
          const errorData = await tenantRes.json().catch(() => ({}));
          console.error('❌ Tenant detail error:', tenantRes.status, errorData);
          throw new Error(`Failed to fetch tenant details: ${tenantRes.status}`);
        }

        const tenantData = await tenantRes.json();
        
        if (!tenantData || typeof tenantData !== 'object') {
          throw new Error("Invalid tenant data received");
        }
        setTenant(tenantData);

        // Fetch student stats
        try {
          const studentsRes = await fetch(
            `/api/students?tenantId=${tenantId}&stats=true`,
            {
              method: "GET",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (studentsRes.ok) {
            const studentsData = await studentsRes.json();
            if (Array.isArray(studentsData)) {
              const total = studentsData.length;
              const active = studentsData.filter(s => s.isActive).length;
              setStudentStats({
                total,
                active,
                inactive: total - active
              });
            }
          }
        } catch (err) {
          console.log("Could not fetch student stats:", err);
        }

        // Fetch user stats
        try {
          const usersRes = await fetch(
            `/api/user?tenantId=${tenantId}`,
            {
              method: "GET",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (usersRes.ok) {
            const usersData = await usersRes.json();
            if (Array.isArray(usersData)) {
              const total = usersData.length;
              const admins = usersData.filter(u => u.role === 'tenantAdmin').length;
              const staff = usersData.filter(u => u.role === 'staff').length;
              setUserStats({
                total,
                admins,
                staff
              });
            }
          }
        } catch (err) {
          console.log("Could not fetch user stats:", err);
        }

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

  // Show loading while waiting for params or data
  if (!tenantId || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tenant details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏢</div>
          <h2 className="text-2xl font-bold mb-2">Tenant Not Found</h2>
          <p className="text-gray-600 mb-4">The tenant you're looking for doesn't exist.</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'trial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'pro':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusColor = (active: boolean) => {
    return active
      ? 'bg-green-100 text-green-800 border-green-300'
      : 'bg-red-100 text-red-800 border-red-300';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              🏢 {tenant.instituteName || tenant.name}
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            {tenant.plan && (
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getPlanColor(tenant.plan)}`}>
                {tenant.plan.toUpperCase()} Plan
              </span>
            )}
            {tenant.active !== undefined && (
              <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(tenant.active)}`}>
                {tenant.active ? '✅ Active' : '❌ Inactive'}
              </span>
            )}
            {tenant.whatsappOptIn && (
              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-50 text-green-700 border border-green-200">
                📱 WhatsApp Enabled
              </span>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">📋 Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Owner Name
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">{tenant.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Institute Name
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {tenant.instituteName || 'Not provided'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">{tenant.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Tenant ID
                  </label>
                  <p className="text-gray-900 dark:text-white font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {tenant.tenantId}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Created Date
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {new Date(tenant.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Last Updated
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {new Date(tenant.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            {tenant.contact && (
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">📞 Contact Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {tenant.contact.phone && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Phone
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium">{tenant.contact.phone}</p>
                    </div>
                  )}

                  {tenant.contact.address && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Address
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium">{tenant.contact.address}</p>
                    </div>
                  )}

                  {tenant.contact.city && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        City
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium">{tenant.contact.city}</p>
                    </div>
                  )}

                  {tenant.contact.state && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        State
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium">{tenant.contact.state}</p>
                    </div>
                  )}

                  {tenant.contact.country && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Country
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium">{tenant.contact.country}</p>
                    </div>
                  )}
                </div>

                {!tenant.contact.phone && !tenant.contact.address && !tenant.contact.city && (
                  <p className="text-gray-500 italic">No contact information provided</p>
                )}
              </div>
            )}

            {/* Subscription Information */}
            {tenant.subscription && (
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">💳 Subscription Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold border ${
                      tenant.subscription.status === 'active' 
                        ? 'bg-green-100 text-green-800 border-green-300'
                        : tenant.subscription.status === 'inactive'
                        ? 'bg-gray-100 text-gray-800 border-gray-300'
                        : 'bg-red-100 text-red-800 border-red-300'
                    }`}>
                      {tenant.subscription.status.toUpperCase()}
                    </span>
                  </div>

                  {tenant.subscription.startDate && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Start Date
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {new Date(tenant.subscription.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {tenant.subscription.endDate && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        End Date
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {new Date(tenant.subscription.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  {tenant.subscription.paymentId && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Payment ID
                      </label>
                      <p className="text-gray-900 dark:text-white font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {tenant.subscription.paymentId}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Stats and Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Usage Statistics */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">📊 Usage Statistics</h2>
              
              <div className="space-y-4">
                {studentStats && (
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">👨‍🎓 Students</h3>
                    <p className="text-2xl font-bold text-blue-600">{studentStats.total}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {studentStats.active} active, {studentStats.inactive} inactive
                    </p>
                  </div>
                )}

                {userStats && (
                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">👥 Users</h3>
                    <p className="text-2xl font-bold text-green-600">{userStats.total}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {userStats.admins} admins, {userStats.staff} staff
                    </p>
                  </div>
                )}

                {tenant.usage && (
                  <div className="border-l-4 border-purple-500 pl-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">📢 Ads Created</h3>
                    <p className="text-2xl font-bold text-purple-600">{tenant.usage.adsCount}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total advertisements</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">⚡ Quick Actions</h2>
              
              <div className="space-y-3">
                <a
                  href={`/dashboard/client/${tenant.tenantId}`}
                  className="block w-full px-4 py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  🏢 Manage Tenant
                </a>

                <a
                  href={`/dashboard/client/${tenant.tenantId}/students`}
                  className="block w-full px-4 py-3 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  👨‍🎓 View Students
                </a>

                <a
                  href={`/dashboard/client/${tenant.tenantId}/whatsapp/campaigns`}
                  className="block w-full px-4 py-3 bg-purple-600 text-white text-center rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                >
                  📱 WhatsApp Campaigns
                </a>

                {tenant.contact?.phone && (
                  <a
                    href={`tel:${tenant.contact.phone}`}
                    className="block w-full px-4 py-3 bg-orange-600 text-white text-center rounded-lg hover:bg-orange-700 transition-colors font-semibold"
                  >
                    📞 Call {tenant.contact.phone}
                  </a>
                )}

                <a
                  href={`mailto:${tenant.email}`}
                  className="block w-full px-4 py-3 bg-gray-600 text-white text-center rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                >
                  ✉️ Send Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}