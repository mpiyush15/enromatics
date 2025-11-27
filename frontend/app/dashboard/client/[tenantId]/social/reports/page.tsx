"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useFacebookConnection } from "@/hooks/useFacebookConnection";

// ---------------- TYPES -------------------

interface AdAccount {
  id: string;
  name: string;
  currency: string;
  balance?: string;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  created_time: string;
  daily_budget?: string;
  lifetime_budget?: string;
}

interface AdInsight {
  impressions: string;
  clicks: string;
  ctr: string;
  spend: string;
  cpm: string;
  reach: string;
  date_start: string;
  date_stop: string;
}

interface Summary {
  totalImpressions: number;
  totalClicks: number;
  totalSpend: number;
  totalReach: number;
  avgCTR: number;
  avgCPM: number;
}

// ---------------- COMPONENT -------------------

export default function SocialReportsPage() {
  const params = useParams();
  const tenantId = params.tenantId as string;

  const { isConnected, connect } = useFacebookConnection();

  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState("");

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [insights, setInsights] = useState<AdInsight[]>([]);

  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState("7d");

  // ----------- CHECK FB CONNECTION -----------

  const checkConnection = async () => {
    try {
      const response = await fetch(`/api/social/status`, {
        credentials: "include",
      });
      const data = await response.json();
      setConnected(data.connected);
    } catch (err) {
      console.error("Connection check failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // ----------- FETCH AD ACCOUNTS -----------

  const fetchAdAccounts = async () => {
    try {
      const response = await fetch(`/api/social/ad-accounts`, {
        credentials: "include",
      });

      const data = await response.json();
      if (data.success) {
        setAdAccounts(data.adAccounts);
        if (data.adAccounts.length > 0) {
          setSelectedAccount(data.adAccounts[0].id.replace("act_", ""));
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ----------- FETCH CAMPAIGNS -----------

  const fetchCampaigns = async () => {
    if (!selectedAccount) return;

    try {
      const response = await fetch(
        `/api/social/campaigns?adAccountId=${selectedAccount}`,
        { credentials: "include" }
      );

      const data = await response.json();
      if (data.success) {
        setCampaigns(data.campaigns);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ----------- FETCH INSIGHTS -----------

  const fetchInsights = async () => {
    if (!selectedAccount) return;

    try {
      const response = await fetch(
        `/api/social/insights?adAccountId=${selectedAccount}&dateRange=${dateRange}`,
        { credentials: "include" }
      );

      const data = await response.json();
      if (data.success) {
        setInsights(data.insights);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ----------- CALCULATE SUMMARY -----------

  const calculateSummary = (insights: AdInsight[]): Summary | null => {
    if (!insights.length) return null;

    return {
      totalImpressions: insights.reduce((a, b) => a + parseInt(b.impressions || "0"), 0),
      totalClicks: insights.reduce((a, b) => a + parseInt(b.clicks || "0"), 0),
      totalSpend: insights.reduce((a, b) => a + parseFloat(b.spend || "0"), 0),
      totalReach: insights.reduce((a, b) => a + parseInt(b.reach || "0"), 0),
      avgCTR:
        insights.reduce((a, b) => a + parseFloat(b.ctr || "0"), 0) / insights.length,
      avgCPM:
        insights.reduce((a, b) => a + parseFloat(b.cpm || "0"), 0) / insights.length,
    };
  };

  const summary = calculateSummary(insights);

  // ----------- LIFECYCLE -----------

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (connected) fetchAdAccounts();
  }, [connected]);

  useEffect(() => {
    if (selectedAccount) {
      fetchCampaigns();
      fetchInsights();
    }
  }, [selectedAccount, dateRange]);

  // ----------- LOADING -----------

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-t-4 border-blue-600 rounded-full" />
      </div>
    );
  }

  // ----------- NOT CONNECTED UI -----------

  if (!connected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10">
        <div className="text-6xl mb-4">🔗</div>
        <h1 className="text-2xl font-bold">Connect Facebook Account</h1>
        <p className="text-gray-600 mt-2">
          Please connect your Facebook Business account to view reports.
        </p>

        <button
          onClick={connect}
          className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          Connect Facebook
        </button>
      </div>
    );
  }

  // --------------- MAIN UI ------------------

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link
              href={`/dashboard/client/${tenantId}/social`}
              className="text-gray-400 hover:text-gray-600"
            >
              ← Back
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Performance insights for your Facebook ads
            </p>
          </div>

          {/* Date Range */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 rounded border"
          >
            <option value="1d">Yesterday</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>

        {/* Metrics Summary */}
        {summary && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard title="Impressions" value={summary.totalImpressions} icon="👁" />
              <MetricCard title="Clicks" value={summary.totalClicks} icon="👉" />
              <MetricCard title="Spend" value={`$${summary.totalSpend.toFixed(2)}`} icon="💰" />
              <MetricCard title="Reach" value={summary.totalReach} icon="📢" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard title="Avg CTR" value={`${summary.avgCTR.toFixed(2)}%`} icon="📈" />
              <MetricCard title="Avg CPM" value={`$${summary.avgCPM.toFixed(2)}`} icon="💲" />
            </div>
          </>
        )}

        {/* Campaign List */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Active Campaigns</h2>

          {campaigns.length ? (
            campaigns.map((c) => (
              <div key={c.id} className="border p-4 rounded-lg mb-3">
                <div className="flex justify-between">
                  <h3 className="font-semibold">{c.name}</h3>
                  <span className="text-sm px-2 py-1 rounded bg-gray-100">
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Created: {new Date(c.created_time).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <p>No campaigns found</p>
          )}
        </div>

        {/* Insights */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold mb-4">Performance Breakdown</h2>

          {insights.length ? (
            insights.map((i, idx) => (
              <InsightCard key={idx} insight={i} />
            ))
          ) : (
            <p>No insights available</p>
          )}
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded">{error}</div>
        )}
      </div>
    </div>
  );
}

// ---------------- COMPONENTS ------------------

function MetricCard({ title, value, icon }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-xl font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-gray-600 dark:text-gray-400 text-sm">{title}</div>
    </div>
  );
}

function InsightCard({ insight }: { insight: AdInsight }) {
  return (
    <div className="border p-4 rounded-lg mb-3 text-sm">
      <p>
        <strong>Date:</strong> {insight.date_start} → {insight.date_stop}
      </p>
      <p>
        <strong>Impressions:</strong> {insight.impressions}
      </p>
      <p>
        <strong>Clicks:</strong> {insight.clicks}
      </p>
      <p>
        <strong>CTR:</strong> {parseFloat(insight.ctr).toFixed(2)}%
      </p>
      <p>
        <strong>Spend:</strong> ${parseFloat(insight.spend).toFixed(2)}
      </p>
      <p>
        <strong>CPM:</strong> ${parseFloat(insight.cpm).toFixed(2)}
      </p>
    </div>
  );
}
