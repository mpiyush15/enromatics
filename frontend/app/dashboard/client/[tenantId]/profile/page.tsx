"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  const params = useParams();
  const tenantId = (params?.tenantId as string) || '';
  
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

  useEffect(() => {
    if (tenantId) {
      fetchTenantProfile();
    }
  }, [tenantId]);

  const fetchTenantProfile = async () => {
    try {
      setLoading(true);
      const data = await api.get<any>(`/api/tenants/${tenantId}`);
      
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
      }
    } catch (error: any) {
      setStatus(`❌ Error saving profile: ${error.message}`);
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

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          💡 <strong>Tip:</strong> Your institute details will appear in student portals and official documents. Keep them accurate and professional.
        </p>
      </div>
    </div>
  );
}
