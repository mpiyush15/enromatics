"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";
import { api } from "@/lib/apiClient";

interface TenantData {
  instituteName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  website?: string;
  description?: string;
  logo?: string;
}

export default function TenantProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const tenantId = (user?.tenantId as string) || (user?.tenant?.tenantId as string) || '';
  
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState<TenantData>({
    instituteName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    website: "",
    description: "",
  });

  // When user data is loaded, populate form from user data first
  useEffect(() => {
    if (!authLoading && user) {
      console.log('👤 User loaded:', user);
      console.log('🔑 TenantId:', tenantId);
      
      // Pre-populate form with user/tenant data
      if (user?.tenant?.instituteName || user?.tenant?.email) {
        setForm(prev => ({
          ...prev,
          instituteName: user?.tenant?.instituteName || user?.name || "",
          email: user?.tenant?.email || user?.email || "",
          phone: user?.tenant?.contact?.phone || "",
          address: user?.tenant?.contact?.address || "",
          city: user?.tenant?.contact?.city || "",
          state: user?.tenant?.contact?.state || "",
          country: user?.tenant?.contact?.country || "India",
          website: user?.tenant?.website || "",
          description: user?.tenant?.description || "",
        }));
        console.log('✅ Form pre-populated with user tenant data');
      }
      
      // Then fetch fresh data from backend
      if (tenantId) {
        fetchTenantProfile();
      } else {
        setLoading(false);
      }
    }
  }, [authLoading, user, tenantId]);

  const fetchTenantProfile = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching profile for tenantId:', tenantId);
      const data = await api.get<any>(`/api/tenants/${tenantId}`);
      
      console.log('📥 Fetched tenant data from backend:', data);
      
      if (data) {
        setForm({
          instituteName: data.instituteName || "",
          email: data.email || "",
          phone: data.contact?.phone || "",
          address: data.contact?.address || "",
          city: data.contact?.city || "",
          state: data.contact?.state || "",
          country: data.contact?.country || "India",
          website: data.website || "",
          description: data.description || "",
          logo: data.branding?.logo || "",
        });
        setStatus("");
        console.log('✅ Profile form updated with backend data');
      }
    } catch (error: any) {
      setStatus(`Error loading profile: ${error.message}`);
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setStatus("");

      // Only send profile fields, NOT plan or subscription fields
      const payload = {
        instituteName: form.instituteName,
        email: form.email,
        website: form.website,
        description: form.description,
        contact: {
          phone: form.phone,
          address: form.address,
          city: form.city,
          state: form.state,
          country: form.country,
        },
      };

      const response = await api.put(`/api/tenants/${tenantId}`, payload);

      if (response) {
        setStatus("✅ Institute profile updated successfully!");
        setIsEditing(false);
        setTimeout(() => setStatus(""), 3000);
        // Refetch profile to ensure latest data
        fetchTenantProfile();
      }
    } catch (error: any) {
      setStatus(`❌ Error saving profile: ${error.message}`);
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading institute profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 py-6 bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🏢 Institute Profile</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Setup and manage your coaching institute details</p>
      </div>

      {/* Status Message */}
      {status && (
        <div className={`mb-6 p-4 rounded-lg ${
          status.includes('✅') 
            ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
        }`}>
          {status}
        </div>
      )}

      {/* Main Form */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
        {/* Form Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Basic Information</h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              isEditing
                ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isEditing ? "Cancel" : "✏️ Edit"}
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* Institute Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Institute Name *
            </label>
            <input
              type="text"
              name="instituteName"
              value={form.instituteName}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 rounded-lg border ${
                isEditing
                  ? "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400"
              }`}
              placeholder="e.g., Shree Coaching Classes"
            />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isEditing
                    ? "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400"
                }`}
                placeholder="institute@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isEditing
                    ? "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400"
                }`}
                placeholder="+91 9876543210"
              />
            </div>
          </div>

          {/* Website & Country */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={form.website}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isEditing
                    ? "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400"
                }`}
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Country
              </label>
              <select
                name="country"
                value={form.country}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isEditing
                    ? "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400"
                }`}
              >
                <option value="India">India</option>
                <option value="USA">USA</option>
                <option value="UK">UK</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`w-full px-4 py-2 rounded-lg border ${
                isEditing
                  ? "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400"
              }`}
              placeholder="123 Main Street"
            />
          </div>

          {/* City & State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isEditing
                    ? "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400"
                }`}
                placeholder="Mumbai"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                State
              </label>
              <input
                type="text"
                name="state"
                value={form.state}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isEditing
                    ? "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400"
                }`}
                placeholder="Maharashtra"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              About Your Institute
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleInputChange}
              disabled={!isEditing}
              rows={4}
              className={`w-full px-4 py-2 rounded-lg border ${
                isEditing
                  ? "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400"
              }`}
              placeholder="Tell us about your coaching institute, specializations, and achievements..."
            />
          </div>

          {/* Save Button */}
          {isEditing && (
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
              >
                {isSaving ? "Saving..." : "💾 Save Changes"}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Summary Card - Display saved data */}
      {!isEditing && form.instituteName && (
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📋 Your Institute Profile</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Institute Name */}
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-semibold mb-1">Institute Name</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{form.instituteName}</p>
            </div>

            {/* Email */}
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-semibold mb-1">Email</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{form.email}</p>
            </div>

            {/* Phone */}
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-semibold mb-1">Phone</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{form.phone || "Not set"}</p>
            </div>

            {/* Website */}
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-semibold mb-1">Website</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {form.website ? (
                  <a href={form.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                    {form.website}
                  </a>
                ) : (
                  "Not set"
                )}
              </p>
            </div>

            {/* City & Country */}
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-semibold mb-1">Location</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {form.city || form.state || form.country ? `${form.city || ''} ${form.state || ''}, ${form.country || ''}`.trim() : "Not set"}
              </p>
            </div>

            {/* Address */}
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-semibold mb-1">Address</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{form.address || "Not set"}</p>
            </div>
          </div>

          {/* Description */}
          {form.description && (
            <div className="mt-6 pt-6 border-t border-blue-200 dark:border-blue-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-semibold mb-2">About Your Institute</p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{form.description}</p>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          💡 <strong>Tip:</strong> Your institute details will appear in student portals and official documents. Keep them accurate and professional.
        </p>
      </div>
    </div>
  );
}
