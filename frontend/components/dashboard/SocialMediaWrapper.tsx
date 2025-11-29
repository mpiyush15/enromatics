"use client";

import { createContext, useContext, ReactNode, useMemo, useState, useEffect, useCallback } from 'react';
import { useFacebookConnection } from '@/hooks/useFacebookConnection';

// Context to share Facebook connection state across social media pages
interface SocialMediaContextType {
  isConnected: boolean;
  userInfo: any;
  pages: any[];
  adAccounts: any[];
  instagramAccounts: any[];
  connect: () => void;
  disconnect: () => Promise<boolean>;
  refresh: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  // Extended functionality for better caching
  refreshAdAccounts: () => Promise<void>;
  getAdAccount: (accountId: string) => any;
}

const SocialMediaContext = createContext<SocialMediaContextType | null>(null);

export const useSocialMediaContext = () => {
  const context = useContext(SocialMediaContext);
  if (!context) {
    throw new Error('useSocialMediaContext must be used within a SocialMediaWrapper');
  }
  return context;
};

interface SocialMediaWrapperProps {
  children: ReactNode;
}

export default function SocialMediaWrapper({ children }: SocialMediaWrapperProps) {
  const facebookConnection = useFacebookConnection();
  
  // Additional state for enhanced caching
  const [cachedAdAccounts, setCachedAdAccounts] = useState<any[]>([]);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  
  // Cache duration: 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000;

  // Enhanced ad accounts refresh
  const refreshAdAccounts = useCallback(async () => {
    if (!facebookConnection.isConnected) return;
    
    try {
      await facebookConnection.refresh();
      setCachedAdAccounts(facebookConnection.adAccounts);
      setLastFetchTime(Date.now());
    } catch (error) {
      console.error('Failed to refresh ad accounts:', error);
    }
  }, [facebookConnection]);

  // Get specific ad account by ID
  const getAdAccount = useCallback((accountId: string) => {
    const accounts = cachedAdAccounts.length > 0 ? cachedAdAccounts : facebookConnection.adAccounts;
    return accounts.find(account => account.id === accountId || account.id === `act_${accountId}`);
  }, [cachedAdAccounts, facebookConnection.adAccounts]);

  // Auto-refresh if cache is stale
  useEffect(() => {
    const now = Date.now();
    if (facebookConnection.isConnected && 
        facebookConnection.adAccounts.length > 0 && 
        (now - lastFetchTime > CACHE_DURATION || cachedAdAccounts.length === 0)) {
      setCachedAdAccounts(facebookConnection.adAccounts);
      setLastFetchTime(now);
    }
  }, [facebookConnection.isConnected, facebookConnection.adAccounts, lastFetchTime, cachedAdAccounts.length]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...facebookConnection,
    adAccounts: cachedAdAccounts.length > 0 ? cachedAdAccounts : facebookConnection.adAccounts,
    refreshAdAccounts,
    getAdAccount
  }), [
    facebookConnection,
    cachedAdAccounts,
    refreshAdAccounts,
    getAdAccount
  ]);

  return (
    <SocialMediaContext.Provider value={contextValue}>
      <div className="social-media-section">
        {children}
      </div>
    </SocialMediaContext.Provider>
  );
}