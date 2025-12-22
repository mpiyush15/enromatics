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
  updateRefundStatus,
  getFinancialReports,
  getFeesPendingStudents,
  getAllTransactions
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

// Financial reports (Profit & Loss)
router.get("/reports", getFinancialReports);

// Fees pending students
router.get("/fees-pending", getFeesPendingStudents);

// Receipt management
router.get("/receipts/search", searchStudentsForReceipt);
router.post("/receipts/generate/:paymentId", generateReceipt);
router.post("/receipts/create", createPaymentWithReceipt);

// All transactions (payments + refunds combined)
router.get("/transactions", getAllTransactions);

// Expenses
router.get("/expenses", getExpenses);
router.post("/expenses", createExpense);

// Refunds
router.get("/refunds", getRefunds);
router.post("/refunds", createRefund);
router.patch("/refunds/:id", updateRefundStatus);

export default router;
