'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/lib/authService';
import { API_BASE_URL } from '@/lib/apiConfig';

interface FacebookConnectionState {
  isConnected: boolean;
  isLoading: boolean;
  userInfo: {
    name?: string;
    email?: string;
    id?: string;
    picture?: string;
  } | null;
  error: string | null;
  pages: any[];
  adAccounts: any[];
  instagramAccounts: any[];
}

// Cache to prevent multiple API calls
let connectionCache: FacebookConnectionState | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30 seconds

export function useFacebookConnection() {
  const [user, setUser] = useState<any>(null);
  const [connectionState, setConnectionState] = useState<FacebookConnectionState>({
    isConnected: false,
    isLoading: true,
    userInfo: null,
    error: null,
    pages: [],
    adAccounts: [],
    instagramAccounts: []
  });

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Error getting current user:', error);
        setUser(null);
      }
    };
    getCurrentUser();
  }, []);

  const checkConnection = async () => {
    if (!user) {
      console.log('❌ No user found, skipping Facebook connection check');
      setConnectionState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // Check cache first
    const now = Date.now();
    if (connectionCache && (now - cacheTimestamp) < CACHE_DURATION) {
      console.log('✅ Using cached Facebook connection state');
      setConnectionState(connectionCache);
      return;
    }

    if (!user.tenantId && user.role?.toLowerCase() !== 'superadmin') {
      console.log('❌ User has no tenantId and is not SuperAdmin:', user);
      setConnectionState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setConnectionState(prev => ({ ...prev, isLoading: true, error: null }));

      console.log('✅ Checking Facebook connection for user:', user.email, 'Role:', user.role);

      // First check connection status (via BFF route)
      const statusResponse = await fetch(`/api/social/status`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!statusResponse.ok) {
        const errorData = await statusResponse.json().catch(() => ({ message: 'Unknown error' }));
        console.error('❌ Status check failed:', errorData);
        setConnectionState({
          isConnected: false,
          isLoading: false,
          userInfo: null,
          error: errorData.message || 'Authentication failed',
          pages: [],
          adAccounts: [],
          instagramAccounts: []
        });
        return;
      }

      const statusData = await statusResponse.json();
      console.log('✅ Status response:', statusData);

      if (!statusData.connected) {
        const newState = {
          isConnected: false,
          isLoading: false,
          userInfo: null,
          error: null,
          pages: [],
          adAccounts: [],
          instagramAccounts: []
        };
        setConnectionState(newState);
        // Update cache
        connectionCache = newState;
        cacheTimestamp = Date.now();
        return;
      }

      // If connected, fetch dashboard data (via BFF route)
      const dashboardResponse = await fetch(`/api/social/dashboard`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (dashboardResponse.ok) {
        const data = await dashboardResponse.json();
        console.log('✅ Dashboard data received:', data);

        if (data.success && data.dashboard) {
          const newState = {
            isConnected: true,
            isLoading: false,
            userInfo: data.userInfo || null,
            error: null,
            pages: data.dashboard.pages || [],
            adAccounts: data.dashboard.adAccounts || [],
            instagramAccounts: data.dashboard.instagramAccounts || []
          };
          setConnectionState(newState);
          // Update cache
          connectionCache = newState;
          cacheTimestamp = Date.now();
        } else {
          // Fallback: try fetching ad-accounts and pages individually in case dashboard endpoint failed partially
          console.warn('⚠️ Dashboard returned no dashboard object, falling back to ad-accounts and pages endpoints');
          try {
            const [adRes, pagesRes, igRes] = await Promise.all([
              fetch('/api/social/ad-accounts', { method: 'GET', credentials: 'include' }),
              fetch('/api/social/pages', { method: 'GET', credentials: 'include' }),
              fetch('/api/social/instagram-accounts', { method: 'GET', credentials: 'include' })
            ]);

            const adData = adRes.ok ? await adRes.json().catch(() => ({})) : {};
            const pagesData = pagesRes.ok ? await pagesRes.json().catch(() => ({})) : {};
            const igData = igRes.ok ? await igRes.json().catch(() => ({})) : {};

            const newState = {
              isConnected: true,
              isLoading: false,
              userInfo: data.userInfo || null,
              error: null,
              pages: pagesData.pages || [],
              adAccounts: adData.adAccounts || [],
              instagramAccounts: igData.instagramAccounts || []
            };
            setConnectionState(newState);
            connectionCache = newState;
            cacheTimestamp = Date.now();
          } catch (fallbackErr) {
            console.error('❌ Fallback fetch failed:', fallbackErr);
            const newState = {
              isConnected: false,
              isLoading: false,
              userInfo: null,
              error: data.message || 'Failed to fetch dashboard data',
              pages: [],
              adAccounts: [],
              instagramAccounts: []
            };
            setConnectionState(newState);
            connectionCache = newState;
            cacheTimestamp = Date.now();
          }
        }
      } else {
        const errorData = await dashboardResponse.json().catch(() => ({ message: 'Unknown error' }));
        console.error('❌ Dashboard fetch failed:', errorData);
        // Try fallback endpoints before giving up
        try {
          const [adRes, pagesRes, igRes] = await Promise.all([
            fetch('/api/social/ad-accounts', { method: 'GET', credentials: 'include' }),
            fetch('/api/social/pages', { method: 'GET', credentials: 'include' }),
            fetch('/api/social/instagram-accounts', { method: 'GET', credentials: 'include' })
          ]);

          const adData = adRes.ok ? await adRes.json().catch(() => ({})) : {};
          const pagesData = pagesRes.ok ? await pagesRes.json().catch(() => ({})) : {};
          const igData = igRes.ok ? await igRes.json().catch(() => ({})) : {};

          const newState = {
            isConnected: true,
            isLoading: false,
            userInfo: null,
            error: null,
            pages: pagesData.pages || [],
            adAccounts: adData.adAccounts || [],
            instagramAccounts: igData.instagramAccounts || []
          };
          setConnectionState(newState);
          connectionCache = newState;
          cacheTimestamp = Date.now();
        } catch (fallbackErr) {
          console.error('❌ Dashboard and fallback fetches failed:', fallbackErr);
          setConnectionState({
            isConnected: false,
            isLoading: false,
            userInfo: null,
            error: errorData.message || 'Failed to fetch dashboard data',
            pages: [],
            adAccounts: [],
            instagramAccounts: []
          });
        }
      }
    } catch (error) {
      console.error('❌ Error checking Facebook connection:', error);
      setConnectionState({
        isConnected: false,
        isLoading: false,
        userInfo: null,
        error: 'Network error occurred',
        pages: [],
        adAccounts: [],
        instagramAccounts: []
      });
    }
  };

  const disconnect = async () => {
    if (!user?.tenantId && user?.role?.toLowerCase() !== 'superadmin') return false;

    try {
      // Use BFF route for disconnect
      const response = await fetch(`/api/social/disconnect`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const newState = {
          isConnected: false,
          isLoading: false,
          userInfo: null,
          error: null,
          pages: [],
          adAccounts: [],
          instagramAccounts: []
        };
        setConnectionState(newState);
        // Clear cache after disconnect
        connectionCache = newState;
        cacheTimestamp = Date.now();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error disconnecting Facebook:', error);
      return false;
    }
  };

  const connect = () => {
    if (!user?.tenantId && user?.role?.toLowerCase() !== 'superadmin') {
      console.error('❌ No user or tenantId found');
      return;
    }
    
    // Use BFF route for OAuth connection
    const connectUrl = `/api/social/connect${user?.role?.toLowerCase() === 'superadmin' ? '' : `?tenantId=${user.tenantId}`}`;
    console.log('🔵 Initiating Facebook connect to:', connectUrl);
    
    // Fetch the auth URL from BFF and redirect
    fetch(connectUrl, {
      method: 'GET',
      credentials: 'include',
    })
      .then(async res => {
        console.log('🔵 BFF response status:', res.status);
        const data = await res.json();
        console.log('🔵 BFF response data:', data);
        
        if (!res.ok) {
          throw new Error(data.error || `HTTP ${res.status}`);
        }
        
        return data;
      })
      .then(data => {
        if (data.authUrl) {
          console.log('✅ Got authUrl, redirecting to Facebook');
          window.location.href = data.authUrl;
        } else {
          throw new Error('No authUrl in response');
        }
      })
      .catch(err => {
        console.error('❌ Error connecting Facebook:', err.message);
        alert(`Failed to connect Facebook: ${err.message}`);
      });
  };

  useEffect(() => {
    if (user?.tenantId || user?.role?.toLowerCase() === 'superadmin') {
      checkConnection();
    }
  }, [user?.tenantId, user?.role]);

  return {
    ...connectionState,
    connect,
    disconnect,
    refresh: checkConnection
  };
}