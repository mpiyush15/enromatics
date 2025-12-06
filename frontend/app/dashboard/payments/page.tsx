'use client';

import { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, 
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUpRight,
  Building2,
  Users
} from 'lucide-react';
import { toast } from 'sonner';

interface Payment {
  id: string;
  tenantId: string;
  tenantName: string;
  instituteName: string;
  email: string;
  plan: string;
  status: string;
  billingCycle: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

interface Stats {
  totalTenants: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  recentPayments: number;
  planDistribution: Record<string, number>;
}

export default function SuperAdminPaymentsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user?.role !== 'SuperAdmin') {
      router.push('/dashboard');
      return;
    }
    if (!authLoading && user?.role === 'SuperAdmin') {
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      const [paymentsRes, statsRes] = await Promise.all([
        fetch('/api/admin/subscriptions', { credentials: 'include' }),
        fetch('/api/admin/stats', { credentials: 'include' })
      ]);

      const paymentsData = await paymentsRes.json();
      const statsData = await statsRes.json();

      if (paymentsData.success) {
        setPayments(paymentsData.payments || []);
      }
      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Error loading payment data');
    } finally {
      setLoading(false);
    }
  };

  const calculateRevenue = () => {
    const planPrices: Record<string, { monthly: number; annual: number }> = {
      'test': { monthly: 10, annual: 10 },
      'starter': { monthly: 1999, annual: 16790 },
      'professional': { monthly: 2999, annual: 25190 },
      'enterprise': { monthly: 4999, annual: 41990 },
    };

    let total = 0;
    let monthly = 0;

    payments.forEach(p => {
      const prices = planPrices[p.plan] || { monthly: 0, annual: 0 };
      const amount = p.billingCycle === 'annual' ? prices.annual : prices.monthly;
      total += amount;
      if (p.billingCycle === 'monthly') {
        monthly += amount;
      }
    });

    return { total, monthly };
  };

  const revenue = calculateRevenue();

  if (authLoading || loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-4 gap-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (user?.role !== 'SuperAdmin') {
    return null;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <CreditCard className="w-7 h-7 text-indigo-600" />
          Payments Overview
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Track subscription payments and revenue
        </p>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold mt-2">₹{revenue.total.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <DollarSign className="w-8 h-8" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-green-100 text-sm">
            <ArrowUpRight className="w-4 h-4 mr-1" />
            All time earnings
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Active Subscriptions</p>
              <p className="text-3xl font-bold mt-2">{stats?.activeSubscriptions || 0}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <CheckCircle className="w-8 h-8" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-blue-100 text-sm">
            <Users className="w-4 h-4 mr-1" />
            Paying customers
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Monthly Revenue</p>
              <p className="text-3xl font-bold mt-2">₹{revenue.monthly.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-purple-100 text-sm">
            <Calendar className="w-4 h-4 mr-1" />
            Recurring monthly
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Recent Payments</p>
              <p className="text-3xl font-bold mt-2">{stats?.recentPayments || 0}</p>
            </div>
            <div className="p-3 bg-white/20 rounded-xl">
              <Clock className="w-8 h-8" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-orange-100 text-sm">
            <Calendar className="w-4 h-4 mr-1" />
            Last 30 days
          </div>
        </div>
      </div>

      {/* Plan Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Plan Distribution
          </h2>
          <div className="space-y-4">
            {stats?.planDistribution && Object.entries(stats.planDistribution).length > 0 ? (
              Object.entries(stats.planDistribution).map(([plan, count]) => (
                <div key={plan} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      plan === 'enterprise' ? 'bg-purple-500' :
                      plan === 'professional' ? 'bg-blue-500' :
                      plan === 'starter' ? 'bg-green-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="text-gray-700 dark:text-gray-300 capitalize font-medium">{plan}</span>
                  </div>
                  <span className="text-gray-900 dark:text-white font-bold">{count}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No active subscriptions</p>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Subscription Summary
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700 dark:text-gray-300">Total Tenants</span>
              </div>
              <span className="text-gray-900 dark:text-white font-bold">{stats?.totalTenants || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">Active</span>
              </div>
              <span className="text-green-600 dark:text-green-400 font-bold">{stats?.activeSubscriptions || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-gray-700 dark:text-gray-300">Expired</span>
              </div>
              <span className="text-red-600 dark:text-red-400 font-bold">{stats?.expiredSubscriptions || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Payments Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Payments
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {payments.slice(0, 10).map((payment) => {
                const planPrices: Record<string, { monthly: number; annual: number }> = {
                  'test': { monthly: 10, annual: 10 },
                  'starter': { monthly: 1999, annual: 16790 },
                  'professional': { monthly: 2999, annual: 25190 },
                  'enterprise': { monthly: 4999, annual: 41990 },
                };
                const prices = planPrices[payment.plan] || { monthly: 0, annual: 0 };
                const amount = payment.billingCycle === 'annual' ? prices.annual : prices.monthly;

                return (
                  <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {payment.tenantName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {payment.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 capitalize">
                        {payment.plan} ({payment.billingCycle})
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        ₹{amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                        payment.status === 'active' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                      }`}>
                        {payment.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No payments recorded yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
