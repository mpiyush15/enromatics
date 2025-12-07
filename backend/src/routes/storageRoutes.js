// Routes for storage usage analytics and reporting

import express from 'express';
import { getStorageUsageReport, getTenantStorageStatus } from '../controllers/storageUsageController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

/**
 * GET /api/storage/report
 * SuperAdmin only: Get S3 usage report for all tenants (for billing)
 */
router.get('/report', protect, authorizeRoles('SuperAdmin'), getStorageUsageReport);

/**
 * GET /api/storage/status
 * Tenant/User: Get their own storage usage status
 */
router.get('/status', protect, getTenantStorageStatus);

export default router;
