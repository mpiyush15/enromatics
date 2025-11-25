"use client";

import { useFacebookConnection } from '@/hooks/useFacebookConnection';
import FacebookConnectionCard from '@/components/dashboard/FacebookConnectionCard';

export default function SuperAdminSocialMediaDashboard() {
  const {
    isConnected,
    userInfo,
    pages,
    adAccounts,
  } = useFacebookConnection();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">📱</div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Platform Social Media Analytics
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Connect Facebook to enable social media features for the platform
            </p>
          </div>

          {/* Connection Card */}
          <div className="flex justify-center mb-8">
            <FacebookConnectionCard />
          </div>

          {/* SuperAdmin Features Overview */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center mb-8">
              <div className="text-5xl mb-6">🔗</div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Platform Facebook Integration
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                As SuperAdmin, your Facebook connection will serve as the platform's default integration, 
                providing social media capabilities to all tenants.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <div className="text-3xl mb-2">🏢</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Platform Management</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Centralized social media management for all platform tenants
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Analytics Overview</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Platform-wide social media performance and insights
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Campaign Oversight</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Monitor and manage campaigns across all tenant accounts
                </p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
                <div className="text-3xl mb-2">⚙️</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Integration Settings</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Configure platform-wide Facebook integration settings
                </p>
              </div>
            </div>
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
              <h1 className="text-4xl font-bold mb-2">📱 Platform Social Media Analytics</h1>
              <p className="text-blue-100">
                Connected as: {userInfo?.name || 'Facebook User'} (Platform Integration)
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

        {/* Platform Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Platform Ad Accounts</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Platform Pages</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reach</p>
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Platform Status</p>
                <p className="text-2xl font-bold text-green-600">
                  Active
                </p>
              </div>
              <div className="text-3xl">✅</div>
            </div>
          </div>
        </div>

        {/* Platform Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ad Accounts */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">💼 Platform Ad Accounts</h2>
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
                          Platform Account
                        </p>
                        <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Connected
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">📄 Platform Pages</h2>
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

        {/* Platform Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">⚡ Platform Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <a
              href="/dashboard/social/assets"
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-4 rounded-xl text-center font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-2xl mb-2">🎨</div>
              <div>Platform Assets</div>
            </a>
            <a
              href="/dashboard/social/reports"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl text-center font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-2xl mb-2">📊</div>
              <div>Analytics Overview</div>
            </a>
            <a
              href="/dashboard/social/campaigns"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-4 rounded-xl text-center font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-2xl mb-2">🎯</div>
              <div>Campaign Manager</div>
            </a>
            <a
              href="/dashboard/social/settings"
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-4 rounded-xl text-center font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              <div className="text-2xl mb-2">⚙️</div>
              <div>Platform Settings</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}