import express from "express";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";

const router = express.Router();

// Middleware to check if user is SuperAdmin
const isSuperAdmin = (req, res, next) => {
  if (req.user?.role !== "SuperAdmin") {
    return res.status(403).json({ message: "Access denied. SuperAdmin role required." });
  }
  next();
};

// GET all tenants (SuperAdmin only)
router.get("/tenants", isSuperAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { tenantId: { $regex: search, $options: "i" } },
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
    }

    const total = await Tenant.countDocuments(query);
    const tenants = await Tenant.find(query)
      .select("-password")
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: tenants,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single tenant details (SuperAdmin only)
router.get("/tenants/:tenantId", isSuperAdmin, async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ tenantId: req.params.tenantId });

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Get tenant users count
    const userCount = await User.countDocuments({ tenantId: req.params.tenantId });

    res.json({
      success: true,
      data: {
        ...tenant.toObject(),
        userCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST create new tenant (SuperAdmin only)
router.post("/tenants", isSuperAdmin, async (req, res) => {
  try {
    const { tenantId, name, email, subdomain, instituteName, plan } = req.body;

    // Validate required fields
    if (!tenantId || !name || !email) {
      return res.status(400).json({
        message: "tenantId, name, and email are required",
      });
    }

    // Check if tenantId already exists
    const existingTenant = await Tenant.findOne({ tenantId });
    if (existingTenant) {
      return res.status(400).json({ message: "Tenant ID already exists" });
    }

    // Check if subdomain already exists (if provided)
    if (subdomain) {
      const existingSubdomain = await Tenant.findOne({ subdomain });
      if (existingSubdomain) {
        return res.status(400).json({ message: "Subdomain already in use" });
      }
    }

    const newTenant = new Tenant({
      tenantId,
      name,
      email,
      subdomain: subdomain || tenantId.toLowerCase(),
      instituteName: instituteName || name,
      plan: plan || "trial",
      subscription: {
        status: "trial",
        trialStartDate: new Date(),
      },
    });

    await newTenant.save();

    res.status(201).json({
      success: true,
      message: "Tenant created successfully",
      data: newTenant,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update tenant (SuperAdmin only)
router.put("/tenants/:tenantId", isSuperAdmin, async (req, res) => {
  try {
    const { name, email, instituteName, plan, subdomain } = req.body;

    // Check subdomain uniqueness if being changed
    if (subdomain) {
      const existingSubdomain = await Tenant.findOne({
        subdomain,
        tenantId: { $ne: req.params.tenantId },
      });
      if (existingSubdomain) {
        return res.status(400).json({ message: "Subdomain already in use" });
      }
    }

    const tenant = await Tenant.findOneAndUpdate(
      { tenantId: req.params.tenantId },
      { name, email, instituteName, plan, subdomain },
      { new: true }
    );

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    res.json({
      success: true,
      message: "Tenant updated successfully",
      data: tenant,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE tenant (SuperAdmin only)
router.delete("/tenants/:tenantId", isSuperAdmin, async (req, res) => {
  try {
    const tenant = await Tenant.findOneAndDelete({ tenantId: req.params.tenantId });

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Delete all users of this tenant
    await User.deleteMany({ tenantId: req.params.tenantId });

    res.json({
      success: true,
      message: "Tenant and associated users deleted successfully",
      data: tenant,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all users (SuperAdmin only)
router.get("/users", isSuperAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, tenantId, role, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (tenantId) query.tenantId = tenantId;
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-password")
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update user (SuperAdmin only)
router.put("/users/:userId", isSuperAdmin, async (req, res) => {
  try {
    const { name, email, role, status } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { name, email, role, status },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE user (SuperAdmin only)
router.delete("/users/:userId", isSuperAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      message: "User deleted successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET dashboard stats (SuperAdmin only)
router.get("/stats", isSuperAdmin, async (req, res) => {
  try {
    const totalTenants = await Tenant.countDocuments();
    const activeTenants = await Tenant.countDocuments({
      "subscription.status": "active",
    });
    const totalUsers = await User.countDocuments();
    const superAdmins = await User.countDocuments({ role: "SuperAdmin" });

    res.json({
      success: true,
      data: {
        totalTenants,
        activeTenants,
        totalUsers,
        superAdmins,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
