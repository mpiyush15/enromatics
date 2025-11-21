import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const generateToken = (id, role, tenantId) =>
  jwt.sign({ id, role, tenantId }, process.env.JWT_SECRET, { expiresIn: "7d" });

/**
 * Register Tenant + User (or add staff to existing tenant)
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, tenantId, role, instituteName } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    // If tenantId is provided, add user to existing tenant (staff member)
    if (tenantId) {
      const tenant = await Tenant.findOne({ tenantId });
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }

      const user = await User.create({
        name,
        email,
        password,
        tenantId,
        role: role || "employee",
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
    const newTenantId = crypto.randomBytes(4).toString("hex");

    const tenant = await Tenant.create({
      tenantId: newTenantId,
      name: name, // Person's name
      instituteName: instituteName || null, // Institute name
      email,
      plan: "free",
      subscription: { status: "active", startDate: new Date() },
    });

    const user = await User.create({
      name,
      email,
      password,
      tenantId: newTenantId,
      role: "tenantAdmin",
    });

    // No cookie needed at registration; only at login
    res.status(201).json({
      message: "User registered successfully ✅",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Login User & set cookie
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const tenant = await Tenant.findOne({ tenantId: user.tenantId });
    const plan = tenant ? tenant.plan : "free";

    // ✅ Generate unique session ID for concurrent login prevention
    const sessionId = crypto.randomBytes(32).toString('hex');
    
    // ✅ Update user's active session (invalidates previous sessions)
    user.activeSessionId = sessionId;
    user.lastLoginAt = new Date();
    await user.save();

    // ✅ Include sessionId in JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role, tenantId: user.tenantId, sessionId },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

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
      },
      plan,
    });
  } catch (err) {
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
