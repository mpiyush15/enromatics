'use client';

import { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Users, Building2, Calendar, Loader2, Eye, Mail, KeyRound } from 'lucide-react';

interface Subscriber {
  _id: string;
  tenantId: string;
  name: string;
  instituteName: string;
  email: string;
  plan: string;
  active: boolean;
  contact?: {
    phone?: string;
    city?: string;
    state?: string;
  };
  subscription: {
    status: string;
    paymentId: string;
    startDate: string;
    endDate: string;
    billingCycle?: string;
    amount?: number;
    currency?: string;
  };
  createdAt: string;
}

const PLAN_NAMES: Record<string, string> = {
  free: 'Free',
  trial: 'Trial',
  test: 'Test Plan',
  starter: 'Starter',
  professional: 'Professional',
  enterprise: 'Enterprise',
  pro: 'Pro',
};

export default function SubscribersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && user?.role !== 'SuperAdmin') {
      router.push('/dashboard');
      return;
    }
    if (!authLoading && user?.role === 'SuperAdmin') {
      fetchSubscribers();
    }
  }, [user, authLoading, router]);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get token from localStorage (stored at login)
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      
      if (!token) {
        setError('Authentication required. Please log in.');
        setLoading(false);
        return;
      }
      
      const res = await fetch('/api/admin/subscribers', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Subscribers API response status:', res.status);
      const data = await res.json();
      console.log('Subscribers API response:', data);
      
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }
        throw new Error(data.message || 'Failed to load subscribers');
      }
      
      if (data.success && data.subscribers) {
        setSubscribers(data.subscribers);
      } else {
        setError(data.message || 'Failed to load subscribers');
      }
    } catch (err: any) {
      console.error('Error fetching subscribers:', err);
      setError(err.message || 'Failed to load subscribers');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysRemaining = (endDate: string) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
          <p className="text-gray-600 dark:text-gray-400">Loading subscribers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Subscribers</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">All registered tenants and their subscription status</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Tenants</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{subscribers.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
            <p className="text-3xl font-bold text-green-600">{subscribers.filter(s => s.subscription?.status === 'active').length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Expiring Soon</p>
            <p className="text-3xl font-bold text-yellow-600">
              {subscribers.filter(s => {
                const days = getDaysRemaining(s.subscription?.endDate);
                return days > 0 && days <= 7;
              }).length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Expired</p>
            <p className="text-3xl font-bold text-red-600">
              {subscribers.filter(s => getDaysRemaining(s.subscription?.endDate) < 0).length}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
            {error}
            <button onClick={fetchSubscribers} className="ml-4 underline">Retry</button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Institute</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Plan</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Expires</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {subscribers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No subscribers found
                    </td>
                  </tr>
                ) : (
                  subscribers.map((sub) => {
                    const daysRemaining = getDaysRemaining(sub.subscription?.endDate);
                    return (
                      <tr key={sub._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Building2 className="text-gray-400" size={20} />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{sub.instituteName || sub.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{sub.email}</p>
                              {sub.contact?.phone && (
                                <p className="text-xs text-gray-400">{sub.contact.phone}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                            {PLAN_NAMES[sub.plan?.toLowerCase()] || sub.plan || 'Free'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            sub.subscription?.status === 'active' && daysRemaining > 7
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : daysRemaining > 0 && daysRemaining <= 7
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                              : daysRemaining <= 0
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}>
                            {daysRemaining > 7 ? 'Active' : daysRemaining > 0 ? `${daysRemaining} days left` : daysRemaining < 0 ? 'Expired' : sub.subscription?.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            {formatDate(sub.subscription?.endDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => router.push(`/dashboard/tenants/${sub.tenantId}`)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
                          >
                            <Eye size={14} />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
