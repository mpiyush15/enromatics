import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/db";
import { redirect } from "next/navigation";

import AdminOverview from "@/components/roles/admin/HomeDashbaord";
import TrialNote from "@/components/roles/user/TrialNote";
import SubscriberHome from "@/components/roles/subscriber/HomeDashboard";
export default async function HomeDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const client = await clientPromise;
  const db = client.db("forteStudioz");

  const user = await db.collection("users").findOne({
    email: session.user.email,
  });

  if (!user) {
    return <div className="text-red-600">User not found.</div>;
  }

  const role = user.role;
  const plan = user.plan || "free";
  const planExpiry = user.planExpiry ? new Date(user.planExpiry).toLocaleDateString() : "N/A";

  // 👇 Render role-specific dashboard content
  if (role === "admin") {
    return <AdminOverview />;
  }

  if (role === "subscriber") {
    return <SubscriberHome username={user.username} plan={plan} planExpiry={planExpiry} />;
  }

  if (role === "user") {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">👋 Welcome to Forte Studioz</h1>
        <TrialNote />
      </div>
    );
  }

  return <div>❌ Unauthorized</div>;
}