/**
 * 📋 Student Enquiry Hooks
 * React hooks for fetching enquiry data from backend
 * ✅ Connected to institute overview for data sync
 * ✅ Includes caching, error handling, and mock data fallback
 */

'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/apiClient';
import useAuth from './useAuth';

// ============ MOCK DATA ============

const MOCK_DATA = {
  enquiries: [
    {
      _id: '1',
      name: 'Arjun Sharma',
      email: 'arjun@example.com',
      phone: '+91 98765 43210',
      courseInterest: 'Advanced Web Development',
      status: 'new',
      notes: 'Interested in React and Node.js with hands-on projects',
      source: 'web',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: '2',
      name: 'Priya Patel',
      email: 'priya@example.com',
      phone: '+91 87654 32109',
      courseInterest: 'UI/UX Design Masterclass',
      status: 'interested',
      notes: 'Want to switch career from graphic design',
      source: 'referral',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: '3',
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      phone: '+91 76543 21098',
      courseInterest: 'Data Science Bootcamp',
      status: 'contacted',
      notes: 'Looking for comprehensive data science program',
      source: 'social',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      _id: '4',
      name: 'Sneha Gupta',
      email: 'sneha@example.com',
      phone: '+91 65432 10987',
      courseInterest: 'Advanced Web Development',
      status: 'enrolled',
      notes: 'Enrolled and excited to start',
      source: 'web',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  stats: {
    total: 4,
    byStatus: {
      new: 1,
      contacted: 1,
      interested: 1,
      enrolled: 1,
      rejected: 0,
    },
    conversionRate: 25,
    activeLeads: 3,
  },
  trends: [
    { date: '2026-03-15', total: 2, new: 1, contacted: 1, interested: 0, enrolled: 0 },
    { date: '2026-03-16', total: 1, new: 0, contacted: 0, interested: 1, enrolled: 0 },
    { date: '2026-03-17', total: 1, new: 0, contacted: 0, interested: 0, enrolled: 1 },
  ],
};

// ============ CACHE SYSTEM ============

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache: Record<string, { data: any; timestamp: number }> = {};

function getCachedData(key: string) {
  const cached = cache[key];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`✅ Cache hit for ${key}`);
    return cached.data;
  }
  return null;
}

function setCachedData(key: string, data: any) {
  cache[key] = { data, timestamp: Date.now() };
}

// ============ FETCH HELPER ============

async function fetchWithCache(
  endpoint: string,
  cacheKey: string,
  fallbackData: any
) {
  try {
    // Try cache first
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    // Fetch from API
    console.log(`📡 Fetching ${endpoint}...`);
    const response = await api.get(endpoint);
    
    // Handle API error response (returns {status, error, data: null})
    if (response?.status && !response?.data) {
      console.warn(`⚠️ API error: ${response.error}`);
      return fallbackData;
    }

    const data = response?.data || response || fallbackData;
    setCachedData(cacheKey, data);
    return data;
  } catch (error: any) {
    console.error(`❌ Error fetching ${endpoint}:`, error.message);
    return fallbackData;
  }
}

// ============ HOOKS ============

/**
 * 📋 Get all enquiries
 * @param status - optional filter by status
 * @param page - pagination page
 * @param limit - items per page
 */
export function useAllEnquiries(status?: string, page = 1, limit = 50) {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnquiries = async () => {
      if (!user?.tenantId) {
        setData(MOCK_DATA.enquiries);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const endpoint = `/api/enquiries?page=${page}&limit=${limit}${status ? `&status=${status}` : ''}`;
        const cacheKey = `enquiries-${status || 'all'}-${page}`;
        
        const result = await fetchWithCache(endpoint, cacheKey, MOCK_DATA.enquiries);
        setData(result?.data || result || MOCK_DATA.enquiries);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching enquiries:', err.message);
        setData(MOCK_DATA.enquiries);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiries();
  }, [user?.tenantId, status, page, limit]);

  return { data, loading, error };
}

/**
 * 📊 Get enquiry statistics
 */
export function useEnquiryStats() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(MOCK_DATA.stats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.tenantId) {
        setData(MOCK_DATA.stats);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await fetchWithCache('/api/enquiries/stats', 'enquiry-stats', MOCK_DATA.stats);
        setData(result?.data || result || MOCK_DATA.stats);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching enquiry stats:', err.message);
        setData(MOCK_DATA.stats);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user?.tenantId]);

  return { data, loading, error };
}

