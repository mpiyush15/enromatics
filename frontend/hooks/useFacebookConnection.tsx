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
    adAccounts: []
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

    if (!user.tenantId && user.role !== 'SuperAdmin') {
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
          adAccounts: []
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
          adAccounts: []
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
            adAccounts: data.dashboard.adAccounts || []
          };
          setConnectionState(newState);
          // Update cache
          connectionCache = newState;
          cacheTimestamp = Date.now();
        } else {
          const newState = {
            isConnected: false,
            isLoading: false,
            userInfo: null,
            error: data.message || 'Failed to fetch dashboard data',
            pages: [],
            adAccounts: []
          };
          setConnectionState(newState);
          // Update cache
          connectionCache = newState;
          cacheTimestamp = Date.now();
        }
      } else {
        const errorData = await dashboardResponse.json().catch(() => ({ message: 'Unknown error' }));
        console.error('❌ Dashboard fetch failed:', errorData);
        setConnectionState({
          isConnected: false,
          isLoading: false,
          userInfo: null,
          error: errorData.message || 'Failed to fetch dashboard data',
          pages: [],
          adAccounts: []
        });
      }
    } catch (error) {
      console.error('❌ Error checking Facebook connection:', error);
      setConnectionState({
        isConnected: false,
        isLoading: false,
        userInfo: null,
        error: 'Network error occurred',
        pages: [],
        adAccounts: []
      });
    }
  };

  const disconnect = async () => {
    if (!user?.tenantId && user?.role !== 'SuperAdmin') return false;

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
          adAccounts: []
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
    if (!user?.tenantId && user?.role !== 'SuperAdmin') return;
    
    // Use BFF route for OAuth connection
    const connectUrl = `/api/social/connect${user?.role === 'SuperAdmin' ? '' : `?tenantId=${user.tenantId}`}`;
    
    // Fetch the auth URL from BFF and redirect
    fetch(connectUrl, {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.authUrl) {
          window.location.href = data.authUrl;
        } else {
          console.error('❌ No authUrl returned from connect endpoint');
        }
      })
      .catch(err => {
        console.error('❌ Error initiating Facebook connection:', err);
      });
  };

  useEffect(() => {
    if (user?.tenantId || user?.role === 'SuperAdmin') {
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