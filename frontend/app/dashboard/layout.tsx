"use client";
import useAuth from "@/hooks/useAuth";
import ClientDashboard from "@/components/dashboard/ClientDashboard";
import TrialBanner from "@/components/dashboard/TrialBanner";
import { AuthDiagnosticPanel } from "@/components/auth-diagnostic-panel";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Checking session...
      </div>
    );
  }

  if (!loading && !user) {
    return null;
  }

  return (
    <>
      {/* Auth Diagnostic Panel - For debugging */}
      <AuthDiagnosticPanel />

      {/* Trial Banner - Shows at top of dashboard (hidden for SuperAdmin) */}
      {user?.trialEndDate && user?.role?.toLowerCase() !== "superadmin" && (
        <TrialBanner 
          trialEndDate={user.trialEndDate}
          plan={user.plan}
          subscriptionStatus={user.subscriptionStatus}
        />
      )}
      
      <ClientDashboard 
        userName={user?.tenant?.instituteName || user?.name || "User"}
        userRole={user?.role}
        isAdmin={user?.role?.toLowerCase() === "superadmin"}
        user={user}
      >
        {children}
      </ClientDashboard>
    </>
  );
}
