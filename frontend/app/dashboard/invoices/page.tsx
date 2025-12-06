'use client';

import { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { FileText, Download, Building2, Calendar, Loader2 } from 'lucide-react';

interface Invoice {
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
  test: { monthly: 10, annual: 10 },
  starter: { monthly: 1999, annual: 16790 },
  professional: { monthly: 2999, annual: 25190 },
  enterprise: { monthly: 4999, annual: 41990 },
};

export default function InvoicesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && user?.role !== 'SuperAdmin') {
      router.push('/dashboard');
      return;
    }
    if (!authLoading && user?.role === 'SuperAdmin') {
      fetchInvoices();
    }
  }, [user, authLoading, router]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await fetch('/api/admin/subscriptions', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      
      console.log('Invoice API response status:', res.status);
      const data = await res.json();
      console.log('Invoice API response:', data);
      
      if (data.success && data.payments) {
        setInvoices(data.payments);
      } else {
        setError(data.message || 'Failed to load invoices');
      }
    } catch (err: any) {
      console.error('Error fetching invoices:', err);
      setError(err.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const getAmount = (plan: string, billingCycle: string) => {
    const prices = PLAN_PRICES[plan?.toLowerCase()] || { monthly: 0, annual: 0 };
    return billingCycle === 'annual' ? prices.annual : prices.monthly;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
          <p className="text-gray-600 dark:text-gray-400">Loading invoices...</p>
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
            <FileText className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Invoices</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">All subscription payments and invoices</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Invoices</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{invoices.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Active Subscriptions</p>
            <p className="text-3xl font-bold text-green-600">{invoices.filter(i => i.status === 'active').length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
            <p className="text-3xl font-bold text-blue-600">
              ₹{invoices.reduce((sum, inv) => sum + getAmount(inv.plan, inv.billingCycle), 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
            {error}
            <button onClick={fetchInvoices} className="ml-4 underline">Retry</button>
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
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Building2 className="text-gray-400" size={20} />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{invoice.instituteName || invoice.tenantName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{invoice.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium">
                          {PLAN_NAMES[invoice.plan?.toLowerCase()] || invoice.plan || 'Free'}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{invoice.billingCycle || 'monthly'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          ₹{getAmount(invoice.plan, invoice.billingCycle).toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          invoice.status === 'active' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {invoice.status || 'unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          {formatDate(invoice.startDate || invoice.createdAt)}
                        </div>
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
