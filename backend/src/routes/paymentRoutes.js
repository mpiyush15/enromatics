import express from "express";
import { 
  addPayment, 
  deletePayment, 
  getReceipt,
  initiateSubscriptionPayment,
  verifySubscriptionPayment,
  cashfreeSubscriptionWebhook
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
