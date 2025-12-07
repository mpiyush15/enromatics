import path from 'path';
import { fileURLToPath } from 'url';
import { computeTenantStorageGB } from '../../lib/s3StorageUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy-require planGuard
// eslint-disable-next-line @typescript-eslint/no-var-requires
const planGuard = require(path.join(__dirname, '..', '..', 'lib', 'planGuard.js'));

/**
 * Storage cap enforcement middleware for study materials
 * Computes current storage usage from S3 and enforces plan limits
 * Warns at 80%, blocks at 100%
 */
export const storageCapCheck = async (req, res, next) => {
  try {
    const tenantId = req.user?.tenantId;
    const tierKey = req.user?.subscriptionTier || 'basic';

    if (!tenantId) return res.status(403).json({ message: 'Tenant ID missing' });

    // Compute current storage usage from S3 listing
    const currentStorageGB = await computeTenantStorageGB(tenantId);

    const capCheck = planGuard.checkStorageCap({ tierKey, usedGB: currentStorageGB });

    // Add cap info to request for controller use
    req.storageStatus = capCheck;

    // Warn at 80%
    if (capCheck.cap && currentStorageGB >= capCheck.cap * 0.8) {
      res.setHeader('X-Storage-Warning', 'true');
      console.warn(`Storage warning for tenant ${tenantId}: ${currentStorageGB}/${capCheck.cap} GB`);
    }

    // Block at 100%
    if (!capCheck.allowed) {
      return res.status(402).json({
        success: false,
        code: 'storage_cap_reached',
        message: `Storage limit reached (${capCheck.cap} GB). Please upgrade to ${capCheck.upgradeTo || 'a higher plan'}.`,
        details: capCheck,
      });
    }

    next();
  } catch (err) {
    console.error('Storage cap check error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
