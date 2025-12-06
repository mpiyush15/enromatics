import express from "express";
import { 
  addPayment, 
  deletePayment, 
  getReceipt,
  initiateSubscriptionPayment,
  verifySubscriptionPayment,
  cashfreeSubscriptionWebhook,
  devMarkOrderPaid,
  getAllSubscriptionPayments,
  getAllSubscribers,
  getSubscriptionStats,
  downloadInvoice,
  sendInvoiceEmail
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { protectStudent } from "../middleware/protectStudent.js";
import { requirePermission } from "../middleware/permissionMiddleware.js";

const router = express.Router();

// ============== SUBSCRIPTION PAYMENT ROUTES ==============
// Initiate subscription payment (public - for new subscriptions)
router.post("/initiate-subscription", initiateSubscriptionPayment);
// Verify subscription payment status
router.get("/verify-subscription", verifySubscriptionPayment);
// Cashfree webhook for payment status updates
router.post("/webhook/cashfree", cashfreeSubscriptionWebhook);

// Dev-only: mark an order as PAID for testing (requires DEV_TEST_VERIFY env var)
router.post('/dev/mark-paid', devMarkOrderPaid);

// ============== SUPERADMIN SUBSCRIPTION MANAGEMENT ==============
// Get all subscription payments (invoices) - SuperAdmin only
router.get("/admin/subscriptions", protect, authorizeRoles("SuperAdmin"), getAllSubscriptionPayments);
// Get all active subscribers - SuperAdmin only
router.get("/admin/subscribers", protect, authorizeRoles("SuperAdmin"), getAllSubscribers);
// Get subscription stats - SuperAdmin only
router.get("/admin/stats", protect, authorizeRoles("SuperAdmin"), getSubscriptionStats);
// Download invoice PDF - SuperAdmin only
router.get("/admin/invoices/:tenantId/download", protect, authorizeRoles("SuperAdmin"), downloadInvoice);
// Send invoice via email - SuperAdmin only
router.post("/admin/invoices/:tenantId/send", protect, authorizeRoles("SuperAdmin"), sendInvoiceEmail);

// ============== STUDENT FEE PAYMENT ROUTES ==============
// Employees can create fees if they have canCreateFees permission
router.post("/", protect, authorizeRoles("tenantAdmin", "teacher", "staff"), requirePermission("canCreateFees"), addPayment);
router.delete("/:id", protect, authorizeRoles("tenantAdmin", "teacher", "staff"), requirePermission("canCreateFees"), deletePayment);
// allow student to download their own receipt too
// Admin route to download any receipt
router.get("/:id/receipt", protect, authorizeRoles("tenantAdmin", "teacher", "staff"), getReceipt);
// Student route to download their own receipt
router.get("/:id/receipt/download", protectStudent, getReceipt);

export default router;
