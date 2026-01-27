import React, { createContext, useState, useCallback } from 'react';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export const AuthContext = createContext();

export function AuthProvider({ children, apiUrl }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${apiUrl}/api/auth/login`,
        { email, password },
        { timeout: 10000 }
      );

      const { token: authToken, user: userData } = response.data;

      if (!authToken || !userData.tenantId) {
        throw new Error('Invalid response from server');
      }

      // Store token securely
      await SecureStore.setItemAsync('authToken', authToken);
      await SecureStore.setItemAsync('tenantId', userData.tenantId);
      await SecureStore.setItemAsync('studentId', userData._id || userData.studentId);

      setToken(authToken);
      setUser(userData);

      console.log('✅ Login successful for:', userData.email);
      return { success: true, user: userData };
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Login failed';
      setError(errorMessage);
      console.error('❌ Login error:', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  const logout = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('tenantId');
      await SecureStore.deleteItemAsync('studentId');
      
      setUser(null);
      setToken(null);
      setError(null);
      
      console.log('✅ Logged out successfully');
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    isLoggedIn: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
