"use client";

import { useState, useEffect } from 'react';
import { useSocialMediaContext } from '@/components/dashboard/SocialMediaWrapper';
import Link from 'next/link';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2,
  Calendar,
  DollarSign,
  Target,
  BarChart3
} from 'lucide-react';

export default function SocialAnalyticsPage() {
  const { adAccounts, pages, isConnected } = useSocialMediaContext();
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [analytics, setAnalytics] = useState({
    reach: 12500,
    impressions: 45200,
    engagement: 3200,
    clicks: 890,
    spend: 156.78,
    cpm: 3.47,
    ctr: 1.97,
    engagementRate: 7.1
  });

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="text-6xl mb-6">📊</div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Analytics Unavailable
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Connect your Facebook account to view detailed analytics and insights.
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
                  📊 Social Media Analytics
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Track your social media performance and insights
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
                
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                  📊 Export Report
                </button>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reach</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {analytics.reach.toLocaleString()}
                  </p>
                  <p className="text-green-600 text-sm mt-1">+12.5% vs last period</p>
                </div>
                <div className="text-3xl">👥</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Impressions</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {analytics.impressions.toLocaleString()}
                  </p>
                  <p className="text-green-600 text-sm mt-1">+8.3% vs last period</p>
                </div>
                <div className="text-3xl">👁️</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Engagement</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {analytics.engagement.toLocaleString()}
                  </p>
                  <p className="text-green-600 text-sm mt-1">+15.7% vs last period</p>
                </div>
                <div className="text-3xl">❤️</div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Clicks</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {analytics.clicks.toLocaleString()}
                  </p>
                  <p className="text-green-600 text-sm mt-1">+5.2% vs last period</p>
                </div>
                <div className="text-3xl">👆</div>
              </div>
            </div>
          </div>

          {/* Charts and Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Performance Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">📈 Performance Overview</h2>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Performance chart will be displayed here</p>
                  <p className="text-sm">Integration with Chart.js coming soon</p>
                </div>
              </div>
            </div>

            {/* Engagement Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">💬 Engagement Breakdown</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span className="text-gray-700 dark:text-gray-300">Likes</span>
                  </div>
                  <span className="font-semibold">1,245</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-blue-500" />
                    <span className="text-gray-700 dark:text-gray-300">Comments</span>
                  </div>
                  <span className="font-semibold">189</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Share2 className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700 dark:text-gray-300">Shares</span>
                  </div>
                  <span className="font-semibold">67</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ad Performance */}
          {adAccounts.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">💰 Ad Performance</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">${analytics.spend}</p>
                  <p className="text-sm text-gray-500">Total Spend</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">${analytics.cpm}</p>
                  <p className="text-sm text-gray-500">CPM</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">{analytics.ctr}%</p>
                  <p className="text-sm text-gray-500">CTR</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{analytics.engagementRate}%</p>
                  <p className="text-sm text-gray-500">Engagement Rate</p>
                </div>
              </div>
            </div>
          )}

          {/* Page Insights */}
          {pages.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">📄 Page Insights</h2>
              <div className="space-y-4">
                {pages.slice(0, 3).map((page: any) => (
                  <div key={page.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{page.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {page.fan_count?.toLocaleString() || '0'} followers
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">Active</p>
                        <p className="text-xs text-gray-500">Status</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}