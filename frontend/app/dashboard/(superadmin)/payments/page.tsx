'use client';

import { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { CreditCard, Building2, Calendar, Loader2, CheckCircle, XCircle, Clock, IndianRupee } from 'lucide-react';

interface Payment {
  id: string;
  tenantId: string;
  tenantName: string;
  instituteName: string;
  email: string;
  plan: string;
  status: string;
  billingCycle: string;
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
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

const PLAN_PRICES: Record<string, { monthly: number; annual: number }> = {
  free: { monthly: 0, annual: 0 },
  trial: { monthly: 0, annual: 0 },
  test: { monthly: 10, annual: 10 },
  starter: { monthly: 1999, annual: 16790 },
  professional: { monthly: 2999, annual: 25190 },
  pro: { monthly: 2999, annual: 25190 },
  enterprise: { monthly: 4999, annual: 41990 },
};

export default function PaymentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    paidCount: 0,
    pendingCount: 0,
    failedCount: 0,
  });

  useEffect(() => {
    if (!authLoading && user?.role !== 'SuperAdmin') {
      router.push('/dashboard');
      return;
    }
    if (!authLoading && user?.role === 'SuperAdmin') {
      fetchPayments();
    }
  }, [user, authLoading, router]);

  const fetchPayments = async () => {
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
      
      // Call BFF endpoint with Bearer token
      const res = await fetch('/api/admin/subscriptions', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Payments API response status:', res.status);
      const data = await res.json();
      console.log('Payments API response:', data);
      
      if (!res.ok) {
        if (res.status === 401) {
          const confirmLogout = window.confirm(
            'Your session has expired. You will be logged out. Click OK to continue to login page.'
          );
          if (confirmLogout) {
            localStorage.removeItem('token');
            router.push('/login');
          }
          return;
        }
        throw new Error(data.message || 'Failed to load payments');
      }
      
      if (data.success && data.payments) {
        // Filter only paid subscriptions (non-free)
        const paidPayments = data.payments.filter((p: Payment) => 
          p.plan && !['free', 'trial'].includes(p.plan.toLowerCase())
        );
        setPayments(paidPayments);
        
        // Calculate stats
        const totalRevenue = paidPayments.reduce((sum: number, p: Payment) => {
          return sum + getAmount(p);
        }, 0);
        
        setStats({
          totalRevenue,
          paidCount: paidPayments.filter((p: Payment) => p.status === 'active').length,
          pendingCount: paidPayments.filter((p: Payment) => p.status === 'pending').length,
          failedCount: paidPayments.filter((p: Payment) => !['active', 'pending'].includes(p.status)).length,
        });
      } else {
        setError(data.message || 'Failed to load payments');
      }
    } catch (err: any) {
      console.error('Error fetching payments:', err);
      setError(err.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const getAmount = (payment: Payment) => {
    if (payment.amount && payment.amount > 0) {
      return payment.amount;
    }
    const prices = PLAN_PRICES[payment.plan?.toLowerCase()] || { monthly: 0, annual: 0 };
    return payment.billingCycle === 'annual' ? prices.annual : prices.monthly;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'pending':
        return <Clock className="text-yellow-500" size={16} />;
      default:
        return <XCircle className="text-red-500" size={16} />;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
          <p className="text-gray-600 dark:text-gray-400">Loading payments...</p>
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
            <CreditCard className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payments</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">All subscription payments from tenants</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <IndianRupee className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-600">₹{stats.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Successful</p>
                <p className="text-2xl font-bold text-green-600">{stats.paidCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Clock className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <XCircle className="text-red-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Failed/Inactive</p>
                <p className="text-2xl font-bold text-red-600">{stats.failedCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
            {error}
            <button onClick={fetchPayments} className="ml-4 underline">Retry</button>
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
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Payment Date</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No paid subscriptions found
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Building2 className="text-gray-400" size={20} />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{payment.instituteName || payment.tenantName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{payment.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                          {PLAN_NAMES[payment.plan?.toLowerCase()] || payment.plan || 'Unknown'}
                        </span>
                        <p className="text-xs text-gray-500 mt-1 capitalize">{payment.billingCycle || 'monthly'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          ₹{getAmount(payment).toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(payment.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            payment.status === 'active' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : payment.status === 'pending'
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}>
                            {payment.status || 'unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          {formatDate(payment.startDate)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        {formatDate(payment.endDate)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
