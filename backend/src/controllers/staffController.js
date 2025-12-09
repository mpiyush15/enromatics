import Staff from "../models/Staff.js";
import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import bcrypt from "bcryptjs";
import * as planGuard from "../../lib/planGuard.js";

// Create new staff member
export const createStaff = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    // Check staff cap
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return res.status(404).json({ message: "Tenant not found" });
    }
    
    const tierKey = tenant.plan || 'trial';
    const currentCount = await Staff.countDocuments({ tenantId });
    const capCheck = planGuard.checkStaffCap({ tierKey, currentStaff: currentCount });
    
    if (!capCheck.allowed) {
      return res.status(402).json({
        success: false,
        code: 'upgrade_required',
        reason: capCheck.reason,
        current: capCheck.current,
        cap: capCheck.cap,
        upgradeTo: capCheck.upgradeTo,
        message: `Staff limit reached (${capCheck.current}/${capCheck.cap}). Please upgrade to add more staff.`
      });
    }

    const {
      name,
      email,
      phone,
      password,
      role,
      department,
      designation,
      joiningDate,
      employmentType,
      salary,
      bankDetails,
      permissions,
      assignedSubjects,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      qualifications,
      previousExperience,
      notes,
    } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !role) {
      return res.status(400).json({ 
        message: "Name, email, phone, and role are required" 
      });
    }

    // Check if user already exists (globally - email is unique across all tenants)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: "A user with this email already exists. Please use a different email." 
      });
    }

    // Also check if staff with this email exists in this tenant
    const existingStaff = await Staff.findOne({ email, tenantId });
    if (existingStaff) {
      return res.status(400).json({ 
        message: "Staff member with this email already exists in your institute" 
      });
    }

    // Generate unique employee ID: {TenantPrefix-3}{DDMM}{Count-3}
    // Example: ABC0912001 = Tenant ABC + 09 Dec + Staff #001
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    
    // Get tenant prefix (first 3 chars of tenantId or instituteName, uppercase)
    const tenantPrefix = (tenant.instituteName || tenant.tenantId || 'TNT')
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 3)
      .toUpperCase()
      .padEnd(3, 'X'); // Pad with X if less than 3 chars
    
    // Get next staff number for this tenant
    const staffCount = await Staff.countDocuments({ tenantId });
    const nextNumber = staffCount + 1;
    
    const employeeId = `${tenantPrefix}${dd}${mm}${String(nextNumber).padStart(3, "0")}`;

    // Create user account
    const userPassword = password || `${name.split(" ")[0].toLowerCase()}@${new Date().getFullYear()}`;
    
    const newUser = await User.create({
      name,
      email,
      password: userPassword,
      tenantId,
      role: role === "admissionIncharge" ? "staff" : role,
      status: "active",
    });

    // Set default permissions based on role
    const defaultPermissions = getDefaultPermissions(role);

    // Create staff record
    const newStaff = await Staff.create({
      tenantId,
      userId: newUser._id,
      name,
      email,
      phone,
      employeeId,
      role,
      department: department || getDepartmentByRole(role),
      designation,
      joiningDate: joiningDate || new Date(),
      employmentType: employmentType || "fullTime",
      status: "active",
      salary: salary || { basic: 0, allowances: 0, total: 0 },
      bankDetails,
      permissions: { ...defaultPermissions, ...permissions },
      assignedSubjects,
      dateOfBirth,
      gender,
      address,
      emergencyContact,
      qualifications,
      previousExperience: previousExperience || 0,
      notes,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Staff member created successfully",
      staff: newStaff,
      credentials: {
        email,
        temporaryPassword: userPassword,
      },
    });
  } catch (err) {
    console.error("Create staff error:", err);
    
    // Handle MongoDB duplicate key error
    if (err.code === 11000 || err.name === 'MongoServerError' && err.message.includes('duplicate key')) {
      const duplicateField = err.keyPattern ? Object.keys(err.keyPattern)[0] : 'email';
      return res.status(400).json({ 
        message: `A user with this ${duplicateField} already exists. Please use a different ${duplicateField}.`,
        code: 'duplicate_entry'
      });
    }
    
    res.status(500).json({ 
      message: "Server error", 
      error: err.message 
    });
  }
};

