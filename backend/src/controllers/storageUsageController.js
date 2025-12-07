// SuperAdmin S3 usage analytics controller
// Tracks storage usage per tenant for billing and resource planning

import Tenant from '../models/Tenant.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { computeTenantStorageGB } from '../../lib/s3StorageUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy-require planGuard for tier info
const planGuard = require(path.join(__dirname, '..', '..', 'lib', 'planGuard.js'));

/**
 * Get S3 storage usage report for all tenants
 * Used by SuperAdmin to track billing and resource usage
 */
export const getStorageUsageReport = async (req, res) => {
  try {
    // Fetch all active tenants
    const tenants = await Tenant.find({ active: true })
      .select('tenantId name instituteName plan subscription.status subscription.billingCycle')
      .lean();

    if (!tenants.length) {
      return res.status(200).json({ success: true, report: [], totalUsageGB: 0 });
    }

    // Compute storage for each tenant (in parallel with Promise.all for speed)
    const report = await Promise.all(
      tenants.map(async (tenant) => {
        const usageGB = await computeTenantStorageGB(tenant.tenantId);
        const tierConfig = planGuard.getTierConfig(tenant.plan);
        const cap = tierConfig.quotas.storageGB;

        return {
          tenantId: tenant.tenantId,
          instituteName: tenant.instituteName || tenant.name,
          plan: tenant.plan,
          subscriptionStatus: tenant.subscription?.status || 'inactive',
          usageGB,
          capGB: cap,
          percentUsed: cap ? Math.round((usageGB / cap) * 100) : 0,
          billingCycle: tenant.subscription?.billingCycle || 'monthly',
        };
      })
    );

    // Sort by usage (highest first)
    report.sort((a, b) => b.usageGB - a.usageGB);

    // Calculate totals
    const totalUsageGB = report.reduce((sum, r) => sum + r.usageGB, 0);
    const totalCapGB = report.reduce((sum, r) => (r.capGB || 0), 0);

    res.status(200).json({
      success: true,
      generatedAt: new Date().toISOString(),
      summary: {
        totalTenants: report.length,
        totalUsageGB: Math.round(totalUsageGB * 100) / 100,
        totalCapGB: totalCapGB || 'unlimited',
        averageUsagePerTenant: Math.round((totalUsageGB / report.length) * 100) / 100,
      },
      report,
    });
  } catch (err) {
    console.error('Storage usage report error:', err);
    res.status(500).json({ message: 'Failed to generate report' });
  }
};

/**
 * Get storage usage for a specific tenant (for tenant's own dashboard)
 */
export const getTenantStorageStatus = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: 'Tenant ID missing' });

    const tenant = await Tenant.findOne({ tenantId }).select('plan').lean();
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    const usageGB = await computeTenantStorageGB(tenantId);
    const tierConfig = planGuard.getTierConfig(tenant.plan);
    const cap = tierConfig.quotas.storageGB;

    res.status(200).json({
      success: true,
      usageGB,
      capGB: cap,
      percentUsed: cap ? Math.round((usageGB / cap) * 100) : 0,
      plan: tenant.plan,
      upgradeUrl: cap && usageGB >= cap * 0.8 ? '/pricing' : null,
    });
  } catch (err) {
    console.error('Tenant storage status error:', err);
    res.status(500).json({ message: 'Failed to fetch storage status' });
  }
};
