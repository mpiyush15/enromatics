"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/apiConfig";

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

interface StaffForm {
  name: string;
  email: string;
  role: string;
  password: string;
}

export default function TenantProfilePage() {
  const { tenantId } = useParams();
  const [tenant, setTenant] = useState<any>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [editStaffForm, setEditStaffForm] = useState<any>(null);
  const [status, setStatus] = useState("");

  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "India",
  });

  const [staffForm, setStaffForm] = useState<StaffForm>({
    name: "",
    email: "",
    role: "employee",
    password: "",
  });

  useEffect(() => {
    fetchTenantProfile();
    fetchStaff();
  }, []);

  const fetchTenantProfile = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${API_BASE_URL}`}/api/tenants/${tenantId}`, {
        credentials: "include",
      });
      
      // Check if response is JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned invalid response. Please check if backend is running.");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch");
      
      setTenant(data.tenant);
      setForm({
        name: data.tenant.name || "",
        email: data.tenant.email || "",
        phone: data.tenant.contact?.phone || "",
        address: data.tenant.contact?.address || "",
        city: data.tenant.contact?.city || "",
        state: data.tenant.contact?.state || "",
        country: data.tenant.contact?.country || "India",
      });
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
      console.error("Fetch tenant error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/users?tenantId=${tenantId}`, {
        credentials: "include",
      });
      
      // Check if response is JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Received non-JSON response for staff fetch");
        return;
      }

      const data = await res.json();
      if (res.ok) {
        setStaff(data.users?.filter((u: any) => u.role !== "SuperAdmin" && u.role !== "tenantAdmin") || []);
      } else {
        console.error("Failed to fetch staff:", data.message);
      }
    } catch (err: any) {
      console.error("Error fetching staff:", err.message);
    }
  };

  const handleSave = async () => {
    setStatus("Saving...");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${API_BASE_URL}`}/api/tenants/${tenantId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          contact: {
            phone: form.phone,
            address: form.address,
            city: form.city,
            state: form.state,
            country: form.country,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setTenant(data.tenant);
      setStatus("Updated successfully!");
      setIsEditing(false);
      setTimeout(() => setStatus(""), 3000);
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Adding staff...");
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...staffForm, tenantId }),
      });
      
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server error. Please check if backend is running.");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setStatus("Staff added successfully!");
      setShowAddStaff(false);
      setStaffForm({ name: "", email: "", role: "employee", password: "" });
      fetchStaff();
      setTimeout(() => setStatus(""), 3000);
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const handleDeleteStaff = async (userId: string) => {
    if (!confirm("Remove this staff member?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to remove");
      setStatus("Staff removed!");
      fetchStaff();
      setTimeout(() => setStatus(""), 3000);
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const handleEditStaff = (member: any) => {
    setEditingStaffId(member._id);
    setEditStaffForm({
      name: member.name,
      email: member.email,
      role: member.role,
    });
  };

  const handleCancelEdit = () => {
    setEditingStaffId(null);
    setEditStaffForm(null);
  };

  const handleUpdateStaff = async (userId: string) => {
    setStatus("Updating...");
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editStaffForm),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server error. Please check if backend is running.");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setStatus("Staff updated successfully!");
      setEditingStaffId(null);
      setEditStaffForm(null);
      fetchStaff();
      setTimeout(() => setStatus(""), 3000);
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!tenant) return <div className="p-6"><p className="text-red-600">Failed to load profile</p></div>;

  const getRoleBadge = (role: string) => {
    const colors: any = {
      SuperAdmin: "bg-red-100 text-red-800",
      Admin: "bg-purple-100 text-purple-800",
      tenantAdmin: "bg-indigo-100 text-indigo-800",
      employee: "bg-blue-100 text-blue-800",
      adsManager: "bg-green-100 text-green-800",
      student: "bg-orange-100 text-orange-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl shadow-2xl p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">Institute Profile</h1>
          <p className="text-blue-100">Manage your institute information and staff</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">{tenant.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{tenant.email}</p>
            </div>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold">
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={handleSave} className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700">Save</button>
                <button onClick={() => { setIsEditing(false); fetchTenantProfile(); }} className="px-6 py-2 bg-gray-600 text-white rounded-xl hover:bg-gray-700">Cancel</button>
              </div>
            )}
          </div>

          {isEditing && (
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">Institute Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Phone</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">City</label>
                <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">State</label>
                <input type="text" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Country</label>
                <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700">
                  <option value="India">India</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-2">Address</label>
                <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={3} className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 dark:bg-gray-700" />
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-bold">Staff Management</h2>
            <button onClick={() => setShowAddStaff(!showAddStaff)} className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 font-semibold">
              {showAddStaff ? "Cancel" : "Add Staff"}
            </button>
          </div>

          {showAddStaff && (
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-b">
              <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required type="text" placeholder="Name" value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700" />
                <input required type="email" placeholder="Email" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700" />
                <select value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700">
                  <option value="Admin">Admin</option>
                  <option value="employee">Employee</option>
                  <option value="adsManager">Ads Manager</option>
                </select>
                <input required type="password" placeholder="Password" minLength={6} value={staffForm.password} onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700" />
                <button type="submit" className="md:col-span-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">Add Staff Member</button>
              </form>
            </div>
          )}

          <div className="p-6">
            {staff.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-lg font-semibold mb-2">No Staff Members Yet</h3>
                <p className="text-gray-600">Click "Add Staff" to add teachers, accountants, or staff.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase">Role</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase">Joined</th>
                      <th className="px-6 py-4 text-left text-xs font-bold uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {staff.map((member: any) => (
                      <tr key={member._id} className="hover:bg-blue-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4">
                          {editingStaffId === member._id ? (
                            <input
                              type="text"
                              value={editStaffForm.name}
                              onChange={(e) => setEditStaffForm({ ...editStaffForm, name: e.target.value })}
                              className="px-3 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                            />
                          ) : (
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                {member.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold">{member.name}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {editingStaffId === member._id ? (
                            <input
                              type="email"
                              value={editStaffForm.email}
                              onChange={(e) => setEditStaffForm({ ...editStaffForm, email: e.target.value })}
                              className="px-3 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                            />
                          ) : (
                            member.email
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {editingStaffId === member._id ? (
                            <select
                              value={editStaffForm.role}
                              onChange={(e) => setEditStaffForm({ ...editStaffForm, role: e.target.value })}
                              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
                            >
                              <option value="Admin">Admin</option>
                              <option value="employee">Employee</option>
                              <option value="adsManager">Ads Manager</option>
                            </select>
                          ) : (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRoleBadge(member.role)}`}>{member.role}</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(member.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          {editingStaffId === member._id ? (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateStaff(member._id)}
                                className="px-3 py-2 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg font-semibold text-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-semibold text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditStaff(member)}
                                className="px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-semibold text-sm"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteStaff(member._id)}
                                className="px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-semibold text-sm"
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {status && (
          <div className={`p-4 rounded-xl font-semibold ${status.includes("success") ? "bg-green-100 text-green-800" : status.includes("Error") ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