/**
 * 📈 Get enquiry trends
 */
export function useEnquiryTrends() {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>(MOCK_DATA.trends);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      if (!user?.tenantId) {
        setData(MOCK_DATA.trends);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await fetchWithCache('/api/enquiries/trends', 'enquiry-trends', MOCK_DATA.trends);
        setData(result?.data || result || MOCK_DATA.trends);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching enquiry trends:', err.message);
        setData(MOCK_DATA.trends);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, [user?.tenantId]);

  return { data, loading, error };
}

/**
 * 📋 Get enquiries by status
 */
export function useEnquiriesByStatus(status: string) {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnquiries = async () => {
      if (!user?.tenantId) {
        const filtered = MOCK_DATA.enquiries.filter(
          e => e.status === status
        );
        setData(filtered);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const endpoint = `/api/enquiries/by-status/${status}`;
        const result = await fetchWithCache(
          endpoint,
          `enquiries-status-${status}`,
          MOCK_DATA.enquiries.filter(e => e.status === status)
        );
        setData(result?.data || result || []);
        setError(null);
      } catch (err: any) {
        console.error(`Error fetching ${status} enquiries:`, err.message);
        setData(MOCK_DATA.enquiries.filter(e => e.status === status));
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiries();
  }, [user?.tenantId, status]);

  return { data, loading, error };
}

/**
 * 📋 Get single enquiry
 */
export function useEnquiry(enquiryId: string) {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnquiry = async () => {
      if (!user?.tenantId || !enquiryId) {
        const found = MOCK_DATA.enquiries.find(e => e._id === enquiryId);
        setData(found || null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const endpoint = `/api/enquiries/${enquiryId}`;
        const result = await fetchWithCache(
          endpoint,
          `enquiry-${enquiryId}`,
          MOCK_DATA.enquiries.find(e => e._id === enquiryId)
        );
        setData(result?.data || result || null);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching enquiry:', err.message);
        setData(MOCK_DATA.enquiries.find(e => e._id === enquiryId) || null);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiry();
  }, [user?.tenantId, enquiryId]);

  return { data, loading, error };
}

/**
 * 📝 Create enquiry
 */
export async function createEnquiry(enquiryData: any) {
  try {
    const response = await api.post('/api/enquiries', enquiryData);
    
    if (response?.status) {
      throw new Error(response.error || 'Failed to create enquiry');
    }

    // Invalidate cache
    delete cache['enquiry-stats'];
    delete cache['enquiry-trends'];
    delete cache['enquiries-all-1'];

    return response?.data || response;
  } catch (error: any) {
    console.error('Error creating enquiry:', error.message);
    throw error;
  }
}

/**
 * ✏️ Update enquiry
 */
export async function updateEnquiry(enquiryId: string, updateData: any) {
  try {
    const response = await api.put(`/api/enquiries/${enquiryId}`, updateData);
    
    if (response?.status) {
      throw new Error(response.error || 'Failed to update enquiry');
    }

    // Invalidate cache
    delete cache[`enquiry-${enquiryId}`];
    delete cache['enquiry-stats'];
    delete cache['enquiry-trends'];

    return response?.data || response;
  } catch (error: any) {
    console.error('Error updating enquiry:', error.message);
    throw error;
  }
}

/**
 * 🔄 Get conversion funnel (connected to institute overview)
 * Used for syncing enquiry → admission data
 */
export function useConversionFunnel() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFunnel = async () => {
      if (!user?.tenantId) {
        setData({
          enquiries: MOCK_DATA.stats.total,
          interested: MOCK_DATA.stats.byStatus.interested,
          enrolled: MOCK_DATA.stats.byStatus.enrolled,
          conversionRate: MOCK_DATA.stats.conversionRate,
        });
        setLoading(false);
        return;
      }

      try {
        const stats = await fetchWithCache('/api/enquiries/stats', 'enquiry-stats', MOCK_DATA.stats);
        setData({
          enquiries: stats.data?.total || 0,
          interested: stats.data?.byStatus?.interested || 0,
          enrolled: stats.data?.byStatus?.enrolled || 0,
          conversionRate: stats.data?.conversionRate || 0,
        });
      } catch (error) {
        console.error('Error fetching conversion funnel:', error);
        setData({
          enquiries: 0,
          interested: 0,
          enrolled: 0,
          conversionRate: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFunnel();
  }, [user?.tenantId]);

  return { data, loading };
}
