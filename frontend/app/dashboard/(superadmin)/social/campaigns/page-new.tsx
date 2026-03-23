"use client";

import { useCampaigns } from "@/hooks/useCampaigns";
import { useSocialMediaContext } from '@/components/dashboard/SocialMediaWrapper';
import Link from "next/link";
import { useState } from "react";

interface CampaignTemplate {
  id: string;
  name: string;
  objective: string;
  description: string;
  targeting: any;
  creative: any;
}

export default function CampaignsPage() {
  const { adAccounts, isConnected } = useSocialMediaContext();
  
  const {
    campaigns,
    loading,
    error,
    selectedAccount,
    setSelectedAccount,
    refreshCampaigns
  } = useCampaigns(adAccounts, isConnected);

  const [showCreateModal, setShowCreateModal] = useState(false);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🔗</div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Facebook Connection Required
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Connect your Facebook account to manage campaigns and view analytics.
            </p>
            <Link
              href="/dashboard/social"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              prefetch={false}
            >
              Connect Facebook
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-gray-600 dark:text-gray-400">Loading campaigns...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  📊 Campaign Manager
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your Facebook advertising campaigns
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/dashboard/social/create-ads"
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all transform hover:scale-105 text-center"
                  prefetch={false}
                >
                  ✨ Create New Campaign
                </Link>
                
                <button
                  onClick={refreshCampaigns}
                  className="px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Ad Account Selector */}
          {adAccounts.length > 1 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Ad Account:
              </label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {adAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.currency})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center">
                <div className="text-red-600 dark:text-red-400 mr-3">⚠️</div>
                <div>
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error Loading Campaigns
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Campaigns List */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Active Campaigns ({campaigns.length})
              </h2>
            </div>

            <div className="p-6">
              {campaigns.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📈</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No Campaigns Found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Get started by creating your first Facebook advertising campaign.
                  </p>
                  <Link
                    href="/dashboard/social/create-ads"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                    prefetch={false}
                  >
                    Create Your First Campaign
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {campaigns.map((campaign: any) => (
                    <div
                      key={campaign.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-shadow bg-gray-50 dark:bg-gray-700"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {campaign.name}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                campaign.status === "ACTIVE"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : campaign.status === "PAUSED"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200"
                              }`}
                            >
                              {campaign.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Objective:</span>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {campaign.objective || 'Not specified'}
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Created:</span>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {campaign.created_time 
                                  ? new Date(campaign.created_time).toLocaleDateString()
                                  : 'Unknown'
                                }
                              </div>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Budget:</span>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {campaign.daily_budget 
                                  ? `$${(parseFloat(campaign.daily_budget) / 100).toFixed(2)}/day`
                                  : campaign.lifetime_budget
                                  ? `$${(parseFloat(campaign.lifetime_budget) / 100).toFixed(2)} lifetime`
                                  : 'Not set'
                                }
                              </div>
                            </div>
                          </div>

                          {campaign.insights && (
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                              <div className="text-center">
                                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                  ${parseFloat(campaign.insights.spend || '0').toFixed(2)}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Spend</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                  {parseInt(campaign.insights.impressions || '0').toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Impressions</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                  {parseInt(campaign.insights.clicks || '0').toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">Clicks</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                                  {parseFloat(campaign.insights.ctr || '0').toFixed(2)}%
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">CTR</div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                          <button className="px-4 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium transition-colors">
                            Edit
                          </button>
                          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/dashboard/social/create-ads"
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow block"
              prefetch={false}
            >
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Create New Campaign
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Launch a new Facebook advertising campaign with our guided setup.
              </p>
            </Link>

            <Link
              href="/dashboard/social/analytics"
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow block"
              prefetch={false}
            >
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                View Analytics
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Analyze campaign performance and get detailed insights.
              </p>
            </Link>

            <Link
              href="/dashboard/social/settings"
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-shadow block"
              prefetch={false}
            >
              <div className="text-3xl mb-3">⚙️</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Account Settings
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Manage your Facebook account settings and preferences.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}