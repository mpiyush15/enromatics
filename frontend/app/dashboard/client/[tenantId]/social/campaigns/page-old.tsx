"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useFacebookConnection } from "@/hooks/useFacebookConnection";

const API_BASE_URL = "https://endearing-blessing-production-c61f.up.railway.app";

interface Campaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  spend?: number;
  impressions?: number;
  clicks?: number;
  daily_budget?: string;
  lifetime_budget?: string;
  created_time: string;
}

interface AdAccount {
  id: string;
  name: string;
  currency: string;
  campaigns: Campaign[];
}

interface CampaignTemplate {
  id: string;
  name: string;
  objective: string;
  description: string;
  targetAudience: string;
  suggestedBudget: string;
  duration: string;
  icon: string;
}

export default function CampaignPlanningPage() {
  const params = useParams();
  const tenantId = params.tenantId as string;
  const { isConnected, connect, disconnect } = useFacebookConnection();

  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("");

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);

  // -----------------------
  // CHECK CONNECTION
  // -----------------------
  const checkConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/facebook/status`, {
        credentials: "include",
      });

      const data = await response.json();
      setConnected(data.connected);
      setLoading(false);
    } catch (err) {
      console.error("Connection check failed:", err);
      setLoading(false);
    }
  };

  // -----------------------
  // FETCH AD ACCOUNTS
  // -----------------------
  const fetchAdAccounts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/facebook/ad-accounts`, {
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        setAdAccounts(data.adAccounts);
        if (data.adAccounts.length > 0) {
          setSelectedAccount(data.adAccounts[0].id);
        }
      }
    } catch (err) {
      console.error("Fetch ad accounts failed:", err);
    }
  };

  // -----------------------
  // FETCH CAMPAIGNS
  // -----------------------
  const fetchCampaigns = async () => {
    if (!selectedAccount) return;
    setLoadingCampaigns(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/facebook/ad-accounts/${selectedAccount}/campaigns`,
        { credentials: "include" }
      );

      const data = await response.json();

      if (data.success) {
        setCampaigns(data.campaigns);
      }
    } catch (err) {
      console.error("Fetch campaigns failed:", err);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "ACTIVE":
        return "text-green-600 bg-green-100";
      case "PAUSED":
        return "text-yellow-600 bg-yellow-100";
      case "DELETED":
        return "text-red-600 bg-red-100";
      case "ARCHIVED":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-blue-600 bg-blue-100";
    }
  };

  // -----------------------
  // LIFECYCLE
  // -----------------------

  useEffect(() => {
    checkConnection();
  }, []);

  useEffect(() => {
    if (connected) fetchAdAccounts();
  }, [connected]);

  useEffect(() => {
    if (selectedAccount) fetchCampaigns();
  }, [selectedAccount]);

  // -----------------------
  // LOADING STATE
  // -----------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  // -----------------------
  // NOT CONNECTED STATE
  // -----------------------
  if (!connected) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-10 flex flex-col items-center justify-center">
        <div className="text-7xl mb-6">🔗</div>
        <h1 className="text-3xl font-bold mb-2">Connect Facebook Account</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          You need to connect your Facebook account to access campaigns.
        </p>

        <Link
          href={`/dashboard/client/${tenantId}/social`}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          Go to Social Dashboard
        </Link>
      </div>
    );
  }

  // -----------------------
  // MAIN UI
  // -----------------------
  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto space-y-6">

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">📊 Campaign Planning</h1>

        {/* SELECT AD ACCOUNT */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <label className="block mb-2 text-gray-700 dark:text-gray-300">
            Select Ad Account
          </label>

          <select
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="w-full p-2 rounded border dark:bg-gray-700"
          >
            {adAccounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name} ({acc.currency})
              </option>
            ))}
          </select>
        </div>

        {/* CAMPAIGNS */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Active Campaigns
            </h2>
            <button
              onClick={fetchCampaigns}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              🔄 Refresh
            </button>
          </div>

          {loadingCampaigns ? (
            <div className="py-10 text-center">
              <div className="animate-spin h-8 w-8 border-t-4 border-blue-600 mx-auto"></div>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="py-10 text-center">
              <div className="text-5xl mb-3">🚀</div>
              <p>No campaigns found. Create one in Facebook Ads Manager.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {campaigns.map((c) => (
                <div key={c.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between">
                    <h3 className="font-semibold">{c.name}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs ${getStatusColor(
                        c.status
                      )}`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mt-2">
                    Objective: {c.objective}
                  </p>

                  <p className="text-sm text-gray-600">
                    Created: {new Date(c.created_time).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