// Get all staff members
export const getAllStaff = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { 
      role, 
      department, 
      status, 
      search, 
      page = 1, 
      limit = 20 
    } = req.query;

    // Build filter
    const filter = { tenantId };
    if (role) filter.role = role;
    if (department) filter.department = department;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Number(page);
    const lim = Math.min(Number(limit), 100);

    const total = await Staff.countDocuments(filter);
    const staff = await Staff.find(filter)
      .populate("userId", "name email status")
      .populate("assignedBatches", "name")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * lim)
      .limit(lim)
      .lean();

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / lim),
      staff,
    });
  } catch (err) {
    console.error("Get all staff error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get staff by ID
export const getStaffById = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { id } = req.params;

    const staff = await Staff.findOne({ _id: id, tenantId })
      .populate("userId", "name email status lastLoginAt")
      .populate("assignedBatches", "name startDate endDate")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .lean();

    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    res.status(200).json({
      success: true,
      staff,
    });
  } catch (err) {
    console.error("Get staff by ID error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update staff member
export const updateStaff = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Add updatedBy
    updateData.updatedBy = req.user._id;

    // Remove fields that shouldn't be updated directly
    delete updateData.tenantId;
    delete updateData.userId;
    delete updateData.employeeId;
    delete updateData.createdBy;
    delete updateData.createdAt;

    const staff = await Staff.findOneAndUpdate(
      { _id: id, tenantId },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("userId", "name email status");

    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    // Update user email/name if changed
    if (updateData.email || updateData.name) {
      await User.findByIdAndUpdate(
        staff.userId,
        {
          ...(updateData.email && { email: updateData.email }),
          ...(updateData.name && { name: updateData.name }),
        }
      );
    }

    res.status(200).json({
      success: true,
      message: "Staff member updated successfully",
      staff,
    });
  } catch (err) {
    console.error("Update staff error:", err);
    res.status(500).json({ 
      message: "Server error", 
      error: err.message 
    });
  }
};

// Delete staff member
export const deleteStaff = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { id } = req.params;

    const staff = await Staff.findOne({ _id: id, tenantId });
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    // Delete associated user account
    await User.findByIdAndDelete(staff.userId);

    // Delete staff record
    await Staff.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Staff member deleted successfully",
    });
  } catch (err) {
    console.error("Delete staff error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update staff status
export const updateStaffStatus = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive", "onLeave", "terminated"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const staff = await Staff.findOneAndUpdate(
      { _id: id, tenantId },
      { 
        $set: { 
          status,
          updatedBy: req.user._id,
        }
      },
      { new: true }
    );

    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    // Update user status accordingly
    const userStatus = status === "active" ? "active" : "inactive";
    await User.findByIdAndUpdate(staff.userId, { status: userStatus });

    res.status(200).json({
      success: true,
      message: "Staff status updated successfully",
      staff,
    });
  } catch (err) {
    console.error("Update staff status error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update staff permissions
export const updateStaffPermissions = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const { id } = req.params;
    const { permissions } = req.body;

    const staff = await Staff.findOneAndUpdate(
      { _id: id, tenantId },
      { 
        $set: { 
          permissions,
          updatedBy: req.user._id,
        }
      },
      { new: true }
    );

    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    res.status(200).json({
      success: true,
      message: "Staff permissions updated successfully",
      staff,
    });
  } catch (err) {
    console.error("Update staff permissions error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get staff statistics
export const getStaffStats = async (req, res) => {
  try {
    const tenantId = req.user?.tenantId;
    if (!tenantId) return res.status(403).json({ message: "Tenant ID missing" });

    const totalStaff = await Staff.countDocuments({ tenantId });
    const activeStaff = await Staff.countDocuments({ tenantId, status: "active" });
    const onLeave = await Staff.countDocuments({ tenantId, status: "onLeave" });
    
    const staffByRole = await Staff.aggregate([
      { $match: { tenantId } },
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]);

    const staffByDepartment = await Staff.aggregate([
      { $match: { tenantId } },
      { $group: { _id: "$department", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        total: totalStaff,
        active: activeStaff,
        onLeave,
        inactive: totalStaff - activeStaff - onLeave,
        byRole: staffByRole,
        byDepartment: staffByDepartment,
      },
    });
  } catch (err) {
    console.error("Get staff stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Helper function to get default permissions by role
function getDefaultPermissions(role) {
  const permissionMap = {
    teacher: {
      canManageStudents: true,
      canMarkAttendance: true,
      canManageAccounts: false,
      canManageAdmissions: false,
      canViewReports: true,
      canManageExams: true,
    },
    accountant: {
      canManageStudents: false,
      canMarkAttendance: false,
      canManageAccounts: true,
      canManageAdmissions: false,
      canViewReports: true,
      canManageExams: false,
    },
    admissionIncharge: {
      canManageStudents: true,
      canMarkAttendance: false,
      canManageAccounts: true, // Can mark fees during admission
      canManageAdmissions: true,
      canViewReports: true,
      canManageExams: false,
    },
    counsellor: {
      canManageStudents: true,
      canMarkAttendance: false,
      canManageAccounts: false,
      canManageAdmissions: true,
      canViewReports: true,
      canManageExams: false,
    },
    staff: {
      canManageStudents: false,
      canMarkAttendance: true,
      canManageAccounts: false,
      canManageAdmissions: false,
      canViewReports: false,
      canManageExams: false,
    },
    manager: {
      canManageStudents: true,
      canMarkAttendance: true,
      canManageAccounts: true,
      canManageAdmissions: true,
      canViewReports: true,
      canManageExams: true,
    },
  };

  return permissionMap[role] || {
    canManageStudents: false,
    canMarkAttendance: false,
    canManageAccounts: false,
    canManageAdmissions: false,
    canViewReports: false,
    canManageExams: false,
  };
}

// Helper function to get department by role
function getDepartmentByRole(role) {
  const departmentMap = {
    teacher: "academics",
    accountant: "accounts",
    admissionIncharge: "admission",
    counsellor: "counselling",
    receptionist: "administration",
    librarian: "library",
    labAssistant: "laboratory",
    manager: "management",
    staff: "administration",
  };

  return departmentMap[role] || "other";
}
