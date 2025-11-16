// Frontend Auth Service - Backend Only (No NextAuth)
// All authentication is managed by backend JWT cookies

import { API_BASE_URL } from './apiConfig';
import { cache, CACHE_KEYS, CACHE_TTL } from './cache';

const API_BASE = `${API_BASE_URL}/api/auth`;

// Prevent multiple simultaneous auth checks
let authCheckPromise: Promise<any> | null = null;

export const authService = {
  // Login user
  async login(email: string, password: string) {
    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ Send and receive cookies
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Cache user data after successful login
      cache.set(CACHE_KEYS.AUTH_USER, data.user, CACHE_TTL.MEDIUM);
      
      return data;
    } catch (error: any) {
      console.error("❌ Login error:", error.message);
      throw error;
    }
  },

  // Get current user from backend with caching
  async getCurrentUser(skipCache = false) {
    // Return cached user if available and not skipping cache
    if (!skipCache) {
      const cachedUser = cache.get(CACHE_KEYS.AUTH_USER);
      if (cachedUser) {
        return cachedUser;
      }
    }

    // If there's already an auth check in progress, return that promise
    if (authCheckPromise) {
      return authCheckPromise;
    }
    
    // Create new auth check promise
    authCheckPromise = (async () => {
      try {
        const res = await fetch(`${API_BASE}/me`, {
          method: "GET",
          credentials: "include", // ✅ Send cookies
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          cache.remove(CACHE_KEYS.AUTH_USER);
          return null;
        }

        const user = await res.json();
        
        // Cache the user data
        cache.set(CACHE_KEYS.AUTH_USER, user, CACHE_TTL.MEDIUM);
        
        return user;
      } catch (error) {
        console.error("❌ Error fetching user:", error);
        cache.remove(CACHE_KEYS.AUTH_USER);
        return null;
      } finally {
        // Clear the promise after completion
        authCheckPromise = null;
      }
    })();

    return authCheckPromise;
  },

  // Logout user
  async logout() {
    try {
      const res = await fetch(`${API_BASE}/logout`, {
        method: "POST",
        credentials: "include", // ✅ Send cookies
      });

      // Clear all auth-related cache
      cache.clearPattern('auth:');
      cache.clearPattern('dashboard:');
      
      return res.ok;
    } catch (error) {
      console.error("❌ Logout error:", error);
      return false;
    }
  },

  // Register new user
  async register(name: string, email: string, password: string) {
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

      return data;
    } catch (error: any) {
      console.error("❌ Registration error:", error.message);
      throw error;
    }
  },

  // Verify session is still valid
  async verifySession() {
    const user = await this.getCurrentUser();
    return !!user;
  },

  // Refresh auth cache
  refreshCache() {
    return this.getCurrentUser(true);
  },
};
