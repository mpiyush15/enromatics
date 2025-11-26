"use client";

import { useState } from 'react';
import { API_BASE_URL } from '@/lib/apiConfig';

interface TestResult {
  status?: number;
  statusText?: string;
  ok?: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}

export default function TestAuthPage() {
  const [results, setResults] = useState<Record<string, TestResult>>({});
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (endpoint: string, name: string) => {
    try {
      console.log(`Testing ${name}: ${API_BASE_URL}${endpoint}`);
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json().catch(() => ({ error: 'Failed to parse JSON' }));
      
      setResults(prev => ({
        ...prev,
        [name]: {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          data: data,
          timestamp: new Date().toISOString()
        }
      }));

      console.log(`${name} Result:`, {
        status: response.status,
        ok: response.ok,
        data
      });
    } catch (error) {
      console.error(`${name} Error:`, error);
      setResults(prev => ({
        ...prev,
        [name]: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      }));
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setResults({});
    
    const tests = [
      { endpoint: '/api/facebook/status', name: 'Facebook Status' },
      { endpoint: '/api/facebook/dashboard', name: 'Facebook Dashboard' },
      { endpoint: '/api/facebook/debug', name: 'Facebook Debug' },
    ];

    for (const test of tests) {
      await testEndpoint(test.endpoint, test.name);
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            🧪 Authentication Test Page
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test Facebook API authentication and debug issues
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">API Tests</h2>
            <button
              onClick={runAllTests}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? 'Testing...' : 'Run Tests'}
            </button>
          </div>

          <div className="space-y-4">
            {Object.entries(results).map(([name, result]: [string, any]) => (
              <div
                key={name}
                className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-700"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    result.error 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : result.ok
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {result.error ? 'Error' : result.status}
                  </span>
                </div>
                
                <div className="text-sm">
                  <div className="mb-2">
                    <strong>Time:</strong> {new Date(result.timestamp).toLocaleTimeString()}
                  </div>
                  
                  {result.error ? (
                    <div className="text-red-600 dark:text-red-400">
                      <strong>Error:</strong> {result.error}
                    </div>
                  ) : (
                    <>
                      <div className="mb-2">
                        <strong>Status:</strong> {result.status} {result.statusText}
                      </div>
                      <div>
                        <strong>Response:</strong>
                        <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto max-h-40">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
            🔍 Debug Information
          </h3>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <div><strong>API Base URL:</strong> {API_BASE_URL}</div>
            <div><strong>Current Time:</strong> {new Date().toISOString()}</div>
            <div><strong>User Agent:</strong> {navigator.userAgent}</div>
            <div><strong>Cookies Enabled:</strong> {navigator.cookieEnabled ? 'Yes' : 'No'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}