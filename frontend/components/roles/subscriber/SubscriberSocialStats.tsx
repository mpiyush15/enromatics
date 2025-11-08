"use client";
import { useEffect, useState } from "react";
import InfoCard from "./widgets/InfoCards";

export default function SubscriberSocialStats() {
  type SocialStats = {
    facebook?: {
      followers?: number;
      likes?: number;
      comments?: number;
    };
    instagram?: {
      followers?: number;
      likes?: number;
      comments?: number;
    };
  };

  const [stats, setStats] = useState<SocialStats | null>(null);

  useEffect(() => {
    fetch("/api/social/updateOut")
      .then((res) => res.json())
      .then((data) => setStats(data.data));
  }, []);
  
  if (!stats) return <div>Loading social stats...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <InfoCard
        platform="facebook"
        title="Facebook Insights"
        description="Engagement and reach summary"
        href="/dashboard/social/facebook"
        followers={stats.facebook?.followers ?? 0}
        likes={stats.facebook?.likes ?? 0}
        comments={stats.facebook?.comments ?? 0}
      />
      <InfoCard
        platform="instagram"
        title="Instagram Analytics"
        description="Track your Instagram performance"
        href="/dashboard/social/instagram"
        followers={stats.instagram?.followers ?? 0}
        likes={stats.instagram?.likes ?? 0}
        comments={stats.instagram?.comments ?? 0}
      />
    </div>
  );
}