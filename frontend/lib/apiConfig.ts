/**
 * API Configuration
 * Centralized API URL management for all backend requests
 */

// Get API URL from environment variable, fallback to localhost for development
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

/**
 * Helper function to construct full API endpoint URLs
 * @param endpoint - API endpoint path (e.g., '/api/auth/login')
 * @returns Full URL to the API endpoint
 */
export function getApiUrl(endpoint: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
}

/**
 * Common API endpoints for easy reference
 */
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
  },
  // Students
  STUDENTS: '/api/students',
  STUDENT_AUTH: {
    LOGIN: '/api/student-auth/login',
    ME: '/api/student-auth/me',
    ATTENDANCE: '/api/student-auth/attendance',
    PAYMENTS: '/api/student-auth/payments',
  },
  // WhatsApp
  WHATSAPP: {
    CONFIG: '/api/whatsapp/config',
    CONTACTS: '/api/whatsapp/contacts',
    MESSAGES: '/api/whatsapp/messages',
    SEND: '/api/whatsapp/send',
    STATS: '/api/whatsapp/stats',
  },
  // Tenants
  TENANTS: '/api/tenants',
  // Leads
  LEADS: '/api/leads',
  // Accounts
  ACCOUNTS: {
    OVERVIEW: '/api/accounts/overview',
    EXPENSES: '/api/accounts/expenses',
    RECEIPTS: '/api/accounts/receipts',
    REFUNDS: '/api/accounts/refunds',
  },
  // Academics
  ACADEMICS: {
    TESTS: '/api/academics/tests',
    REPORTS: '/api/academics/reports',
  },
  // Dashboard
  DASHBOARD: {
    OVERVIEW: '/api/dashboard/overview',
  },
  // UI
  UI: {
    SIDEBAR: '/api/ui/sidebar',
  },
} as const;
