// Frontend Auth Service - Now Using BFF Layer
// All requests go through Next.js API routes (/api/auth/*)
// which forward to backend with proper cookie handling

import { cache, CACHE_KEYS, CACHE_TTL } from './cache';

// BFF routes (same domain - no CORS needed!)
const BFF_BASE = '/api/auth';

// Prevent multiple simultaneous auth checks
let authCheckPromise: Promise<any> | null = null;

export const authService = {
  // Login user - Now through BFF layer
  async login(email: string, password: string) {
    try {
      const res = await fetch(`${BFF_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ✅ BFF handles cookie forwarding
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

  // Get current user from BFF with caching
  async getCurrentUser(skipCache = false) {
    // Return cached user if available and not skipping cache
    if (!skipCache) {
      const cachedUser = cache.get(CACHE_KEYS.AUTH_USER);
      if (cachedUser !== undefined) { // Check for explicit undefined, not falsy
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
        const res = await fetch(`${BFF_BASE}/me`, {
          method: "GET",
          credentials: "include", // ✅ Send cookies (BFF handles forwarding)
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          console.warn('⚠️ Auth check returned error status:', res.status);
          cache.set(CACHE_KEYS.AUTH_USER, null, CACHE_TTL.SHORT); // Cache as null
          return null;
        }

        const data = await res.json();
        const user = data.user || null; // Handle { user: null } response
        
        // Cache the user data (including null)
        cache.set(CACHE_KEYS.AUTH_USER, user, CACHE_TTL.MEDIUM);
        
        if (user) {
          console.log('✅ User authenticated:', user.email);
        } else {
          console.log('ℹ️ No authenticated user');
        }
        
        return user;
      } catch (error) {
        console.error("❌ Error fetching user:", error);
        cache.set(CACHE_KEYS.AUTH_USER, null, CACHE_TTL.SHORT); // Cache as null on error
        return null;
      } finally {
        // Clear the promise after completion
        authCheckPromise = null;
      }
    })();

    return authCheckPromise;
  },

  // Logout user - through BFF
  async logout() {
    try {
      const res = await fetch(`${BFF_BASE}/logout`, {
        method: "POST",
        credentials: "include", // ✅ Send cookies (BFF handles forwarding)
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
      const res = await fetch(`${BFF_BASE}/register`, {
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
