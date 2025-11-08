import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/authOptions";
import { redirect } from "next/navigation";
import ClientDashboard from "@/components/dashboard/ClientDashboard";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <ClientDashboard userName={session.user?.username || "User"}>
      {children}
    </ClientDashboard>
  );
}