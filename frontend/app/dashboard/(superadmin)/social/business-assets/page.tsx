"use client";

import { useState } from 'react';
import { useSocialMediaContext } from '@/components/dashboard/SocialMediaWrapper';
import Link from 'next/link';
import { 
  Building2, 
  CreditCard, 
  Users, 
  FileText, 
  Settings,
  Eye,
  Edit,
  Plus
} from 'lucide-react';

export default function BusinessAssetsPage() {
  const { adAccounts, pages, isConnected, userInfo } = useSocialMediaContext();
  const [activeTab, setActiveTab] = useState('pages');

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="text-6xl mb-6">🏢</div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              Business Assets Unavailable
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Connect your Facebook account to manage your business assets.
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  🏢 Business Assets
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage your Facebook business pages, ad accounts, and assets
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Asset
                </button>
              </div>
            </div>
          </div>

          {/* Connected Account Info */}
          {userInfo && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <div className="flex items-center gap-4">
                {userInfo.picture && (
                  <img 
                    src={userInfo.picture} 
                    alt="Profile" 
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Connected as: {userInfo.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">{userInfo.email}</p>
                </div>
                <div className="ml-auto">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    ✅ Connected
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('pages')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'pages'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  📄 Pages ({pages.length})
                </button>
                <button
                  onClick={() => setActiveTab('ad-accounts')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'ad-accounts'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  💼 Ad Accounts ({adAccounts.length})
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'settings'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  ⚙️ Settings
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'pages' && (
            <div className="space-y-6">
              <div className="grid gap-6">
                {pages.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📄</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      No Pages Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      No Facebook pages are associated with this account.
                    </p>
                  </div>
                ) : (
                  pages.map((page: any) => (
                    <div key={page.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {page.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              Page ID: {page.id}
                            </p>
                            <p className="text-sm text-gray-500">
                              {page.fan_count?.toLocaleString() || '0'} followers
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <Edit className="h-4 w-4" />
                          </button>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'ad-accounts' && (
            <div className="space-y-6">
              <div className="grid gap-6">
                {adAccounts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">💼</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      No Ad Accounts Found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      No advertising accounts are associated with this business.
                    </p>
                  </div>
                ) : (
                  adAccounts.map((account: any) => (
                    <div key={account.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                            <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {account.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              Account ID: {account.id?.replace?.('act_', '') || account.id}
                            </p>
                            <p className="text-sm text-gray-500">
                              Currency: {account.currency}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/social/campaigns?account=${account.id}`}
                            className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
                          >
                            View Campaigns
                          </Link>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Business Settings
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={userInfo?.name || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={userInfo?.email || ''}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Connection Status
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      ✅ Connected to Facebook
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                    Disconnect Facebook Account
                  </button>
                  <p className="text-sm text-gray-500 mt-2">
                    This will remove access to all Facebook business features.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}