"use client";

import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '@/lib/apiConfig';

interface Campaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  created_time: string;
  start_time?: string;
  stop_time?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  insights?: {
    spend: string;
    impressions: string;
    clicks: string;
    ctr: string;
    cpc: string;
    cpm: string;
  };
}

interface AdAccount {
  id: string;
  name: string;
  currency: string;
  account_status: number;
  spend_cap?: string;
}

export const useCampaigns = (adAccounts: AdAccount[], isConnected: boolean) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>("");

  const fetchCampaigns = useCallback(async (accountId: string) => {
    if (!accountId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/facebook/campaigns/${accountId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch campaigns: ${response.statusText}`);
      }

      const data = await response.json();
      setCampaigns(data.campaigns || []);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch campaigns');
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-select first ad account if available
  useEffect(() => {
    if (adAccounts.length > 0 && !selectedAccount) {
      setSelectedAccount(adAccounts[0].id);
    }
  }, [adAccounts, selectedAccount]);

  // Fetch campaigns when account is selected
  useEffect(() => {
    if (selectedAccount && isConnected) {
      fetchCampaigns(selectedAccount);
    }
  }, [selectedAccount, isConnected, fetchCampaigns]);

  const refreshCampaigns = useCallback(() => {
    if (selectedAccount) {
      fetchCampaigns(selectedAccount);
    }
  }, [selectedAccount, fetchCampaigns]);

  return {
    campaigns,
    loading,
    error,
    selectedAccount,
    setSelectedAccount,
    refreshCampaigns
  };
};