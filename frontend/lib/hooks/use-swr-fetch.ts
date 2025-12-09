import useSWR, { SWRConfiguration } from "swr";

// Generic fetcher with credentials
const fetcher = async (url: string) => {
  const response = await fetch(url, {
    credentials: "include",
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  return response.json();
};

// Default SWR config for caching - prevents refetch on navigation
const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: false,      // Don't refetch when tab gets focus
  revalidateOnReconnect: false,  // Don't refetch on reconnect
  dedupingInterval: 300000,      // 5 minutes - don't refetch within this time
  revalidateIfStale: false,      // Don't auto-revalidate stale data
  errorRetryCount: 2,            // Retry twice on error
};

// Generic hook for any API endpoint
export function useSWRFetch<T>(
  url: string | null,
  config?: SWRConfiguration
) {
  const { data, error, isLoading, mutate } = useSWR<T>(
    url,
    fetcher,
    { ...defaultConfig, ...config }
  );

  return {
    data,
    isLoading,
    isError: !!error,
    error,
    refresh: mutate,
  };
}

// ============ Dashboard Hooks ============

interface DashboardData {
  success: boolean;
  data: {
    totalStudents: number;
    totalStaff: number;
    totalRevenue: number;
    activeStudents: number;
    pendingFees: number;
    recentActivity: any[];
  };
}

export function useDashboard(tenantId: string | undefined) {
  return useSWRFetch<DashboardData>(
    tenantId ? `/api/dashboard?tenantId=${tenantId}` : null
  );
}

// ============ Students Hooks ============

interface StudentsResponse {
  success: boolean;
  students: any[];
  total: number;
  page: number;
  limit: number;
}

export function useStudents(tenantId: string | undefined, page = 1, limit = 10, search = "") {
  const params = new URLSearchParams({
    tenantId: tenantId || "",
    page: String(page),
    limit: String(limit),
  });
  if (search) params.append("search", search);
  
  return useSWRFetch<StudentsResponse>(
    tenantId ? `/api/students?${params}` : null,
    { dedupingInterval: 60000 } // 1 min for list data
  );
}

// ============ Staff Hooks ============

interface StaffResponse {
  success: boolean;
  staff: any[];
  total: number;
}

export function useStaff(tenantId: string | undefined) {
  return useSWRFetch<StaffResponse>(
    tenantId ? `/api/settings/staff-list?tenantId=${tenantId}` : null
  );
}

// ============ Academics Hooks ============

interface AttendanceResponse {
  success: boolean;
  attendance: any[];
}

export function useAttendance(tenantId: string | undefined, date?: string, classId?: string) {
  const params = new URLSearchParams({ tenantId: tenantId || "" });
  if (date) params.append("date", date);
  if (classId) params.append("classId", classId);
  
  return useSWRFetch<AttendanceResponse>(
    tenantId ? `/api/academics/attendance?${params}` : null,
    { dedupingInterval: 30000 } // 30 sec for attendance (changes frequently)
  );
}

interface TestsResponse {
  success: boolean;
  tests: any[];
}

export function useTests(tenantId: string | undefined) {
  return useSWRFetch<TestsResponse>(
    tenantId ? `/api/academics/tests?tenantId=${tenantId}` : null
  );
}

interface MarksResponse {
  success: boolean;
  marks: any[];
}

export function useMarks(tenantId: string | undefined, testId?: string) {
  const params = new URLSearchParams({ tenantId: tenantId || "" });
  if (testId) params.append("testId", testId);
  
  return useSWRFetch<MarksResponse>(
    tenantId ? `/api/academics/marks?${params}` : null
  );
}

// ============ Fee/Accounts Hooks ============

interface FeesResponse {
  success: boolean;
  fees: any[];
  summary?: {
    totalCollected: number;
    totalPending: number;
  };
}

export function useFees(tenantId: string | undefined) {
  return useSWRFetch<FeesResponse>(
    tenantId ? `/api/accounts/fees?tenantId=${tenantId}` : null
  );
}

interface InvoicesResponse {
  success: boolean;
  invoices: any[];
}

export function useInvoices(tenantId: string | undefined) {
  return useSWRFetch<InvoicesResponse>(
    tenantId ? `/api/accounts/invoices?tenantId=${tenantId}` : null
  );
}

// ============ Social Media Hooks ============

interface SocialDashboardResponse {
  success: boolean;
  data: any;
}

export function useSocialDashboard(tenantId: string | undefined) {
  return useSWRFetch<SocialDashboardResponse>(
    tenantId ? `/api/social/dashboard?tenantId=${tenantId}` : null
  );
}

interface SocialPagesResponse {
  success: boolean;
  pages: any[];
}

export function useSocialPages(tenantId: string | undefined) {
  return useSWRFetch<SocialPagesResponse>(
    tenantId ? `/api/social/pages?tenantId=${tenantId}` : null
  );
}

interface CampaignsResponse {
  success: boolean;
  campaigns: any[];
}

export function useCampaigns(tenantId: string | undefined) {
  return useSWRFetch<CampaignsResponse>(
    tenantId ? `/api/social/campaigns?tenantId=${tenantId}` : null
  );
}

interface InstagramAccountsResponse {
  success: boolean;
  accounts: any[];
}

export function useInstagramAccounts(tenantId: string | undefined) {
  return useSWRFetch<InstagramAccountsResponse>(
    tenantId ? `/api/social/instagram-accounts?tenantId=${tenantId}` : null
  );
}

// ============ WhatsApp Hooks ============

interface WhatsAppContactsResponse {
  success: boolean;
  contacts: any[];
}

export function useWhatsAppContacts(tenantId: string | undefined) {
  return useSWRFetch<WhatsAppContactsResponse>(
    tenantId ? `/api/whatsapp/contacts?tenantId=${tenantId}` : null
  );
}

interface WhatsAppConversationsResponse {
  success: boolean;
  conversations: any[];
}

export function useWhatsAppConversations(tenantId: string | undefined) {
  return useSWRFetch<WhatsAppConversationsResponse>(
    tenantId ? `/api/whatsapp/inbox/conversations?tenantId=${tenantId}` : null,
    { dedupingInterval: 30000 } // 30 sec for real-time messages
  );
}

// ============ Sidebar Hook ============

interface SidebarResponse {
  success: boolean;
  navigation: any[];
  permissions: any;
}

export function useSidebar(tenantId: string | undefined) {
  return useSWRFetch<SidebarResponse>(
    tenantId ? `/api/ui/sidebar?tenantId=${tenantId}` : null,
    { dedupingInterval: 1800000 } // 30 min for sidebar (rarely changes)
  );
}

// ============ Admin Hooks ============

interface AdminStatsResponse {
  success: boolean;
  stats: any;
}

export function useAdminStats() {
  return useSWRFetch<AdminStatsResponse>("/api/admin/stats");
}

interface SubscribersResponse {
  success: boolean;
  subscribers: any[];
}

export function useSubscribers() {
  return useSWRFetch<SubscribersResponse>("/api/admin/subscribers");
}
