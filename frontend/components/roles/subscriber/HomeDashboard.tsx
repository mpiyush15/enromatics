// components/roles/subscriber/SubscriberHome.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { fetchSocialStats } from "@/lib/fetchSocialStats";
import InfoCard from "./widgets/InfoCards";


export default async function SubscriberHome({
  username,
  plan,
  planExpiry,
}: {
  username: string;
  plan: string;
  planExpiry: string;
  userId?: string; // Optional userId prop if needed  
}) {
  
    const session = await getServerSession(authOptions);
  const tenantId = session?.user?.tenantId || "";
  const userId = session?.user?.userId || ""; // Make sure this is the MongoDB _id as a string
  
  console.log("tenantId:", tenantId, "userId:", userId);
  const stats = await fetchSocialStats(userId)


  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 p-6 rounded shadow">
        <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-300">
          🎉 Welcome, {username}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          You are currently on the <strong>{plan}</strong> plan.
        </p>
        <p className="text-sm text-gray-500 mt-1">
          Your subscription expires on:{" "}
          <span className="font-medium">{planExpiry}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <InfoCard
          platform="facebook"
          title="Facebook Insights"
          description="Engagement and reach summary"
          href="/dashboard/social/facebook"
          followers={stats.facebook.followers}
          likes={stats.facebook.likes}
          comments={stats.facebook.comments}
        />

        <InfoCard
          platform="instagram"
          title="Instagram Analytics"
          description="Track your Instagram performance"
          href="/dashboard/social/instagram"
          followers={stats.instagram.followers}
          likes={stats.instagram.likes}
          comments={stats.instagram.comments}
        />
      </div>
      
    </div>
  );
}