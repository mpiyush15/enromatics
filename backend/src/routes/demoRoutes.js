import express from "express";
import {
  createDemoRequest,
  getAllDemoRequests,
  getDemoRequestById,
  updateDemoRequestStatus,
  deleteDemoRequest,
  getDemoStats,
} from "../controllers/demoController.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route   POST /api/demo-requests
 * @desc    Create demo request (Public)
 * @access  Public
 */
router.post("/", createDemoRequest);

/**
 * @route   GET /api/demo-requests
 * @desc    Get all demo requests
 * @access  SuperAdmin only
 */
router.get("/", authenticate, getAllDemoRequests);

/**
 * @route   GET /api/demo-requests/stats
 * @desc    Get demo stats
 * @access  SuperAdmin only
 */
router.get("/stats", authenticate, getDemoStats);

/**
 * @route   GET /api/demo-requests/:id
 * @desc    Get single demo request
 * @access  SuperAdmin only
 */
router.get("/:id", authenticate, getDemoRequestById);

/**
 * @route   PUT /api/demo-requests/:id
 * @desc    Update demo request status
 * @access  SuperAdmin only
 */
router.put("/:id", authenticate, updateDemoRequestStatus);

/**
 * @route   DELETE /api/demo-requests/:id
 * @desc    Delete demo request
 * @access  SuperAdmin only
 */
router.delete("/:id", authenticate, deleteDemoRequest);

export default router;
