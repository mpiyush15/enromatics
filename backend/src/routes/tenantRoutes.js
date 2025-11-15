/**
 * Tenant Routes – Manage tenants, plans, and access control
 * Enro Matics © 2025
 */

import express from "express";
import {
  upgradeTenantPlan,
  downgradeExpiredPlans,
  getTenantInfo,
  updateTenantProfile,
  getAllTenants,
  deleteTenant,
} from "../controllers/tenantController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { tenantProtect } from "../middleware/tenantProtect.js";

const router = express.Router();

/**
 * @route   GET /api/tenants
 * @desc    Fetch all tenants (for superadmin dashboard)
 * @access  Private – superadmin only
 */
router.get(
  "/",
  protect,
  authorizeRoles("SuperAdmin"),
  getAllTenants
);

/**
 * @route   GET /api/tenants/:tenantId
 * @desc    Fetch single tenant info for dashboard
 * @access  Private – tenantAdmin (own tenant) or superadmin
 */
router.get(
  "/:tenantId",
  protect,
  authorizeRoles("tenantAdmin", "SuperAdmin"),
  tenantProtect,
  getTenantInfo
);

/**
 * @route   PUT /api/tenants/:tenantId
 * @desc    Update tenant profile information
 * @access  Private – tenantAdmin (own tenant) or superadmin
 */
router.put(
  "/:tenantId",
  protect,
  authorizeRoles("tenantAdmin", "SuperAdmin"),
  tenantProtect,
  updateTenantProfile
);

/**
 * @route   PUT /api/tenants/upgrade
 * @desc    Upgrade tenant plan (after payment)
 * @access  Private – tenantAdmin or superadmin
 */
router.put(
  "/upgrade",
  protect,
  authorizeRoles("tenantAdmin", "superadmin"),
  upgradeTenantPlan
);

/**
 * @route   PUT /api/tenants/downgrade
 * @desc    Auto downgrade expired or inactive tenants
 * @access  Private – superadmin only
 */
router.put(
  "/downgrade",
  protect,
  authorizeRoles("superadmin"),
  downgradeExpiredPlans
);

/**
 * @route   DELETE /api/tenants/:tenantId
 * @desc    Delete or deactivate a tenant
 * @access  Private – superadmin only
 */
router.delete(
  "/:tenantId",
  protect,
  authorizeRoles("superadmin"),
  deleteTenant
);

export default router;
