"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useFacebookConnection } from "@/hooks/useFacebookConnection";

const API_BASE_URL = 'https://endearing-blessing-production-c61f.up.railway.app';

interface AdAccount {
  id: string;
  name: string;
  status: number;
  balance: string;
  currency: string;
}

interface DashboardData {
  adAccounts?: AdAccount[];
  summary?: {
    totalAdAccounts: number;
  };
  insights?: {
    impressions: number;
    spend: number;
  };
}

export default function SocialMediaDashboard() {
  const params = useParams();
  const tenantId = params.tenantId as string;
  const { isConnected, connect, disconnect, refresh, isLoading, error } = useFacebookConnection();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (isConnected && !isLoading) {
      fetchDashboardData();
    }
  }, [isConnected, isLoading]);

  const fetchDashboardData = async () => {
    setDataLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/facebook/dashboard`, {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success && data.dashboard) {
        setDashboardData(data.dashboard);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-3"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-light">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-3">📱</div>
            <h1 className="text-2xl font-light text-gray-900 dark:text-white mb-2">
              Social Media Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-light">
              Connect your Facebook Business account to get started
            </p>
          </div>

          {/* Connection Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 text-center max-w-md mx-auto">
            <div className="text-3xl mb-4">🔗</div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Connect Facebook Business
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm font-light mb-6">
              Access your ad accounts, campaigns, and performance insights
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <div className="text-lg mb-1">📊</div>
                <div className="font-medium text-gray-900 dark:text-white">Ad Analytics</div>
                <div className="text-gray-600 dark:text-gray-400 font-light">Campaign insights</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                <div className="text-lg mb-1">🎯</div>
                <div className="font-medium text-gray-900 dark:text-white">Ad Management</div>
                <div className="text-gray-600 dark:text-gray-400 font-light">Create & optimize</div>
              </div>
            </div>

            <button
              onClick={connect}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              🔗 Connect Facebook Account
            </button>

            {error && (
              <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-red-600 dark:text-red-400 text-xs font-light">❌ {error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-light text-gray-900 dark:text-white">Social Media</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-light">Manage your Facebook advertising campaigns</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => refresh()}
              disabled={dataLoading}
              className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-light text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              <span className={dataLoading ? "animate-spin" : ""}>🔄</span>
              Refresh
            </button>
            <button
              onClick={async () => {
                if (confirm('Are you sure you want to disconnect your Facebook account?')) {
                  const success = await disconnect();
                  if (success) {
                    alert('Facebook account disconnected successfully!');
                  } else {
                    alert('Failed to disconnect Facebook account. Please try again.');
                  }
                }
              }}
              className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg px-3 py-2 text-sm font-light hover:bg-red-100 dark:hover:bg-red-900/30"
            >
              🔌 Disconnect
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        {dashboardData && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-sm">💼</div>
                <div>
                  <div className="text-lg font-light text-gray-900 dark:text-white">
                    {dashboardData.adAccounts?.length || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-light">Ad Accounts</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-sm">🎯</div>
                <div>
                  <div className="text-lg font-light text-gray-900 dark:text-white">
                    {dashboardData.summary?.totalAdAccounts || 0}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-light">Active Campaigns</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-sm">👁</div>
                <div>
                  <div className="text-lg font-light text-gray-900 dark:text-white">
                    {dashboardData.insights?.impressions?.toLocaleString() || '0'}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-light">Impressions</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center text-sm">💰</div>
                <div>
                  <div className="text-lg font-light text-gray-900 dark:text-white">
                    ${dashboardData.insights?.spend?.toFixed(2) || '0.00'}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 font-light">Total Spend</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            href={`/dashboard/client/${tenantId}/social/campaigns`}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-lg group-hover:scale-110 transition-transform">🎯</div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">Campaigns</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-light">Manage ads</div>
              </div>
            </div>
          </Link>

          <Link
            href={`/dashboard/client/${tenantId}/social/reports`}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-lg group-hover:scale-110 transition-transform">📊</div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">Analytics</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-light">Performance data</div>
              </div>
            </div>
          </Link>

          <Link
            href={`/dashboard/client/${tenantId}/social/ads`}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-lg group-hover:scale-110 transition-transform">✨</div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">Create Ad</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-light">New campaign</div>
              </div>
            </div>
          </Link>

          <Link
            href={`/dashboard/client/${tenantId}/social/settings`}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-lg group-hover:scale-110 transition-transform">⚙️</div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">Settings</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-light">Account setup</div>
              </div>
            </div>
          </Link>
        </div>

        {/* Ad Accounts */}
        {dashboardData?.adAccounts && dashboardData.adAccounts.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-light text-gray-900 dark:text-white">Ad Accounts</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-light">Your connected Facebook ad accounts</p>
            </div>
            <div className="p-4">
              <div className="grid gap-3">
                {dashboardData.adAccounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-sm">💼</div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">{account.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 font-light">
                          Status: {account.status === 1 ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-light text-gray-900 dark:text-white text-sm">
                        {parseFloat(account.balance) > 0 ? `$${(parseFloat(account.balance) / 100).toFixed(2)}` : '$0.00'}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-light">{account.currency}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {dataLoading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-light">Loading data...</p>
          </div>
        )}
      </div>
    </div>
  );
}