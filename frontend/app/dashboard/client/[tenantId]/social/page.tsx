"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/apiConfig";
import { useFacebookConnection } from "@/hooks/useFacebookConnection";
import FacebookConnectionCard from "@/components/dashboard/FacebookConnectionCard";

interface AdAccount {
  id: string;
  name: string;
  status: number;
  balance: string;
  currency: string;
}

interface FacebookPage {
  id: string;
  name: string;
  followers: number;
}

interface Insights {
  impressions: number;
  clicks: number;
  spend: number;
  reach: number;
}

interface DashboardData {
  adAccounts: AdAccount[];
  pages: FacebookPage[];
  insights: Insights | null;
  summary: {
    totalAdAccounts: number;
    totalPages: number;
    totalFollowers: number;
  };
}

interface ConnectionStatus {
  connected: boolean;
  facebookUserId?: string;
  permissions?: string[];
  connectedAt?: string;
  error?: string;
}

export default function SocialMediaDashboard() {
  const params = useParams();
  const tenantId = params.tenantId as string;
  
  const {
    isConnected,
    isLoading: connectionLoading,
    userInfo,
    pages,
    adAccounts,
    error: connectionError
  } = useFacebookConnection();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardInsights = async () => {
    if (!isConnected) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/facebook/dashboard?tenantId=${tenantId}`, {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (response.ok) {
        setDashboardData({
          adAccounts: data.adAccounts || [],
          pages: data.pages || [],
          insights: data.insights || null,
          summary: {
            totalAdAccounts: data.adAccounts?.length || 0,
            totalPages: data.pages?.length || 0,
            totalFollowers: data.pages?.reduce((sum: number, page: any) => sum + (page.followers || 0), 0) || 0
          }
        });
      } else {
        setError(data.message || 'Failed to fetch dashboard data');
      }
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchDashboardInsights();
    } else {
      setLoading(false);
    }
  }, [isConnected, tenantId]);

  if (connectionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading social media data...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📱</div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Social Media Analytics
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Connect your Facebook account to get started
            </p>
          </div>

          {/* Connection Card */}
          <div className="flex justify-center mb-8">
            <FacebookConnectionCard />
          </div>

          {/* Features Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center mb-8">
              <div className="text-5xl mb-6">🔗</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Facebook Business Integration
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                Connect your Facebook Business account to access comprehensive social media analytics, 
                ad performance data, and page insights all in one place.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Ad Analytics</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Campaign performance, impressions, clicks, and spend data
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                <div className="text-3xl mb-2">📝</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Page Insights</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Post engagement, reach, and audience demographics
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                <div className="text-3xl mb-2">👥</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Audience Data</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Follower growth, demographics, and engagement metrics
                </p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                <div className="text-3xl mb-2">📈</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Reports</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Detailed analytics reports and performance trends
                </p>
              </div>
            </div>

            {connectionError && (
              <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <p className="text-red-600 dark:text-red-400">
                  ❌ Connection failed: {connectionError}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-3xl shadow-2xl p-8 text-white">
            <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">📱 Social Media Analytics</h1>
              <p className="text-blue-100">
                Connected as: {userInfo?.name || 'Facebook User'}
              </p>
              {userInfo?.email && (
                <p className="text-blue-200 text-sm">
                  {userInfo.email}
                </p>
              )}
            </div>
            <div className="text-6xl opacity-20">📊</div>
          </div>
        </div>

        {/* Connection Status Card */}
        <div className="flex justify-center mb-6">
          <FacebookConnectionCard />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ad Accounts</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {adAccounts.length}
                </p>
              </div>
              <div className="text-3xl">💼</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Facebook Pages</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {pages.length}
                </p>
              </div>
              <div className="text-3xl">📄</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Followers</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {pages.reduce((sum: number, page: any) => sum + (page.fan_count || 0), 0).toLocaleString()}
                </p>
              </div>
              <div className="text-3xl">👥</div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Weekly Spend</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  ${dashboardData?.insights?.spend?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="text-3xl">💰</div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ad Accounts */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">💼 Ad Accounts</h2>
            </div>
            <div className="p-6 space-y-4">
              {adAccounts.length ? (
                adAccounts.map((account: any) => (
                  <div key={account.id} className="border rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{account.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">ID: {account.id?.replace?.('act_', '') || account.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {account.balance || '0'} {account.currency || 'USD'}
                        </p>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          account.account_status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {account.account_status === 1 ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No ad accounts found</p>
              )}
            </div>
          </div>

          {/* Facebook Pages */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">📄 Facebook Pages</h2>
            </div>
            <div className="p-6 space-y-4">
              {pages.length ? (
                pages.map((page: any) => (
                  <div key={page.id} className="border rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{page.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Page ID: {page.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">{(page.fan_count || 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">followers</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No pages found</p>
              )}
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        {dashboardData?.insights && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">📈 Weekly Performance</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{dashboardData.insights.impressions.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Impressions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{dashboardData.insights.clicks.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Clicks</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">${dashboardData.insights.spend.toFixed(2)}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Spend</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{dashboardData.insights.reach.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Reach</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">⚡ Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <a
              href={`/dashboard/client/${tenantId}/social/assets`}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-4 rounded-xl text-center font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-2xl mb-2">🎨</div>
              <div>Business Assets</div>
            </a>
            <a
              href={`/dashboard/client/${tenantId}/social/reports`}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl text-center font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-2xl mb-2">📊</div>
              <div>Detailed Reports</div>
            </a>
            <a
              href={`/dashboard/client/${tenantId}/social/campaigns`}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-4 rounded-xl text-center font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-2xl mb-2">🎯</div>
              <div>Campaign Planner</div>
            </a>
            <a
              href={`/dashboard/client/${tenantId}/social/posts`}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-4 rounded-xl text-center font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-2xl mb-2">📝</div>
              <div>Manage Posts</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}