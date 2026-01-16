"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTenantFromBrowser } from "@/lib/middleware/tenantContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

export default function StudentLoginPage() {
  const router = useRouter();
  const [tenantSubdomain, setTenantSubdomain] = useState<string | null>(null);
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tenant = getTenantFromBrowser();
    setTenantSubdomain(tenant);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Logging in...");
    setLoading(true);
    try {
      console.log("🔐 Attempting login to:", `${API_URL}/api/student-auth/login`);
      const res = await fetch(`${API_URL}/api/student-auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ ...form, subdomain: tenantSubdomain }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      
      // Save token and user data
      if (data.token) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userEmail", data.student?.email || form.email);
        localStorage.setItem("userId", data.student?._id || "");
        
        // Also set cookie for middleware authentication check
        document.cookie = `token=${data.token}; path=/; max-age=604800; SameSite=Lax`;
      }
      
      setStatus("✅ Logged in successfully!");
      setTimeout(() => router.push("/student/home"), 500);
    } catch (err: any) {
      console.error(err);
      setStatus(`❌ ${err.message || "Login failed"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Portal</h1>
          {tenantSubdomain && (
            <p className="text-gray-600 capitalize text-sm">
              {tenantSubdomain} Coaching Classes
            </p>
          )}
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                name="email" 
                type="email"
                value={form.email} 
                onChange={handleChange} 
                placeholder="Enter your email" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                name="password" 
                type="password" 
                value={form.password} 
                onChange={handleChange} 
                placeholder="Enter your password" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                required 
              />
            </div>
            <button 
              type="submit"
              disabled={loading || !tenantSubdomain}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition mt-6"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Demo/Test Credentials */}
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-xs text-gray-700 font-semibold mb-2">✅ Test Student:</p>
            <p className="text-xs text-gray-600">📧 pixelsadvertise@gmail.com</p>
            <p className="text-xs text-gray-600">🔑 jpr2mope</p>
          </div>

          {status && (
            <p className={`mt-4 text-sm text-center ${status.includes("✅") ? "text-green-600" : "text-red-600"}`}>
              {status}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
