/**
 * Invoice Service - Manage invoices and payments
 * Issue 10 Fix: Consolidated invoice tracking across Tenant and TenantSubscription
 */

import TenantSubscription from '../models/TenantSubscription.js';
import Tenant from '../models/Tenant.js';

/**
 * Create invoice record
 */
export const createInvoice = async (tenantId, invoiceData) => {
  const {
    amount,
    planType,
    billingCycle = 'monthly',
    startDate = new Date(),
    endDate,
    description = '',
    invoiceNumber = null,
    pdfUrl = null
  } = invoiceData;

  // Get subscription
  const subscription = await TenantSubscription.findOne({ tenantId });
  if (!subscription) {
    throw new Error(`No subscription found for tenant ${tenantId}`);
  }

  // Add to paymentHistory
  const invoice = {
    date: startDate,
    amount,
    planType,
    status: 'completed',
    billingCycle,
    invoiceNumber,
    pdfUrl,
    description,
    periodStart: startDate,
    periodEnd: endDate,
    createdAt: new Date()
  };

  subscription.paymentHistory.push(invoice);
  subscription.invoiceData = {
    lastInvoiceNumber: invoiceNumber,
    lastInvoicePdfUrl: pdfUrl,
    lastInvoiceDate: new Date(),
    totalInvoices: subscription.paymentHistory.length
  };

  await subscription.save();

  // Also update Tenant for quick access
  const tenant = await Tenant.findOne({ tenantId });
  if (tenant) {
    tenant.invoiceData = {
      lastInvoiceNumber: invoiceNumber,
      lastInvoicePdfUrl: pdfUrl,
      lastInvoiceDate: new Date(),
      totalInvoices: subscription.paymentHistory.length
    };
    await tenant.save();
  }

  return invoice;
};

/**
 * Get invoice by number
 */
export const getInvoiceByNumber = async (tenantId, invoiceNumber) => {
  const subscription = await TenantSubscription.findOne({ tenantId });
  if (!subscription) {
    return null;
  }

  return subscription.paymentHistory.find(
    inv => inv.invoiceNumber === invoiceNumber
  );
};

/**
 * Get all invoices for tenant
 */
export const getAllInvoices = async (tenantId, options = {}) => {
  const {
    limit = 50,
    offset = 0,
    status = null,
    sortBy = 'date',
    sortOrder = -1
  } = options;

  const subscription = await TenantSubscription.findOne({ tenantId });
  if (!subscription) {
    return [];
  }

  let invoices = subscription.paymentHistory || [];

  // Filter by status if provided
  if (status) {
    invoices = invoices.filter(inv => inv.status === status);
  }

  // Sort
  const sortMultiplier = sortOrder === -1 ? -1 : 1;
  invoices.sort((a, b) => {
    if (sortBy === 'date') {
      return (new Date(b.date) - new Date(a.date)) * sortMultiplier;
    } else if (sortBy === 'amount') {
      return (b.amount - a.amount) * sortMultiplier;
    }
    return 0;
  });

  // Paginate
  return invoices.slice(offset, offset + limit);
};

/**
 * Get invoice statistics
 */
export const getInvoiceStats = async (tenantId) => {
  const subscription = await TenantSubscription.findOne({ tenantId });
  if (!subscription) {
    return null;
  }

  const invoices = subscription.paymentHistory || [];

  const stats = {
    totalInvoices: invoices.length,
    totalRevenue: invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0),
    avgInvoiceAmount: invoices.length > 0 ? invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0) / invoices.length : 0,
    byStatus: {},
    byPlan: {},
    byBillingCycle: {},
    lastInvoice: invoices[invoices.length - 1] || null,
    firstInvoice: invoices[0] || null
  };

  // Group by status
  invoices.forEach(inv => {
    stats.byStatus[inv.status] = (stats.byStatus[inv.status] || 0) + 1;
  });

  // Group by plan
  invoices.forEach(inv => {
    stats.byPlan[inv.planType] = (stats.byPlan[inv.planType] || 0) + 1;
  });

  // Group by billing cycle
  invoices.forEach(inv => {
    stats.byBillingCycle[inv.billingCycle] = (stats.byBillingCycle[inv.billingCycle] || 0) + 1;
  });

  return stats;
};

/**
 * Generate invoice number
 */
