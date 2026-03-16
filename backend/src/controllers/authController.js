import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { resolveTenantFromSubdomain } from "../utils/subdomainResolver.js";
import { sendCredentialsEmail } from "../services/emailService.js";
import { notifyNewSignup } from "../services/superadminNotificationService.js";

const generateToken = (id, email, role, tenantId) =>
  jwt.sign({ id, email, role, tenantId }, process.env.JWT_SECRET, { expiresIn: "7d" });

/**
 * Check if email is already registered (for signup form)
 */
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existing = await User.findOne({ email });
    
    if (existing) {
      return res.status(200).json({ 
        exists: true,
        message: "Email already registered. Please login or use a different email."
      });
    }

    return res.status(200).json({ 
      exists: false,
      message: "Email is available"
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Register Tenant + User (or add staff to existing tenant)
 * Supports trial signup with planId and isTrial flag
 */
export const registerUser = async (req, res) => {
  try {
    console.log('📝 [SIGNUP] Starting registerUser with body:', req.body);
    
    const { name, email, password, tenantId, role, instituteName, phone, whatsappOptIn, planId, isTrial } = req.body;
    
    // For trial signup, use instituteName as the user's name if name is not provided
    const userName = name || instituteName || email.split('@')[0];
    console.log('📝 [SIGNUP] userName:', userName, 'email:', email, 'isTrial:', isTrial);
    
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('❌ [SIGNUP] User already exists:', email);
      return res.status(400).json({ message: "User already exists" });
    }
    console.log('✅ [SIGNUP] Email available, proceeding...');

    // If tenantId is provided, add user to existing tenant (staff member)
    if (tenantId) {
      const tenant = await Tenant.findOne({ tenantId });
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }

      const user = await User.create({
        name: userName,
        email,
        password,
        phone: phone || null,
        whatsappOptIn: whatsappOptIn || false,
        tenantId,
        role: role || "employee",
      });

      // Send superadmin notification about new staff member (non-blocking)
      notifyNewSignup({
        name: userName,
        email: email,
        phone: phone,
        instituteName: tenant.instituteName || tenant.name,
        plan: tenant.plan,
        isTrial: false,
        tenantId: tenantId
      }).catch(err => {
        console.error('❌ [SIGNUP] Failed to send superadmin notification for staff member:', err.message);
      });

      return res.status(201).json({
        message: "Staff member added successfully ✅",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          createdAt: user.createdAt,
        },
      });
    }

    // Otherwise, create new tenant and tenantAdmin
    console.log('📝 [SIGNUP] Creating tenant...');
    
    // Auto-generate subdomain for tenant
    const baseName = instituteName || userName || email.split('@')[0];
    const cleanSubdomain = baseName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove all non-alphanumeric
      .substring(0, 20); // Limit to 20 chars
    const suffix = Math.random().toString(36).substr(2, 5); // 5 char random suffix
    const generatedSubdomain = cleanSubdomain + suffix;
    
    console.log('📝 [SIGNUP] Generated subdomain:', generatedSubdomain);
    
    const tenant = await Tenant.create({
      name: userName, // Person's name
      instituteName: instituteName || null, // Institute name
      email,
      plan: isTrial ? 'trial' : 'free', // ✅ Set plan to 'trial' for trial users, 'free' otherwise
      subdomain: generatedSubdomain, // ✅ AUTO-GENERATED SUBDOMAIN
      subscription: { 
        status: subscriptionStatus, // 'trial', 'active', or 'inactive'
        startDate: new Date(),
        endDate: trialEndDate, // When trial/subscription ends
        trialStartDate: trialStartDate, // When trial started (for 14-day countdown)
      },
      contact: {
        phone: phone || null, // Store phone in tenant contact for WhatsApp sync
      },
      whatsappOptIn: whatsappOptIn || false, // Store WhatsApp consent
    });

    // ✅ Use MongoDB's _id as tenantId (not random hex)
    const tenantId = tenant._id.toString();
    console.log('✅ [SIGNUP] Tenant created:', tenantId, 'with subdomain:', generatedSubdomain);

    // ✅ Update tenant document to store tenantId field for legacy compatibility
    tenant.tenantId = tenantId;
    await tenant.save();
    console.log('✅ [SIGNUP] Tenant tenantId field updated');

    console.log('📝 [SIGNUP] Creating user...');
    const user = await User.create({
      name: userName,
      email,
      password,
      phone: phone || null,
      whatsappOptIn: whatsappOptIn || false,
      tenantId: tenantId, // ✅ Use MongoDB ObjectId as tenantId
      role: "tenantAdmin",
      plan: isTrial ? 'trial' : 'free', // ✅ Set user plan to 'trial' or 'free' based on signup type
    });
    console.log('✅ [SIGNUP] User created:', user._id);

    // Generate token for immediate auth (especially important for trial signup)
    console.log('📝 [SIGNUP] Generating token...');
    const token = generateToken(user._id, user.email, user.role, tenantId);
    console.log('✅ [SIGNUP] Token generated');

    // Build institute URL with auto-generated subdomain
    const instituteUrl = `https://${generatedSubdomain}.enromatics.com`;
    const loginUrl = `${instituteUrl}/login`;

    console.log('📧 [SIGNUP] Sending credentials email...');
    // Send credentials email to tenant (non-blocking)
    sendCredentialsEmail({
      to: email,
      name: userName,
      instituteName: instituteName || userName,
      email: email,
      password: password, // User created their own password
      instituteUrl: instituteUrl,
      loginUrl: loginUrl,
      tenantId: newTenantId,
      userId: user._id
    }).catch(err => {
      console.error('❌ [SIGNUP] Failed to send credentials email:', err.message);
    });

    // Send superadmin notification about new signup (non-blocking)
    notifyNewSignup({
      name: userName,
      email: email,
      phone: phone,
      instituteName: instituteName,
      plan: subscriptionTier,
      isTrial: isTrial,
      tenantId: newTenantId
    }).catch(err => {
      console.error('❌ [SIGNUP] Failed to send superadmin notification:', err.message);
    });

    console.log('✅ [SIGNUP] Sending response...');

    res.status(201).json({
      message: "User registered successfully ✅",
      token, // Include token for trial signup flow
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        plan: user.plan, // ✅ Include plan so frontend can check for 'trial'
        createdAt: user.createdAt,
      },
      tenant: {
        tenantId: tenant.tenantId,
        name: tenant.name,
        instituteName: tenant.instituteName,
        email: tenant.email,
        subdomain: generatedSubdomain,
        instituteUrl: instituteUrl,
        loginUrl: loginUrl,
      },
      trial: isTrial ? {
        planId: subscriptionTier,
        planName: planId === 'pro' ? 'Pro' : planId === 'enterprise' ? 'Enterprise' : 'Basic',
        daysRemaining: 14,
      } : null,
    });
  } catch (err) {
    console.error('❌ [SIGNUP] ERROR:', err.message);
    console.error('❌ [SIGNUP] Full error:', err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Login User & set cookie
 * ✅ NEW: Route-based role separation with tenant ownership validation
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password, purpose } = req.body;

    console.log('\n' + '='.repeat(80));
    console.log('🔐 LOGIN ATTEMPT');
    console.log('='.repeat(80));
    console.log('📧 Email:', email);
    console.log('🔑 Password received:');
    console.log('   - Type:', typeof password);
    console.log('   - Length:', password ? password.length : 'NULL/UNDEFINED');
    console.log('   - Value:', JSON.stringify(password));
    console.log('   - First 20 chars:', password ? password.substring(0, 20) : 'NONE');
    console.log('🎯 Purpose:', purpose || 'default');
    
    // Extract tenant subdomain from request (set by frontend middleware via BFF)
    const tenantSubdomain = req.headers['x-tenant-subdomain'];
    console.log('🌐 Subdomain header:', tenantSubdomain || 'NONE (main domain)');
    
    console.log('\n📊 Database check:');
    console.log('   - Connected:', !!mongoose.connection);
    console.log('   - Database name:', mongoose.connection.name);
    
    const user = await User.findOne({ email });
    
    console.log('\n👤 User lookup:');
    console.log('   - User found:', !!user);
    
    if (!user) {
      console.log('   ❌ User NOT found in database');
      return res.status(404).json({ message: "User not found" });
    }

    console.log('   - Name:', user.name);
    console.log('   - Email:', user.email);
    console.log('   - Role:', user.role);
    console.log('   - TenantId:', user.tenantId || '❌ MISSING');
    console.log('   - Password field:', user.password ? 'EXISTS' : 'MISSING');
    
    console.log('\n🔐 PASSWORD DEBUG:');
    console.log('LOGIN DEBUG');
    console.log('Email:', email);
    console.log('User found:', !!user);
    console.log('Stored password:', user?.password);
    console.log(
      'Password match:',
      user ? await bcrypt.compare(password, user.password) : 'no user'
    );
    
    console.log('\n🔐 Password verification:');
    console.log('   - Stored hash (first 30):', user.password ? user.password.substring(0, 30) + '...' : 'NO HASH');
    console.log('   - Calling matchPassword()...');
    
    const isMatch = await user.matchPassword(password);
    console.log('   - Result:', isMatch ? '✅ PASSWORD MATCHES' : '❌ PASSWORD DOES NOT MATCH');
    
    if (!isMatch) {
      console.log('❌ LOGIN FAILED: Invalid password');
      console.log('='.repeat(80));
      return res.status(401).json({ message: "Invalid credentials" });
    }

    console.log('✅ Password verified successfully');
    console.log('='.repeat(80) + '\n');
    
    // ✅ TENANT-BASED ACCESS CONTROL
    const userRole = user.role?.toLowerCase();
    
    console.log('\n🔐 TENANT VALIDATION:');
    console.log('   - User role:', userRole);
    console.log('   - Tenant subdomain header:', tenantSubdomain || 'NONE');
    console.log('   - User tenantId:', user.tenantId);
    
    // Check if this is a checkout/upgrade login (allows tenant users on main domain)
    const isCheckoutLogin = purpose === 'checkout' || purpose === 'upgrade';
    
    // 1. SuperAdmin → ONLY main domain (no subdomain)
    if (userRole === 'superadmin') {
      if (tenantSubdomain) {
        console.log('❌ Access denied: SuperAdmin trying to login on tenant subdomain');
        return res.status(403).json({ 
          message: "Access denied. SuperAdmin can only login on the main domain",
          hint: "Please visit enromatics.com/login"
        });
      }
      console.log('✅ SuperAdmin login on main domain');
    }
    
    // 2. All other roles → MUST use tenant subdomain (UNLESS checkout/upgrade purpose)
    else {
      if (!tenantSubdomain && !isCheckoutLogin) {
        console.log('❌ Access denied: Non-SuperAdmin trying to login on main domain');
        console.log('   - Has X-Tenant-Subdomain header:', !!tenantSubdomain);
        console.log('   - Is checkout login:', isCheckoutLogin);
        return res.status(403).json({ 
          message: "Access denied. Please login using your tenant subdomain",
          hint: `Visit ${user.tenantId || 'yourtenant'}.enromatics.com/login`
        });
      }
      
      // For checkout login on main domain, skip subdomain validation
      if (isCheckoutLogin && !tenantSubdomain) {
        console.log('✅ Checkout login allowed on main domain for tenant user:', user.email);
      } else if (tenantSubdomain) {
        // Resolve subdomain to tenantId
        console.log('   - Resolving subdomain to tenantId for:', tenantSubdomain);
        const resolvedTenantId = await resolveTenantFromSubdomain(tenantSubdomain);
        
        console.log('   - Resolved tenantId:', resolvedTenantId || 'NULL');
        
        if (!resolvedTenantId) {
          console.log('❌ Tenant not found for subdomain:', tenantSubdomain);
          return res.status(404).json({ 
            message: "Tenant not found",
            hint: "Please check your subdomain URL"
          });
        }
        
        // Validate user belongs to this tenant
        console.log('   - Comparing: user.tenantId (' + user.tenantId + ') vs resolvedTenantId (' + resolvedTenantId + ')');
        if (user.tenantId !== resolvedTenantId) {
          console.log('❌ Access denied: User does not belong to this tenant');
          console.log('   User tenantId:', user.tenantId, '| Subdomain tenantId:', resolvedTenantId);
          return res.status(403).json({ 
            message: "Access denied. You don't belong to this tenant",
            hint: `Please visit ${user.tenantId}.enromatics.com/login`
          });
        }
        
        console.log(`✅ ${userRole} login on tenant subdomain: ${tenantSubdomain}`);
      }
    }

    console.log('✅ Login successful for:', email);

    // ✅ Generate unique session ID for concurrent login prevention
    const sessionId = crypto.randomBytes(32).toString('hex');
    
    // ✅ Update user's active session (invalidates previous sessions)
    user.activeSessionId = sessionId;
    user.lastLoginAt = new Date();
    
    // Save with timeout to prevent hanging
    try {
      await Promise.race([
        user.save(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("User save timeout")), 5000)
        )
      ]);
    } catch (saveErr) {
      console.error('⚠️  User save failed, continuing anyway:', saveErr.message);
      // Don't block login if save fails
    }

    // ✅ Include sessionId in JWT token
    console.log('\n🔐 Creating JWT with payload:');
    console.log('   - id:', user._id);
    console.log('   - email:', user.email);
    console.log('   - role:', user.role);
    console.log('   - tenantId:', user.tenantId || '❌ MISSING!');
    
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, tenantId: user.tenantId, sessionId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    
    console.log('✅ JWT created successfully');

    // ✅ Set cookie after successful login (cross-domain compatible)
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true only in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.status(200).json({
      message: "Login successful ✅",
      token, // Include token for mobile apps
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        plan: user.plan, // ✅ Include plan from user object (set during signup)
      },
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get current logged in user (using cookie) console logs for dev purpose
 */
export const getCurrentUser = async (req, res) => {
  try {
    
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ message: "Not logged in" });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (tokenError) {
      console.error("🔴 Token verification failed:", tokenError.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.log("🔴 No user found for decoded ID:", decoded.id);
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Check if session is still valid (concurrent login prevention)
    if (decoded.sessionId && user.activeSessionId !== decoded.sessionId) {
      console.log("🔴 Session invalidated - User logged in from another device");
      return res.status(401).json({ 
        message: "Session expired. You have been logged in from another device." 
      });
    }

    // Fetch tenant info if user has tenantId
    let tenant = null;
    if (user.tenantId) {
      tenant = await Tenant.findOne({ tenantId: user.tenantId }).select("name instituteName tenantId");
    }

    // Return user with tenant info
    const userWithTenant = {
      ...user.toObject(),
      tenant: tenant ? {
        name: tenant.name, // Person's name
        instituteName: tenant.instituteName, // Institute name
        tenantId: tenant.tenantId
      } : null
    };
    
    res.status(200).json(userWithTenant);
  } catch (error) {
    console.error("❌ Auth check failed:", error.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

/**
 * Get session with additional context (user + quick stats)
 * This reduces multiple API calls on dashboard load
 */
export const getSession = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({ message: "Not logged in" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build response with user and relevant stats based on role
    const response = {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        plan: user.plan,
        planExpiry: user.planExpiry,
      },
      stats: null,
    };

    // Add role-specific quick stats
    if (user.role === 'SuperAdmin') {
      // For SuperAdmin: tenant count
      const Tenant = (await import('../models/Tenant.js')).default;
      const tenantCount = await Tenant.countDocuments();
      response.stats = { tenantCount };
    } else if (user.role === 'tenantAdmin' && user.tenantId) {
      // For TenantAdmin: student count, today's attendance
      const Student = (await import('../models/Student.js')).default;
      const Attendance = (await import('../models/Attendance.js')).default;
      
      const [studentCount, todayAttendance] = await Promise.all([
        Student.countDocuments({ tenantId: user.tenantId }),
        Attendance.countDocuments({
          tenantId: user.tenantId,
          date: { $gte: new Date().setHours(0, 0, 0, 0) }
        })
      ]);
      
      response.stats = { studentCount, todayAttendance };
    }

    res.status(200).json(response);
  } catch (error) {
    console.error("❌ Session fetch failed:", error.message);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};


/**
 * Logout user (clear cookie)
 */
export const logoutUser = async (req, res) => {
  try {
    // ✅ Clear active session from database
    const token = req.cookies.jwt;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      await User.findByIdAndUpdate(decoded.id, {
        activeSessionId: null,
      });
    }
  } catch (error) {
    console.error("Error clearing session:", error.message);
  }

  // ✅ Must match EXACT settings used when setting the cookie
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: true, // Match login settings
    sameSite: "none", // Match login settings  
    path: "/", // Important: must match the path
  });
  res.status(200).json({ message: "Logged out successfully" });
};
