/**
 * Diagnostic hook to check JWT token and auth status
 */
'use client';

import { useEffect, useState } from 'react';

interface AuthDiagnostic {
  localStorageToken: boolean;
  sessionStorageToken: boolean;
  jwtCookie: boolean;
  tokenCookie: boolean;
  allCookies: Record<string, string>;
  authHeaderStatus: string;
  testApiResult: string;
}

export function useDiagnosticAuth() {
  const [diagnostic, setDiagnostic] = useState<AuthDiagnostic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 1. Check localStorage
        const localStorageToken = !!localStorage.getItem('token');
        const sessionStorageToken = !!sessionStorage.getItem('auth_token');

        // 2. Check cookies - parse document.cookie
        const cookieString = document.cookie;
        const cookies: Record<string, string> = {};
        cookieString.split(';').forEach((cookie) => {
          const [key, value] = cookie.split('=').map((s) => s.trim());
          if (key) cookies[key] = value;
        });

        const jwtCookie = !!cookies.jwt;
        const tokenCookie = !!cookies.token;

        // 3. Test API call with diagnostic headers
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        const testApiResult = response.ok ? `✅ Success - User: ${data.user?.email}` : `❌ Failed - Status: ${response.status}`;

        // 4. Check Authorization header in browser (we can't actually see outgoing headers, but we can check fetch behavior)
        const authHeaderStatus = localStorageToken || jwtCookie ? '✅ Auth available' : '❌ No auth found';

        setDiagnostic({
          localStorageToken,
          sessionStorageToken,
          jwtCookie,
          tokenCookie,
          allCookies: cookies,
          authHeaderStatus,
          testApiResult,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { diagnostic, loading, error };
}