export const generateInvoiceNumber = async (tenantId) => {
  const tenant = await Tenant.findOne({ tenantId });
  if (!tenant) {
    throw new Error(`Tenant not found: ${tenantId}`);
  }

  // Format: TENANT-YYYYMMDD-00001
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const tenantPrefix = tenantId.slice(0, 6).toUpperCase();

  // Get count of invoices today
  const subscription = await TenantSubscription.findOne({ tenantId });
  if (!subscription) {
    throw new Error(`Subscription not found for tenant: ${tenantId}`);
  }

  const todayInvoices = (subscription.paymentHistory || []).filter(inv => {
    const invDate = new Date(inv.date);
    const today = new Date();
    return (
      invDate.getDate() === today.getDate() &&
      invDate.getMonth() === today.getMonth() &&
      invDate.getFullYear() === today.getFullYear()
    );
  }).length;

  const sequence = String(todayInvoices + 1).padStart(5, '0');
  return `INV-${tenantPrefix}-${dateStr}-${sequence}`;
};

/**
 * Update invoice
 */
export const updateInvoice = async (tenantId, invoiceNumber, updateData) => {
  const subscription = await TenantSubscription.findOne({ tenantId });
  if (!subscription) {
    throw new Error(`No subscription found for tenant ${tenantId}`);
  }

  const invoice = subscription.paymentHistory.find(
    inv => inv.invoiceNumber === invoiceNumber
  );

  if (!invoice) {
    throw new Error(`Invoice not found: ${invoiceNumber}`);
  }

  // Update allowed fields
  const allowedFields = ['status', 'pdfUrl', 'description', 'amount'];
  allowedFields.forEach(field => {
    if (field in updateData) {
      invoice[field] = updateData[field];
    }
  });

  invoice.updatedAt = new Date();
  return subscription.save();
};

/**
 * Delete invoice
 */
export const deleteInvoice = async (tenantId, invoiceNumber) => {
  const subscription = await TenantSubscription.findOne({ tenantId });
  if (!subscription) {
    throw new Error(`No subscription found for tenant ${tenantId}`);
  }

  const index = subscription.paymentHistory.findIndex(
    inv => inv.invoiceNumber === invoiceNumber
  );

  if (index === -1) {
    throw new Error(`Invoice not found: ${invoiceNumber}`);
  }

  subscription.paymentHistory.splice(index, 1);
  return subscription.save();
};

/**
 * Get invoices by date range
 */
export const getInvoicesByDateRange = async (tenantId, startDate, endDate) => {
  const subscription = await TenantSubscription.findOne({ tenantId });
  if (!subscription) {
    return [];
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  return (subscription.paymentHistory || []).filter(inv => {
    const invDate = new Date(inv.date);
    return invDate >= start && invDate <= end;
  });
};

/**
 * Get invoices by plan type
 */
export const getInvoicesByPlan = async (tenantId, planType) => {
  const subscription = await TenantSubscription.findOne({ tenantId });
  if (!subscription) {
    return [];
  }

  return (subscription.paymentHistory || []).filter(
    inv => inv.planType === planType
  );
};

/**
 * Export invoices as CSV
 */
export const exportInvoicesAsCSV = async (tenantId) => {
  const invoices = await getAllInvoices(tenantId, { limit: 10000 });

  if (invoices.length === 0) {
    return '';
  }

  // CSV header
  const headers = [
    'Invoice Number',
    'Date',
    'Amount',
    'Plan Type',
    'Billing Cycle',
    'Status',
    'Period Start',
    'Period End',
    'PDF URL'
  ];

  // CSV rows
  const rows = invoices.map(inv => [
    inv.invoiceNumber || '',
    new Date(inv.date).toISOString().split('T')[0],
    inv.amount || 0,
    inv.planType || '',
    inv.billingCycle || '',
    inv.status || '',
    inv.periodStart ? new Date(inv.periodStart).toISOString().split('T')[0] : '',
    inv.periodEnd ? new Date(inv.periodEnd).toISOString().split('T')[0] : '',
    inv.pdfUrl || ''
  ]);

  // Combine
  const csv = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csv;
};

/**
 * Generate invoice summary
 */
export const generateInvoiceSummary = async (tenantId) => {
  const stats = await getInvoiceStats(tenantId);
  if (!stats) {
    return null;
  }

  return {
    totalInvoices: stats.totalInvoices,
    totalRevenue: stats.totalRevenue,
    avgInvoiceAmount: stats.avgInvoiceAmount,
    lastInvoiceDate: stats.lastInvoice?.date || null,
    invoiceByStatus: stats.byStatus,
    invoiceByPlan: stats.byPlan,
    invoiceByBillingCycle: stats.byBillingCycle
  };
};

export default {
  createInvoice,
  getInvoiceByNumber,
  getAllInvoices,
  getInvoiceStats,
  generateInvoiceNumber,
  updateInvoice,
  deleteInvoice,
  getInvoicesByDateRange,
  getInvoicesByPlan,
  exportInvoicesAsCSV,
  generateInvoiceSummary
};
