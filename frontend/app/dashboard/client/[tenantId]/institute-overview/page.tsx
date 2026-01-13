"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/**
 * 🔄 DEPRECATED: This page has been replaced by overview-pro
 * Redirecting all traffic to the new page
 */
export default function InstituteOverviewPage() {
  const router = useRouter();
  const params = useParams();
  const tenantId = (params?.tenantId as string) || '';

  useEffect(() => {
    // Redirect to the new overview-pro page
    router.push(`/dashboard/client/${tenantId}/overview-pro`);
  }, [tenantId, router]);

  return null;
}
