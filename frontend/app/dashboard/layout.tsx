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
    <div className="flex h-screen overflow-hidden">
      {/* Trial Banner - Fixed at top, doesn't affect layout */}
      {user?.trialEndDate && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <TrialBanner 
            trialEndDate={user.trialEndDate}
            plan={user.plan}
            subscriptionStatus={user.subscriptionStatus}
          />
        </div>
      )}
      
      <ClientDashboard 
        userName={user?.email || "User"}
        userRole={user?.role}
        isAdmin={user?.role === "SuperAdmin"}
      >
        {/* Add padding-top to account for fixed banner */}
        <div className={user?.trialEndDate && user?.subscriptionStatus === "trial" ? "pt-10" : ""}>
          {children}
        </div>
      </ClientDashboard>
    </div>
  );
}
