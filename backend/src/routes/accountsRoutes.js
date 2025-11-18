import express from "express";
import {
  getAccountsOverview,
  searchStudentsForReceipt,
  generateReceipt,
  createPaymentWithReceipt,
  getExpenses,
  createExpense,
  getRefunds,
  createRefund,
  updateRefundStatus
} from "../controllers/accountsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

// All routes require authentication and proper role
// Note: tenantId is validated within each controller function
// Staff are BLOCKED from accessing accounts section
router.use(protect);
router.use(authorizeRoles("tenantAdmin", "accountant", "teacher"));
// Note: staff removed from authorizeRoles above to completely block them

// Accounts overview/dashboard
router.get("/overview", getAccountsOverview);

// Receipt management
router.get("/receipts/search", searchStudentsForReceipt);
router.post("/receipts/generate/:paymentId", generateReceipt);
router.post("/receipts/create", createPaymentWithReceipt);

// Expenses
router.get("/expenses", getExpenses);
router.post("/expenses", createExpense);

// Refunds
router.get("/refunds", getRefunds);
router.post("/refunds", createRefund);
router.patch("/refunds/:id", updateRefundStatus);

export default router;
