import Employee from "../models/Employee.js";
import User from "../models/User.js";

// Get all employees for a tenant
export const getEmployees = async (req, res) => {
  try {
    const { tenantId } = req.user;

    if (!tenantId) {
      return res.status(400).json({ message: "Tenant ID not found" });
    }

    const employees = await Employee.find({ tenantId }).sort({ createdAt: -1 });
    
    // Also fetch User accounts for each employee to show if they have login credentials
    const employeesWithAuth = await Promise.all(
      employees.map(async (emp) => {
        const user = await User.findOne({ email: emp.email, tenantId });
        return {
          ...emp.toObject(),
          hasLoginAccess: !!user,
          userId: user?._id,
        };
      })
    );
    
    res.json({ success: true, employees: employeesWithAuth });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single employee by ID
export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;

    const employee = await Employee.findOne({ _id: id, tenantId });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ success: true, employee });
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create new employee
export const createEmployee = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const { name, email, phone, role, salary, joiningDate, permissions } = req.body;

    if (!tenantId) {
      return res.status(400).json({ message: "Tenant ID not found" });
    }

    // Block accounts access for staff role
    const finalPermissions = { ...permissions };
    if (role === "staff") {
      finalPermissions.canAccessAccounts = false;
    }

    const employee = new Employee({
      tenantId,
      name,
      email,
      phone,
      role,
      salary,
      joiningDate,
      permissions: finalPermissions,
      status: "active",
    });

    await employee.save();
    res.status(201).json({ success: true, employee, message: "Employee created successfully" });
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update employee
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    const { name, email, phone, role, salary, joiningDate, permissions, status } = req.body;

    const employee = await Employee.findOne({ _id: id, tenantId });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Block accounts access for staff role
    const finalPermissions = { ...permissions };
    if (role === "staff") {
      finalPermissions.canAccessAccounts = false;
    }

    // Update fields
    employee.name = name || employee.name;
    employee.email = email || employee.email;
    employee.phone = phone || employee.phone;
    employee.role = role || employee.role;
    employee.salary = salary !== undefined ? salary : employee.salary;
    employee.joiningDate = joiningDate || employee.joiningDate;
    employee.permissions = finalPermissions || employee.permissions;
    employee.status = status || employee.status;

    await employee.save();
    res.json({ success: true, employee, message: "Employee updated successfully" });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete employee
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;

    const employee = await Employee.findOneAndDelete({ _id: id, tenantId });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ success: true, message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update employee permissions only
export const updatePermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    const { permissions } = req.body;

    const employee = await Employee.findOne({ _id: id, tenantId });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Block accounts access for staff role
    if (employee.role === "staff") {
      permissions.canAccessAccounts = false;
    }

    employee.permissions = { ...employee.permissions, ...permissions };
    await employee.save();

    res.json({ success: true, employee, message: "Permissions updated successfully" });
  } catch (error) {
    console.error("Error updating permissions:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create login credentials for employee
export const createEmployeeLogin = async (req, res) => {
  try {
    console.log("=== CREATE LOGIN REQUEST ===");
    const { id } = req.params;
    const { tenantId } = req.user;
    const { password } = req.body;

    console.log("Employee ID:", id);
    console.log("Tenant ID:", tenantId);
    console.log("Password length:", password?.length);

    if (!password || password.length < 6) {
      console.log("❌ Password validation failed");
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const employee = await Employee.findOne({ _id: id, tenantId });
    console.log("Employee found:", employee ? employee.email : "NOT FOUND");

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Check if user account already exists
    const existingUser = await User.findOne({ email: employee.email, tenantId });
    console.log("Existing user check:", existingUser ? "ALREADY EXISTS" : "NONE");
    
    if (existingUser) {
      return res.status(400).json({ message: "Login credentials already exist for this employee" });
    }

    // Determine user role based on employee role
    let userRole = "employee";
    if (employee.role === "teacher") userRole = "teacher";
    else if (employee.role === "staff") userRole = "staff";
    else if (employee.role === "manager") userRole = "manager";
    else if (employee.role === "counsellor") userRole = "counsellor";

    console.log("Creating user with role:", userRole);

    // Create User account
    const user = new User({
      name: employee.name,
      email: employee.email,
      password,
      tenantId,
      role: userRole,
      status: "active",
      plan: "free",
      subscriptionStatus: "active",
    });

    await user.save();
    console.log("✅ User created successfully:", user._id);

    res.json({ 
      success: true, 
      message: "Login credentials created successfully",
      userId: user._id,
    });
  } catch (error) {
    console.error("❌ Error creating employee login:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: "Server error: " + error.message });
  }
};

// Reset employee password
export const resetEmployeePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const employee = await Employee.findOne({ _id: id, tenantId });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Find user account
    const user = await User.findOne({ email: employee.email, tenantId });

    if (!user) {
      return res.status(404).json({ 
        message: "No login account found. Please create login credentials first." 
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ 
      success: true, 
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error resetting employee password:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Generate random password
export const generatePassword = (req, res) => {
  const length = 10;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  res.json({ success: true, password });
};
