"use client";
import useAuth from "@/hooks/useAuth";
import ClientDashboard from "@/components/dashboard/ClientDashboard";
import TrialBanner from "@/components/dashboard/TrialBanner";

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
      {/* Trial Banner - Shows at top of dashboard */}
      {user?.trialEndDate && (
        <TrialBanner 
          trialEndDate={user.trialEndDate}
          plan={user.plan}
          subscriptionStatus={user.subscriptionStatus}
        />
      )}
      
      <ClientDashboard 
        userName={user?.tenant?.instituteName || user?.tenant?.name || user?.name || user?.email || "User"}
        userRole={user?.role}
        isAdmin={user?.role === "SuperAdmin"}
      >
        {children}
      </ClientDashboard>
    </>
  );
}
