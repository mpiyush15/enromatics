import express from "express";
import { 
  checkoutInitiate,
  getPlans,
  getPlanById
} from "../controllers/subscriptionCheckoutController.js";

const router = express.Router();

// Get all subscription plans
router.get("/plans", getPlans);

// Get specific plan details
router.get("/plans/:planId", getPlanById);

// Initiate checkout (handles both free and paid plans)
router.post("/checkout", checkoutInitiate);

export default router;
