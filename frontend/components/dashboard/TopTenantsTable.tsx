'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Loader } from 'lucide-react';

interface TopTenant {
  _id: string;
  instituteName: string;
  name: string;
  email: string;
  plan: string;
  subscription: {
    status: string;
    amount: number;
    billingCycle: string;
    startDate: string;
    trialStartDate?: string;
  };
}

interface TopTenantsTableProps {
  limit?: number;
}

const planColors: Record<string, string> = {
  free: 'bg-gray-100 text-gray-800',
  trial: 'bg-blue-100 text-blue-800',
  test: 'bg-purple-100 text-purple-800',
  starter: 'bg-green-100 text-green-800',
  professional: 'bg-orange-100 text-orange-800',
  pro: 'bg-orange-100 text-orange-800',
  enterprise: 'bg-red-100 text-red-800',
};

export default function TopTenantsTable({ limit = 10 }: TopTenantsTableProps) {
  const [tenants, setTenants] = useState<TopTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchTopTenants();
    }
  }, [mounted]);

  const fetchTopTenants = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `/api/analytics/top-tenants?limit=${limit}`,
        {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          setError('Session expired. Please refresh.');
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch top tenants');
      }

      const data = await response.json();
      setTenants(data.topTenants || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load top tenants');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            Top Revenue Tenants
          </h3>
          <button
            onClick={fetchTopTenants}
            className="text-sm px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">Error loading tenants</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        </div>
      ) : tenants.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Institution
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Monthly Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {tenants.map((tenant) => (
                <tr
                  key={tenant._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {tenant.instituteName || tenant.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {tenant.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {tenant.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        planColors[tenant.plan] || planColors.free
                      }`}
                    >
                      {tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        ₹{tenant.subscription?.amount?.toLocaleString() || '0'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {tenant.subscription?.billingCycle === 'annual' ? 'Annual' : 'Monthly'}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {tenant.subscription?.status === 'trial' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        🎉 Trial
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Active
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
