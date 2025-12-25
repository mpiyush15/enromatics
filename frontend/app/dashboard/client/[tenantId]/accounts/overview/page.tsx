"use client";

import { useParams } from "next/navigation";
import AccountsOverview from "./AccountsOverview";

export default function AccountsOverviewPage() {
  const params = useParams();
  const tenantId = params?.tenantId as string;

  return <AccountsOverview tenantId={tenantId} />;
}
