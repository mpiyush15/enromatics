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
    if (!user?.tenantId && user?.role !== 'SuperAdmin') {
      setConnectionState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setConnectionState(prev => ({ ...prev, isLoading: true, error: null }));

      const dashboardUrl = user?.role === 'SuperAdmin'
        ? `${API_BASE_URL}/api/facebook/dashboard`
        : `${API_BASE_URL}/api/facebook/dashboard?tenantId=${user.tenantId}`;
      
      const response = await fetch(dashboardUrl, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setConnectionState({
          isConnected: true,
          isLoading: false,
          userInfo: data.userInfo || null,
          error: null,
          pages: data.pages || [],
          adAccounts: data.adAccounts || []
        });
      } else {
        setConnectionState({
          isConnected: false,
          isLoading: false,
          userInfo: null,
          error: null,
          pages: [],
          adAccounts: []
        });
      }
    } catch (error) {
      console.error('Error checking Facebook connection:', error);
      setConnectionState({
        isConnected: false,
        isLoading: false,
        userInfo: null,
        error: 'Failed to check connection status',
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
      ? `${API_BASE_URL}/api/facebook/auth`  // SuperAdmin doesn't need tenantId
      : `${API_BASE_URL}/api/facebook/auth?tenantId=${user.tenantId}`;
    
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