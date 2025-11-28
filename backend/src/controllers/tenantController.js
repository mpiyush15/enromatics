/**
 * Tenant Controller – handles upgrades, downgrades, subscription logic, and tenant management.
 * Enro Matics © 2025
 */

import Tenant from "../models/Tenant.js";
import crypto from "crypto";

/* ================================================================
   🔹 1. Upgrade Tenant Plan
================================================================ */
export const upgradeTenantPlan = async (req, res) => {
  try {
    const { tenantId, newPlan, paymentId } = req.body;

    if (!tenantId || !newPlan) {
      return res.status(400).json({ message: "Tenant ID and plan are required" });
    }

    const validPlans = ["pro", "enterprise"];
    if (!validPlans.includes(newPlan.toLowerCase())) {
      return res.status(400).json({ message: "Invalid plan type" });
    }

    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1);

    tenant.plan = newPlan.toLowerCase();
    tenant.subscription = {
      status: "active",
      paymentId: paymentId || `manual_${crypto.randomBytes(4).toString("hex")}`,
      startDate: now,
      endDate,
    };

    await tenant.save();

    res.status(200).json({
      message: `Plan upgraded to ${newPlan} successfully.`,
      plan: tenant.plan,
      subscription: tenant.subscription,
    });
  } catch (err) {
    console.error("Upgrade Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================================================
   🔹 2. Auto-Downgrade Expired Plans
================================================================ */
export const downgradeExpiredPlans = async (req, res) => {
  try {
    const today = new Date();

    const expiredTenants = await Tenant.find({
      "subscription.status": "active",
      "subscription.endDate": { $lte: today },
    });

    for (const tenant of expiredTenants) {
      tenant.plan = "free";
      tenant.subscription.status = "inactive";
      await tenant.save();
    }

    res.status(200).json({
      message: `${expiredTenants.length} tenants downgraded to free tier.`,
    });
  } catch (err) {
    console.error("Downgrade Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================================================
   🔹 3. Get Single Tenant Info
================================================================ */
export const getTenantInfo = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const tenant = await Tenant.findOne({ tenantId });

    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    res.status(200).json({
      success: true,
      tenant: {
        tenantId: tenant.tenantId,
        name: tenant.name,
        email: tenant.email,
        plan: tenant.plan,
        subscription: tenant.subscription,
        active: tenant.active,
        contact: tenant.contact,
        usage: tenant.usage,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
      }
    });
  } catch (err) {
    console.error("Tenant Info Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================================================
   🔹 3.1. Get Single Tenant Info (SuperAdmin Only - No tenantProtect)
================================================================ */
export const getSuperAdminTenantDetail = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const tenant = await Tenant.findOne({ tenantId });

    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    res.status(200).json({
      success: true,
      tenant: {
        _id: tenant._id,
        tenantId: tenant.tenantId,
        name: tenant.name,
        email: tenant.email,
        instituteName: tenant.instituteName,
        plan: tenant.plan,
        subscription: tenant.subscription,
        active: tenant.active,
        contact: tenant.contact,
        usage: tenant.usage,
        whatsappOptIn: tenant.whatsappOptIn,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
      }
    });
  } catch (err) {
    console.error("SuperAdmin Tenant Detail Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================================================
   🔹 3.5. Update Tenant Profile
================================================================ */
export const updateTenantProfile = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { name, email, contact, active } = req.body;

    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    // Only allow updating specific fields
    if (name) tenant.name = name;
    if (email) tenant.email = email;
    if (contact) {
      tenant.contact = {
        phone: contact.phone || tenant.contact?.phone,
        address: contact.address || tenant.contact?.address,
        city: contact.city || tenant.contact?.city,
        state: contact.state || tenant.contact?.state,
        country: contact.country || tenant.contact?.country || "India",
      };
    }
    // ✅ Support toggling active status (suspend/activate)
    if (active !== undefined) {
      tenant.active = active;
    }

    await tenant.save();

    console.log("✅ Tenant profile updated:", tenant.name);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      tenant: {
        tenantId: tenant.tenantId,
        name: tenant.name,
        email: tenant.email,
        plan: tenant.plan,
        subscription: tenant.subscription,
        active: tenant.active,
        contact: tenant.contact,
        usage: tenant.usage,
      }
    });
  } catch (err) {
    console.error("Update Tenant Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================================================
   🔹 4. Get All Tenants (for SuperAdmin Dashboard)
================================================================ */
export const getAllTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find().sort({ createdAt: -1 });

    res.status(200).json(
      tenants.map((tenant) => ({
        tenantId: tenant.tenantId,
        name: tenant.name,
        email: tenant.email,
        plan: tenant.plan,
        active: tenant.active,
        subscription: tenant.subscription,
        createdAt: tenant.createdAt,
      }))
    );
  } catch (err) {
    console.error("GetAllTenants Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================================================
   🔹 5. Delete Tenant (SuperAdmin Only)
================================================================ */
export const deleteTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;

    const tenant = await Tenant.findOneAndDelete({ tenantId });
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    res.status(200).json({ message: "Tenant deleted successfully" });
  } catch (err) {
    console.error("Delete Tenant Error:", err);
    res.status(500).json({ message: err.message });
  }
};
