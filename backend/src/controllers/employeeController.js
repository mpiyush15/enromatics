import Employee from "../models/Employee.js";

// Get all employees for a tenant
export const getEmployees = async (req, res) => {
  try {
    const { tenantId } = req.user;

    if (!tenantId) {
      return res.status(400).json({ message: "Tenant ID not found" });
    }

    const employees = await Employee.find({ tenantId }).sort({ createdAt: -1 });
    res.json({ success: true, employees });
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
