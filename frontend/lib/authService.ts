// Frontend Auth Service - Backend Only (No NextAuth)
// All authentication is managed by backend JWT cookies

import { API_BASE_URL } from './apiConfig';

const API_BASE = `${API_BASE_URL}/api/auth`;

export const authService = {
  // Login user
  async login(email: string, password: string) {
    console.log("🔵 Logging in with backend...", { email });
    
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ Send and receive cookies
        body: JSON.stringify({ email, password }),
      });

      console.log("📍 Login response status:", res.status);
      const data = await res.json();

      if (!res.ok) {
        console.log("❌ Login failed:", data.message);
        throw new Error(data.message || "Login failed");
      }

      console.log("🟢 Login successful:", {
        email: data.user.email,
        role: data.user.role,
        tenantId: data.user.tenantId,
      });
      return data;
    } catch (error: any) {
      console.error("❌ Login error:", error.message);
      throw error;
    }
  },

  // Get current user from backend
  async getCurrentUser() {
    console.log("🔵 Fetching current user from /api/auth/me...");
    
    try {
      const res = await fetch(`${API_BASE}/me`, {
        method: "GET",
        credentials: "include", // ✅ Send cookies
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("📍 /api/auth/me response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        console.log("🔴 Auth failed:", res.status, errorData?.message);
        return null;
      }

      const user = await res.json();
      console.log("🟢 Current user fetched:", {
        email: user.email,
        role: user.role,
        _id: user._id,
      });
      return user;
    } catch (error) {
      console.error("❌ Error fetching user:", error);
      return null;
    }
  },

  // Logout user
  async logout() {
    console.log("🔵 Logging out...");
    
    try {
      const res = await fetch(`${API_BASE}/logout`, {
        method: "POST",
        credentials: "include", // ✅ Send cookies
      });

      if (res.ok) {
        console.log("🟢 Logged out successfully");
      }
      return res.ok;
    } catch (error) {
      console.error("❌ Logout error:", error);
      return false;
    }
  },

  // Register new user
  async register(name: string, email: string, password: string) {
    console.log("🔵 Registering new user...");
    
    try {
      const res = await fetch(`${API_BASE}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      console.log("🟢 Registration successful");
      return data;
    } catch (error: any) {
      console.error("❌ Registration error:", error.message);
      throw error;
    }
  },

  // Verify session is still valid
  async verifySession() {
    console.log("🔵 Verifying session...");
    
    const user = await this.getCurrentUser();
    if (!user) {
      console.log("🔴 Session invalid or expired");
      return false;
    }
    console.log("🟢 Session valid");
    return true;
  },
};
