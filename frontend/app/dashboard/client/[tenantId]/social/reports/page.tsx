"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/apiConfig";

interface AdInsight {
  impressions: string;
  clicks: string;
  ctr: string;
  spend: string;
  cpm: string;
  reach: string;
  frequency: string;
  date_start: string;
  date_stop: string;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  created_time: string;
  budget_remaining: string;
  daily_budget: string;
  lifetime_budget: string;
}

interface AdAccount {
  id: string;
  name: string;
  account_status: number;
  balance: string;
  currency: string;
}

export default function SocialReportsPage() {
  const params = useParams();
  const tenantId = params.tenantId as string;

  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [insights, setInsights] = useState<AdInsight[]>([]);
  const [dateRange, setDateRange] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (connected) {
      fetchAdAccounts();
    }
  }, [connected]);

  useEffect(() => {
    if (selectedAccount) {
      fetchCampaigns();
      fetchInsights();
    }
  }, [selectedAccount, dateRange]);

  const checkConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/facebook/status`, {
        credentials: 'include',
      });
      const data = await response.json();
      setConnected(data.connected);
      setLoading(false);
    } catch (err) {
      console.error('Connection check failed:', err);
      setLoading(false);
    }
  };

  const fetchAdAccounts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/facebook/ad-accounts`, {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        setAdAccounts(data.adAccounts);
        if (data.adAccounts.length > 0) {
          setSelectedAccount(data.adAccounts[0].id.replace('act_', ''));
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchCampaigns = async () => {
    if (!selectedAccount) return;
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/facebook/ad-accounts/${selectedAccount}/campaigns`,
        { credentials: 'include' }
      );
      const data = await response.json();
      
      if (data.success) {
        setCampaigns(data.campaigns);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchInsights = async () => {
    if (!selectedAccount) return;
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/facebook/ad-accounts/${selectedAccount}/insights?dateRange=${dateRange}`,
        { credentials: 'include' }
      );
      const data = await response.json();
      
      if (data.success) {
        setInsights(data.insights);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-4">🔗</div>
          <h1 className="text-3xl font-bold mb-4">Connect Facebook Account</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please connect your Facebook account to view detailed reports.
          </p>
          <a
            href={`/dashboard/client/${tenantId}/social`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Go to Social Dashboard
          </a>
        </div>
      </div>
    );
  }

  const calculateSummary = (insights: AdInsight[]) => {
    if (!insights.length) return null;
    
    return {
      totalImpressions: insights.reduce((sum, insight) => sum + parseInt(insight.impressions || '0'), 0),
      totalClicks: insights.reduce((sum, insight) => sum + parseInt(insight.clicks || '0'), 0),
      totalSpend: insights.reduce((sum, insight) => sum + parseFloat(insight.spend || '0'), 0),
      totalReach: insights.reduce((sum, insight) => sum + parseInt(insight.reach || '0'), 0),
      avgCTR: insights.reduce((sum, insight) => sum + parseFloat(insight.ctr || '0'), 0) / insights.length,
      avgCPM: insights.reduce((sum, insight) => sum + parseFloat(insight.cpm || '0'), 0) / insights.length,
    };
  };

  const summary = calculateSummary(insights);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-800 rounded-3xl shadow-2xl p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">📊 Detailed Analytics Reports</h1>
          <p className="text-purple-100">Comprehensive insights for your Facebook advertising campaigns</p>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Ad Account
              </label>
              <select
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              >
                {adAccounts.map((account) => (
                  <option key={account.id} value={account.id.replace('act_', '')}>
                    {account.name} ({account.currency} {account.balance})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="1d">Yesterday</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{summary.totalImpressions.toLocaleString()}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Impressions</div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{summary.totalClicks.toLocaleString()}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Clicks</div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">${summary.totalSpend.toFixed(2)}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Spend</div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{summary.totalReach.toLocaleString()}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Reach</div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{summary.avgCTR.toFixed(2)}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg CTR</div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">${summary.avgCPM.toFixed(2)}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg CPM</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Campaigns List */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">🎯 Active Campaigns</h2>
            </div>
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {campaigns.length ? (
                campaigns.map((campaign) => (
                  <div key={campaign.id} className="border rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{campaign.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{campaign.objective}</p>
                        <p className="text-xs text-gray-500">
                          Created: {new Date(campaign.created_time).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {campaign.status}
                        </span>
                        {campaign.daily_budget && (
                          <p className="text-sm text-gray-600 mt-1">
                            Budget: ${(parseInt(campaign.daily_budget) / 100).toFixed(2)}/day
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No campaigns found</p>
              )}
            </div>
          </div>

          {/* Detailed Insights */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">📈 Performance Breakdown</h2>
            </div>
            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {insights.length ? (
                insights.map((insight, index) => (
                  <div key={index} className="border rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Period:</span>
                        <span className="ml-2 font-medium">
                          {new Date(insight.date_start).toLocaleDateString()} - {new Date(insight.date_stop).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Impressions:</span>
                        <span className="ml-2 font-medium">{parseInt(insight.impressions || '0').toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Clicks:</span>
                        <span className="ml-2 font-medium">{parseInt(insight.clicks || '0').toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">CTR:</span>
                        <span className="ml-2 font-medium">{parseFloat(insight.ctr || '0').toFixed(2)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Spend:</span>
                        <span className="ml-2 font-medium">${parseFloat(insight.spend || '0').toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">CPM:</span>
                        <span className="ml-2 font-medium">${parseFloat(insight.cpm || '0').toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">No insights data available</p>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600">❌ {error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
