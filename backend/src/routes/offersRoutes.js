import express from "express";
import Offer from "../models/Offer.js";
import { authenticate, authorizeRoles } from "../middleware/auth.js";
import Subscription from "../models/Subscription.js";

const router = express.Router();

// ============================================
// SUPERADMIN: CREATE OFFER
// ============================================
router.post("/", authenticate, authorizeRoles("superadmin"), async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      discountType,
      discountValue,
      maxDiscountAmount,
      validFrom,
      validUntil,
      applicableTo,
      planIds,
      maxUsageCount,
      maxUsagePerUser,
      minimumOrderValue,
    } = req.body;

    // Validation
    if (!name || !code || !discountType || discountValue === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, code, discountType, discountValue",
      });
    }

    // Check if code already exists
    const existingOffer = await Offer.findOne({ code: code.toUpperCase() });
    if (existingOffer) {
      return res.status(400).json({
        success: false,
        message: "Offer code already exists",
      });
    }

    // Validate dates
    if (new Date(validFrom) >= new Date(validUntil)) {
      return res.status(400).json({
        success: false,
        message: "validFrom must be before validUntil",
      });
    }

    // Validate discount value
    if (discountType === "percentage" && (discountValue < 0 || discountValue > 100)) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount must be between 0 and 100",
      });
    }

    if (discountType === "flat" && discountValue < 0) {
      return res.status(400).json({
        success: false,
        message: "Flat discount cannot be negative",
      });
    }

    // Create offer
    const newOffer = new Offer({
      name,
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      maxDiscountAmount,
      validFrom,
      validUntil,
      applicableTo: applicableTo || "all_plans",
      planIds: applicableTo === "specific_plans" ? planIds : [],
      maxUsageCount,
      maxUsagePerUser: maxUsagePerUser || 1,
      minimumOrderValue: minimumOrderValue || 0,
      createdBy: req.user._id,
      status: "active",
    });

    await newOffer.save();

    res.status(201).json({
      success: true,
      message: "Offer created successfully",
      offer: newOffer,
    });
  } catch (error) {
    console.error("Error creating offer:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================
// GET ALL OFFERS (Superadmin)
// ============================================
router.get("/", authenticate, authorizeRoles("superadmin"), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, isActive } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const offers = await Offer.find(filter)
      .populate("planIds", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Offer.countDocuments(filter);

    res.status(200).json({
      success: true,
      offers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching offers:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================
// GET SINGLE OFFER
// ============================================
router.get("/:id", authenticate, authorizeRoles("superadmin"), async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id)
      .populate("planIds", "name")
      .populate("createdBy", "name email");

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    res.status(200).json({
      success: true,
      offer,
    });
  } catch (error) {
    console.error("Error fetching offer:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================
// UPDATE OFFER
// ============================================
router.put("/:id", authenticate, authorizeRoles("superadmin"), async (req, res) => {
  try {
    const { name, description, discountType, discountValue, maxDiscountAmount, validUntil, isActive, planIds } = req.body;

    let offer = await Offer.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    // Update fields
    if (name) offer.name = name;
    if (description) offer.description = description;
    if (discountType) offer.discountType = discountType;
    if (discountValue !== undefined) offer.discountValue = discountValue;
    if (maxDiscountAmount !== undefined) offer.maxDiscountAmount = maxDiscountAmount;
    if (validUntil) offer.validUntil = validUntil;
    if (isActive !== undefined) offer.isActive = isActive;
    if (planIds) offer.planIds = planIds;

    await offer.save();

    res.status(200).json({
      success: true,
      message: "Offer updated successfully",
      offer,
    });
  } catch (error) {
    console.error("Error updating offer:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================
// DELETE OFFER
// ============================================
router.delete("/:id", authenticate, authorizeRoles("superadmin"), async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Offer deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting offer:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================
// VALIDATE OFFER (For checkout)
// ============================================
router.post("/validate/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const { planId, totalAmount } = req.body;

    const offer = await Offer.findOne({ code: code.toUpperCase() });

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer code not found",
      });
    }

    // Check if valid
    if (!offer.isValid()) {
      return res.status(400).json({
        success: false,
        message: "This offer has expired or is no longer available",
      });
    }

    // Check if eligible for plan
    if (!offer.isEligibleForPlan(planId)) {
      return res.status(400).json({
        success: false,
        message: "This offer is not applicable to the selected plan",
      });
    }

    // Check minimum order value
    if (totalAmount < offer.minimumOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value of ₹${offer.minimumOrderValue} required`,
      });
    }

    // Calculate discount
    const discount = offer.calculateDiscount(totalAmount);
    const finalAmount = totalAmount - discount;

    res.status(200).json({
      success: true,
      offer: {
        id: offer._id,
        code: offer.code,
        name: offer.name,
        discountType: offer.discountType,
        discountValue: offer.discountValue,
      },
      discount,
      finalAmount,
    });
  } catch (error) {
    console.error("Error validating offer:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================
// APPLY OFFER (During subscription)
// ============================================
router.post("/apply/:code", authenticate, async (req, res) => {
  try {
    const { code } = req.params;
    const { planId, totalAmount } = req.body;

    const offer = await Offer.findOne({ code: code.toUpperCase() });

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer code not found",
      });
    }

    if (!offer.isValid()) {
      return res.status(400).json({
        success: false,
        message: "This offer has expired",
      });
    }

    if (!offer.isEligibleForPlan(planId)) {
      return res.status(400).json({
        success: false,
        message: "Offer not applicable to this plan",
      });
    }

    if (totalAmount < offer.minimumOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value required: ₹${offer.minimumOrderValue}`,
      });
    }

    // Calculate discount
    const discount = offer.calculateDiscount(totalAmount);

    // Update offer usage
    offer.usageCount += 1;
    offer.totalRedemptions += 1;
    offer.totalDiscountGiven += discount;
    await offer.save();

    res.status(200).json({
      success: true,
      message: "Offer applied successfully",
      discount,
      finalAmount: totalAmount - discount,
    });
  } catch (error) {
    console.error("Error applying offer:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
