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
  getSuperAdminTenantDetail,
  createNewTenant,
  sendTenantCredentials,
  cancelSubscription,
  checkOnboarding,
  checkSubdomainAvailability,
  saveBranding,
  getTenantBySubdomain,
  getTenantDashboard,
  authenticateTenantUser,
  uploadLogo,
} from "../controllers/tenantController.js";
import {
  getPaymentHistory,
  getPaymentById,
  downloadInvoice,
  generateInvoice,
} from "../controllers/subscriptionPaymentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { tenantProtect } from "../middleware/tenantProtect.js";
import multer from "multer";

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
 * @route   POST /api/tenants/create
 * @desc    Create new tenant (superadmin creates demo accounts)
 * @access  Private – superadmin only
 */
router.post(
  "/create",
  protect,
  authorizeRoles("SuperAdmin"),
  createNewTenant
);

/* ============================================================
   PUBLIC WHITE-LABEL ROUTES (No Auth Required)
============================================================ */

/**
 * @route   GET /api/tenants/check-subdomain?subdomain=myschool
 * @desc    Check if subdomain is available
 * @access  Public
 */
router.get(
  "/check-subdomain",
  checkSubdomainAvailability
);

/**
 * @route   POST /api/tenants/authenticate
 * @desc    Authenticate tenant user for branded portal login
 * @access  Public
 */
router.post(
  "/authenticate",
  authenticateTenantUser
);

/**
 * @route   GET /api/tenants/by-subdomain/:subdomain
 * @desc    Fetch public tenant branding info by subdomain (for login page)
 * @access  Public
 */
router.get(
  "/by-subdomain/:subdomain",
  getTenantBySubdomain
);

/**
 * @route   GET /api/admin/:tenantId
 * @desc    Fetch single tenant info for superadmin (NO tenantProtect)
 * @access  Private – superadmin only
 */
router.get(
  "/admin/:tenantId",
  protect,
  authorizeRoles("SuperAdmin"),
  getSuperAdminTenantDetail
);

/**
 * @route   PUT /api/tenants/admin/:tenantId
 * @desc    Update tenant for superadmin (suspend/activate) - NO tenantProtect
 * @access  Private – superadmin only
 */
router.put(
  "/admin/:tenantId",
  protect,
  authorizeRoles("SuperAdmin"),
  updateTenantProfile
);

/**
 * @route   POST /api/tenants/:tenantId/send-credentials
 * @desc    Send login credentials email to tenant (create user if needed)
 * @access  Private – superadmin only
 */
router.post(
  "/:tenantId/send-credentials",
  protect,
  authorizeRoles("SuperAdmin"),
  sendTenantCredentials
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
 * @route   POST /api/tenants/:tenantId/cancel-subscription
 * @desc    Cancel tenant subscription
 * @access  Private – tenantAdmin (own tenant) or superadmin
 */
router.post(
  "/:tenantId/cancel-subscription",
  protect,
  authorizeRoles("tenantAdmin", "SuperAdmin"),
  tenantProtect,
  cancelSubscription
);

/**
 * @route   GET /api/tenants/:tenantId/payments
 * @desc    Get payment history for tenant
 * @access  Private – tenantAdmin (own tenant) or superadmin
 */
router.get(
  "/:tenantId/payments",
  protect,
  authorizeRoles("tenantAdmin", "SuperAdmin"),
  tenantProtect,
  getPaymentHistory
);

/**
 * @route   GET /api/tenants/:tenantId/payments/:paymentId
 * @desc    Get single payment details
 * @access  Private – tenantAdmin (own tenant) or superadmin
 */
router.get(
  "/:tenantId/payments/:paymentId",
  protect,
  authorizeRoles("tenantAdmin", "SuperAdmin"),
  tenantProtect,
  getPaymentById
);

/**
 * @route   GET /api/tenants/:tenantId/payments/:paymentId/invoice
 * @desc    Generate and download invoice PDF
 * @access  Private – tenantAdmin (own tenant) or superadmin
 */
router.get(
  "/:tenantId/payments/:paymentId/invoice",
  protect,
  authorizeRoles("tenantAdmin", "SuperAdmin"),
  tenantProtect,
  downloadInvoice
);

/**
 * @route   POST /api/tenants/:tenantId/payments/:paymentId/generate-invoice
 * @desc    Generate invoice PDF and upload to S3
 * @access  Private – tenantAdmin (own tenant) or superadmin
 */
router.post(
  "/:tenantId/payments/:paymentId/generate-invoice",
  protect,
  authorizeRoles("tenantAdmin", "SuperAdmin"),
  tenantProtect,
  generateInvoice
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

/* ============================================================
   WHITE-LABEL ONBOARDING ROUTES (Private)
============================================================ */

/**
 * @route   GET /api/tenants/:tenantId/check-onboarding
 * @desc    Check if tenant needs to complete onboarding
 * @access  Private – tenantAdmin (own tenant)
 */
router.get(
  "/:tenantId/check-onboarding",
  protect,
  authorizeRoles("tenantAdmin", "SuperAdmin"),
  checkOnboarding
);

/**
 * @route   POST /api/tenants/:tenantId/branding
 * @desc    Save branding configuration (subdomain, logo, colors, etc.)
 * @access  Private – tenantAdmin (own tenant)
 */
router.post(
  "/:tenantId/branding",
  protect,
  authorizeRoles("tenantAdmin", "SuperAdmin"),
  tenantProtect,
  saveBranding
);

/**
 * @route   GET /api/tenants/by-subdomain/:subdomain/dashboard
 * @desc    Fetch tenant dashboard analytics data
 * @access  Private – Bearer token required (tenant user)
 */
router.get(
  "/by-subdomain/:subdomain/dashboard",
  protect,
  getTenantDashboard
);

/**
 * @route   POST /api/upload/logo
 * @desc    Upload logo file to S3
 * @access  Private – tenantAdmin
 */
// Configure multer for file upload
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post(
  "/upload/logo",
  protect,
  authorizeRoles("tenantAdmin", "SuperAdmin"),
  upload.single('file'),
  uploadLogo
);

export default router;
