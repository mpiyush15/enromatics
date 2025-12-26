import express from "express";
import SubscriptionPlan from "../models/SubscriptionPlan.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

// ============================================
// GET ALL PLANS (SuperAdmin)
// ============================================
router.get("/", protect, authorizeRoles("SuperAdmin"), async (req, res) => {
  try {
    const { status, isVisible, page = 1, limit = 10 } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (isVisible !== undefined) filter.isVisible = isVisible === "true";

    const plans = await SubscriptionPlan.find(filter)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SubscriptionPlan.countDocuments(filter);

    res.status(200).json({
      success: true,
      plans,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching plans:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================
// GET SINGLE PLAN (SuperAdmin)
// ============================================
router.get("/:id", protect, authorizeRoles("SuperAdmin"), async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    res.status(200).json({
      success: true,
      plan,
    });
  } catch (error) {
    console.error("Error fetching plan:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================
// CREATE NEW PLAN (SuperAdmin)
// ============================================
router.post("/", protect, authorizeRoles("SuperAdmin"), async (req, res) => {
  try {
    const {
      name,
      id,
      description,
      monthlyPrice,
      annualPrice,
      quotas,
      features,
      highlightFeatures,
      buttonLabel,
      popular,
      status,
      isVisible,
    } = req.body;

    // Validation
    if (!name || !id || !description) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, id, description",
      });
    }

    // Check if plan already exists
    const existingPlan = await SubscriptionPlan.findOne({
      $or: [{ name }, { id }],
    });

    if (existingPlan) {
      return res.status(400).json({
        success: false,
        message: "Plan with this name or ID already exists",
      });
    }

    // Create new plan
    const newPlan = new SubscriptionPlan({
      name,
      id,
      description,
      monthlyPrice: monthlyPrice || 0,
      annualPrice: annualPrice || 0,
      quotas: quotas || {
        students: 100,
        staff: 5,
        storage: "Standard",
        concurrentTests: 1,
      },
      features: features || [],
      highlightFeatures: highlightFeatures || [],
      buttonLabel: buttonLabel || "Get Started",
      popular: popular || false,
      status: status || "active",
      isVisible: isVisible !== false,
      createdBy: req.user._id,
    });

    await newPlan.save();

    res.status(201).json({
      success: true,
      message: "Plan created successfully",
      plan: newPlan,
    });
  } catch (error) {
    console.error("Error creating plan:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================
// UPDATE PLAN (SuperAdmin)
// ============================================
router.put("/:id", protect, authorizeRoles("SuperAdmin"), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      monthlyPrice,
      annualPrice,
      quotas,
      features,
      highlightFeatures,
      buttonLabel,
      popular,
      status,
      isVisible,
    } = req.body;

    // Find plan
    const plan = await SubscriptionPlan.findById(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    // Check if name change conflicts with another plan
    if (name && name !== plan.name) {
      const existingPlan = await SubscriptionPlan.findOne({ name });
      if (existingPlan) {
        return res.status(400).json({
          success: false,
          message: "Plan with this name already exists",
        });
      }
    }

    // Update fields
    if (name) plan.name = name;
    if (description) plan.description = description;
    if (monthlyPrice !== undefined) plan.monthlyPrice = monthlyPrice;
    if (annualPrice !== undefined) plan.annualPrice = annualPrice;
    if (quotas) plan.quotas = { ...plan.quotas, ...quotas };
    if (features) plan.features = features;
    if (highlightFeatures) plan.highlightFeatures = highlightFeatures;
    if (buttonLabel) plan.buttonLabel = buttonLabel;
    if (popular !== undefined) plan.popular = popular;
    if (status) plan.status = status;
    if (isVisible !== undefined) plan.isVisible = isVisible;

    plan.updatedBy = req.user._id;

    await plan.save();

    res.status(200).json({
      success: true,
      message: "Plan updated successfully",
      plan,
    });
  } catch (error) {
    console.error("Error updating plan:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================
// PATCH PLAN (Partial Update - SuperAdmin)
// For quick updates like price, visibility, features
// ============================================
router.patch("/:id", protect, authorizeRoles("SuperAdmin"), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find plan
    const plan = await SubscriptionPlan.findById(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    // Update only provided fields
    if (updateData.monthlyPrice !== undefined) plan.monthlyPrice = updateData.monthlyPrice;
    if (updateData.annualPrice !== undefined) plan.annualPrice = updateData.annualPrice;
    if (updateData.features !== undefined) plan.features = updateData.features;
    if (updateData.isVisible !== undefined) plan.isVisible = updateData.isVisible;
    if (updateData.popular !== undefined) plan.popular = updateData.popular;
    if (updateData.status !== undefined) plan.status = updateData.status;
    if (updateData.highlightFeatures !== undefined) plan.highlightFeatures = updateData.highlightFeatures;

    plan.updatedBy = req.user._id;

    await plan.save();

    res.status(200).json({
      success: true,
      message: "Plan updated successfully",
      plan,
    });
  } catch (error) {
    console.error("Error patching plan:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ============================================
// DELETE PLAN (SuperAdmin)
// ============================================
router.delete(
  "/:id",
  protect,
  authorizeRoles("SuperAdmin"),
  async (req, res) => {
    try {
      const plan = await SubscriptionPlan.findByIdAndDelete(req.params.id);

      if (!plan) {
        return res.status(404).json({
          success: false,
          message: "Plan not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Plan deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting plan:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// ============================================
// GET PUBLIC PLANS (No auth required - for pricing page)
// ============================================
router.get("/public/all", async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({
      status: "active",
      isVisible: true,
    })
      .select("-createdBy -updatedBy -__v")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      plans,
    });
  } catch (error) {
    console.error("Error fetching public plans:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
