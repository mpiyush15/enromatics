"use client";

import Link from 'next/link';
import { useSocialMediaContext } from '@/components/dashboard/SocialMediaWrapper';
import FacebookConnectionCard from '@/components/dashboard/FacebookConnectionCard';

export default function SuperAdminSocialMediaDashboard() {
  const {
    isConnected,
    userInfo,
    pages,
    adAccounts,
    instagramAccounts,
    connect,
    disconnect,
    isLoading,
    error
  } = useSocialMediaContext();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">📱</div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Platform Social Media Analytics
            </h1>
            <p className="text-base text-gray-600 dark:text-gray-300">
              Connect Facebook to enable social media features for the platform
            </p>
          </div>

          {/* SuperAdmin Notice */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 rounded-lg p-6 mb-8 max-w-3xl mx-auto">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="text-2xl">🔧</div>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">SuperAdmin Notice</h3>
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                  As SuperAdmin, connecting your Facebook account will establish the platform's default integration. 
                  Individual tenants can override this with their own Facebook connections if needed.
                </p>
              </div>
            </div>
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
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">📱 Platform Social Media Analytics</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Connected as: {userInfo?.name || 'Facebook User'} (Platform Integration)
              </p>
              {userInfo?.email && (
                <p className="text-gray-500 dark:text-gray-500 text-sm">
                  {userInfo.email}
                </p>
              )}
            </div>
            <div className="text-3xl opacity-50">📊</div>
          </div>
        </div>

        {/* SuperAdmin Notice */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-400 rounded-lg p-6 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="text-2xl">🔧</div>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200">SuperAdmin Notice</h3>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                As SuperAdmin, this Facebook connection will be used as the platform's default integration. 
                Individual tenants can override this with their own Facebook connections if needed.
              </p>
              <ul className="mt-2 text-sm text-amber-700 dark:text-amber-300 space-y-1">
                <li>• This integration provides platform-wide social media capabilities</li>
                <li>• Tenants without their own connections will use this default integration</li>
                <li>• Platform analytics and insights are available through this connection</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Connection Status Card */}
        <div className="flex justify-center mb-6">
          <FacebookConnectionCard />
        </div>

        {/* Debug Panel - Remove after testing */}
        <details className="bg-gray-900 text-white p-4 rounded-lg border border-gray-700 text-xs mb-6 font-mono">
          <summary className="cursor-pointer font-bold">🔍 Debug Info (Click to expand)</summary>
          <div className="mt-3 space-y-2 text-gray-300">
            <div>
              <span className="text-yellow-400">isConnected:</span> {isConnected ? '✅ true' : '❌ false'}
            </div>
            <div>
              <span className="text-yellow-400">isLoading:</span> {isLoading ? '⏳ true' : '✅ false'}
            </div>
            <div>
              <span className="text-yellow-400">adAccounts.length:</span> {adAccounts.length}
              {adAccounts.length > 0 && (
                <div className="ml-4 mt-1 bg-gray-800 p-2 rounded">
                  {adAccounts.map((acc: any, i: number) => (
                    <div key={i}>
                      {i}: {acc.name} (ID: {acc.id})
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <span className="text-yellow-400">pages.length:</span> {pages.length}
              {pages.length > 0 && (
                <div className="ml-4 mt-1 bg-gray-800 p-2 rounded">
                  {pages.map((page: any, i: number) => (
                    <div key={i}>
                      {i}: {page.name} (ID: {page.id})
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <span className="text-yellow-400">instagramAccounts.length:</span> {instagramAccounts.length}
              {instagramAccounts.length > 0 && (
                <div className="ml-4 mt-1 bg-gray-800 p-2 rounded">
                  {instagramAccounts.map((ig: any, i: number) => (
                    <div key={i}>
                      {i}: @{ig.username} (ID: {ig.id}) - {ig.followers_count} followers
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <span className="text-yellow-400">error:</span> {error ? <span className="text-red-400">{error}</span> : 'null'}
            </div>
            <div>
              <span className="text-yellow-400">userInfo:</span> {userInfo?.name ? userInfo.name : 'null'}
            </div>
          </div>
        </details>

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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Instagram Accounts</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {instagramAccounts.length}
                </p>
              </div>
              <div className="text-3xl">�</div>
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

        {/* Instagram Accounts */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">📸 Linked Instagram Accounts</h2>
          </div>
          <div className="p-6">
            {instagramAccounts.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {instagramAccounts.map((ig: any) => (
                  <div key={ig.id} className="border rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      {ig.profile_pic_url ? (
                        <img 
                          src={ig.profile_pic_url} 
                          alt={ig.username}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white text-lg font-bold">
                          {ig.username?.charAt(0)?.toUpperCase() || 'I'}
                        </div>
                      )}
                      <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300">
                        Instagram
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">@{ig.username}</h3>
                      {ig.name && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">{ig.name}</p>
                      )}
                      {ig.biography && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ig.biography}</p>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-gray-500">Followers</p>
                          <p className="font-bold text-gray-900 dark:text-white">{(ig.followers_count || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Following</p>
                          <p className="font-bold text-gray-900 dark:text-white">{(ig.following_count || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                    {ig.facebookPageName && (
                      <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500">Linked to: <span className="text-gray-900 dark:text-gray-200">{ig.facebookPageName}</span></p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📸</div>
                <p className="text-gray-500 text-lg">No Instagram accounts linked</p>
                <p className="text-sm text-gray-400 mt-2">Instagram accounts linked to your Facebook pages will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Platform Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">⚡ Platform Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Link
              href="/dashboard/social/business-assets"
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-4 rounded-xl text-center font-semibold transition-all transform hover:scale-105 shadow-lg block"
              prefetch={false}
            >
              <div className="text-2xl mb-2">🎨</div>
              <div>Business Assets</div>
            </Link>
            <Link
              href="/dashboard/social/analytics"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl text-center font-semibold transition-all transform hover:scale-105 shadow-lg block"
              prefetch={false}
            >
              <div className="text-2xl mb-2">📊</div>
              <div>Analytics</div>
            </Link>
            <Link
              href="/dashboard/social/campaigns"
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-4 rounded-xl text-center font-semibold transition-all transform hover:scale-105 shadow-lg block"
              prefetch={false}
            >
              <div className="text-2xl mb-2">🎯</div>
              <div>Campaigns</div>
            </Link>
            <Link
              href="/dashboard/social/create-ads"
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-4 rounded-xl text-center font-semibold transition-all transform hover:scale-105 shadow-lg block"
              prefetch={false}
            >
              <div className="text-2xl mb-2">🎯</div>
              <div>Create Ads</div>
            </Link>
          </div>
          
          {/* Additional Actions Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Link
              href="/dashboard/social/content-planner"
              className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-6 py-4 rounded-xl text-center font-semibold transition-all transform hover:scale-105 shadow-lg block"
              prefetch={false}
            >
              <div className="text-2xl mb-2">📅</div>
              <div>Content Planner</div>
            </Link>
            <Link
              href="/dashboard/social/analytics"
              className="bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white px-6 py-4 rounded-xl text-center font-semibold transition-all transform hover:scale-105 shadow-lg block"
              prefetch={false}
            >
              <div className="text-2xl mb-2">📈</div>
              <div>Analytics</div>
            </Link>
            <Link
              href="/dashboard/social/settings"
              className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-4 rounded-xl text-center font-semibold transition-all transform hover:scale-105 shadow-lg block"
              prefetch={false}
            >
              <div className="text-2xl mb-2">⚙️</div>
              <div>Settings</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}