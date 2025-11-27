"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useFacebookConnection } from "@/hooks/useFacebookConnection";

interface AdAccount {
  id: string;
  name: string;
  status: number;
  balance: string;
  currency: string;
  account_id: string;
  timezone_name?: string;
  created_time?: string;
}

interface FacebookPage {
  id: string;
  name: string;
  followers: number;
  category?: string;
  link?: string;
  picture?: any;
}

interface Insights {
  impressions: number;
  clicks: number;
  spend: number;
  reach: number;
  ctr?: number;
  cpm?: number;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  budget_remaining?: string;
  daily_budget?: string;
  created_time: string;
}

interface DashboardData {
  adAccounts: AdAccount[];
  pages: FacebookPage[];
  insights: Insights | null;
  summary: {
    totalAdAccounts: number;
    totalPages: number;
    totalFollowers: number;
    totalSpend?: number;
    totalClicks?: number;
    avgCTR?: number;
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

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const fetchConnectionStatus = async () => {
    try {
      const response = await fetch(`/api/social/status`, {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        setConnectionStatus(data);
      }
    } catch (err: any) {
      console.error('Failed to fetch connection status:', err);
      setError(err.message);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`/api/social/dashboard`, {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.dashboard);
        
        // Fetch campaigns for first ad account
        if (data.dashboard.adAccounts.length > 0) {
          fetchCampaigns(data.dashboard.adAccounts[0].id.replace('act_', ''));
        }
      } else {
        setError(data.message || 'Failed to fetch dashboard data');
      }
    } catch (err: any) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.message);
    }
  };

  const fetchCampaigns = async (adAccountId: string) => {
    setLoadingCampaigns(true);
    try {
      const response = await fetch(`/api/social/campaigns?adAccountId=${adAccountId}`, {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        setCampaigns(data.campaigns || []);
      }
    } catch (err: any) {
      console.error('Failed to fetch campaigns:', err);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchConnectionStatus();
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    if (connectionStatus?.connected) {
      fetchDashboardData();
    }
  }, [connectionStatus]);

  const handleConnect = () => {
    window.location.href = `/api/facebook/connect`;
  };

  const formatCurrency = (amount: string, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(parseFloat(amount) / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string | number) => {
    if (typeof status === 'number') {
      return status === 1 ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    }
    
    switch (status.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'DELETED':
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading social media data...</p>
        </div>
      </div>
    );
  }

  if (!connectionStatus?.connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📱</div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Social Media Analytics
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Connect your Facebook account to get started
            </p>
          </div>

          {/* Connection Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 text-center">
            <div className="text-5xl mb-6">🔗</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Connect Your Facebook Business Account
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              To access your social media analytics, ad performance, and page insights, 
              you need to connect your Facebook Business account. This will allow us to fetch:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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

            <button
              onClick={handleConnect}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              🔗 Connect Facebook Account
            </button>

            {connectionStatus?.error && (
              <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <p className="text-red-600 dark:text-red-400">
                  ❌ Connection failed: {connectionStatus.error}
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
              <h1 className="text-2xl font-semibold mb-2">📱 Meta Business Analytics</h1>
              <p className="text-blue-100 text-lg">
                Connected as Facebook User: {connectionStatus.facebookUserId}
              </p>
              <p className="text-blue-200 text-sm">
                Connected on {connectionStatus.connectedAt ? new Date(connectionStatus.connectedAt).toLocaleDateString() : 'N/A'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {connectionStatus.permissions?.slice(0, 4).map((perm) => (
                  <span key={perm} className="px-3 py-1 bg-blue-800/50 rounded-full text-xs">
                    {perm}
                  </span>
                ))}
                {(connectionStatus.permissions?.length || 0) > 4 && (
                  <span className="px-3 py-1 bg-blue-800/50 rounded-full text-xs">
                    +{(connectionStatus.permissions?.length || 0) - 4} more
                  </span>
                )}
              </div>
            </div>
            <div className="text-6xl opacity-20">📊</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'overview', name: 'Overview', icon: '📊' },
              { id: 'accounts', name: 'Ad Accounts', icon: '💼' },
              { id: 'pages', name: 'Pages', icon: '📄' },
              { id: 'campaigns', name: 'Campaigns', icon: '🎯' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && dashboardData && (
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100">Ad Accounts</p>
                        <p className="text-3xl font-bold">
                          {dashboardData.summary.totalAdAccounts}
                        </p>
                      </div>
                      <div className="text-4xl opacity-80">💼</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100">Facebook Pages</p>
                        <p className="text-2xl font-semibold">
                          {dashboardData.summary.totalPages}
                        </p>
                      </div>
                      <div className="text-4xl opacity-80">📄</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100">Total Followers</p>
                        <p className="text-3xl font-bold">
                          {dashboardData.summary.totalFollowers.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-4xl opacity-80">👥</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-orange-100">Weekly Spend</p>
                        <p className="text-3xl font-bold">
                          ${dashboardData.insights?.spend.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="text-4xl opacity-80">💰</div>
                    </div>
                  </div>
                </div>

                {/* Performance Insights */}
                {dashboardData?.insights && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">📈 Weekly Performance</h3>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-semibold text-blue-600 mb-2">
                            {dashboardData.insights.impressions.toLocaleString()}
                          </div>
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Impressions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-semibold text-green-600 mb-2">
                            {dashboardData.insights.clicks.toLocaleString()}
                          </div>
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Clicks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-semibold text-purple-600 mb-2">
                            ${dashboardData.insights.spend.toFixed(2)}
                          </div>
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Spend</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-semibold text-orange-600 mb-2">
                            {dashboardData.insights.reach.toLocaleString()}
                          </div>
                          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Reach</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Ad Accounts Tab */}
            {activeTab === 'accounts' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">💼 Ad Accounts</h3>
                  <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                    {dashboardData?.adAccounts.length || 0} accounts
                  </span>
                </div>
                
                {dashboardData?.adAccounts.length ? (
                  <div className="grid gap-6">
                    {dashboardData.adAccounts.map((account) => (
                      <div key={account.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl p-6 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-xl font-bold text-gray-900 dark:text-white">{account.name}</h4>
                              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(account.status)}`}>
                                {account.status === 1 ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Account ID</p>
                                <p className="font-medium text-gray-900 dark:text-white">{account.account_id}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Currency</p>
                                <p className="font-medium text-gray-900 dark:text-white">{account.currency}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Balance</p>
                                <p className="font-medium text-green-600">
                                  {formatCurrency(account.balance, account.currency)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Timezone</p>
                                <p className="font-medium text-gray-900 dark:text-white">{account.timezone_name || 'N/A'}</p>
                              </div>
                            </div>
                            {account.created_time && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                                Created: {formatDate(account.created_time)}
                              </p>
                            )}
                          </div>
                          <div className="text-4xl opacity-50">💼</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4 opacity-50">💼</div>
                    <p className="text-gray-500 text-lg">No ad accounts found</p>
                  </div>
                )}
              </div>
            )}

            {/* Pages Tab */}
            {activeTab === 'pages' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">📄 Facebook Pages</h3>
                  <span className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                    {dashboardData?.pages.length || 0} pages
                  </span>
                </div>
                
                {dashboardData?.pages.length ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    {dashboardData.pages.map((page) => (
                      <div key={page.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl p-6 hover:shadow-lg transition-all">
                        <div className="flex items-start gap-4">
                          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-2xl">
                            📄
                          </div>
                          <div className="flex-1">
                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{page.name}</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Page ID:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{page.id}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Followers:</span>
                                <span className="font-bold text-blue-600">{page.followers.toLocaleString()}</span>
                              </div>
                              {page.category && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500 dark:text-gray-400">Category:</span>
                                  <span className="font-medium text-gray-900 dark:text-white">{page.category}</span>
                                </div>
                              )}
                            </div>
                            {page.link && (
                              <a
                                href={page.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                View Page 🔗
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4 opacity-50">📄</div>
                    <p className="text-gray-500 text-lg">No pages found</p>
                  </div>
                )}
              </div>
            )}

            {/* Campaigns Tab */}
            {activeTab === 'campaigns' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">🎯 Campaigns</h3>
                  <div className="flex items-center gap-3">
                    {loadingCampaigns && (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-blue-600"></div>
                    )}
                    <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 px-3 py-1 rounded-full text-sm font-medium">
                      {campaigns.length} campaigns
                    </span>
                  </div>
                </div>

                {campaigns.length ? (
                  <div className="grid gap-6">
                    {campaigns.map((campaign) => (
                      <div key={campaign.id} className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl p-6 hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h4 className="text-xl font-bold text-gray-900 dark:text-white">{campaign.name}</h4>
                              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(campaign.status)}`}>
                                {campaign.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Objective</p>
                                <p className="font-medium text-gray-900 dark:text-white">{campaign.objective}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Campaign ID</p>
                                <p className="font-mono text-xs text-gray-600 dark:text-gray-400">{campaign.id}</p>
                              </div>
                              {campaign.daily_budget && (
                                <div>
                                  <p className="text-gray-500 dark:text-gray-400">Daily Budget</p>
                                  <p className="font-medium text-green-600">${(parseFloat(campaign.daily_budget) / 100).toFixed(2)}</p>
                                </div>
                              )}
                              {campaign.budget_remaining && (
                                <div>
                                  <p className="text-gray-500 dark:text-gray-400">Budget Remaining</p>
                                  <p className="font-medium text-orange-600">${(parseFloat(campaign.budget_remaining) / 100).toFixed(2)}</p>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                              Created: {formatDate(campaign.created_time)}
                            </p>
                          </div>
                          <div className="text-4xl opacity-50">🎯</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    {loadingCampaigns ? (
                      <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-600"></div>
                        <p className="text-gray-500">Loading campaigns...</p>
                      </div>
                    ) : (
                      <>
                        <div className="text-6xl mb-4 opacity-50">🎯</div>
                        <p className="text-gray-500 text-lg">No campaigns found</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">⚡ Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              href={`/dashboard/client/${tenantId}/social/reports`}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl text-center font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-2xl mb-2">📊</div>
              <div>Detailed Reports</div>
            </Link>
            <Link
              href={`/dashboard/client/${tenantId}/social/campaigns`}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-4 rounded-xl text-center font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-2xl mb-2">🎯</div>
              <div>Campaign Planner</div>
            </Link>
            <Link
              href={`/dashboard/client/${tenantId}/social/posts`}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-4 rounded-xl text-center font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-2xl mb-2">📝</div>
              <div>Manage Posts</div>
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-4 rounded-xl text-center font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-2xl mb-2">🔄</div>
              <div>Refresh Data</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}