'use client';

import { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';

interface RevenueBreakdown {
  cycle: string;
  totalRevenue: number;
  count: number;
  avgRevenue: number;
}

export default function RevenueBreakdownCard() {
  const [breakdown, setBreakdown] = useState<RevenueBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchRevenueBreakdown();
    }
  }, [mounted]);

  const fetchRevenueBreakdown = async () => {
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
        '/api/analytics/revenue-breakdown',
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
        throw new Error('Failed to fetch revenue breakdown');
      }

      const data = await response.json();
      setBreakdown(data.breakdown || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load breakdown');
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
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Revenue by Billing Cycle
        </h3>
        <button
          onClick={fetchRevenueBreakdown}
          className="text-sm px-3 py-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
        >
          Refresh
        </button>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error loading breakdown</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      ) : breakdown.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No data available</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {breakdown.map((item) => (
            <div
              key={item.cycle}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                  {item.cycle} Plans
                </h4>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {item.count} subscribers
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    ₹{item.totalRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg Revenue</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    ₹{item.avgRevenue.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                  style={{
                    width: `${(item.totalRevenue / Math.max(...breakdown.map(b => b.totalRevenue))) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
