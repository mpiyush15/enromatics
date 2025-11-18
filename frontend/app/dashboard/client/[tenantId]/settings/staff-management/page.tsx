"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/apiConfig";

interface Employee {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  salary: number;
  joiningDate: string;
  status: string;
  hasLoginAccess?: boolean;
  userId?: string;
  permissions: {
    canAccessStudents: boolean;
    canAccessTests: boolean;
    canCreateFees: boolean;
    canAccessAccounts: boolean;
  };
}

export default function StaffManagementPage() {
  const router = useRouter();
  const params = useParams();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [password, setPassword] = useState("");
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "staff",
    salary: 0,
    joiningDate: "",
    permissions: {
      canAccessStudents: false,
      canAccessTests: false,
      canCreateFees: false,
      canAccessAccounts: false,
    },
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/employees`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setEmployees(data.employees);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm({
        ...form,
        permissions: {
          ...form.permissions,
          [name]: checked,
        },
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Saving...");

    try {
      const url = editingEmployee
        ? `${API_BASE_URL}/api/employees/${editingEmployee._id}`
        : `${API_BASE_URL}/api/employees`;
      const method = editingEmployee ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        setMessage(editingEmployee ? "✅ Employee updated!" : "✅ Employee created!");
        fetchEmployees();
        resetForm();
        setShowModal(false);
      } else {
        setMessage("❌ " + (data.message || "Operation failed"));
      }
    } catch (error) {
      console.error("Error saving employee:", error);
      setMessage("❌ Server error");
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setForm({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      salary: employee.salary,
      joiningDate: employee.joiningDate ? new Date(employee.joiningDate).toISOString().split("T")[0] : "",
      permissions: employee.permissions || {
        canAccessStudents: false,
        canAccessTests: false,
        canCreateFees: false,
        canAccessAccounts: false,
      },
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/employees/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        setMessage("✅ Employee deleted!");
        fetchEmployees();
      } else {
        setMessage("❌ Delete failed");
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      setMessage("❌ Server error");
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      role: "staff",
      salary: 0,
      joiningDate: "",
      permissions: {
        canAccessStudents: false,
        canAccessTests: false,
        canCreateFees: false,
        canAccessAccounts: false,
      },
    });
    setEditingEmployee(null);
    setMessage("");
  };

  const handleGeneratePassword = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/employees/generate-password`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setPassword(data.password);
      }
    } catch (error) {
      console.error("Error generating password:", error);
    }
  };

  const handleCreateLogin = async (employee: Employee) => {
    setSelectedEmployee(employee);
    setPassword("");
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async () => {
    if (!selectedEmployee) return;
    
    if (!password || password.length < 6) {
      setMessage("❌ Password must be at least 6 characters");
      return;
    }

    console.log("\n=== PASSWORD SUBMIT ===");
    console.log("Employee:", selectedEmployee.name, selectedEmployee._id);
    console.log("Has login access:", selectedEmployee.hasLoginAccess);
    console.log("Password length:", password.length);

    setMessage("⏳ Processing...");

    try {
      const endpoint = selectedEmployee.hasLoginAccess
        ? `${API_BASE_URL}/api/employees/${selectedEmployee._id}/reset-password`
        : `${API_BASE_URL}/api/employees/${selectedEmployee._id}/create-login`;

      const payload = selectedEmployee.hasLoginAccess 
        ? { newPassword: password } 
        : { password: password };

      console.log("Endpoint:", endpoint);
      console.log("Payload keys:", Object.keys(payload));

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      console.log("Response status:", res.status);
      const data = await res.json();
      console.log("Response data:", data);

      if (res.ok && data.success) {
        setMessage(`✅ ${data.message}`);
        setShowPasswordModal(false);
        fetchEmployees();
        setPassword("");
        setSelectedEmployee(null);
      } else {
        setMessage("❌ " + (data.message || "Operation failed"));
        console.error("Operation failed:", data);
      }
    } catch (error) {
      console.error("❌ Error managing password:", error);
      setMessage("❌ Server error: " + (error as Error).message);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">👥 Staff Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          + Add Employee
        </button>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900 rounded text-sm">
          {message}
        </div>
      )}

      {/* Employee List */}
      <div className="bg-white dark:bg-gray-900 rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Login Access</th>
              <th className="px-4 py-3 text-left">Permissions</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp._id} className="border-t dark:border-gray-700">
                <td className="px-4 py-3">{emp.name}</td>
                <td className="px-4 py-3">{emp.email}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                    {emp.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {emp.hasLoginAccess ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      ✓ Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                      ✗ No Access
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-2 flex-wrap">
                    {emp.permissions?.canAccessStudents && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                        👥 Students
                      </span>
                    )}
                    {emp.permissions?.canAccessTests && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                        📝 Tests
                      </span>
                    )}
                    {emp.permissions?.canCreateFees && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                        💰 Fees
                      </span>
                    )}
                    {emp.role !== "staff" && emp.permissions?.canAccessAccounts && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                        📊 Accounts
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      emp.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {emp.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(emp)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleCreateLogin(emp)}
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      {emp.hasLoginAccess ? "Reset Password" : "Create Login"}
                    </button>
                    <button
                      onClick={() => handleDelete(emp._id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {employees.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No employees found. Click "Add Employee" to get started.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingEmployee ? "Edit Employee" : "Add New Employee"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border rounded dark:bg-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border rounded dark:bg-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={form.phone}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded dark:bg-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Role *</label>
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 border rounded dark:bg-gray-800"
                    >
                      <option value="staff">Staff</option>
                      <option value="teacher">Teacher</option>
                      <option value="counsellor">Counsellor</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Salary</label>
                    <input
                      type="number"
                      name="salary"
                      value={form.salary}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded dark:bg-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Joining Date</label>
                    <input
                      type="date"
                      name="joiningDate"
                      value={form.joiningDate}
                      onChange={handleInputChange}
                      className="w-full p-2 border rounded dark:bg-gray-800"
                    />
                  </div>
                </div>

                {/* Permissions */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-semibold mb-3">Permissions</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="canAccessStudents"
                        checked={form.permissions.canAccessStudents}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <span>Can access Students section</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="canAccessTests"
                        checked={form.permissions.canAccessTests}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <span>Can access Tests section</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="canCreateFees"
                        checked={form.permissions.canCreateFees}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <span>Can create Fees (not access accounts)</span>
                    </label>

                    {form.role !== "staff" && (
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name="canAccessAccounts"
                          checked={form.permissions.canAccessAccounts}
                          onChange={handleInputChange}
                          className="w-4 h-4"
                        />
                        <span>Can access Accounts section (Not available for staff)</span>
                      </label>
                    )}

                    {form.role === "staff" && (
                      <p className="text-sm text-red-600 mt-2">
                        ⚠️ Staff members cannot access Accounts section
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
                  >
                    {editingEmployee ? "Update" : "Create"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">
              {selectedEmployee.hasLoginAccess ? "Reset Password" : "Create Login Credentials"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {selectedEmployee.hasLoginAccess 
                ? `Reset password for ${selectedEmployee.name}`
                : `Create login credentials for ${selectedEmployee.name}`
              }
            </p>
            
            <div className="mb-4">
              <label className="block text-sm mb-2">Password (min 6 characters)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="flex-1 p-2 border rounded dark:bg-gray-800"
                />
                <button
                  onClick={handleGeneratePassword}
                  className="bg-gray-200 dark:bg-gray-700 px-3 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
                  title="Generate random password"
                >
                  🎲 Generate
                </button>
              </div>
              {password && (
                <p className="text-xs text-gray-500 mt-2">
                  💡 Make sure to copy this password and share it securely with the employee
                </p>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handlePasswordSubmit}
                className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700"
              >
                {selectedEmployee.hasLoginAccess ? "Reset Password" : "Create Login"}
              </button>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword("");
                  setSelectedEmployee(null);
                }}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
