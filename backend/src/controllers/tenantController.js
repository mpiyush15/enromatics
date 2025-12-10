/**
 * Tenant Controller – handles upgrades, downgrades, subscription logic, and tenant management.
 * Enro Matics © 2025
 */

import Tenant from "../models/Tenant.js";
import User from "../models/User.js";
import SubscriptionPayment from "../models/SubscriptionPayment.js";
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

    // Send credentials email
    await sendCredentialsEmail({
      to: tenant.email,
      name: tenant.name,
      instituteName: tenant.instituteName || tenant.name,
      email: tenant.email,
      password: generatedPassword,
      loginUrl: `${process.env.FRONTEND_URL}/login`,
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
   🔹 11. Check Onboarding Status
   Get /api/tenants/:tenantId/check-onboarding
   Check if tenant needs to complete white-label onboarding
================================================================ */
export const checkOnboarding = async (req, res) => {
  try {
    const { tenantId } = req.params;

    if (!tenantId) {
      return res.status(400).json({ message: "Tenant ID is required" });
    }

    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Tenant needs onboarding if:
    // 1. They have paid_status = true (paid customer)
    // 2. They haven't completed onboarding yet (onboarding_completed = false)
    const needsOnboarding = tenant.paid_status === true && tenant.onboarding_completed !== true;

    res.status(200).json({
      success: true,
      needsOnboarding,
      onboardingCompleted: tenant.onboarding_completed || false,
      hasBranding: !!tenant.subdomain,
      tenantId: tenant.tenantId,
      subdomain: tenant.subdomain,
    });
  } catch (err) {
    console.error("Check Onboarding Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================================================
   🔹 12. Check Subdomain Availability
   Get /api/tenants/check-subdomain?subdomain=myschool
   Check if subdomain is available for registration
================================================================ */
export const checkSubdomainAvailability = async (req, res) => {
  try {
    const { subdomain } = req.query;

    if (!subdomain) {
      return res.status(400).json({ message: "Subdomain is required" });
    }

    // Validate subdomain format (alphanumeric and hyphens only)
    if (!/^[a-z0-9-]+$/.test(subdomain.toLowerCase())) {
      return res.status(400).json({ 
        available: false, 
        message: "Subdomain can only contain letters, numbers, and hyphens" 
      });
    }

    // Check if subdomain already exists
    const existingTenant = await Tenant.findOne({ 
      subdomain: subdomain.toLowerCase() 
    });

    const available = !existingTenant;

    res.status(200).json({
      success: true,
      available,
      subdomain: subdomain.toLowerCase(),
      message: available ? "Subdomain is available" : "Subdomain is already taken",
    });
  } catch (err) {
    console.error("Check Subdomain Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================================================
   🔹 13. Save Branding Configuration
   POST /api/tenants/:tenantId/branding
   Save subdomain, logo, theme color, and WhatsApp config
================================================================ */
export const saveBranding = async (req, res) => {
  try {
    const { tenantId } = req.params;
    const { subdomain, branding } = req.body;

    if (!tenantId) {
      return res.status(400).json({ message: "Tenant ID is required" });
    }

    if (!subdomain) {
      return res.status(400).json({ message: "Subdomain is required" });
    }

    // Validate subdomain format
    if (!/^[a-z0-9-]+$/.test(subdomain.toLowerCase())) {
      return res.status(400).json({ 
        message: "Subdomain can only contain letters, numbers, and hyphens" 
      });
    }

    // Check if subdomain is already taken by another tenant
    const existingTenant = await Tenant.findOne({ 
      subdomain: subdomain.toLowerCase(),
      tenantId: { $ne: tenantId } // Exclude current tenant
    });

    if (existingTenant) {
      return res.status(400).json({ 
        message: "This subdomain is already taken" 
      });
    }

    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Update tenant with branding
    tenant.subdomain = subdomain.toLowerCase();
    if (branding) {
      tenant.branding = {
        logoUrl: branding.logoUrl || tenant.branding?.logoUrl || null,
        themeColor: branding.themeColor || tenant.branding?.themeColor || "#2F6CE5",
        appName: branding.appName || tenant.branding?.appName || tenant.instituteName,
      };
      
      // Store WhatsApp number in branding if provided
      if (branding.whatsappNumber) {
        tenant.branding.whatsappNumber = branding.whatsappNumber;
      }
    }

    // Mark onboarding as completed when subdomain and branding are saved
    tenant.onboarding_completed = true;

    await tenant.save();

    console.log(`Branding saved for tenant: ${tenantId}, subdomain: ${subdomain}`);

    res.status(200).json({
      success: true,
      message: "Branding configuration saved successfully",
      tenant: {
        tenantId: tenant.tenantId,
        instituteName: tenant.instituteName,
        subdomain: tenant.subdomain,
        branding: tenant.branding,
      },
    });
  } catch (err) {
    console.error("Save Branding Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================================================
   🔹 14. Get Tenant By Subdomain
   Get /api/tenants/by-subdomain/:subdomain
   Fetch public tenant branding info (for login/dashboard pages)
================================================================ */
export const getTenantBySubdomain = async (req, res) => {
  try {
    const { subdomain } = req.params;

    if (!subdomain) {
      return res.status(400).json({ message: "Subdomain is required" });
    }

    const tenant = await Tenant.findOne({ 
      subdomain: subdomain.toLowerCase() 
    });

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Return only public branding info (no sensitive data)
    res.status(200).json({
      success: true,
      tenantId: tenant.tenantId,
      instituteName: tenant.instituteName || tenant.name,
      subdomain: tenant.subdomain,
      branding: tenant.branding || {},
    });
  } catch (err) {
    console.error("Get Tenant By Subdomain Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================================================
   🔹 15. Get Tenant Dashboard Data
   Get /api/tenants/by-subdomain/:subdomain/dashboard
   Fetch analytics data for branded dashboard
================================================================ */
export const getTenantDashboard = async (req, res) => {
  try {
    const { subdomain } = req.params;

    if (!subdomain) {
      return res.status(400).json({ message: "Subdomain is required" });
    }

    const tenant = await Tenant.findOne({ 
      subdomain: subdomain.toLowerCase() 
    });

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // For now, return dummy/usage data from tenant model
    // In production, you'd query Student, Staff, Course, and payment models
    const totalStudents = tenant.usage?.studentsCount || 0;
    const totalCourses = 0; // Would query Batch/Course model
    const activeUsers = 0; // Would query User model with recent activity
    const totalRevenue = tenant.subscription?.amount || 0;

    res.status(200).json({
      success: true,
      tenantId: tenant.tenantId,
      instituteName: tenant.instituteName,
      subdomain: tenant.subdomain,
      totalStudents,
      totalCourses,
      activeUsers,
      totalRevenue,
    });
  } catch (err) {
    console.error("Get Tenant Dashboard Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================================================
   🔹 16. Authenticate Tenant User
   POST /api/tenants/authenticate
   Authenticate tenant user for branded portal login
================================================================ */
export const authenticateTenantUser = async (req, res) => {
  try {
    const { email, password, subdomain } = req.body;

    if (!email || !password || !subdomain) {
      return res.status(400).json({ 
        message: "Email, password, and subdomain are required" 
      });
    }

    // Find tenant by subdomain
    const tenant = await Tenant.findOne({ 
      subdomain: subdomain.toLowerCase() 
    });

    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }

    // Find user with matching email and tenantId
    const user = await User.findOne({ 
      email,
      tenantId: tenant.tenantId 
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Verify password
    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check payment status if tenant has pending or active subscription
    let paymentStatus = null;
    if (tenant.subscription?.status === 'pending') {
      paymentStatus = 'pending';
    } else if (tenant.subscription?.paymentId) {
      // Check latest payment record
      const latestPayment = await SubscriptionPayment.findOne({
        tenantId: tenant.tenantId
      }).sort({ createdAt: -1 });
      
      if (latestPayment) {
        paymentStatus = latestPayment.status;
      }
    }

    // If payment is pending - show error and don't allow login
    if (paymentStatus === 'pending') {
      return res.status(402).json({ 
        success: false,
        message: "Your payment is still being processed. Please wait and try again in a few moments.",
        paymentStatus: 'pending',
        suggestion: "Your payment is under process. Do not refresh the page. Please check back shortly."
      });
    }

    // If payment failed - allow login but show failed message
    if (paymentStatus === 'failed') {
      return res.status(200).json({
        success: true,
        message: "Login successful but payment failed",
        token: user.getSignedJwt(),
        tenantId: tenant.tenantId,
        paymentStatus: 'failed',
        tenant: {
          tenantId: tenant.tenantId,
          name: tenant.name,
          instituteName: tenant.instituteName,
          email: tenant.email,
          plan: tenant.plan,
          paid_status: false, // Reset paid status
          onboarding_completed: tenant.onboarding_completed || false,
          subdomain: tenant.subdomain,
        },
        user: {
          _id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
        },
        redirectTo: 'dashboard' // Go to free dashboard
      });
    }

    // Generate JWT token
    const token = user.getSignedJwt();

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      tenantId: tenant.tenantId,
      tenant: {
        tenantId: tenant.tenantId,
        name: tenant.name,
        instituteName: tenant.instituteName,
        email: tenant.email,
        plan: tenant.plan,
        paid_status: tenant.paid_status || false,
        onboarding_completed: tenant.onboarding_completed || false,
        subdomain: tenant.subdomain,
      },
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
      },
    });
  } catch (err) {
    console.error("Tenant Authentication Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================================================
   🔹 17. Poll Payment Status (Auto-Check every 10 minutes)
   GET /api/tenants/:tenantId/payment-status
   Check latest payment status from Cashfree
================================================================ */
export const pollPaymentStatus = async (req, res) => {
  try {
    const { tenantId } = req.params;

    if (!tenantId) {
      return res.status(400).json({ message: "Tenant ID is required" });
    }

    // Find latest payment for this tenant
    const latestPayment = await SubscriptionPayment.findOne({
      tenantId
    }).sort({ createdAt: -1 });

    if (!latestPayment) {
      return res.status(404).json({ 
        message: "No payment found",
        status: 'no-payment'
      });
    }

    // If payment is already resolved (success/failed), just return it
    if (latestPayment.status === 'success' || latestPayment.status === 'failed') {
      return res.status(200).json({
        success: true,
        paymentStatus: latestPayment.status,
        orderId: latestPayment.gatewayOrderId,
        amount: latestPayment.amount,
        planName: latestPayment.planName,
        message: latestPayment.status === 'success' ? 'Payment successful!' : 'Payment failed',
        createdAt: latestPayment.createdAt,
        paidAt: latestPayment.paidAt,
        notes: latestPayment.notes
      });
    }

    // If still pending, check Cashfree API for latest status
    if (latestPayment.status === 'pending') {
      try {
        const axios = await import('axios').then(m => m.default);
        const CASHFREE_BASE_URL = 'https://api.cashfree.com/pg';
        const CASHFREE_CLIENT_ID = process.env.CASHFREE_CLIENT_ID;
        const CASHFREE_CLIENT_SECRET = process.env.CASHFREE_CLIENT_SECRET;

        const apiResponse = await axios.get(
          `${CASHFREE_BASE_URL}/orders/${latestPayment.gatewayOrderId}`,
          {
            headers: {
              'x-client-id': CASHFREE_CLIENT_ID,
              'x-client-secret': CASHFREE_CLIENT_SECRET,
              'x-api-version': '2023-08-01'
            }
          }
        );

        const cashfreeOrder = apiResponse.data;
        console.log('Payment Status Poll - Order Status:', cashfreeOrder.order_status, 'Order ID:', latestPayment.gatewayOrderId);

        // Return current status from Cashfree
        return res.status(200).json({
          success: true,
          paymentStatus: cashfreeOrder.order_status,
          orderId: latestPayment.gatewayOrderId,
          amount: latestPayment.amount,
          planName: latestPayment.planName,
          message: `Payment status: ${cashfreeOrder.order_status}`,
          createdAt: latestPayment.createdAt,
          checkCount: latestPayment.statusCheckCount || 0
        });
      } catch (apiErr) {
        console.error('Cashfree API check error:', apiErr?.message);
        // Return database status if API fails
        return res.status(200).json({
          success: false,
          paymentStatus: latestPayment.status,
          message: 'Could not verify with payment gateway, current status: pending',
          orderId: latestPayment.gatewayOrderId
        });
      }
    }

    res.status(200).json({
      success: true,
      paymentStatus: latestPayment.status,
      orderId: latestPayment.gatewayOrderId
    });
  } catch (err) {
    console.error("Poll Payment Status Error:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================================================================
   🔹 17. Upload Logo
   POST /api/upload/logo
   Upload logo file to S3
================================================================ */
export const uploadLogo = async (req, res) => {
  try {
    // Check if file is provided
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const { buffer, originalname, mimetype } = req.file;
    const { uploadToS3 } = await import("../services/s3Service.js");

    // Validate file type
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(mimetype)) {
      return res.status(400).json({ 
        message: "Only JPEG, PNG, and WebP images are allowed" 
      });
    }

    // Validate file size (max 5MB)
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ 
        message: "File size must be less than 5MB" 
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `logos/${timestamp}-${originalname.replace(/\s+/g, '-')}`;

    // Upload to S3
    const { url } = await uploadToS3(buffer, filename, mimetype);

    res.status(200).json({
      success: true,
      message: "Logo uploaded successfully",
      url,
      filename,
    });
  } catch (err) {
    console.error("Upload Logo Error:", err);
    res.status(500).json({ message: err.message });
  }
};
