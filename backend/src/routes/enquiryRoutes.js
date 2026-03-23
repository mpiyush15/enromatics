/**
 * 📋 Enquiry Routes
 * Handles student enquiry/lead management endpoints
 * ✅ Multi-tenant ready - tenantProtect ensures tenant isolation
 * ✅ Auth protected - requires protect middleware first
 */

import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { tenantProtect } from "../middleware/tenantProtect.js";
import { 
  getAllEnquiries,
  getEnquiryById,
  createEnquiry,
  updateEnquiry,
  getEnquiryStats,
  getEnquiryTrends,
  getEnquiryByStatus
} from "../controllers/enquiryController.js";

const router = express.Router();

/**
 * @route   GET /api/enquiries
 * @desc    Get all enquiries for tenant with pagination & filters
 * @access  Private - tenantAdmin, staff
 * @query   status, page, limit, search
 */
router.get(
  "/",
  protect,
  tenantProtect,
  getAllEnquiries
);

/**
 * @route   GET /api/enquiries/stats
 * @desc    Get enquiry statistics (total, by status, conversion rate)
 * @access  Private - tenantAdmin
 * @returns { total, byStatus: {new, contacted, interested, enrolled, rejected}, conversionRate }
 */
router.get(
  "/stats",
  protect,
  tenantProtect,
  getEnquiryStats
);

/**
 * @route   GET /api/enquiries/trends
 * @desc    Get enquiry trends over time for dashboard
 * @access  Private - tenantAdmin
 * @returns array of {date, count, status breakdown}
 */
router.get(
  "/trends",
  protect,
  tenantProtect,
  getEnquiryTrends
);

/**
 * @route   GET /api/enquiries/by-status/:status
 * @desc    Get enquiries filtered by status
 * @access  Private - tenantAdmin
 * @param   status - new|contacted|interested|enrolled|rejected
 */
router.get(
  "/by-status/:status",
  protect,
  tenantProtect,
  getEnquiryByStatus
);

/**
 * @route   GET /api/enquiries/:id
 * @desc    Get single enquiry by ID
 * @access  Private - tenantAdmin
 */
router.get(
  "/:id",
  protect,
  tenantProtect,
  getEnquiryById
);

/**
 * @route   POST /api/enquiries
 * @desc    Create new enquiry
 * @access  Private - tenantAdmin, staff
 * @body    { studentName, email, phone, course, status, message, location }
 */
router.post(
  "/",
  protect,
  tenantProtect,
  createEnquiry
);

/**
 * @route   PUT /api/enquiries/:id
 * @desc    Update enquiry status/details
 * @access  Private - tenantAdmin, staff
 * @body    { status, notes, nextFollowUp, etc }
 */
router.put(
  "/:id",
  protect,
  tenantProtect,
  updateEnquiry
);

export default router;
