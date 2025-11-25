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

    if (!user.tenantId && user.role !== 'SuperAdmin') {
      console.log('❌ User has no tenantId and is not SuperAdmin:', user);
      setConnectionState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setConnectionState(prev => ({ ...prev, isLoading: true, error: null }));

      console.log('✅ Checking Facebook connection for user:', user.email, 'Role:', user.role);

      // First check connection status
      const statusResponse = await fetch(`${API_BASE_URL}/api/facebook/status`, {
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
        setConnectionState({
          isConnected: false,
          isLoading: false,
          userInfo: null,
          error: null,
          pages: [],
          adAccounts: []
        });
        return;
      }

      // If connected, fetch dashboard data
      const dashboardResponse = await fetch(`${API_BASE_URL}/api/facebook/dashboard`, {
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
          setConnectionState({
            isConnected: true,
            isLoading: false,
            userInfo: data.userInfo || null,
            error: null,
            pages: data.dashboard.pages || [],
            adAccounts: data.dashboard.adAccounts || []
          });
        } else {
          setConnectionState({
            isConnected: false,
            isLoading: false,
            userInfo: null,
            error: data.message || 'Failed to fetch dashboard data',
            pages: [],
            adAccounts: []
          });
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
      const disconnectUrl = user?.role === 'SuperAdmin'
        ? `${API_BASE_URL}/api/facebook/disconnect`
        : `${API_BASE_URL}/api/facebook/disconnect?tenantId=${user.tenantId}`;
      
      const response = await fetch(disconnectUrl, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setConnectionState({
          isConnected: false,
          isLoading: false,
          userInfo: null,
          error: null,
          pages: [],
          adAccounts: []
        });
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
    
    // Use backend OAuth URL for both SuperAdmin and tenant users
    const authUrl = user?.role === 'SuperAdmin' 
      ? `${API_BASE_URL}/api/facebook/connect`  // SuperAdmin doesn't need tenantId
      : `${API_BASE_URL}/api/facebook/connect?tenantId=${user.tenantId}`;
    
    window.location.href = authUrl;
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