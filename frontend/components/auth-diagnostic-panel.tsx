/**
 * Auth Diagnostic Panel - Debug auth issues
 */
'use client';

import { useDiagnosticAuth } from '@/hooks/useDiagnosticAuth';

export function AuthDiagnosticPanel() {
  const { diagnostic, loading, error } = useDiagnosticAuth();

  if (loading) return <div className="p-4 text-sm text-gray-500">🔍 Checking auth...</div>;
  if (error) return <div className="p-4 text-sm text-red-600">❌ Error: {error}</div>;
  if (!diagnostic) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="mb-2 font-bold">🔐 Auth Diagnostic</div>
      
      <div className="space-y-1 text-gray-300">
        <div>
          <span className={diagnostic.localStorageToken ? '✅' : '❌'}>
            {' '}localStorage.token
          </span>
        </div>
        <div>
          <span className={diagnostic.sessionStorageToken ? '✅' : '❌'}>
            {' '}sessionStorage.auth_token
          </span>
        </div>
        <div>
          <span className={diagnostic.jwtCookie ? '✅' : '❌'}>
            {' '}jwt cookie
          </span>
        </div>
        <div>
          <span className={diagnostic.tokenCookie ? '✅' : '❌'}>
            {' '}token cookie
          </span>
        </div>
      </div>

      <div className="border-t border-gray-600 mt-2 pt-2 text-yellow-400">
        {diagnostic.testApiResult}
      </div>

      <div className="text-gray-400 mt-2">
        Cookies: {Object.keys(diagnostic.allCookies).join(', ') || 'none'}
      </div>
    </div>
  );
}
