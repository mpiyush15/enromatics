'use client';

import { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { FileText, Download, Building2, Calendar, Loader2, Eye, Send, MoreHorizontal } from 'lucide-react';

interface Invoice {
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

export default function InvoicesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showModal, setShowModal] = useState(false);

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

  // Get amount - use stored amount if available, otherwise calculate from plan
  const getAmount = (invoice: Invoice) => {
    // If amount is stored in database, use it
    if (invoice.amount && invoice.amount > 0) {
      return invoice.amount;
    }
    // Fallback: calculate from plan prices
    const prices = PLAN_PRICES[invoice.plan?.toLowerCase()] || { monthly: 0, annual: 0 };
    return invoice.billingCycle === 'annual' ? prices.annual : prices.monthly;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // View invoice details
  const viewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowModal(true);
  };

  // Download invoice PDF
  const downloadInvoice = async (invoice: Invoice) => {
    try {
      setActionLoading(`download-${invoice.id}`);
      const res = await fetch(`/api/admin/invoices/${invoice.tenantId}/download`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${invoice.tenantId}-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to download invoice');
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download invoice');
    } finally {
      setActionLoading(null);
    }
  };

  // Send invoice to tenant via email
  const sendInvoice = async (invoice: Invoice) => {
    if (!confirm(`Send invoice to ${invoice.email}?`)) return;
    
    try {
      setActionLoading(`send-${invoice.id}`);
      const res = await fetch(`/api/admin/invoices/${invoice.tenantId}/send`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const data = await res.json();
      if (data.success) {
        alert('Invoice sent successfully!');
      } else {
        alert(data.message || 'Failed to send invoice');
      }
    } catch (err) {
      console.error('Send error:', err);
      alert('Failed to send invoice');
    } finally {
      setActionLoading(null);
    }
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
              ₹{invoices.reduce((sum, inv) => sum + getAmount(inv), 0).toLocaleString()}
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
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
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
                          ₹{getAmount(invoice).toLocaleString()}
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
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => viewInvoice(invoice)}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                            title="View Invoice"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => downloadInvoice(invoice)}
                            disabled={actionLoading === `download-${invoice.id}`}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition disabled:opacity-50"
                            title="Download PDF"
                          >
                            {actionLoading === `download-${invoice.id}` ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Download size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => sendInvoice(invoice)}
                            disabled={actionLoading === `send-${invoice.id}`}
                            className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition disabled:opacity-50"
                            title="Send to Tenant"
                          >
                            {actionLoading === `send-${invoice.id}` ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Send size={16} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoice Modal */}
        {showModal && selectedInvoice && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Invoice Details</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b dark:border-gray-700">
                  <span className="text-gray-500">Invoice ID</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedInvoice.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b dark:border-gray-700">
                  <span className="text-gray-500">Institute</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedInvoice.instituteName || selectedInvoice.tenantName}</span>
                </div>
                <div className="flex justify-between py-2 border-b dark:border-gray-700">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium text-gray-900 dark:text-white">{selectedInvoice.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b dark:border-gray-700">
                  <span className="text-gray-500">Plan</span>
                  <span className="font-medium text-blue-600">{PLAN_NAMES[selectedInvoice.plan?.toLowerCase()] || selectedInvoice.plan}</span>
                </div>
                <div className="flex justify-between py-2 border-b dark:border-gray-700">
                  <span className="text-gray-500">Billing Cycle</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">{selectedInvoice.billingCycle || 'monthly'}</span>
                </div>
                <div className="flex justify-between py-2 border-b dark:border-gray-700">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-bold text-green-600 text-lg">₹{getAmount(selectedInvoice).toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b dark:border-gray-700">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedInvoice.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {selectedInvoice.status}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b dark:border-gray-700">
                  <span className="text-gray-500">Start Date</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatDate(selectedInvoice.startDate)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-500">End Date</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatDate(selectedInvoice.endDate)}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => downloadInvoice(selectedInvoice)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Download size={16} />
                  Download PDF
                </button>
                <button
                  onClick={() => sendInvoice(selectedInvoice)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Send size={16} />
                  Send to Tenant
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
