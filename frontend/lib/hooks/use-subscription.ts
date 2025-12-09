import useSWR from "swr";

interface SubscriptionInfo {
  plan: string;
  status: string;
  startDate: string | null;
  endDate: string | null;
  trialStartDate: string | null;
  billingCycle: string;
  amount: number;
  currency: string;
  daysRemaining: number;
  isTrialActive: boolean;
}

interface TenantInfo {
  instituteName: string;
  email: string;
  plan: string;
  subscription: SubscriptionInfo;
}

interface SubscriptionResponse {
  success: boolean;
  tenant: TenantInfo | null;
  message?: string;
}

const fetcher = async (url: string): Promise<SubscriptionResponse> => {
  const response = await fetch(url, {
    credentials: "include",
  });
  const data = await response.json();
  return data;
};

export function useSubscription(tenantId: string | undefined) {
  const { data, error, isLoading, mutate } = useSWR<SubscriptionResponse>(
    tenantId ? `/api/tenants/${tenantId}/subscription` : null,
    fetcher,
    {
      // Cache for 5 minutes, don't refetch on focus/reconnect
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 300000, // 5 minutes - don't refetch within this time
      revalidateIfStale: false, // Don't auto-revalidate stale data
    }
  );

  return {
    tenant: data?.success ? data.tenant : null,
    isLoading,
    isError: error || (data && !data.success),
    error: error?.message || data?.message,
    refresh: mutate, // Call this to manually refresh data
  };
}
