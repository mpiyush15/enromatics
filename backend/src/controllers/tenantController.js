/**
 * Tenant Controller – handles upgrades, downgrades, subscription logic, and tenant management.
 * Enro Matics © 2025
 */

import Tenant from "../models/Tenant.js";
import User from "../models/User.js";
import SubscriptionPayment from "../models/SubscriptionPayment.js";
import crypto from "crypto";
import axios from "axios";
import { PLANS } from "../config/plans.js";
import {
  sendTenantRegistrationEmail,
  sendWelcomeEmail,
  sendEmail,
  sendSubscriptionConfirmationEmail,
  sendCredentialsEmail
} from "../services/emailService.js";

// Cashfree config from .env
const CASHFREE_BASE_URL = 'https://api.cashfree.com/pg';
const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;

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
   ✅ Handles both PUT (old way after payment) and POST (new direct payment)
================================================================ */
export const upgradeTenantPlan = async (req, res) => {
  try {
    const { planId, billingCycle, newPlan, paymentId } = req.body;
    const paramTenantId = req.params?.tenantId;
    const bodyTenantId = req.body?.tenantId;
    const tenantId = paramTenantId || bodyTenantId;

    // Validate tenant ID
    if (!tenantId) {
      return res.status(400).json({ error: "Tenant ID is required" });
    }

    // Find tenant
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return res.status(404).json({ error: "Tenant not found" });
    }

    console.log(`🚀 Upgrade request for tenant ${tenantId}:`, { planId, billingCycle });

    // ========== CASE 1: POST with planId & billingCycle (NEW - Direct Payment Modal) ==========
    if (planId && billingCycle) {
      console.log(`📱 Direct payment upgrade flow - Plan: ${planId}, Cycle: ${billingCycle}`);
      
      // Validate plan exists
      const plan = PLANS.find(p => p.id === planId?.toLowerCase());
      if (!plan) {
        return res.status(400).json({ 
          error: "Invalid plan selected", 
          availablePlans: PLANS.map(p => p.id) 
        });
      }

      // Check if it's a free plan
      if (plan.priceMonthly === 0 && plan.priceAnnual === 0) {
        // Free plan - no payment needed, just upgrade immediately
        const now = new Date();
        const duration = billingCycle === 'annual' ? 365 : 30;
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + duration);

        tenant.plan = planId.toLowerCase();
        tenant.subscription = {
          status: "active",
          paymentId: `free_${crypto.randomBytes(4).toString("hex")}`,
          startDate: now,
          endDate,
          billingCycle,
        };
        await tenant.save();

        return res.status(200).json({
          success: true,
          isFree: true,
          message: `Upgraded to ${plan.name} plan successfully`,
          plan: {
            id: plan.id,
            name: plan.name,
            price: 0,
            billingCycle
          }
        });
      }

      // ✅ Paid plan - Initiate Cashfree payment (NO OTP, NO REGISTRATION)
      const cycle = billingCycle === 'annual' ? 'annual' : 'monthly';
      const orderAmount = cycle === 'annual' ? plan.priceAnnual : plan.priceMonthly;

      // Store pending upgrade info
      tenant.subscription = tenant.subscription || {};
      tenant.subscription.pendingPlan = planId.toLowerCase();
      tenant.subscription.billingCycle = cycle;
      tenant.subscription.status = tenant.subscription.status === 'active' ? 'active' : 'pending';
      await tenant.save();

      // Create Cashfree order
      const orderPayload = {
        order_id: `upgrade_${tenantId}_${Date.now()}`,
        order_amount: orderAmount,
        order_currency: 'INR',
        customer_details: {
          customer_id: tenantId,
          customer_email: tenant.email,
          customer_phone: tenant.contact?.phone || '9999999999'
        },
        order_meta: {
          return_url: `${process.env.FRONTEND_URL}/dashboard/client/${tenantId}/my-subscription`,
          plan_id: planId,
          billing_cycle: cycle,
          upgrade: true
        }
      };

      console.log('💳 Creating Cashfree order for upgrade:', orderPayload);

      const cashfreeResponse = await axios.post(
        `${CASHFREE_BASE_URL}/orders`,
        orderPayload,
        {
          headers: {
            'x-client-id': CASHFREE_CLIENT_ID,
            'x-client-secret': CASHFREE_CLIENT_SECRET,
            'x-api-version': '2023-08-01',
            'Content-Type': 'application/json'
          }
        }
      );

      // Store order ID in tenant
      tenant.subscription.paymentId = cashfreeResponse.data.order_id;
      await tenant.save();

      // Log pending payment
      try {
        let duration = 30 * 24 * 60 * 60 * 1000; // monthly
        if (cycle === 'annual') {
          duration = 365 * 24 * 60 * 60 * 1000;
        }
        await SubscriptionPayment.create({
          tenantId,
          amount: orderAmount,
          totalAmount: orderAmount,
          planName: plan.name,
          planKey: plan.id,
          billingCycle: cycle,
          periodStart: new Date(),
          periodEnd: new Date(Date.now() + duration),
          paymentMethod: 'cashfree',
          gatewayOrderId: cashfreeResponse.data.order_id,
          status: 'pending',
          notes: `Upgrade initiated - ${new Date().toISOString()}`,
          tenantSnapshot: {
            instituteName: tenant.instituteName || tenant.name,
            email: tenant.email,
            phone: tenant.contact?.phone || '9999999999',
          }
        });
      } catch (logErr) {
        console.error('Failed to log pending payment:', logErr?.message);
      }

      // Send email notification
      await sendEmail({
        to: tenant.email,
        subject: `Plan Upgrade Initiated: ${plan.name} (${cycle})`,
        html: `<p>Your upgrade to the <strong>${plan.name}</strong> plan (₹${orderAmount}/${cycle}) has been initiated. Complete the payment to activate your new plan.</p>`
      }).catch(err => console.error('❌ Failed to send upgrade email:', err.message));

      // Return session ID for modal checkout
      return res.status(200).json({
        success: true,
        isFree: false,
        paymentSessionId: cashfreeResponse.data.payment_session_id,
        paymentLink: cashfreeResponse.data.payment_link,
        orderId: cashfreeResponse.data.order_id,
        tenantId,
        plan: {
          id: plan.id,
          name: plan.name,
          price: orderAmount,
          billingCycle: cycle
        }
      });
    }

    // ========== CASE 2: PUT with newPlan & paymentId (OLD - After Payment Confirmation) ==========
    if (newPlan || paymentId) {
      console.log(`✅ Finalizing upgrade - Old style`);
      
      const validPlans = ["pro", "enterprise", "basic", "starter", "professional"];
      const planToUpgrade = newPlan?.toLowerCase() || planId?.toLowerCase();
      
      if (!validPlans.includes(planToUpgrade)) {
        return res.status(400).json({ error: "Invalid plan type" });
      }

      const now = new Date();
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + 1);

      tenant.plan = planToUpgrade;
      tenant.subscription = {
        status: "active",
        paymentId: paymentId || `manual_${crypto.randomBytes(4).toString("hex")}`,
        startDate: now,
        endDate,
      };

      await tenant.save();

      // Send confirmation emails
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
      }).catch(err => console.error('❌ Failed to send upgrade email:', err.message));

      if (process.env.SUPER_ADMIN_EMAIL) {
        sendEmail({
          to: process.env.SUPER_ADMIN_EMAIL,
          subject: `Tenant Plan Upgraded: ${tenant.name}`,
          html: `<p><strong>${tenant.name}</strong> upgraded to <strong>${tenant.plan}</strong> plan.</p>`
        }).catch(err => console.error('❌ Failed to notify superadmin:', err.message));
      }

      return res.status(200).json({
        message: `Plan upgraded to ${planToUpgrade} successfully`,
        plan: tenant.plan,
        subscription: tenant.subscription,
      });
    }

    // Invalid request - neither direct payment nor finalization
    return res.status(400).json({ 
      error: "Invalid upgrade request. Provide either planId+billingCycle (direct payment) or paymentId (finalization)" 
    });

  } catch (err) {
    console.error("🚨 Upgrade Error:", err.message || err);
    res.status(500).json({ 
      error: err.message || "Upgrade failed", 
      details: process.env.NODE_ENV === 'development' ? err.toString() : undefined
    });
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
        instituteName: tenant.instituteName,
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
        subdomain: tenant.subdomain,
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
    const { name, instituteName, email, contact, active } = req.body;

    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) return res.status(404).json({ message: "Tenant not found" });

    // Only allow updating specific fields
    if (name) tenant.name = name;
    if (instituteName) tenant.instituteName = instituteName;
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
        subject: `Tenant Profile Updated: ${tenant.instituteName || tenant.name}`,
        html: `<p>Tenant <strong>${tenant.instituteName || tenant.name}</strong> updated their profile.</p>`
      }).catch(err => console.error('❌ Failed to notify superadmin:', err.message));
    }

    console.log("✅ Tenant profile updated:", tenant.instituteName || tenant.name);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      tenant: {
        tenantId: tenant.tenantId,
        name: tenant.name,
        instituteName: tenant.instituteName,
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

    // Auto-generate clean subdomain for the tenant
    const baseName = instituteName || name || email.split('@')[0];
    const cleanSubdomain = baseName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric
      .substring(0, 20); // Limit to 20 chars for prefix
    const suffix = Math.random().toString(36).substr(2, 5); // 5 char random suffix
    const generatedSubdomain = cleanSubdomain + suffix;

    // Create new tenant with auto-generated subdomain
    const newTenant = new Tenant({
      tenantId,
      name,
      email,
      instituteName: instituteName || null,
      plan: "free", // Default to free plan for demos
      active: true,
      subdomain: generatedSubdomain, // ✅ Auto-generated subdomain
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

    console.log(`✅ Tenant created with auto-generated subdomain: ${generatedSubdomain}`);

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
        subdomain: newTenant.subdomain,
        instituteUrl: `https://${newTenant.subdomain}.enromatics.com`,
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

    // Auto-generate clean subdomain if not set or if it's an ugly auto-generated one
    if (!tenant.subdomain || tenant.subdomain.startsWith('tenant_')) {
      const baseName = tenant.instituteName || tenant.name || tenant.email?.split('@')[0] || 'tenant';
      const cleanSubdomain = baseName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric
        .substring(0, 30);
      const suffix = Math.random().toString(36).substr(2, 4);
      tenant.subdomain = `${cleanSubdomain}${suffix}`;
      await tenant.save();
      console.log('✅ Auto-generated clean subdomain:', tenant.subdomain);
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
    const instituteUrl = `https://${subdomainForUrl}.${baseDomain}`;

    // Send credentials email
    await sendCredentialsEmail({
      to: tenant.email,
      name: tenant.name,
      instituteName: tenant.instituteName || tenant.name,
      email: tenant.email,
      password: generatedPassword,
      loginUrl: loginUrl,
      instituteUrl: instituteUrl,
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

/* ================================================================
   🔹 11. Update Tenant Subdomain (SuperAdmin only)
   Supports both manual assignment and auto-generation
================================================================ */
export const updateTenantSubdomain = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { subdomain, autoGenerate = false } = req.body;

    if (!tenantId) {
      return res.status(400).json({ message: "Tenant ID is required" });
    }

    // Find tenant
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    let finalSubdomain;

    if (autoGenerate) {
      // Auto-generate new subdomain
      const baseName = tenant.instituteName || tenant.name || tenant.email.split('@')[0];
      const cleanSubdomain = baseName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20);
      const suffix = Math.random().toString(36).substr(2, 5);
      finalSubdomain = cleanSubdomain + suffix;
      console.log(`✅ Auto-generated subdomain for ${tenantId}: ${finalSubdomain}`);
    } else {
      // Manual assignment
      if (!subdomain || !subdomain.trim()) {
        return res.status(400).json({ message: "Subdomain is required or set autoGenerate to true" });
      }

      // Validate subdomain format (lowercase alphanumeric only)
      finalSubdomain = subdomain.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      
      if (finalSubdomain.length < 3) {
        return res.status(400).json({ message: "Subdomain must be at least 3 characters" });
      }

      if (finalSubdomain.length > 30) {
        return res.status(400).json({ message: "Subdomain must be 30 characters or less" });
      }
    }

    // Check if subdomain is already taken by another tenant
    const existingTenant = await Tenant.findOne({ 
      subdomain: finalSubdomain, 
      tenantId: { $ne: tenantId } 
    });

    if (existingTenant) {
      return res.status(400).json({ message: "This subdomain is already taken. Please choose another." });
    }

    // Update tenant with new subdomain
    tenant.subdomain = finalSubdomain;
    await tenant.save();

    const baseDomain = process.env.FRONTEND_URL?.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || 'enromatics.com';
    const instituteUrl = `https://${finalSubdomain}.${baseDomain}`;
    const loginUrl = `https://${finalSubdomain}.${baseDomain}/login`;

    console.log(`✅ Subdomain updated for tenant ${tenantId}: ${finalSubdomain}`);

    res.status(200).json({
      success: true,
      message: autoGenerate ? "Subdomain auto-generated successfully" : "Subdomain updated successfully",
      subdomain: finalSubdomain,
      instituteUrl: instituteUrl,
      loginUrl: loginUrl,
      baseDomain: baseDomain
    });
  } catch (err) {
    console.error("Update Subdomain Error:", err);
    res.status(500).json({ message: err.message });
  }
};
