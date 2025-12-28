'use client';

import { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import AnalyticsOverview from './AnalyticsOverview';
import Phase1Dashboard from '@/components/analytics/phase1/Phase1Dashboard';

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'phase1'>('overview');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading || !mounted) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Real-time insights and performance metrics</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('phase1')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'phase1'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            Engagement Metrics
          </button>
        </div>

        {/* Content */}
        {activeTab === 'overview' ? (
          <AnalyticsOverview tenantId={user?.tenantId || ''} />
        ) : (
          <Phase1Dashboard />
        )}
      </div>
    </div>
  );
}
