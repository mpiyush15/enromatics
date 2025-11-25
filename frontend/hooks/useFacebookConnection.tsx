'use client';

import { useState, useEffect } from 'react';
import { authService } from '@/lib/authService';

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
    if (!user?.tenantId) {
      setConnectionState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setConnectionState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch(`/api/facebook/dashboard?tenantId=${user.tenantId}`, {
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
    if (!user?.tenantId) return false;

    try {
      const response = await fetch(`/api/facebook/disconnect?tenantId=${user.tenantId}`, {
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
    if (!user?.tenantId) return;
    
    const authUrl = `/api/facebook/auth?tenantId=${user.tenantId}`;
    window.location.href = authUrl;
  };

  useEffect(() => {
    if (user?.tenantId) {
      checkConnection();
    }
  }, [user?.tenantId]);

  return {
    ...connectionState,
    connect,
    disconnect,
    refresh: checkConnection
  };
}