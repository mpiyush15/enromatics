/**
 * Tenant Controller – handles upgrades, downgrades, subscription logic, and tenant management.
 * Enro Matics © 2025
 */

import Tenant from "../models/Tenant.js";
import User from "../models/User.js";
import crypto from "crypto";
import {
  sendTenantRegistrationEmail,
  sendWelcomeEmail,
  sendEmail,
  sendSubscriptionConfirmationEmail,
  sendCredentialsEmail
} from "../services/emailService.js";

// Generate random 6-digit password
const generatePassword = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/* ================================================================
   🔹 Get Tenant by Subdomain (PUBLIC - for login page branding)
================================================================ */
export const getTenantBySubdomain = async (req, res) => {
  try {
    const { subdomain } = req.params;

    if (!subdomain) {
      return res.status(400).json({ message: "Subdomain is required" });
    }

    console.log('🎨 Fetching tenant by subdomain:', subdomain);

    // Find tenant by subdomain OR tenantId (since tenantId is used as subdomain in URLs)
    const tenant = await Tenant.findOne({ 
      $or: [
        { subdomain: subdomain },
        { tenantId: subdomain }
      ]
    });

    if (!tenant) {
      console.log('❌ Tenant not found for subdomain:', subdomain);
      return res.status(404).json({ message: "Tenant not found" });
    }

    console.log('✅ Tenant found:', tenant.instituteName || tenant.name);

    // Return only public branding information (no sensitive data)
    return res.status(200).json({
      subdomain: tenant.subdomain,
      tenantId: tenant.tenantId,
      instituteName: tenant.instituteName || tenant.name,
      name: tenant.name,
      branding: {
        logo: tenant.branding?.logo || null,
        primaryColor: tenant.branding?.primaryColor || '#3B82F6',
        secondaryColor: tenant.branding?.secondaryColor || '#6366F1',
      },
    });

  } catch (error) {
    console.error('❌ Error fetching tenant by subdomain:', error.message);
    return res.status(500).json({ 
      message: "Error fetching tenant information",
      error: error.message 
    });
  }
};

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

    // Send plan upgrade email to tenant
    sendSubscriptionConfirmationEmail({
      to: tenant.email,
      subscriptionDetails: {
        planName: tenant.plan,
        amount: tenant.subscription?.amount || 'N/A',
        billingCycle: 'monthly',
        startDate: tenant.subscription?.startDate,
        endDate: tenant.subscription?.endDate,
        instituteName: tenant.instituteName || tenant.name
      },
      tenantId: tenant.tenantId
    }).catch(err => console.error('❌ Failed to send plan upgrade email:', err.message));

    // Notify superadmin
    if (process.env.SUPER_ADMIN_EMAIL) {
      sendEmail({
        to: process.env.SUPER_ADMIN_EMAIL,
        subject: `Tenant Plan Upgraded: ${tenant.name}`,
        html: `<p>Tenant <strong>${tenant.name}</strong> upgraded to <strong>${tenant.plan}</strong> plan.</p>`
      }).catch(err => console.error('❌ Failed to notify superadmin:', err.message));
    }

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

    // Send profile update email to tenant
    sendEmail({
      to: tenant.email,
      subject: 'Your Institute Profile Was Updated',
      html: `<p>Hi ${tenant.name},<br>Your institute profile was updated. If you did not request this change, please contact support.</p>`,
      tenantId: tenant.tenantId,
      type: 'general'
    }).catch(err => console.error('❌ Failed to send profile update email:', err.message));

    // Notify superadmin
    if (process.env.SUPER_ADMIN_EMAIL) {
      sendEmail({
        to: process.env.SUPER_ADMIN_EMAIL,
        subject: `Tenant Profile Updated: ${tenant.name}`,
        html: `<p>Tenant <strong>${tenant.name}</strong> updated their profile.</p>`
      }).catch(err => console.error('❌ Failed to notify superadmin:', err.message));
    }

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

    // Send account deletion email to tenant
    if (tenant?.email) {
      sendEmail({
        to: tenant.email,
        subject: 'Your Institute Account Was Deleted',
        html: `<p>Hi ${tenant.name},<br>Your institute account has been deleted from Enromatics. If you have questions, contact support.</p>`,
        tenantId: tenant.tenantId,
        type: 'general'
      }).catch(err => console.error('❌ Failed to send account deletion email:', err.message));
    }

    // Notify superadmin
    if (process.env.SUPER_ADMIN_EMAIL) {
      sendEmail({
        to: process.env.SUPER_ADMIN_EMAIL,
        subject: `Tenant Deleted: ${tenant?.name}`,
        html: `<p>Tenant <strong>${tenant?.name}</strong> was deleted.</p>`
      }).catch(err => console.error('❌ Failed to notify superadmin:', err.message));
    }

    res.status(200).json({ message: "Tenant deleted successfully" });
  } catch (err) {
    console.error("Delete Tenant Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================================================
   🔹 CREATE NEW TENANT (for Superadmin to create demo accounts)
================================================================ */
export const createNewTenant = async (req, res) => {
  try {
    const { name, email, instituteName, phone, country } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    // Check if email already exists
    const existingTenant = await Tenant.findOne({ email });
    if (existingTenant) {
      return res.status(409).json({ message: "Email already exists" });
    }

    // Generate unique tenantId
    const tenantId = crypto.randomBytes(4).toString("hex");

    // Create new tenant
    const newTenant = new Tenant({
      tenantId,
      name,
      email,
      instituteName: instituteName || null,
      plan: "free", // Default to free plan for demos
      active: true,
      contact: {
        phone: phone || null,
        country: country || "India",
      },
      subscription: {
        status: "inactive",
        startDate: new Date(),
        endDate: null,
      },
      whatsappOptIn: true,
    });

    await newTenant.save();

    // Send welcome email to tenant
    sendTenantRegistrationEmail({
      to: newTenant.email,
      tenantName: newTenant.instituteName || newTenant.name,
      loginUrl: `${process.env.FRONTEND_URL}/login`,
      tenantId: newTenant.tenantId
    }).catch(err => console.error('❌ Failed to send tenant registration email:', err.message));

    // Notify superadmin
    if (process.env.SUPER_ADMIN_EMAIL) {
      sendEmail({
        to: process.env.SUPER_ADMIN_EMAIL,
        subject: `New Tenant Registered: ${newTenant.name}`,
        html: `<p>Tenant <strong>${newTenant.name}</strong> was registered.<br>Email: ${newTenant.email}</p>`
      }).catch(err => console.error('❌ Failed to notify superadmin:', err.message));
    }

    res.status(201).json({
      message: "Tenant created successfully",
      tenant: {
        tenantId: newTenant.tenantId,
        name: newTenant.name,
        email: newTenant.email,
        instituteName: newTenant.instituteName,
        plan: newTenant.plan,
        contact: newTenant.contact,
        createdAt: newTenant.createdAt,
      },
    });
  } catch (err) {
    console.error("Create Tenant Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================================================
   🔹 9. Send Login Credentials to Tenant (SuperAdmin action)
================================================================ */
export const sendTenantCredentials = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { resetPassword } = req.body; // Optional: whether to reset password

    // Find tenant
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Find or create user for this tenant
    let user = await User.findOne({ email: tenant.email });
    let generatedPassword = null;
    let isNewUser = false;

    if (!user) {
      // Create new user
      isNewUser = true;
      generatedPassword = generatePassword();
      
      user = await User.create({
        name: tenant.name,
        email: tenant.email,
        password: generatedPassword,
        phone: tenant.contact?.phone || null,
        tenantId: tenant.tenantId,
        role: 'tenantAdmin',
        status: 'active',
        plan: tenant.plan || 'free',
        subscriptionStatus: tenant.subscription?.status || 'inactive',
        subscriptionEndDate: tenant.subscription?.endDate || null,
        requirePasswordReset: true,
      });
      console.log('Created new user for tenant:', tenant.email);
    } else if (resetPassword) {
      // Reset password for existing user
      generatedPassword = generatePassword();
      user.password = generatedPassword;
      user.requirePasswordReset = true;
      await user.save();
      console.log('Reset password for existing user:', tenant.email);
    } else {
      // User exists and no password reset requested
      return res.status(400).json({ 
        message: "User already exists. Check 'Reset Password' to send new credentials.",
        userExists: true
      });
    }

    // Build login URL with tenant subdomain
    const baseUrl = process.env.FRONTEND_URL || 'https://enromatics.com';
    // Extract base domain (e.g., enromatics.com from https://www.enromatics.com)
    const baseDomain = baseUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
    // Use subdomain field if set, otherwise fallback to tenantId
    const subdomainForUrl = tenant.subdomain || tenant.tenantId;
    const loginUrl = `https://${subdomainForUrl}.${baseDomain}/login`;

    // Send credentials email
    await sendCredentialsEmail({
      to: tenant.email,
      name: tenant.name,
      instituteName: tenant.instituteName || tenant.name,
      email: tenant.email,
      password: generatedPassword,
      loginUrl: loginUrl,
      tenantId: tenant.tenantId,
      userId: user._id
    });

    res.status(200).json({
      success: true,
      message: isNewUser 
        ? "New user created and credentials sent successfully" 
        : "Password reset and credentials sent successfully",
      email: tenant.email
    });
  } catch (err) {
    console.error("Send Credentials Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================================================
   🔹 10. Cancel Subscription
================================================================ */
export const cancelSubscription = async (req, res) => {
  try {
    const { tenantId } = req.params;

    if (!tenantId) {
      return res.status(400).json({ message: "Tenant ID is required" });
    }

    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Update subscription status to cancelled
    tenant.subscription = {
      ...tenant.subscription,
      status: "cancelled",
      cancelledAt: new Date(),
    };

    await tenant.save();

    console.log(`Subscription cancelled for tenant: ${tenantId}`);

    res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully. Access will continue until the end of your billing period.",
    });
  } catch (err) {
    console.error("Cancel Subscription Error:", err);
    res.status(500).json({ message: err.message });
  }
};
