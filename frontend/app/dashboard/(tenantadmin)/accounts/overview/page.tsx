"use client";

import useAuth from "@/hooks/useAuth";
import AccountsOverview from "./AccountsOverview";

export default function AccountsOverviewPage() {
  const { user } = useAuth();
  const tenantId = user?.tenantId || "";

  return <AccountsOverview tenantId={tenantId} />;
}
