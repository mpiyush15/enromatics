"use client";
import { useEffect, useState } from "react";

export default function SocialStatsPage() {
  type SocialStats = Record<string, unknown> | null;
  const [stats, setStats] = useState<SocialStats>(null);

  useEffect(() => {
    fetch("/api/social/socialUpdateOut")
      .then((res) => res.json())
      .then((data) => setStats(data.data));
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <h1>Your Social Stats</h1>
      <pre>{JSON.stringify(stats, null, 2)}</pre>
    </div>
  );
}