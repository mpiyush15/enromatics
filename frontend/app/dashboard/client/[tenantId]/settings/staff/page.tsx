"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TableSkeleton } from "@/components/ui/Skeleton";

interface Staff {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  designation: string;
  status: string;
  joiningDate: string;
  employmentType: string;
  salary: {
    total: number;
  };
  permissions: {
    canManageStudents: boolean;
    canMarkAttendance: boolean;
    canManageAccounts: boolean;
    canManageAdmissions: boolean;
    canViewReports: boolean;
    canManageExams: boolean;
  };
}

interface Quota {
  current: number;
  cap: number;
  canAdd: boolean;
  plan: string;
}

export default function StaffManagementPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params?.tenantId as string;

  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // For background refresh
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [quota, setQuota] = useState<Quota | null>(null);

  const roles = [
    { value: "teacher", label: "Teacher" },
    { value: "accountant", label: "Accountant" },
    { value: "admissionIncharge", label: "Admission Incharge" },
    { value: "counsellor", label: "Counsellor" },
    { value: "receptionist", label: "Receptionist" },
    { value: "librarian", label: "Librarian" },
    { value: "labAssistant", label: "Lab Assistant" },
    { value: "manager", label: "Manager" },
    { value: "staff", label: "Staff" },
    { value: "other", label: "Other" },
  ];

  const departments = [
    { value: "academics", label: "Academics" },
    { value: "administration", label: "Administration" },
    { value: "accounts", label: "Accounts" },
    { value: "admission", label: "Admission" },
    { value: "counselling", label: "Counselling" },
    { value: "library", label: "Library" },
    { value: "laboratory", label: "Laboratory" },
    { value: "management", label: "Management" },
    { value: "other", label: "Other" },
  ];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "staff",
    department: "administration",
    designation: "",
    joiningDate: new Date().toISOString().split("T")[0],
    employmentType: "fullTime",
    salary: { basic: 0, allowances: 0 },
  });

  // Helper to get auth headers
  const getHeaders = (): HeadersInit => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  };

  useEffect(() => {
    fetchStaff();
  }, [filterRole, filterStatus, searchQuery]);

  const fetchStaff = async (bustCache = false) => {
    // Only show full loading spinner on initial load (when no data yet)
    if (staff.length === 0) {
      setLoading(true);
    } else {
      setIsRefreshing(true); // Background refresh indicator
    }
    
    try {
      const params = new URLSearchParams();
      if (filterRole) params.append("role", filterRole);
      if (filterStatus) params.append("status", filterStatus);
      if (searchQuery) params.append("search", searchQuery);
      if (bustCache) params.append("_t", Date.now().toString());

      const res = await fetch(
        `/api/staff?${params.toString()}`,
        { 
          headers: getHeaders(),
          cache: bustCache ? 'no-store' : 'default'
        }
      );
      const data = await res.json();
      if (data.success) {
        setStaff(data.staff);
        // Update quota info
        if (data.quota) {
          setQuota(data.quota);
        }
      }
    } catch (err) {
      console.error("Failed to fetch staff:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = selectedStaff
        ? `/api/staff/${selectedStaff._id}`
        : `/api/staff`;

      const res = await fetch(url, {
        method: selectedStaff ? "PUT" : "POST",
        headers: getHeaders(),
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      // Handle different error cases with proper messages
      if (!res.ok) {
        if (res.status === 402 && data.code === 'upgrade_required') {
          alert(`🚫 Staff Limit Reached!\n\nYou have ${data.current}/${data.cap} staff members.\nPlease upgrade your plan to add more staff.`);
          // Refresh quota
          fetchStaff(true);
          return;
        }
        
        if (data.code === 'duplicate_entry' || data.message?.includes('already exists')) {
          alert(`⚠️ Duplicate Entry\n\n${data.message}`);
          return;
        }
        
        // Generic error
        alert(`❌ Error\n\n${data.message || 'Failed to save staff. Please try again.'}`);
        return;
      }
      
      if (data.success) {
        setShowAddModal(false);
        setSelectedStaff(null);
        setFormData({
          name: "",
          email: "",
          phone: "",
          password: "",
          role: "staff",
          department: "administration",
          designation: "",
          joiningDate: new Date().toISOString().split("T")[0],
          employmentType: "fullTime",
          salary: { basic: 0, allowances: 0 },
        });
        // Force fresh fetch after create/update
        fetchStaff(true);
      } else {
        alert(`❌ Error\n\n${data.message || 'Failed to save staff'}`);
      }
    } catch (err) {
      console.error("Failed to save staff:", err);
      alert("❌ Network Error\n\nFailed to save staff. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this staff member?")) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/staff/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        // Optimistic update - remove from UI immediately
        setStaff(prev => prev.filter(s => s._id !== id));
        // Also fetch fresh data
        fetchStaff(true);
      } else {
        alert(data.message || "Failed to delete staff");
      }
    } catch (err) {
      console.error("Failed to delete staff:", err);
      alert("Failed to delete staff. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditClick = (staffMember: Staff) => {
    setSelectedStaff(staffMember);
    setFormData({
      name: staffMember.name,
      email: staffMember.email,
      phone: staffMember.phone,
      password: "",
      role: staffMember.role,
      department: staffMember.department,
      designation: staffMember.designation,
      joiningDate: staffMember.joiningDate.split("T")[0],
      employmentType: staffMember.employmentType,
      salary: { 
        basic: staffMember.salary.total / 2, 
        allowances: staffMember.salary.total / 2 
      },
    });
    setShowAddModal(true);
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      teacher: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      accountant: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      admissionIncharge: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      counsellor: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
      manager: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    };
    return colors[role] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      inactive: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
      onLeave: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      terminated: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              👥 Staff Management
              {isRefreshing && (
                <span className="inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
              )}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your institute staff members and their roles
              {quota && (
                <span className={`ml-2 text-sm font-medium ${quota.canAdd ? 'text-green-600' : 'text-red-600'}`}>
                  ({quota.current}/{quota.cap === -1 ? '∞' : quota.cap} staff)
                </span>
              )}
            </p>
          </div>
          <div className="relative group">
            <button
              onClick={() => {
                if (quota && !quota.canAdd) {
                  return; // Don't open modal if quota reached
                }
                setSelectedStaff(null);
                setFormData({
                  name: "",
                  email: "",
                  phone: "",
                  password: "",
                  role: "staff",
                  department: "administration",
                  designation: "",
                  joiningDate: new Date().toISOString().split("T")[0],
                  employmentType: "fullTime",
                  salary: { basic: 0, allowances: 0 },
                });
                setShowAddModal(true);
              }}
              disabled={quota !== null && !quota.canAdd}
              className={`px-6 py-3 rounded-xl transition-all shadow-md font-semibold flex items-center gap-2 ${
                quota && !quota.canAdd
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg'
              }`}
            >
              <span>➕</span>
              Add Staff Member
            </button>
            {/* Tooltip for disabled button */}
            {quota && !quota.canAdd && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                Staff limit reached ({quota.current}/{quota.cap}).
                <button
                  onClick={() => router.push(`/dashboard/client/${tenantId}/my-subscription`)}
                  className="ml-2 text-blue-400 hover:text-blue-300 underline"
                >
                  Upgrade Plan
                </button>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="🔍 Search by name, email, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
            />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
            >
              <option value="">All Roles</option>
              {roles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="onLeave">On Leave</option>
              <option value="terminated">Terminated</option>
            </select>
            <button
              onClick={() => {
                setFilterRole("");
                setFilterStatus("");
                setSearchQuery("");
              }}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Staff List */}
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <TableSkeleton rows={6} />
          </div>
        ) : staff.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
              No Staff Members Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Add your first staff member to get started.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      Employee ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {staff.map((member, index) => (
                    <tr
                      key={member._id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        index % 2 === 0 ? "bg-white dark:bg-gray-800" : "bg-gray-50/50 dark:bg-gray-800/50"
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                          {member.employeeId}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {member.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {member.name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(member.role)}`}>
                          {member.role.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white capitalize">
                          {member.department}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{member.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(member.status)}`}>
                          {member.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEditClick(member)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(member._id)}
                          disabled={deletingId === member._id}
                          className={`text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 ${deletingId === member._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {deletingId === member._id ? '⏳ Deleting...' : '🗑️ Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full p-8 border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedStaff ? "Edit Staff Member" : "Add New Staff Member"}
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
                >
                  <span className="text-2xl">✕</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                    />
                  </div>

                  {!selectedStaff && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Password (leave empty for auto-generate)
                      </label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Role *
                    </label>
                    <select
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                    >
                      {roles.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Department
                    </label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                    >
                      {departments.map((dept) => (
                        <option key={dept.value} value={dept.value}>
                          {dept.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Designation
                    </label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Joining Date
                    </label>
                    <input
                      type="date"
                      value={formData.joiningDate}
                      onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Employment Type
                    </label>
                    <select
                      value={formData.employmentType}
                      onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                    >
                      <option value="fullTime">Full Time</option>
                      <option value="partTime">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="temporary">Temporary</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Basic Salary
                    </label>
                    <input
                      type="number"
                      value={formData.salary.basic}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          salary: { ...formData.salary, basic: Number(e.target.value) },
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Allowances
                    </label>
                    <input
                      type="number"
                      value={formData.salary.allowances}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          salary: { ...formData.salary, allowances: Number(e.target.value) },
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-semibold disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {submitting ? '⏳ Saving...' : (selectedStaff ? "Update Staff Member" : "Add Staff Member")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
