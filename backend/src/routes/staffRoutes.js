import express from "express";
import {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  updateStaffStatus,
  updateStaffPermissions,
  getStaffStats,
} from "../controllers/staffController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Staff CRUD operations
router.post("/", createStaff);
router.get("/", getAllStaff);
router.get("/stats", getStaffStats);
router.get("/:id", getStaffById);
router.put("/:id", updateStaff);
router.delete("/:id", deleteStaff);

// Update staff status
router.patch("/:id/status", updateStaffStatus);

// Update staff permissions
router.patch("/:id/permissions", updateStaffPermissions);

export default router;
