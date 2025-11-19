import express from "express";
import {
  getBatches,
  getBatchById,
  createBatch,
  updateBatch,
  deleteBatch,
} from "../controllers/batchController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All routes require authentication and tenantAdmin role
router.use(protect);
router.use(authorizeRoles("tenantAdmin", "teacher", "staff"));

// Get all batches for the tenant
router.get("/", getBatches);

// Get single batch
router.get("/:id", getBatchById);

// Create new batch (tenantAdmin only)
router.post("/", authorizeRoles("tenantAdmin"), createBatch);

// Update batch (tenantAdmin only)
router.put("/:id", authorizeRoles("tenantAdmin"), updateBatch);

// Delete batch (tenantAdmin only)
router.delete("/:id", authorizeRoles("tenantAdmin"), deleteBatch);

export default router;
